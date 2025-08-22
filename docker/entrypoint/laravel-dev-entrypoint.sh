#!/bin/sh
# Entrypoint for Laravel dev container: install dependencies if missing, then start app
set -e

cd /var/www/html

# Install PHP dependencies if vendor/autoload.php is missing
if [ ! -f vendor/autoload.php ]; then
  echo "[Entrypoint] Installing PHP dependencies with composer..."
  composer install --no-interaction --prefer-dist --optimize-autoloader
fi

# Install Node dependencies if node_modules is missing
if [ ! -d node_modules ]; then
  echo "[Entrypoint] Installing Node dependencies with npm..."
  npm install
fi

# Check if the argument is to run supervisor for background services
if [ "$1" = "supervisor" ]; then
  echo "[Entrypoint] Starting Supervisor to manage queue workers and Reverb server..."
  exec /usr/bin/supervisord -c /etc/supervisor/conf.d/supervisord.conf
fi

# Start the main process (passed as CMD)
exec "$@"
