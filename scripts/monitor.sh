#!/bin/bash

# Source common functions
source "$(dirname "$0")/common.sh"

# Function to check system resources
check_system_resources() {
    echo "=== System Resources ==="
    
    # CPU Usage
    echo "CPU Usage:"
    top -bn1 | grep "Cpu(s)" | sed "s/.*, *\([0-9.]*\)%* id.*/\1/" | awk '{print 100 - $1"%"}'
    
    # Memory Usage
    echo "Memory Usage:"
    free -h | grep -v + > /tmp/mem_usage
    cat /tmp/mem_usage
    rm /tmp/mem_usage
    
    # Disk Usage
    echo "Disk Usage:"
    df -h | grep -v "tmpfs" | grep -v "udev"
    
    # Docker Container Status
    echo "Docker Container Status:"
    docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
}

# Function to monitor logs
monitor_logs() {
    local service=$1
    local lines=${2:-50}
    
    echo "=== Recent Logs for $service ==="
    if [ "$service" = "backend" ]; then
        docker logs --tail $lines about-me-backend
    elif [ "$service" = "db" ]; then
        docker logs --tail $lines about-me-db
    elif [ "$service" = "frontend" ]; then
        tail -n $lines frontend/.next/server.log 2>/dev/null || echo "No frontend logs found"
    else
        echo "Unknown service: $service"
        return 1
    fi
}

# Function to check service health
check_service_health() {
    local service=$1
    
    echo "=== Health Check for $service ==="
    case $service in
        "backend")
            check_backend_health
            ;;
        "db")
            if docker ps | grep -q "about-me-db"; then
                echo "Database container is running"
                if docker exec about-me-db pg_isready -U postgres > /dev/null 2>&1; then
                    echo "Database is accepting connections"
                else
                    echo "Database is not accepting connections"
                    return 1
                fi
            else
                echo "Database container is not running"
                return 1
            fi
            ;;
        "frontend")
            if curl -s http://localhost:4000 > /dev/null; then
                echo "Frontend is responding"
            else
                echo "Frontend is not responding"
                return 1
            fi
            ;;
        *)
            echo "Unknown service: $service"
            return 1
            ;;
    esac
}

# Function to run all checks
run_all_checks() {
    local exit_code=0
    
    echo "=== Starting Comprehensive System Check ==="
    
    # Check system resources
    check_system_resources
    
    # Check service health
    for service in backend db frontend; do
        if ! check_service_health "$service"; then
            exit_code=1
        fi
    done
    
    # Monitor logs
    for service in backend db frontend; do
        monitor_logs "$service"
    done
    
    echo "=== System Check Complete ==="
    return $exit_code
}

# Main execution
case "$1" in
    "resources")
        check_system_resources
        ;;
    "logs")
        monitor_logs "$2" "$3"
        ;;
    "health")
        check_service_health "$2"
        ;;
    *)
        run_all_checks
        ;;
esac 