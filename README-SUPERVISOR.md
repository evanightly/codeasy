# Supervisor Integration

This project now includes Supervisor integration for managing Laravel queue workers and Reverb WebSocket server.

## Quick Start

1. **Start all services with Supervisor:**
   ```bash
   # Development
   docker-compose -f docker-compose.dev.yml up -d
   
   # Production
   docker-compose -f docker-compose.prod.yml up -d
   ```

2. **Manage Supervisor services:**
   ```bash
   # Check service status
   ./supervisor.sh dev status
   
   # View logs
   ./supervisor.sh dev logs
   
   # Restart queue workers
   ./supervisor.sh dev queue-restart
   
   # Health check
   ./health-check-supervisor.sh dev
   ```

## Services Managed by Supervisor

- **Queue Workers**: 2 parallel processes handling `high` and `default` queues
- **Reverb Server**: WebSocket server for real-time communication on port 8080
- **Scheduler**: Laravel task scheduler for automated jobs

## Environment Configuration

Add these variables to your `.env` file:

```bash
# Queue Configuration
QUEUE_CONNECTION=database

# Reverb WebSocket Configuration
REVERB_APP_ID=codeasy-app
REVERB_APP_KEY=codeasy-key
REVERB_APP_SECRET=codeasy-secret
REVERB_HOST=localhost
REVERB_PORT=8080
REVERB_SCHEME=http
REVERB_SERVER_HOST=0.0.0.0
REVERB_SERVER_PORT=8080

# Frontend Configuration
VITE_REVERB_APP_KEY="${REVERB_APP_KEY}"
VITE_REVERB_HOST="${REVERB_HOST}"
VITE_REVERB_PORT="${REVERB_PORT}"
VITE_REVERB_SCHEME="${REVERB_SCHEME}"
```

For detailed documentation, see [docs/supervisor-integration.md](docs/supervisor-integration.md).

---
