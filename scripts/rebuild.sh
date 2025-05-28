#!/bin/bash

# Source common functions
source "$(dirname "$0")/common.sh"

echo ">>> Stopping and removing all containers and volumes..."
frontend_port=$(get_frontend_port)

# Kill frontend processes and wait for port to be free
kill_port_process "$frontend_port" "force"
if ! wait_for_port_free "$frontend_port" 15 2; then
  echo "WARNING: Could not free port $frontend_port after multiple attempts."
  echo "You may need to manually identify and kill the process using this port."
  echo "Continuing with rebuild anyway..."
fi

docker compose down -v

echo ">>> Cleaning up frontend..."
cd frontend 2>/dev/null
if [ $? -eq 0 ]; then
  rm -rf node_modules
  rm -rf .next
  rm -f package-lock.json

  echo ">>> Cleaning npm cache..."
  npm cache clean --force

  echo ">>> Installing dependencies..."
  npm install
  cd -
else
  echo ">>> Frontend directory not found, skipping frontend cleanup..."
fi

echo ">>> Rebuilding and starting backend containers..."
docker compose up --build -d

echo ">>> Starting frontend development server..."
cd frontend 2>/dev/null
if [ $? -eq 0 ]; then
  npm run dev &
  cd -
else
  echo ">>> Frontend directory not found, skipping frontend start..."
fi

echo ">>> Everything has been rebuilt and started!"
echo "Frontend: http://localhost:4000"
echo "Backend:  http://localhost:8000"
