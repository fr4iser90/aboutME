#!/bin/bash

# Source common functions
source "$(dirname "$0")/common.sh"

# Function to run Trivy scan
run_trivy_scan() {
    echo "Running Trivy vulnerability scan..."
    nix-shell -p trivy --run "trivy fs --scanners vuln,secret,misconfig --exit-code 0 --format table --ignore-unfixed ."
}

# Function to run OWASP ZAP scan
run_zap_scan() {
    if ! command -v zap-cli &>/dev/null; then
        echo "OWASP ZAP not found. Install it for security scanning."
        return 1
    fi

    echo "Running OWASP ZAP scan..."
    # Start backend if not running
    if ! check_backend_health; then
        echo "Starting backend for ZAP scan..."
        ./scripts/start.sh
        sleep 10  # Wait for backend to be ready
    fi
    
    # Run ZAP scan
    zap-cli quick-scan --self-contained --start-options "-config api.disablekey=true" http://localhost:8000
    
    # Generate report
    zap-cli report -o zap-report.html -f html
    echo "ZAP scan report generated: zap-report.html"
}

# Function to run dependency checks
run_dependency_checks() {
    echo "Running dependency security checks..."
    
    # Check Python dependencies
    echo "Checking Python dependencies..."
    safety check
    
    # Check npm dependencies
    echo "Checking npm dependencies..."
    cd frontend || exit 1
    npm audit
    cd - || exit 1
}

# Function to run all security checks
run_all_security_checks() {
    local exit_code=0
    
    echo "=== Starting Security Checks ==="
    
    # Run Trivy scan
    if ! run_trivy_scan; then
        echo "Trivy scan failed!"
        exit_code=1
    fi
    
    # Run ZAP scan
    if ! run_zap_scan; then
        echo "ZAP scan failed!"
        exit_code=1
    fi
    
    # Run dependency checks
    if ! run_dependency_checks; then
        echo "Dependency checks failed!"
        exit_code=1
    fi
    
    echo "=== Security Checks Complete ==="
    return $exit_code
}

# Main execution
case "$1" in
    "trivy")
        run_trivy_scan
        ;;
    "zap")
        run_zap_scan
        ;;
    "deps")
        run_dependency_checks
        ;;
    *)
        run_all_security_checks
        ;;
esac
