#!/bin/bash

# Source common functions
source "$(dirname "$0")/common.sh"

echo "Starting quick startup process..."

# Check Docker is running
if ! check_docker; then
  exit 1
fi

# Check and install frontend dependencies if needed
check_frontend_deps

# Start backend if not running and wait for it to be healthy
if ! docker compose ps --services --filter "status=running" | grep -q "about-me-backend"; then
  echo "Docker containers not running. Building and starting..."
  docker compose up --build -d
  if ! check_backend_health; then
    echo "Failed to start backend properly. Please check the logs."
    exit 1
  fi
fi

# Start frontend
echo "Starting frontend development server..."
cd frontend
npm run dev &
cd -

echo "Quick startup complete! All services should be running."
echo "Frontend: http://localhost:4000"
echo "Backend: http://localhost:8000"
