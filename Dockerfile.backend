FROM python:3.9-slim

WORKDIR /app

COPY api ./api
COPY migrations ./migrations
COPY alembic.ini ./alembic.ini
COPY requirements.txt ./requirements.txt

RUN pip install --no-cache-dir --upgrade -r requirements.txt

ENV AUTO_APPLY_MIGRATIONS=true
ENV PORT=10000

EXPOSE 10000

CMD uvicorn api.main:app --host 0.0.0.0 --port ${PORT}