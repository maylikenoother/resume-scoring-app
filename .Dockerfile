FROM node:18-alpine AS frontend-builder

WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM python:3.9-slim

WORKDIR /app

COPY --from=frontend-builder /app/.next ./.next
COPY --from=frontend-builder /app/public ./public
COPY --from=frontend-builder /app/package.json ./package.json
COPY --from=frontend-builder /app/node_modules ./node_modules

COPY api ./api
COPY migrations ./migrations
COPY alembic.ini ./alembic.ini
COPY requirements.txt ./requirements.txt

RUN pip install --no-cache-dir --upgrade -r requirements.txt

RUN apt-get update && apt-get install -y curl && \
    curl -fsSL https://deb.nodesource.com/setup_18.x | bash - && \
    apt-get install -y nodejs && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

ENV NODE_ENV=production
ENV AUTO_APPLY_MIGRATIONS=true

EXPOSE 3000 8000

RUN echo '#!/bin/bash\n\
\n\
if [ "$AUTO_APPLY_MIGRATIONS" = "true" ]; then\n\
  echo "Applying database migrations..."\n\
  alembic upgrade head\n\
  if [ $? -ne 0 ]; then\n\
    echo "Error applying migrations!"\n\
    exit 1\n\
  fi\n\
  echo "Migrations applied successfully"\n\
fi\n\
\n\
echo "Starting FastAPI backend..."\n\
uvicorn api.main:app --host 0.0.0.0 --port 8000 &\n\
BACKEND_PID=$!\n\
\n\
echo "Starting Next.js frontend..."\n\
npm start &\n\
FRONTEND_PID=$!\n\
\n\
function handle_shutdown {\n\
  echo "Shutting down services..."\n\
  kill -TERM $BACKEND_PID 2>/dev/null\n\
  kill -TERM $FRONTEND_PID 2>/dev/null\n\
  wait\n\
  echo "Shutdown complete"\n\
  exit 0\n\
}\n\
\n\
trap handle_shutdown SIGINT SIGTERM\n\
\n\
wait $BACKEND_PID $FRONTEND_PID\n\
' > /app/start.sh

RUN chmod +x /app/start.sh

CMD ["/app/start.sh"]