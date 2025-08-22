# Supervisor Integration for Laravel Queue and Reverb

This document explains how to use Supervisor to manage Laravel queue workers and Reverb WebSocket server in the codeasy project.

## Overview

Supervisor is integrated into both development and production Docker containers to manage:
- Laravel queue workers (2 processes for better performance)
- Laravel Reverb WebSocket server
- Laravel scheduler

## Configuration

### Environment Variables

Add these variables to your `.env` file:

```bash
# Reverb Configuration
REVERB_APP_ID=codeasy-app
REVERB_APP_KEY=codeasy-key
REVERB_APP_SECRET=codeasy-secret
REVERB_HOST=localhost
REVERB_PORT=8080
REVERB_SCHEME=http
REVERB_SERVER_HOST=0.0.0.0
REVERB_SERVER_PORT=8080

# Vite configuration for frontend
VITE_REVERB_APP_KEY="${REVERB_APP_KEY}"
VITE_REVERB_HOST="${REVERB_HOST}"
VITE_REVERB_PORT="${REVERB_PORT}"
VITE_REVERB_SCHEME="${REVERB_SCHEME}"
```

### Broadcasting Configuration

Update your `config/broadcasting.php` to use Reverb:

```php
'default' => env('BROADCAST_DRIVER', 'reverb'),
```

## Usage

### Starting Services

#### Development
```bash
# Start all services including supervisor
docker-compose -f docker-compose.dev.yml up -d

# Or start supervisor only
./supervisor.sh dev start
```

#### Production
```bash
# Start all services including supervisor
docker-compose -f docker-compose.prod.yml up -d

# Or start supervisor only
./supervisor.sh prod start
```

### Management Commands

The `supervisor.sh` script provides convenient management:

```bash
# Show status of all supervised processes
./supervisor.sh dev status

# View supervisor logs
./supervisor.sh dev logs

# Restart all supervisor services
./supervisor.sh dev restart

# Restart only queue workers
./supervisor.sh dev queue-restart

# Restart only Reverb server
./supervisor.sh dev reverb-restart

# Open shell in supervisor container
./supervisor.sh dev shell
```

### Manual Supervisor Commands

If you need to run supervisor commands directly:

```bash
# Enter the supervisor container
docker-compose -f docker-compose.dev.yml exec supervisor /bin/sh

# Check status
supervisorctl status

# Restart specific process
supervisorctl restart laravel-queue-worker:00
supervisorctl restart laravel-reverb-server

# View logs
supervisorctl tail laravel-queue-worker:00
supervisorctl tail laravel-reverb-server
```

## Services Configuration

### Queue Workers
- **Processes**: 2 workers running in parallel
- **Queues**: Processes `high` and `default` queues
- **Max time**: 3600 seconds per job
- **Tries**: 3 attempts per job
- **Auto-restart**: Yes

### Reverb Server
- **Port**: 8080 (exposed to host)
- **Protocol**: WebSocket
- **Auto-restart**: Yes
- **User**: www-data

### Scheduler
- **Command**: `php artisan schedule:work`
- **Auto-restart**: Yes
- **User**: www-data

## Monitoring

### Log Files
Supervisor logs are stored in `/var/log/supervisor/` within the container:
- `supervisord.log` - Main supervisor log
- `laravel-queue-worker.log` - Queue worker logs
- `laravel-reverb-server.log` - Reverb server logs
- `laravel-scheduler.log` - Scheduler logs

### Web Interface
Supervisor provides a web interface at `http://127.0.0.1:9001` (only accessible from within the container).

## Troubleshooting

### Common Issues

1. **Permission Issues**
   ```bash
   # Fix permissions
   docker-compose exec supervisor chown -R www-data:www-data /var/www/html
   ```

2. **Queue Jobs Not Processing**
   ```bash
   # Check queue worker status
   ./supervisor.sh dev status
   
   # Restart queue workers
   ./supervisor.sh dev queue-restart
   ```

3. **Reverb Connection Issues**
   ```bash
   # Check Reverb server status
   ./supervisor.sh dev status
   
   # Restart Reverb server
   ./supervisor.sh dev reverb-restart
   
   # Check logs
   ./supervisor.sh dev logs
   ```

4. **High Memory Usage**
   - Queue workers restart every hour (3600 seconds) to prevent memory leaks
   - Monitor with `docker stats` to check resource usage

### Performance Tuning

1. **Increase Queue Workers**
   Edit `docker/supervisor/supervisord.conf` and change `numprocs=2` to a higher number.

2. **Adjust Memory Limits**
   Add memory limits to queue worker commands:
   ```
   command=php /var/www/html/artisan queue:work --sleep=3 --tries=3 --max-time=3600 --memory=512
   ```

3. **Queue Priority**
   Queues are processed in order: `high`, `default`

## Production Considerations

1. **Resource Limits**: Set appropriate CPU and memory limits in Docker Compose
2. **Logging**: Configure log rotation to prevent disk space issues
3. **Monitoring**: Use Laravel Horizon or external monitoring tools
4. **Scaling**: For high traffic, consider running multiple supervisor containers

## Integration with Broadcasting

The Reverb server automatically handles:
- WebSocket connections
- Event broadcasting
- Channel authorization
- Real-time updates

Frontend applications can connect using Laravel Echo:

```javascript
import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

window.Pusher = Pusher;

window.Echo = new Echo({
    broadcaster: 'reverb',
    key: import.meta.env.VITE_REVERB_APP_KEY,
    wsHost: import.meta.env.VITE_REVERB_HOST,
    wsPort: import.meta.env.VITE_REVERB_PORT ?? 80,
    wssPort: import.meta.env.VITE_REVERB_PORT ?? 443,
    forceTLS: (import.meta.env.VITE_REVERB_SCHEME ?? 'https') === 'https',
    enabledTransports: ['ws', 'wss'],
});
```
