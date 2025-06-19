#!/bin/bash
set -e

# Function to log with timestamp
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1"
}

# Function to cleanup background processes
cleanup() {
    log "Cleaning up background processes..."
    pkill -f "Xvfb" || true
    pkill -f "Xvnc" || true
    pkill -f "vncserver" || true
    pkill -f "fluxbox" || true
    pkill -f "websockify" || true
    rm -f /tmp/.X99-lock || true
    rm -f /tmp/.X*-lock || true
    exit 0
}

# Trap cleanup function on script exit
trap cleanup EXIT INT TERM

# Set display
export DISPLAY=:99

# Clean up any existing X server processes and lock files
log "Cleaning up any existing X server processes..."
pkill -f "Xvfb" || true
pkill -f "Xvnc" || true
rm -f /tmp/.X99-lock || true
rm -f /tmp/.X*-lock || true

# Start TigerVNC server (Xvnc) directly - this provides both X server and VNC
log "Starting TigerVNC server on port 5900..."
Xvnc :99 -desktop VNC-Server -geometry 1920x1080 -depth 24 -SecurityTypes None -rfbport 5900 -AlwaysShared -dpi 96 &
VNC_PID=$!

# Wait for VNC server to be ready
sleep 5

# Start window manager on the VNC display
log "Starting fluxbox window manager..."
DISPLAY=:99 fluxbox &
FLUXBOX_PID=$!

# Wait for window manager
sleep 2

# Start websockify to bridge VNC and WebSocket for noVNC
log "Starting websockify for noVNC on port 6080..."
websockify --web=/opt/noVNC 6080 localhost:5900 &
WEBSOCKIFY_PID=$!

# Wait for websockify
sleep 3

# Wait for the Laravel application to be available
log "Waiting for Laravel application to be ready..."
max_attempts=30
attempt=0
while ! curl -f http://laravel:9001 >/dev/null 2>&1; do
    log "Waiting for Laravel (http://laravel:9001)... Attempt $((attempt+1))/$max_attempts"
    sleep 10
    attempt=$((attempt+1))
    if [ $attempt -eq $max_attempts ]; then
        log "Laravel application is not responding after $max_attempts attempts. Proceeding anyway..."
        break
    fi
done

log "Laravel is ready (or timeout reached)!"

# Wait for FastAPI to be available
log "Checking FastAPI availability..."
if curl -f http://fastapi:8001 >/dev/null 2>&1; then
    log "FastAPI is available at http://fastapi:8001"
else
    log "FastAPI is not responding, but continuing..."
fi

# Display connection information
log "=== VNC Connection Information ==="
log "VNC Desktop: Connect to localhost:5900 (password: secret)"
log "Web VNC: Open http://localhost:6080/vnc.html in your browser"
log "Application URL: http://laravel:9001"
log "=================================="

# Start Cypress based on command line argument
log "Starting Cypress..."
if [ "$1" = "run" ]; then
    log "Running Cypress in headless mode..."
    DISPLAY=:99 cypress run --browser chrome --config-file cypress.config.ts --spec "cypress/e2e/**/*.cy.ts"
elif [ "$1" = "run-firefox" ]; then
    log "Running Cypress in headless mode with Firefox..."
    DISPLAY=:99 cypress run --browser firefox --config-file cypress.config.ts --spec "cypress/e2e/**/*.cy.ts"
elif [ "$1" = "open" ]; then
    log "Opening Cypress GUI..."
    DISPLAY=:99 cypress open --project /e2e/cypress
elif [ "$1" = "daemon" ]; then
    log "Starting in daemon mode. Connect via VNC to run tests manually."
    log "Available commands:"
    log "  docker exec -it cypress-e2e cypress open  # Interactive mode"
    log "  docker exec -it cypress-e2e cypress run   # Headless mode"
    
    # Keep container running and monitor processes
    while true; do
        sleep 30
        # Check if main processes are still running
        if ! kill -0 $VNC_PID 2>/dev/null; then
            log "Xvnc process died, restarting..."
            Xvnc :99 -desktop VNC-Server -geometry 1920x1080 -depth 24 -SecurityTypes None -rfbport 5900 -AlwaysShared -dpi 96 &
            VNC_PID=$!
        fi
        if ! kill -0 $WEBSOCKIFY_PID 2>/dev/null; then
            log "Websockify process died, restarting..."
            websockify --web=/opt/noVNC 6080 localhost:5900 &
            WEBSOCKIFY_PID=$!
        fi
    done
else
    log "Running Cypress in interactive mode by default..."
    log "Use VNC connection to interact with Cypress GUI"
    DISPLAY=:99 cypress open --project /e2e/cypress
fi
