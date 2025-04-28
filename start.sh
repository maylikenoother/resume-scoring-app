#!/bin/bash
# Start both frontend and backend services

# Run database migrations if AUTO_APPLY_MIGRATIONS is set to true
if [ "$AUTO_APPLY_MIGRATIONS" = "true" ]; then
  echo "Applying database migrations..."
  cd /app && alembic upgrade head
  if [ $? -ne 0 ]; then
    echo "Error applying migrations!"
    exit 1
  fi
  echo "Migrations applied successfully"
fi

# Start FastAPI in the background
echo "Starting FastAPI backend..."
uvicorn api.main:app --host 0.0.0.0 --port 8000 &
BACKEND_PID=$!

# Start Next.js frontend
echo "Starting Next.js frontend..."
npm start &
FRONTEND_PID=$!

# Handle graceful shutdown
function handle_shutdown {
  echo "Shutting down services..."
  kill -TERM $BACKEND_PID 2>/dev/null
  kill -TERM $FRONTEND_PID 2>/dev/null
  wait
  echo "Shutdown complete"
  exit 0
}

# Register signal handlers
trap handle_shutdown SIGINT SIGTERM

# Keep the script running until both processes exit
wait $BACKEND_PID $FRONTEND_PID