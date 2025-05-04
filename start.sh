if [ "$AUTO_APPLY_MIGRATIONS" = "true" ]; then
  echo "Applying database migrations..."
  cd /app && alembic upgrade head
  if [ $? -ne 0 ]; then
    echo "Error applying migrations!"
    exit 1
  fi
  echo "Migrations applied successfully"
fi

echo "Starting FastAPI backend..."
uvicorn api.main:app --host 0.0.0.0 --port 8000 &
BACKEND_PID=$!

echo "Starting Next.js frontend..."
npm start &
FRONTEND_PID=$!

function handle_shutdown {
  echo "Shutting down services..."
  kill -TERM $BACKEND_PID 2>/dev/null
  kill -TERM $FRONTEND_PID 2>/dev/null
  wait
  echo "Shutdown complete"
  exit 0
}

trap handle_shutdown SIGINT SIGTERM

wait $BACKEND_PID $FRONTEND_PID