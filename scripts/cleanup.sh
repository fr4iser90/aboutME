#!/bin/bash

# Source common functions
source "$(dirname "$0")/common.sh"

echo ">>> Stopping and removing all backend containers and volumes (project only)..."
docker compose down -v

echo ">>> Killing frontend dev server and freeing its port..."
kill_port_process "$(get_frontend_port)" "force"

echo ">>> Removing ALL node_modules and build artifacts..."
# Clean root directory
rm -rf node_modules
rm -f package-lock.json
rm -f yarn.lock
rm -f pnpm-lock.yaml

# Clean frontend directory
cd frontend 2>/dev/null
if [ $? -eq 0 ]; then
  rm -rf node_modules
  rm -rf .next
  rm -rf dist
  rm -rf build
  rm -rf .turbo
  rm -rf .swc
  rm -f package-lock.json
  rm -f yarn.lock
  rm -f pnpm-lock.yaml
  rm -rf .cache
  rm -rf .parcel-cache
  rm -rf .eslintcache
  rm -rf .stylelintcache
  cd -
fi

echo ">>> Cleaning Python caches (__pycache__, .pytest_cache)..."
clean_caches

echo ">>> Removing project-specific Docker network (if exists)..."
docker network rm about-me_default 2>/dev/null || true

echo ">>> All project apps stopped and all caches/artifacts cleaned!"
echo "If you want to start fresh, use: ./scripts/start.sh"
