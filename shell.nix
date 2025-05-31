{ pkgs ? import <nixpkgs> {} }:

let
  pythonEnv = pkgs.python3.withPackages (ps: with ps; [
    # Test dependencies
    pytest
    pytest-asyncio
    pytest-cov
    pytest-mock
    httpx
    
    structlog
    colorama
    
    # Monitoring Dependency
    psutil
    requests
    pillow
    # Database dependencies
    sqlalchemy
    asyncpg
    alembic
    psycopg2
    
    # Other dependencies
    python-dotenv
    py-cpuinfo
    speedtest-cli
    pyyaml
    email-validator
    
    # Web dependencies
    fastapi
    
    # Security dependencies
    cryptography
    python-jose
    passlib
    bcrypt
    
    # Main application dependencies
    uvicorn
    pydantic
    pydantic-settings
    python-multipart
    
    # Development tools
    black
    mypy
    pylint
    
  ]);
in
pkgs.mkShell {
  buildInputs = [
    pythonEnv
    pkgs.tree
    pkgs.nodejs_20    # Add Node.js
    pkgs.nodePackages.npm    # Add npm
    pkgs.nodePackages.npm-check-updates    # Add npm-check-updates
    pkgs.docker    # Add Docker
    pkgs.docker-compose    # Add Docker Compose
    pkgs.curl    # Add curl for health checks
    pkgs.lsof
    pkgs.tmux    # Add tmux for terminal sessions
    pkgs.pyright    # Add pyright for Python type checking
  ];
  
  shellHook = ''
    # Set PYTHONPATH to include the project root
    export PYTHONPATH="$PWD:$PYTHONPATH" # Adjusted for backend.app structure
    # Updated message to reflect current DB name for dev/testing
    echo "Für Tests/Entwicklung: Stelle sicher, dass die PostgreSQL-Datenbank (about-me-db) per Docker läuft!"
    
    # --- Cache Cleaning Function ---
    clean-caches() {
      echo "Cleaning host caches (__pycache__, .pytest_cache)..."
      find . \( -path '*/__pycache__' -o -path '*/.pytest_cache' \) -type d -exec rm -rf {} +
      echo "Host cache cleaning complete."
    }

    # --- Start/Stop Functions ---

    # Start/Stop Main Backend (API + DB)
    start-backend-dev() {
      echo "Starting main API (about-me-backend) and DB (about-me-db) containers..."
      docker compose -f docker-compose.yml up -d about-me-backend about-me-db
    }
    stop-backend-dev() {
      echo "Stopping main API and DB containers..."
      docker compose -f docker-compose.yml stop about-me-backend about-me-db
      docker compose -f docker-compose.yml rm -f about-me-backend about-me-db
      # Ensure correct volume name is used if needed, or let 'docker compose down -v' handle it.
      # docker volume rm about-me-db-data || true # This is handled by 'rebuild-all' or 'close-kill-clean-all'
    }

    # === Test Environment Functions - USER ACTION REQUIRED ===
    # The following functions assume a 'test-db' service and 'docker-compose.override.test.yml'.
    # If you don't have this setup for 'aboutMe', these need adaptation or removal.
    # For now, I've replaced 'hackathon-api' with 'about-me-backend' but 'test-db' remains.
    # You might need to:
    # 1. Create a docker-compose.override.test.yml that defines 'test-db' and configures
    #    'about-me-backend' to use it.
    # 2. Or, adapt these to run tests against 'about-me-db' (use with caution).
    # 3. Or, comment out/remove these test-specific environment functions.
    start-backend-test() {
      echo "Starting test API (about-me-backend) and test DB (test-db) containers..."
      echo "NOTE: This requires a 'docker-compose.override.test.yml' defining 'test-db'."
      if [ ! -f "docker-compose.override.test.yml" ]; then
        echo "ERROR: docker-compose.override.test.yml not found. Cannot start test environment."
        return 1
      fi
      docker compose -f docker-compose.override.test.yml up -d about-me-backend test-db
    }
    stop-backend-test() {
      echo "Stopping test API and test DB containers..."
      if [ ! -f "docker-compose.override.test.yml" ]; then
        echo "NOTE: docker-compose.override.test.yml not found. Assuming no test environment to stop."
        return 0
      fi
      docker compose -f docker-compose.override.test.yml stop about-me-backend test-db
      docker compose -f docker-compose.override.test.yml rm -f about-me-backend test-db
      # docker volume rm test-db-data || true # Assuming test-db might have its own volume
    }

    pytest() {
      check_docker || return 1
      echo "NOTE: Pytest is configured to use a test-specific backend (see start-backend-test)."
      clean-caches
      start-backend-test || return 1
      sleep 5 # Give services time to start
      echo "Running pytest (locally) with arguments: $@"
      command pytest "$@"
      local exit_code=$?
      echo "Pytest finished with exit code $exit_code."
      clean-caches
      stop-backend-test
      return $exit_code
    }

    pytest-minimal-log() {
      check_docker || return 1
      echo "NOTE: Pytest (minimal-log) is configured to use a test-specific backend."
      clean-caches
      start-backend-test || return 1
      sleep 5 # Give services time to start
      echo "Running pytest with minimal log (short tracebacks, warnings disabled, max 30 fails)..."
      command pytest --maxfail=30 --disable-warnings --tb=short > test_report.txt || true
      local exit_code=$?
      echo "Pytest finished with exit code $exit_code. See test_report.txt for results."
      clean-caches
      stop-backend-test
      return $exit_code
    }
    # === End of Test Environment Functions ===

    check_docker() {
      if ! docker info > /dev/null 2>&1; then
        echo "Docker is not running. Please start Docker and try again."
        return 1
      fi
      return 0
    }

    check_frontend_deps() {
      if [ ! -d "frontend/node_modules" ]; then # Corrected path
        echo "Frontend dependencies not found. Installing..."
        install-npm
      fi
    }

    check_backend_health() {
      local max_attempts=30
      local attempt=1
      local wait_time=2
      # Updated port to 8090 and endpoint to /ping for about-me-backend
      local health_url="http://localhost:8090/ping" 

      echo "Checking backend health at $health_url..."
      while [ $attempt -le $max_attempts ]; do
        if curl -s "$health_url" > /dev/null; then
          echo "Backend is healthy!"
          return 0
        fi
        echo "Attempt $attempt/$max_attempts: Backend not ready yet, waiting $wait_time seconds..."
        sleep $wait_time
        attempt=$((attempt + 1))
      done
      echo "Backend health check failed after $max_attempts attempts"
      return 1
    }

    check_docker_containers() {
      # Updated service name to about-me-backend
      if ! docker compose -f docker-compose.yml ps --services --filter "status=running" | grep -q "about-me-backend"; then
        echo "Docker containers not running. Building and starting..."
        if ! start-main-services; then # Renamed from start-backend for clarity
          echo "Failed to start main services properly. Please check the logs."
          return 1
        fi
        if ! check_backend_health; then
          echo "Failed to start backend properly. Please check the logs."
          return 1
        fi
      fi
      return 0
    }

    quick-install() {
      echo "Starting quick installation process..."
      check_frontend_deps
      if check_docker; then
        echo "Building Docker containers for aboutMe project..."
        docker compose -f docker-compose.yml build
      fi
      echo "Quick installation complete!"
    }
    
    # Renamed start-backend to start-main-services for clarity
    start-main-services() {
      echo "Starting main backend (about-me-backend) and database (about-me-db)..."
      docker compose -f docker-compose.yml up --build -d about-me-backend about-me-db
      sleep 5 # Wait for containers to initialize
      # Updated service name for log check
      if ! docker compose -f docker-compose.yml ps --services --filter "status=running" | grep -q "about-me-backend"; then
        echo "Failed to start containers. Check logs with: docker compose logs about-me-backend"
        return 1
      fi
      echo "Main backend and database containers started successfully"
    }

    quick-startup() {
      echo "Starting quick startup process..."
      if ! check_docker; then return 1; fi
      check_frontend_deps
      if ! check_docker_containers; then # This now calls start-main-services if needed
        echo "Failed to ensure backend is running. Aborting startup."
        return 1
      fi
      echo "Starting frontend development server..."
      start-frontend-dev
      echo "Quick startup complete! All services should be running."
      echo "Frontend: http://localhost:$(get-frontend-port)" # Use dynamic port
      echo "Backend:  http://localhost:8090" # Corrected backend port
    }

    install-npm() {
      echo "Installing npm dependencies for frontend..."
      cd frontend # Corrected path
      npm install
      cd -
      echo "npm dependencies installation complete."
    }

    start-frontend-dev() {
      echo "Starting frontend development server on port $(get-frontend-port)..."
      cd frontend # Corrected path
      npm run dev # This uses port 4000 as per package.json, exposed on 4040 by docker-compose
      cd -
    }
    
    start-frontend-tmux() {
      echo "Starting frontend development server in tmux session..."
      local session_name="aboutme-frontend" # Updated session name
      if ! tmux has-session -t "$session_name" 2>/dev/null; then
        tmux new-session -d -s "$session_name"
      fi
      tmux send-keys -t "$session_name" "cd $(pwd)/frontend" C-m # Corrected path
      tmux send-keys -t "$session_name" "npm run dev" C-m
      echo "Frontend server started in tmux session '$session_name'"
      echo "To attach to the session: tmux attach -t $session_name"
    }

    rebuild-backend() {
      echo "Stopping and removing main backend/db containers and volumes..."
      docker compose -f docker-compose.yml down -v --remove-orphans # Ensure all related are down
      echo "Rebuilding and starting main backend/db containers in background..."
      # Explicitly list services to rebuild and start
      docker compose -f docker-compose.yml up --build -d about-me-backend about-me-db
      echo "Main backend/db rebuild complete!"
    }

    rebuild-frontend() {
      echo "Removing node_modules, package-lock.json, and .next in the frontend..."
      cd frontend # Corrected path
      rm -rf node_modules package-lock.json .next
      echo "Cleaning npm cache..."
      npm cache clean --force
      echo "Reinstalling npm dependencies..."
      npm install
      cd -
      echo "Frontend dependencies have been completely reinstalled!"
      start-frontend-dev
    }
    
    # --- Improved Port Management Functions (largely unchanged, ensure get-frontend-port is accurate) ---
    detect_port_process() {
      local port=$1
      local pids=""
      if command -v lsof &>/dev/null; then
        pids=$(lsof -t -i ":$port" 2>/dev/null | while read pid; do if ! ps -p "$pid" -o comm= | grep -q "firefox"; then echo "$pid"; fi; done)
      fi
      if [ -z "$pids" ] && command -v netstat &>/dev/null; then
        pids=$(netstat -tulpn 2>/dev/null | grep ":$port " | awk '{print $7}' | cut -d'/' -f1 | grep -v "-" | sort -u | while read pid; do if ! ps -p "$pid" -o comm= | grep -q "firefox"; then echo "$pid"; fi; done)
      fi
      if [ -z "$pids" ] && command -v ss &>/dev/null; then
        pids=$(ss -tulpn 2>/dev/null | grep ":$port " | awk '{print $7}' | cut -d',' -f2 | cut -d'=' -f2 | grep -v "-" | sort -u | while read pid; do if ! ps -p "$pid" -o comm= | grep -q "firefox"; then echo "$pid"; fi; done)
      fi
      if [ -z "$pids" ] && command -v fuser &>/dev/null; then
        pids=$(fuser -n tcp "$port" 2>/dev/null | awk '{for(i=1;i<=NF;i++) if($i+0>0) print $i}' | while read pid; do if ! ps -p "$pid" -o comm= | grep -q "firefox"; then echo "$pid"; fi; done)
      fi
      echo "$pids"
    }

    is_port_in_use() {
      local port=$1
      if command -v lsof &>/dev/null && lsof -i ":$port" &>/dev/null; then return 0; fi
      if command -v netstat &>/dev/null && netstat -tuln 2>/dev/null | grep -q ":$port "; then return 0; fi
      if command -v ss &>/dev/null && ss -tuln 2>/dev/null | grep -q ":$port "; then return 0; fi
      if command -v fuser &>/dev/null && fuser -n tcp "$port" 2>/dev/null | grep -q "$port"; then return 0; fi
      if command -v nc &>/dev/null; then nc -z localhost "$port" &>/dev/null && return 0; 
      elif command -v timeout &>/dev/null; then timeout 1 bash -c "</dev/tcp/localhost/$port" &>/dev/null && return 0; fi
      return 1
    }

    kill_port_process() {
      local port=$1; local force=$2; local pids=$(detect_port_process "$port"); local killed=false
      if [ -n "$pids" ]; then
        echo "Found process(es) on port $port (excluding Firefox): $pids"
        if [ "$force" != "force" ]; then
          echo "Attempting graceful termination..."; for pid in $pids; do if ! ps -p "$pid" -o comm= | grep -q "firefox"; then kill "$pid" 2>/dev/null; killed=true; fi; done; sleep 1
        fi
        if [ "$force" = "force" ] || is_port_in_use "$port"; then
          echo "Using force termination (kill -9)..."; for pid in $pids; do if ! ps -p "$pid" -o comm= | grep -q "firefox"; then kill -9 "$pid" 2>/dev/null; killed=true; fi; done; sleep 1
        fi
        if is_port_in_use "$port"; then echo "WARNING: Port $port is still in use after kill attempts!"; return 1; else echo "Successfully freed port $port"; return 0; fi
      else
        echo "No process found using port $port (excluding Firefox)"; if is_port_in_use "$port"; then echo "WARNING: Port $port appears to be in use, but couldn't identify the process"; return 1; fi; return 0
      fi
    }

    wait_for_port_free() {
      local port=$1
      local max_attempts=10
      local wait_time=1
      local attempt=1
      if [ -n "$2" ]; then max_attempts=$2; fi
      if [ -n "$3" ]; then wait_time=$3; fi

      while [ $attempt -le $max_attempts ]; do
        if ! is_port_in_use "$port"; then echo "Port $port is now free."; return 0; fi
        echo "Port $port is still in use, waiting... (attempt $attempt/$max_attempts)"; sleep $wait_time; attempt=$((attempt + 1))
      done
      echo "WARNING: Port $port is STILL in use after $max_attempts attempts!"; return 1
    }

    kill-frontend-port() {
      local port=$(get-frontend-port); echo "Checking for processes using frontend port $port..."
      kill_port_process "$port"
      if is_port_in_use "$port"; then
        echo "Port still in use, checking for Next.js processes..."; local next_pids=$(ps aux | grep -i "next dev" | grep -v grep | awk '{print $2}')
        if [ -n "$next_pids" ]; then echo "Found Next.js processes: $next_pids"; for pid in $next_pids; do kill "$pid" 2>/dev/null; done; sleep 1; fi
      fi
      if is_port_in_use "$port"; then echo "Still in use, trying force kill..."; kill_port_process "$port" "force"; fi
    }

    clean-ports() {
      for port in "$@"; do
        echo "Cleaning port $port..."; kill_port_process "$port"
        if is_port_in_use "$port"; then echo "First attempt failed, trying force kill for port $port..."; kill_port_process "$port" "force"; fi
      done
    }

    clean-frontend() {
      kill-frontend-port
      echo "Removing node_modules, package-lock.json, and .next in the frontend..."
      cd frontend; rm -rf node_modules package-lock.json .next; cd - # Corrected path
      echo "Frontend has been cleaned!"
    }

    rebuild-all() {
      echo ">>> Stopping and removing all containers and volumes..."
      local frontend_port_val=$(get-frontend-port) # Renamed variable to avoid conflict
      kill-frontend-port # This uses get-frontend-port internally
      if ! wait_for_port_free "$frontend_port_val" 15 2; then
        echo "WARNING: Could not free port $frontend_port_val after multiple attempts."
        echo "Continuing with rebuild anyway..."
      fi
      docker compose -f docker-compose.yml down -v --remove-orphans
      echo ">>> Cleaning up frontend..."
      cd frontend # Corrected path
      rm -rf node_modules package-lock.json .next
      echo ">>> Cleaning npm cache..."
      npm cache clean --force
      echo ">>> Installing dependencies..."
      npm install
      cd -
      echo ">>> Rebuilding and starting main backend/db containers..."
      # Explicitly list services
      docker compose -f docker-compose.yml up --build -d about-me-backend about-me-db
      echo ">>> Starting frontend development server..."
      cd frontend # Corrected path
      npm run dev & # This will run in background
      cd -
      echo ">>> Everything has been rebuilt and started!"
      echo "Frontend: http://localhost:$(get-frontend-port)" # Use dynamic port
      echo "Backend:  http://localhost:8090" # Corrected backend port
    }

    clean-all() {
      clean-caches
      kill-frontend-port
      clean-frontend
      echo "Everything has been cleaned!"
    }

    update-frontend-deps() {
      local auto_update=false
      
      # Check if --auto flag is provided
      if [ "$1" = "--auto" ]; then
        auto_update=true
      fi
      
      echo ">>> Checking for frontend dependency updates..."
      cd frontend
      
      # First, ensure ESLint is properly configured
      if [ ! -f ".eslintrc.json" ]; then
        echo "Configuring ESLint..."
        npx eslint --init
      fi
      
      echo "Running npm-check-updates..."
      ncu
      
      if [ "$auto_update" = true ]; then
        echo "Auto-update mode: Updating all dependencies..."
        ncu -u
        npm install
        echo "Running security fixes..."
        npm audit fix --force
        echo "Running lint fix..."
        npm run lint -- --fix
        echo "All updates and fixes completed!"
      else
        echo "Do you want to update all dependencies? (y/n)"
        read -r answer
        if [ "$answer" = "y" ]; then
          echo "Updating all dependencies..."
          ncu -u
          npm install
          echo "Running security fixes..."
          npm audit fix --force
          echo "Running lint fix..."
          npm run lint -- --fix
          
          # Check if there are still ESLint errors
          if npm run lint 2>&1 | grep -q "Error:"; then
            echo "There are still ESLint errors. Do you want to see them? (y/n)"
            read -r show_errors
            if [ "$show_errors" = "y" ]; then
              npm run lint
            fi
          fi
          
          echo "All updates and fixes completed!"
        else
          echo "Update cancelled."
        fi
      fi
      cd -
    }

    update-backend-deps() {
      echo ">>> Checking for backend dependency updates..."
      if [ -f "backend/requirements.txt" ]; then
        cd backend
        echo "Current Python dependencies:"
        pip list --outdated
        echo "Do you want to update all dependencies? (y/n)"
        read -r answer
        if [ "$answer" = "y" ]; then
          echo "Updating all Python dependencies..."
          pip install --upgrade -r requirements.txt
          echo "Backend dependencies updated!"
        else
          echo "Update cancelled."
        fi
        cd -
      else
        echo "No requirements.txt found in backend directory."
      fi
    }

    update-all() {
      echo ">>> Starting full dependency update..."
      update-frontend-deps
      update-backend-deps
      echo ">>> All dependency checks completed!"
    }

    get-frontend-port() {
      local env_file="frontend/.env.local" # Corrected path
      local port="4000" # Default to the host port defined in npm dev
      if [ -f "$env_file" ]; then
        local env_port
        env_port=$(grep -E '^PORT=' "$env_file" | cut -d'=' -f2)
        if [ -z "$env_port" ]; then
          env_port=$(grep -E '^NEXTAUTH_URL=' "$env_file" | sed -E 's/.*:([0-9]+).*/\1/')
        fi
        if [ -n "$env_port" ]; then # If port found in .env.local, use it
          port=$env_port
        fi
      fi
      echo "$port"
    }
    
    tree-frontend() {
      tree frontend -I 'node_modules|.next|.swc|dist|build' # Corrected path, added common build dirs
    }

    tree-backend() {
      tree backend -I '__pycache__|.pytest_cache|.venv|dist|build' # Corrected path, added common build/venv dirs
    }   

    trivy() {
      nix-shell -p trivy --run "trivy fs --scanners vuln,secret,misconfig --exit-code 0 --format table --ignore-unfixed ."
    }

    lint-fix() {
      echo "Running black auto-fix..."
      black backend # Target backend directory
      echo "Running pylint auto-fix (this might take a moment to generate .pylintrc if it doesn't exist)..."
      # Consider if .pylintrc should be project-specific or generated each time
      # pylint --generate-rcfile > .pylintrc 
      # Example: pylint --disable=C0111,C0103,C0303,W0311,W0603,W0621,R0903,R0913,R0914,R0915 --output-format=colorized backend
      echo "Linting (Python) - check your project's pylint config. For now, skipping detailed pylint auto-fix."
      echo "Linting complete!"
    }

    close-kill-clean-all() {
      echo ">>> Stopping and removing all backend containers and volumes (project only)..."
      docker compose -f docker-compose.yml down -v --remove-orphans
      echo ">>> Killing frontend dev server and freeing its port..."
      kill-frontend-port
      if ! wait_for_port_free "$(get-frontend-port)" 10 2; then
        echo "WARNING: Could not free frontend port after multiple attempts."
      fi
      echo ">>> Removing frontend build artifacts and dependencies..."
      cd frontend # Corrected path
      rm -rf node_modules package-lock.json .next
      cd -
      echo ">>> Cleaning Python caches (__pycache__, .pytest_cache)..."
      clean-caches
      # Removed explicit network removal, docker compose down -v handles it.
      echo ">>> All project apps stopped and all caches/artifacts cleaned!"
      echo "If you want to start fresh, use: quick-startup"
    }

    # === Test DB Functions - USER ACTION REQUIRED ===
    # These functions still refer to 'test-db'. You need to decide how to handle testing:
    # 1. Create a 'docker-compose.override.test.yml' with a 'test-db' service and
    #    configure 'about-me-backend' to use it for tests.
    # 2. Adapt these to use 'about-me-db' for tests (be careful with data).
    # 3. Comment out or remove these if not using a separate test DB setup for now.
    start-test-db() {
      echo "NOTE: This function assumes a 'test-db' service defined in 'docker-compose.override.test.yml'."
      if [ ! -f "docker-compose.override.test.yml" ]; then
        echo "ERROR: docker-compose.override.test.yml not found. Cannot start test-db."
        return 1
      fi
      docker rm -f test-db 2>/dev/null || true # Generic name, ensure it matches your override
      echo "Starting PostgreSQL test database (test-db)..."
      docker compose -f docker-compose.yml -f docker-compose.override.test.yml up -d --force-recreate test-db
      for i in {1..20}; do
        status=$(docker inspect --format='{{.State.Health.Status}}' test-db 2>/dev/null)
        if [ "$status" = "healthy" ]; then echo "Test-DB is healthy!"; sleep 2; return 0; fi
        echo "Waiting for Test-DB ($i/20)..."; sleep 1
      done
      echo "Test-DB did not become healthy!"; docker logs test-db || true; return 1
    }

    stop-test-db() {
      echo "Stopping PostgreSQL test database (test-db)..."
      docker stop test-db 2>/dev/null || true
      docker rm test-db 2>/dev/null || true
    }
    # === End of Test DB Functions ===

    pytest-with-testdb() { # This function now clearly depends on the above test-db setup
      echo "NOTE: This command requires a working 'test-db' setup via 'docker-compose.override.test.yml'."
      start-test-db || return 1
      pytest "$@" # Pass along any arguments to pytest
      local exit_code=$?
      stop-test-db
      return $exit_code
    }

    check-backend() {
      ./scripts/check_backend.sh "$@"
    }

    echo "Python development environment activated"
    echo "PYTHONPATH set to: $PYTHONPATH"
    echo "Available commands:"
    echo "  quick-startup       - Start all services with automatic dependency checks"
    echo "  quick-install       - Install all dependencies and build Docker containers"
    echo "  install-npm         - Install npm dependencies for the frontend"
    echo "  start-frontend-dev  - Start the frontend development server (Host: $(get-frontend-port))"
    echo "  start-frontend-tmux - Start the frontend development server in a tmux session"
    echo "  start-main-services - Start the main backend and database using Docker"
    echo "  rebuild-all         - Full rebuild: Stops, cleans, reinstalls frontend deps, rebuilds/starts backend & frontend"
    echo "  rebuild-backend     - Clean rebuild of backend Docker services"
    echo "  rebuild-frontend    - Clean rebuild of frontend dependencies and restarts dev server"
    echo "  pytest              - Run pytest (uses test-specific DB if configured, see notes)"
    echo "  pytest-minimal-log  - Run pytest with minimal log (uses test-specific DB, see notes)"
    echo "  pytest-with-testdb  - Explicitly run pytest with the 'test-db' setup"
    echo "  clean-caches        - Manually clean Python host caches"
    echo "  clean-frontend      - Clean frontend (node_modules, .next, etc.)"
    echo "  clean-all           - Clean Python and frontend caches/artifacts"
    echo "  close-kill-clean-all - Stops all services, cleans everything (Docker, caches, frontend artifacts)"
    echo "  get-frontend-tree   - Show frontend directory structure (excluding common large dirs)"
    echo "  get-backend-tree    - Show backend directory structure (excluding common large dirs)"
    echo "  trivy               - Run Trivy security scan"
    echo "  lint-fix            - Attempt to auto-fix Python linting issues with black"
    echo "  start-backend-dev   - Alias for start-main-services"
    echo "  stop-backend-dev    - Stops main backend and db"
    echo "  update-frontend-deps - Check and update frontend dependencies"
    echo "  update-backend-deps - Check and update backend dependencies"
    echo "  update-all          - Check and update all dependencies (frontend and backend)"
    echo "  check-backend       - Run type checking and compilation checks on backend code"
  '';
}
