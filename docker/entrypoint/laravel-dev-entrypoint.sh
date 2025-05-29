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

# Start the main process (passed as CMD)
exec "$@"
