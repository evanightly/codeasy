#!/bin/bash

# Supervisor management script for Laravel queue workers and Reverb server

SUPERVISOR_SERVICE="supervisor"
COMPOSE_FILE=""

# Determine which compose file to use
if [ "$1" = "prod" ] || [ "$1" = "production" ]; then
    COMPOSE_FILE="docker-compose.prod.yml"
    echo "Using production configuration..."
elif [ "$1" = "dev" ] || [ "$1" = "development" ] || [ -z "$1" ]; then
    COMPOSE_FILE="docker-compose.dev.yml"
    echo "Using development configuration..."
else
    echo "Usage: $0 [dev|prod] [command]"
    echo "Commands:"
    echo "  start    - Start supervisor services"
    echo "  stop     - Stop supervisor services"
    echo "  restart  - Restart supervisor services"
    echo "  status   - Show supervisor status"
    echo "  logs     - Show supervisor logs"
    echo "  shell    - Open shell in supervisor container"
    exit 1
fi

COMMAND="$2"

case "$COMMAND" in
    "start")
        echo "Starting Supervisor services..."
        docker compose -f "$COMPOSE_FILE" up -d "$SUPERVISOR_SERVICE"
        ;;
    "stop")
        echo "Stopping Supervisor services..."
        docker compose -f "$COMPOSE_FILE" stop "$SUPERVISOR_SERVICE"
        ;;
    "restart")
        echo "Restarting Supervisor services..."
        docker compose -f "$COMPOSE_FILE" restart "$SUPERVISOR_SERVICE"
        ;;
    "status")
        echo "Supervisor service status:"
        docker compose -f "$COMPOSE_FILE" exec "$SUPERVISOR_SERVICE" supervisorctl status
        ;;
    "logs")
        echo "Supervisor logs:"
        docker compose -f "$COMPOSE_FILE" logs -f "$SUPERVISOR_SERVICE"
        ;;
    "shell")
        echo "Opening shell in supervisor container..."
        docker compose -f "$COMPOSE_FILE" exec "$SUPERVISOR_SERVICE" /bin/sh
        ;;
    "queue-restart")
        echo "Restarting queue workers..."
        docker compose -f "$COMPOSE_FILE" exec "$SUPERVISOR_SERVICE" supervisorctl restart laravel-queue-worker:*
        ;;
    "reverb-restart")
        echo "Restarting Reverb server..."
        docker compose -f "$COMPOSE_FILE" exec "$SUPERVISOR_SERVICE" supervisorctl restart laravel-reverb-server
        ;;
    *)
        echo "Available commands:"
        echo "  start         - Start supervisor services"
        echo "  stop          - Stop supervisor services"
        echo "  restart       - Restart supervisor services"
        echo "  status        - Show supervisor status"
        echo "  logs          - Show supervisor logs"
        echo "  shell         - Open shell in supervisor container"
        echo "  queue-restart - Restart queue workers only"
        echo "  reverb-restart- Restart Reverb server only"
        ;;
esac
