FROM node:18-alpine AS frontend-builder

WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Stage 2: Build the backend
FROM python:3.9-slim AS backend-builder

WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir --upgrade -r requirements.txt

# Stage 3: Final image
FROM python:3.9-slim

WORKDIR /app

# Copy frontend build
COPY --from=frontend-builder /app/.next ./.next
COPY --from=frontend-builder /app/public ./public
COPY --from=frontend-builder /app/package.json ./package.json

# Copy Python dependencies
COPY --from=backend-builder /usr/local/lib/python3.9/site-packages /usr/local/lib/python3.9/site-packages

# Copy API code and migrations
COPY api ./api
COPY migrations ./migrations
COPY alembic.ini ./alembic.ini

# Set environment variables
ENV NODE_ENV=production
ENV AUTO_APPLY_MIGRATIONS=true

# Install Node.js
RUN apt-get update && apt-get install -y curl && \
    curl -fsSL https://deb.nodesource.com/setup_18.x | bash - && \
    apt-get install -y nodejs && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# Expose ports
EXPOSE 3000 8000

# Copy and set permissions for startup script
COPY start.sh ./start.sh
RUN chmod +x ./start.sh

# Run the application
CMD ["./start.sh"]