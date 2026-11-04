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

# private/ is not part of the image, so a fresh draft volume starts empty and the
# CMS editor would have nothing to edit. Seeding an empty store is idempotent:
# as soon as it holds files this branch never runs again.
if [ -z "$(ls -A /app/private/data 2>/dev/null)" ] && [ -n "$(ls -A /app/public/data 2>/dev/null)" ]; then
  if cp -a /app/public/data/. /app/private/data/ 2>/dev/null; then
    echo "{\"timestamp\":\"$(date -Iseconds)\",\"level\":\"INFO\",\"event\":\"private_data_seeded\",\"message\":\"Draft store seeded from published data\",\"service\":\"docker-entrypoint\"}"
  else
    echo "{\"timestamp\":\"$(date -Iseconds)\",\"level\":\"WARNING\",\"event\":\"private_data_seed_failed\",\"message\":\"Could not seed empty draft store\",\"service\":\"docker-entrypoint\"}"
  fi
fi

# Start Next.js server
echo "🚀 Starting Next.js server..."
exec node server.js
