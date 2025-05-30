#!/bin/bash

# Source common functions
source "$(dirname "$0")/common.sh"

# Function to run Python type checking
run_python_checks() {
    echo "Running Python type checking..."
    local exit_code=0
    
    # Run mypy
    echo "Running mypy..."
    if ! mypy backend; then
        echo "mypy found type errors!"
        exit_code=1
    fi
    
    # Run pyright
    echo "Running pyright..."
    if ! pyright backend; then
        echo "pyright found type errors!"
        exit_code=1
    fi
    
    # Run compileall
    echo "Running compileall..."
    if ! python -m compileall backend; then
        echo "compileall found errors!"
        exit_code=1
    fi
    
    return $exit_code
}

# Function to run all checks
run_all_checks() {
    local exit_code=0
    
    echo "=== Starting Backend Code Checks ==="
    
    # Run Python checks
    if ! run_python_checks; then
        echo "Python checks failed!"
        exit_code=1
    fi
    
    echo "=== Backend Code Checks Complete ==="
    return $exit_code
}

# Main execution
case "$1" in
    "python")
        run_python_checks
        ;;
    *)
        run_all_checks
        ;;
esac 