#!/bin/bash

# Health check script for Supervisor managed services

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "=== Supervisor Services Health Check ==="

# Function to check if a service is running
check_service() {
    local service_name="$1"
    local status=$(docker-compose exec supervisor supervisorctl status "$service_name" 2>/dev/null | awk '{print $2}')
    
    if [ "$status" = "RUNNING" ]; then
        echo -e "${GREEN}✓${NC} $service_name: $status"
        return 0
    else
        echo -e "${RED}✗${NC} $service_name: $status"
        return 1
    fi
}

# Function to check port connectivity
check_port() {
    local port="$1"
    local service="$2"
    
    if nc -z localhost "$port" 2>/dev/null; then
        echo -e "${GREEN}✓${NC} $service port $port: Accessible"
        return 0
    else
        echo -e "${RED}✗${NC} $service port $port: Not accessible"
        return 1
    fi
}

# Determine which compose file to use
COMPOSE_FILE="docker-compose.dev.yml"
if [ "$1" = "prod" ] || [ "$1" = "production" ]; then
    COMPOSE_FILE="docker-compose.prod.yml"
fi

echo "Using: $COMPOSE_FILE"
echo ""

# Check if supervisor container is running
if ! docker-compose -f "$COMPOSE_FILE" ps supervisor | grep -q "Up"; then
    echo -e "${RED}✗${NC} Supervisor container is not running"
    echo "Start it with: ./supervisor.sh $([ "$1" = "prod" ] && echo "prod" || echo "dev") start"
    exit 1
fi

echo -e "${GREEN}✓${NC} Supervisor container is running"
echo ""

# Check individual services
echo "Checking supervised services:"
all_good=true

if ! check_service "laravel-queue-worker:laravel-queue-worker_00"; then
    all_good=false
fi

if ! check_service "laravel-queue-worker:laravel-queue-worker_01"; then
    all_good=false
fi

if ! check_service "laravel-reverb-server"; then
    all_good=false
fi

if ! check_service "laravel-scheduler"; then
    all_good=false
fi

echo ""

# Check port connectivity
echo "Checking port connectivity:"
if ! check_port "8080" "Reverb WebSocket Server"; then
    all_good=false
fi

echo ""

# Check recent logs for errors
echo "Checking recent logs for errors:"
error_count=$(docker-compose -f "$COMPOSE_FILE" logs --tail=50 supervisor 2>/dev/null | grep -i "error\|failed\|exception" | wc -l)

if [ "$error_count" -eq 0 ]; then
    echo -e "${GREEN}✓${NC} No recent errors found in logs"
else
    echo -e "${YELLOW}⚠${NC} Found $error_count recent error(s) in logs"
    echo "Check logs with: ./supervisor.sh $([ "$1" = "prod" ] && echo "prod" || echo "dev") logs"
fi

echo ""

# Overall status
if [ "$all_good" = true ]; then
    echo -e "${GREEN}=== All services are healthy! ===${NC}"
    exit 0
else
    echo -e "${RED}=== Some services have issues ===${NC}"
    echo "Troubleshooting:"
    echo "1. Check logs: ./supervisor.sh $([ "$1" = "prod" ] && echo "prod" || echo "dev") logs"
    echo "2. Check status: ./supervisor.sh $([ "$1" = "prod" ] && echo "prod" || echo "dev") status"
    echo "3. Restart services: ./supervisor.sh $([ "$1" = "prod" ] && echo "prod" || echo "dev") restart"
    exit 1
fi
