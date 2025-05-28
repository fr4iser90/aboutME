#!/bin/bash

# Source common functions
source "$(dirname "$0")/common.sh"

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

echo ">>> Stopping backend containers..."
docker compose down

echo ">>> Killing frontend dev server..."
kill_port_process "$(get_frontend_port)" "force"

echo "All services have been stopped."
