#!/bin/bash

# Source common functions
source "$(dirname "$0")/common.sh"

# Main test function
run_tests() {
  check_docker || return 1
  clean_caches
  
  start_test_db || return 1
  sleep 5
  
  if [ "$1" = "--minimal" ]; then
    echo "Running pytest with minimal log (short tracebacks, warnings disabled, max 30 fails)..."
    python -m pytest --maxfail=30 --disable-warnings --tb=short > test_report.txt || true
    echo "Pytest finished. See test_report.txt for results."
  else
    echo "Running pytest with arguments: $@"
    python -m pytest "$@"
  fi
  
  local exit_code=$?
  echo "Pytest finished with exit code $exit_code."
  
  clean_caches
  stop_test_db
  
  return $exit_code
}

# Set PYTHONPATH
export PYTHONPATH="$PWD/api:$PWD:$PYTHONPATH"

# Run tests with all arguments passed to this script
run_tests "$@"
