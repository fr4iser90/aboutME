#!/bin/bash

# =========================================
# Port Management Functions
# =========================================

# Function to detect and kill processes on a port
kill_port_process() {
  local port=$1
  local force=$2
  local pids=""
  
  # Try lsof
  if command -v lsof &>/dev/null; then
    pids=$(lsof -t -i ":$port" 2>/dev/null | while read pid; do
      if ! ps -p "$pid" -o comm= | grep -q "firefox"; then
        echo "$pid"
      fi
    done)
  fi
  
  # Try netstat if no pids found
  if [ -z "$pids" ] && command -v netstat &>/dev/null; then
    pids=$(netstat -tulpn 2>/dev/null | grep ":$port " | awk '{print $7}' | cut -d'/' -f1)
  fi
  
  if [ -n "$pids" ]; then
    echo "Found process(es) on port $port: $pids"
    for pid in $pids; do
      if [ "$force" = "force" ]; then
        kill -9 "$pid" 2>/dev/null
      else
        kill "$pid" 2>/dev/null
      fi
    done
  fi
}

# Get frontend port from env file
get_frontend_port() {
  local env_file="frontend/.env.local"
  if [ -f "$env_file" ]; then
    local port
    port=$(grep -E '^PORT=' "$env_file" | cut -d'=' -f2)
    if [ -z "$port" ]; then
      port=$(grep -E '^NEXTAUTH_URL=' "$env_file" | sed -E 's/.*:([0-9]+).*/\1/')
    fi
    if [ -z "$port" ]; then
      port=4000
    fi
    echo "$port"
  else
    echo "4000"
  fi
}

# Wait for a port to become free
wait_for_port_free() {
  local port=$1
  local max_attempts=${2:-15}
  local wait_time=${3:-2}
  local attempt=1
  
  while [ $attempt -le $max_attempts ]; do
    if ! lsof -i ":$port" >/dev/null 2>&1; then
      echo "Port $port is now free."
      return 0
    fi
    echo "Port $port is still in use, waiting... (attempt $attempt/$max_attempts)"
    sleep $wait_time
    attempt=$((attempt + 1))
  done
  echo "WARNING: Port $port is STILL in use after $max_attempts attempts!"
  return 1
}

# =========================================
# Docker Management Functions
# =========================================

# Check if Docker is running
check_docker() {
  if ! docker info > /dev/null 2>&1; then
    echo "Docker is not running. Please start Docker and try again."
    return 1
  fi
  return 0
}

# Start test database
start_test_db() {
  # Remove old test-db container if exists (any state)
  docker rm -f about-me-test-db 2>/dev/null || true
  # Remove old test network if exists
  docker network rm about-me_default 2>/dev/null || true
  
  echo "Starting PostgreSQL test database..."
  docker compose -f docker-compose.yml -f docker-compose.override.test.yml up -d --force-recreate test-db
  
  # Wait until healthy
  for i in {1..20}; do
    status=$(docker inspect --format='{{.State.Health.Status}}' about-me-test-db 2>/dev/null)
    if [ "$status" = "healthy" ]; then
      echo "Test DB is healthy!"
      sleep 2
      return 0
    fi
    echo "Waiting for Test DB ($i/20)..."
    sleep 1
  done
  
  echo "Test DB did not become healthy!"
  docker logs about-me-test-db || true
  return 1
}

# Stop test database
stop_test_db() {
  echo "Stopping PostgreSQL test database..."
  docker stop about-me-test-db 2>/dev/null || true
  docker rm about-me-test-db 2>/dev/null || true
}

# =========================================
# Health Check Functions
# =========================================

# Check backend health
check_backend_health() {
  local max_attempts=30
  local attempt=1
  local wait_time=2

  echo "Checking backend health..."
  while [ $attempt -le $max_attempts ]; do
    if curl -s http://localhost:8000/health > /dev/null; then
      echo "Backend is healthy!"
      return 0
    fi
    echo "Attempt $attempt/$max_attempts: Backend not ready yet, waiting $wait_time seconds..."
    sleep $wait_time
    attempt=$((attempt + 1))
  done
  echo "Backend health check failed after $max_attempts attempts"
  return 1
}

# =========================================
# Cache Management Functions
# =========================================

# Function to clean Python caches
clean_caches() {
  echo "Cleaning host caches (__pycache__, .pytest_cache)..."
  find . \( -path '*/__pycache__' -o -path '*/.pytest_cache' \) -type d -exec rm -rf {} +
  echo "Host cache cleaning complete."
}

# =========================================
# Frontend Management Functions
# =========================================

# Check if node_modules exists in frontend
check_frontend_deps() {
  if [ ! -d "frontend/node_modules" ]; then
    echo "Frontend dependencies not found. Installing..."
    cd frontend
    npm install
    cd -
  fi
} 