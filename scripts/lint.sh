#!/bin/bash

# Source common functions
source "$(dirname "$0")/common.sh"

# Function to run Python linting
run_python_lint() {
    echo "Running Python linting..."
    
    # Black formatting
    echo "Running black auto-fix..."
    black .
    
    # Pylint
    echo "Running pylint..."
    pylint --generate-rcfile > .pylintrc
    pylint --disable=C0111,C0103,C0303,W0311,W0603,W0621,R0903,R0913,R0914,R0915 \
           --output-format=colorized .
    
    # MyPy type checking
    echo "Running mypy type checking..."
    mypy .
}

# Function to run frontend linting
run_frontend_lint() {
    echo "Running frontend linting..."
    cd frontend || exit 1
    
    # ESLint
    echo "Running ESLint..."
    npm run lint
    
    # TypeScript type checking
    echo "Running TypeScript type checking..."
    npm run type-check
    
    cd - || exit 1
}

# Function to run all linting checks
run_all_checks() {
    local exit_code=0
    
    echo "=== Starting Code Quality Checks ==="
    
    # Run Python linting
    if ! run_python_lint; then
        echo "Python linting failed!"
        exit_code=1
    fi
    
    # Run frontend linting
    if ! run_frontend_lint; then
        echo "Frontend linting failed!"
        exit_code=1
    fi
    
    echo "=== Code Quality Checks Complete ==="
    return $exit_code
}

# Main execution
case "$1" in
    "python")
        run_python_lint
        ;;
    "frontend")
        run_frontend_lint
        ;;
    *)
        run_all_checks
        ;;
esac 