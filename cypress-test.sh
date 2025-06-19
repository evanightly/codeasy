#!/bin/bash

# Codeasy Cypress E2E Testing Quick Start Script

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to check if Docker is running
check_docker() {
    if ! docker info > /dev/null 2>&1; then
        print_error "Docker is not running. Please start Docker and try again."
        exit 1
    fi
    print_success "Docker is running"
}

# Function to check if services are healthy
check_services() {
    print_status "Checking service health..."
    
    # Check Laravel service
    if ./dc.sh ps laravel | grep -q "healthy"; then
        print_success "Laravel service is healthy"
    else
        print_warning "Laravel service may not be ready yet"
    fi
    
    # Check FastAPI service
    if ./dc.sh ps fastapi | grep -q "Up"; then
        print_success "FastAPI service is running"
    else
        print_warning "FastAPI service may not be ready yet"
    fi
}

# Function to start Cypress in different modes
start_cypress() {
    case $1 in
        "interactive"|"gui"|"open")
            print_status "Starting Cypress in interactive mode with VNC..."
            print_status "VNC Access: localhost:5900 (password: secret)"
            print_status "Web VNC: http://localhost:6080"
            ./dc.sh up cypress-e2e
            ;;
        "headless"|"run")
            print_status "Running Cypress tests in headless mode..."
            ./dc.sh run --rm cypress-e2e run
            ;;
        "firefox")
            print_status "Running Cypress tests with Firefox..."
            ./dc.sh run --rm cypress-e2e run-firefox
            ;;
        "build")
            print_status "Building Cypress container..."
            ./dc.sh build cypress-e2e
            ;;
        *)
            print_error "Invalid mode. Use: interactive|headless|firefox|build"
            exit 1
            ;;
    esac
}

# Function to show help
show_help() {
    echo "Codeasy Cypress E2E Testing Script"
    echo ""
    echo "Usage: $0 [COMMAND]"
    echo ""
    echo "Commands:"
    echo "  start           Start all services and run interactive Cypress"
    echo "  interactive     Start Cypress in interactive mode (with VNC)"
    echo "  headless        Run tests in headless mode (Chrome)"
    echo "  firefox         Run tests in headless mode (Firefox)"
    echo "  build           Build Cypress container"
    echo "  status          Check service status"
    echo "  logs            Show Cypress logs"
    echo "  clean           Clean up containers and volumes"
    echo "  help            Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0 start                 # Start all services and Cypress GUI"
    echo "  $0 headless              # Run all tests in headless mode"
    echo "  $0 firefox               # Run tests with Firefox browser"
    echo ""
    echo "VNC Access:"
    echo "  Desktop VNC: localhost:5900 (password: secret)"
    echo "  Web VNC: http://localhost:6080"
}

# Main script logic
case ${1:-start} in
    "start")
        print_status "Starting Codeasy E2E testing environment..."
        check_docker
        
        print_status "Starting all services..."
        ./dc.sh up -d laravel fastapi mariadb redis
        
        # Wait for services to be ready
        sleep 10
        check_services
        
        start_cypress "interactive"
        ;;
    "interactive"|"gui"|"open")
        check_docker
        start_cypress "interactive"
        ;;
    "headless"|"run")
        check_docker
        start_cypress "headless"
        ;;
    "firefox")
        check_docker
        start_cypress "firefox"
        ;;
    "build")
        check_docker
        start_cypress "build"
        ;;
    "status")
        print_status "Checking service status..."
        ./dc.sh ps
        check_services
        ;;
    "logs")
        print_status "Showing Cypress logs..."
        ./dc.sh logs -f cypress-e2e
        ;;
    "clean")
        print_warning "This will remove all containers and volumes. Are you sure? (y/N)"
        read -r response
        if [[ "$response" =~ ^([yY][eE][sS]|[yY])$ ]]; then
            print_status "Cleaning up..."
            ./dc.sh down -v
            docker system prune -f
            print_success "Cleanup completed"
        else
            print_status "Cleanup cancelled"
        fi
        ;;
    "help"|"-h"|"--help")
        show_help
        ;;
    *)
        print_error "Unknown command: $1"
        show_help
        exit 1
        ;;
esac
