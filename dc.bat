@echo off
setlocal enabledelayedexpansion

:: Codeasy Docker Compose Helper Script
:: This script helps manage Docker environments for the Codeasy project

:: Check if Docker is running
docker info >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo Docker is not running. Please start Docker Desktop and try again.
    exit /b 1
)

if "%1"=="" (
    goto :help
) else (
    goto :%1 2>nul || (
        echo Unknown command: %1
        echo.
        goto :help
    )
)

:help
echo Codeasy Docker Commands
echo.
echo Usage:
echo   dc [command]
echo.
echo Commands:
echo   dev        Start the development environment
echo   dev-staged Start development environment with staged service startup (more reliable)
echo   prod       Start the production environment
echo   down       Stop and remove all containers
echo   build-dev  Build development images without starting containers
echo   build-prod Build production images without starting containers
echo   restart    Restart all containers
echo   logs       Show logs for a specific service (default: laravel)
echo   ps         List running containers
echo   shell      Open a shell in a specific container (default: laravel)
echo   queue      View queue worker logs
echo   db         Connect to MariaDB command line
echo   redis      Connect to Redis CLI
echo   routes     List Laravel routes
echo   test       Run Laravel tests
echo   migrate    Run Laravel migrations
echo   npm        Run NPM commands in the node container
echo   composer   Run Composer commands in the Laravel container
echo   artisan    Run Laravel Artisan commands
echo   cleanup    Remove all containers, networks, volumes, and images
echo   reset      Reset the Docker environment (down + cleanup + dev)
echo.
goto :eof

:dev
echo Starting development environment...
docker compose -f docker-compose.dev.yml --env-file laravel/.env up -d
goto :eof

:dev-staged
echo Starting development environment with staged service startup (more reliable)...
echo Step 1/5: Starting database and cache services...
docker compose -f docker-compose.dev.yml --env-file laravel/.env up -d mariadb redis
echo Waiting for services to be healthy...
timeout /t 10 /nobreak > nul

echo Step 2/5: Starting Laravel main application...
docker compose -f docker-compose.dev.yml --env-file laravel/.env up -d laravel
echo Waiting for Laravel to be healthy...
timeout /t 15 /nobreak > nul

echo Step 3/5: Starting backend services (queue, scheduler, websocket)...
docker compose -f docker-compose.dev.yml --env-file laravel/.env up -d queue scheduler websocket
echo Waiting for services to start...
timeout /t 5 /nobreak > nul

echo Step 4/5: Starting FastAPI service...
docker compose -f docker-compose.dev.yml --env-file laravel/.env up -d fastapi chrome
echo Waiting for services to start...
timeout /t 5 /nobreak > nul

echo Step 5/5: Starting frontend services (node, nginx, phpmyadmin)...
docker compose -f docker-compose.dev.yml --env-file laravel/.env up -d node nginx phpmyadmin

echo Development environment started successfully!
echo Access your Laravel application at: http://localhost
echo Access PHPMyAdmin at: http://localhost:8000
echo FastAPI server available at: http://localhost:8001
echo.
echo For logs and status, run: dc logs [service]
goto :eof

:prod
echo Starting production environment...
docker compose -f docker-compose.prod.yml up -d
goto :eof

:build-dev
echo Building development images...
docker compose -f docker-compose.dev.yml --env-file laravel/.env build
goto :eof

:build-prod
echo Building production images...
docker compose -f docker-compose.prod.yml --env-file laravel/.env build
goto :eof

:down
echo Stopping containers...
docker compose -f docker-compose.dev.yml --env-file laravel/.env down 2>nul
docker compose -f docker-compose.prod.yml --env-file laravel/.env down 2>nul
goto :eof

:restart
echo Restarting containers...
if exist docker-compose.dev.yml (
    docker compose -f docker-compose.dev.yml --env-file laravel/.env restart
) else (
    docker compose -f docker-compose.prod.yml --env-file laravel/.env restart
)
goto :eof

:logs
set service=laravel
if not "%2"=="" set service=%2

echo Showing logs for %service%...
docker compose -f docker-compose.dev.yml logs -f %service%
goto :eof

:queue
echo Showing queue worker logs...
docker compose -f docker-compose.dev.yml logs -f queue
goto :eof

:ps
echo Listing running containers...
docker compose ps
goto :eof

:shell
set service=laravel
if not "%2"=="" set service=%2

echo Opening shell in %service% container...
docker compose -f docker-compose.dev.yml exec %service% sh
goto :eof

:db
echo Connecting to MariaDB...
docker compose -f docker-compose.dev.yml exec mariadb mysql -u root -p
goto :eof

:redis
echo Connecting to Redis CLI...
docker compose -f docker-compose.dev.yml exec redis redis-cli
goto :eof

:routes
echo Listing Laravel routes...
docker compose -f docker-compose.dev.yml exec laravel php artisan route:list
goto :eof

:test
echo Running Laravel tests...
docker compose -f docker-compose.dev.yml exec laravel php artisan test %2 %3 %4 %5 %6 %7 %8 %9
goto :eof

:migrate
echo Running Laravel migrations...
docker compose -f docker-compose.dev.yml exec laravel php artisan migrate %2 %3 %4 %5 %6 %7 %8 %9
goto :eof

:npm
echo Running NPM command...
docker compose -f docker-compose.dev.yml exec node npm %2 %3 %4 %5 %6 %7 %8 %9
goto :eof

:composer
echo Running Composer command...
docker compose -f docker-compose.dev.yml exec laravel composer %2 %3 %4 %5 %6 %7 %8 %9
goto :eof

:artisan
echo Running Artisan command...
docker compose -f docker-compose.dev.yml exec laravel php artisan %2 %3 %4 %5 %6 %7 %8 %9
goto :eof

:prune
echo Removing stopped containers and unused networks/images...
docker system prune -f
echo Docker pruned.
goto :eof

:cleanup
echo Cleaning up Docker environment...
call :down
docker system prune -f
echo Docker environment cleaned up.
goto :eof

:reset
echo Resetting Docker environment...
call :down
call :cleanup
call :dev-staged
goto :eof