#!/bin/bash

# Codeasy Docker Compose Helper Script

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
  echo "Docker is not running. Please start Docker and try again."
  exit 1
fi

case "$1" in
  "dev")
    echo "Starting development environment..."
    docker compose -f docker-compose.dev.yml --env-file laravel/.env up -d
    ;;
  "dev-staged")
    echo "Starting development environment with staged service startup..."
    echo "Step 1/5: Starting database and cache services..."
    docker compose -f docker-compose.dev.yml --env-file laravel/.env up -d mariadb redis
    echo "Waiting for services to be healthy..."
    sleep 10

    echo "Step 2/5: Starting Laravel main application..."
    docker compose -f docker-compose.dev.yml --env-file laravel/.env up -d laravel
    echo "Waiting for Laravel to be healthy..."
    sleep 15

    echo "Step 3/5: Starting backend services..."
    docker compose -f docker-compose.dev.yml --env-file laravel/.env up -d queue scheduler websocket
    echo "Waiting for services to start..."
    sleep 5

    echo "Step 4/5: Starting FastAPI service..."
    docker compose -f docker-compose.dev.yml --env-file laravel/.env up -d fastapi chrome
    echo "Waiting for services to start..."
    sleep 5

    echo "Step 5/5: Starting frontend services..."
    docker compose -f docker-compose.dev.yml --env-file laravel/.env up -d node nginx phpmyadmin
    
    echo "Development environment started successfully!"
    ;;
  "build-dev")
    echo "Building development images..."
    docker compose -f docker-compose.dev.yml --env-file laravel/.env build
    ;;
  "build-prod")
    echo "Building production images..."
    docker compose -f docker-compose.prod.yml --env-file laravel/.env build
    ;;
  "down")
    echo "Stopping containers..."
    docker compose -f docker-compose.dev.yml --env-file laravel/.env down 2>/dev/null
    docker compose -f docker-compose.prod.yml --env-file laravel/.env down 2>/dev/null
    ;;
  "restart")
    echo "Restarting containers..."
    docker compose -f docker-compose.dev.yml --env-file laravel/.env restart
    ;;
  "restart-prod")
    echo "Restarting containers..."
    docker compose -f docker-compose.prod.yml --env-file laravel/.env restart
    ;;
  "supervisor")
    action=${2:-status}
    echo "Supervisor action: $action"
    case "$action" in
      "status")
        docker compose -f docker-compose.dev.yml --env-file laravel/.env exec supervisor supervisorctl status
        ;;
      "start")
        docker compose -f docker-compose.dev.yml --env-file laravel/.env up -d supervisor
        ;;
      "restart")
        docker compose -f docker-compose.dev.yml --env-file laravel/.env restart supervisor
        ;;
      "logs")
        docker compose -f docker-compose.dev.yml --env-file laravel/.env logs -f supervisor
        ;;
      "shell")
        docker compose -f docker-compose.dev.yml --env-file laravel/.env exec supervisor sh
        ;;
      *)
        echo "Available supervisor actions: status, start, restart, logs, shell"
        ;;
    esac
    ;;
  "reverb")
    action=${2:-restart}
    echo "Reverb action: $action"
    case "$action" in
      "restart")
        docker compose -f docker-compose.dev.yml --env-file laravel/.env exec supervisor supervisorctl restart laravel-reverb-server
        ;;
      "status")
        docker compose -f docker-compose.dev.yml --env-file laravel/.env exec supervisor supervisorctl status laravel-reverb-server
        ;;
      "logs")
        docker compose -f docker-compose.dev.yml --env-file laravel/.env exec supervisor supervisorctl tail laravel-reverb-server
        ;;
      *)
        echo "Available reverb actions: restart, status, logs"
        ;;
    esac
    ;;
  "queue")
    action=${2:-restart}
    echo "Queue action: $action"
    case "$action" in
      "restart")
        docker compose -f docker-compose.dev.yml --env-file laravel/.env exec supervisor supervisorctl restart laravel-queue-worker:*
        ;;
      "status")
        docker compose -f docker-compose.dev.yml --env-file laravel/.env exec supervisor supervisorctl status laravel-queue-worker:*
        ;;
      "logs")
        docker compose -f docker-compose.dev.yml --env-file laravel/.env exec supervisor supervisorctl tail laravel-queue-worker:laravel-queue-worker_00
        ;;
      *)
        echo "Available queue actions: restart, status, logs"
        ;;
    esac
    ;;
  "logs")
    service=${2:-laravel}
    echo "Showing logs for $service..."
    docker compose -f docker-compose.dev.yml --env-file laravel/.env logs -f "$service"
    ;;
  "shell")
    service=${2:-laravel}
    echo "Opening shell in $service container..."
    docker compose -f docker-compose.dev.yml --env-file laravel/.env exec "$service" sh
    ;;
  "artisan")
    echo "Running Artisan command..."
    docker compose -f docker-compose.dev.yml --env-file laravel/.env exec laravel php artisan "${@:2}"
    ;;
  "composer")
    echo "Running Composer command..."
    docker compose -f docker-compose.dev.yml --env-file laravel/.env exec laravel composer "${@:2}"
    ;;
  "npm")
    echo "Running NPM command..."
    docker compose -f docker-compose.dev.yml --env-file laravel/.env exec laravel npm "${@:2}"
    ;;
  *)
    echo "Codeasy Docker Commands"
    echo
    echo "Usage:"
    echo "  ./dc.sh [command]"
    echo
    echo "Commands:"
    echo "  dev          Start the development environment"
    echo "  dev-staged   Start development environment with staged service startup"
    echo "  build-dev    Build development images"
    echo "  build-prod   Build production images"
    echo "  down         Stop all containers"
    echo "  restart      Restart all containers"
    echo "  restart-prod Restart production containers"
    echo "  supervisor   Manage supervisor (status|start|restart|logs|shell)"
    echo "  reverb       Manage Reverb server (restart|status|logs)"
    echo "  queue        Manage queue workers (restart|status|logs)"
    echo "  logs [svc]   Show logs (default: laravel)"
    echo "  shell [svc]  Open shell (default: laravel)"
    echo "  artisan      Run Laravel Artisan commands"
    echo "  composer     Run Composer commands"
    ;;
esac