#!/bin/bash

# Source common functions
source "$(dirname "$0")/common.sh"

# Configuration
BACKUP_DIR="backups"
DB_BACKUP_DIR="$BACKUP_DIR/database"
CONFIG_BACKUP_DIR="$BACKUP_DIR/config"
MAX_BACKUPS=5

# Create backup directories if they don't exist
mkdir -p "$DB_BACKUP_DIR" "$CONFIG_BACKUP_DIR"

# Function to backup database
backup_database() {
    local timestamp=$(date +%Y%m%d_%H%M%S)
    local backup_file="$DB_BACKUP_DIR/db_backup_$timestamp.sql"
    
    echo "Creating database backup..."
    if docker exec about-me-db pg_dump -U postgres > "$backup_file"; then
        echo "Database backup created: $backup_file"
        # Compress the backup
        gzip "$backup_file"
        echo "Backup compressed: ${backup_file}.gz"
        
        # Cleanup old backups
        cleanup_old_backups "$DB_BACKUP_DIR" "db_backup_*.sql.gz"
    else
        echo "Database backup failed!"
        return 1
    fi
}

# Function to backup configuration
backup_config() {
    local timestamp=$(date +%Y%m%d_%H%M%S)
    local backup_file="$CONFIG_BACKUP_DIR/config_backup_$timestamp.tar.gz"
    
    echo "Creating configuration backup..."
    if tar -czf "$backup_file" .env docker-compose.yml; then
        echo "Configuration backup created: $backup_file"
        
        # Cleanup old backups
        cleanup_old_backups "$CONFIG_BACKUP_DIR" "config_backup_*.tar.gz"
    else
        echo "Configuration backup failed!"
        return 1
    fi
}

# Function to cleanup old backups
cleanup_old_backups() {
    local dir=$1
    local pattern=$2
    
    echo "Cleaning up old backups in $dir..."
    # Keep only the MAX_BACKUPS most recent backups
    ls -t "$dir"/$pattern 2>/dev/null | tail -n +$((MAX_BACKUPS + 1)) | xargs -r rm
}

# Function to restore database backup
restore_database() {
    local backup_file=$1
    
    if [ ! -f "$backup_file" ]; then
        echo "Backup file not found: $backup_file"
        return 1
    fi
    
    echo "Restoring database from backup: $backup_file"
    if [[ "$backup_file" == *.gz ]]; then
        gunzip -c "$backup_file" | docker exec -i about-me-db psql -U postgres
    else
        docker exec -i about-me-db psql -U postgres < "$backup_file"
    fi
    
    if [ $? -eq 0 ]; then
        echo "Database restore completed successfully"
    else
        echo "Database restore failed!"
        return 1
    fi
}

# Function to restore configuration
restore_config() {
    local backup_file=$1
    
    if [ ! -f "$backup_file" ]; then
        echo "Backup file not found: $backup_file"
        return 1
    fi
    
    echo "Restoring configuration from backup: $backup_file"
    if tar -xzf "$backup_file"; then
        echo "Configuration restore completed successfully"
    else
        echo "Configuration restore failed!"
        return 1
    fi
}

# Function to list available backups
list_backups() {
    echo "=== Database Backups ==="
    ls -lh "$DB_BACKUP_DIR" 2>/dev/null || echo "No database backups found"
    
    echo -e "\n=== Configuration Backups ==="
    ls -lh "$CONFIG_BACKUP_DIR" 2>/dev/null || echo "No configuration backups found"
}

# Main execution
case "$1" in
    "db")
        backup_database
        ;;
    "config")
        backup_config
        ;;
    "all")
        backup_database
        backup_config
        ;;
    "restore-db")
        if [ -z "$2" ]; then
            echo "Please specify a backup file to restore"
            exit 1
        fi
        restore_database "$2"
        ;;
    "restore-config")
        if [ -z "$2" ]; then
            echo "Please specify a backup file to restore"
            exit 1
        fi
        restore_config "$2"
        ;;
    "list")
        list_backups
        ;;
    *)
        echo "Usage: $0 {db|config|all|restore-db|restore-config|list}"
        echo "  db             - Backup database only"
        echo "  config         - Backup configuration only"
        echo "  all            - Backup both database and configuration"
        echo "  restore-db     - Restore database from backup"
        echo "  restore-config - Restore configuration from backup"
        echo "  list           - List available backups"
        exit 1
        ;;
esac 