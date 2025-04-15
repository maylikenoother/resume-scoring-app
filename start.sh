#!/bin/bash
# Start both frontend and backend services

# Start FastAPI in the background
uvicorn api.main:app --host 0.0.0.0 --port 8000 &

# Start Next.js frontend
npm start