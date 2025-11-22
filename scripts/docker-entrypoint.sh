#!/bin/sh

# Docker Entrypoint Script
# Runs configuration validation AFTER volumes are mounted
# and sets SETUP_MODE accordingly before starting Next.js

echo "🚀 Starting Portfolio Container..."

# Run runtime configuration check
node /app/scripts/runtime-config-check.js
VALIDATION_EXIT_CODE=$?

# Set SETUP_MODE based on validation result
if [ $VALIDATION_EXIT_CODE -eq 1 ]; then
  export SETUP_MODE="true"
  export ENABLE_EDITOR="true"
  export ENABLE_AUTH="true"
  echo "{\"timestamp\":\"$(date -Iseconds)\",\"level\":\"INFO\",\"event\":\"setup_mode_activated\",\"message\":\"Setup mode enabled based on runtime validation\",\"service\":\"docker-entrypoint\"}"
else
  export SETUP_MODE="false"
  echo "{\"timestamp\":\"$(date -Iseconds)\",\"level\":\"INFO\",\"event\":\"normal_mode_activated\",\"message\":\"Normal mode - portfolio fully configured\",\"service\":\"docker-entrypoint\"}"
fi

# Start Next.js server
echo "🚀 Starting Next.js server..."
exec node server.js

