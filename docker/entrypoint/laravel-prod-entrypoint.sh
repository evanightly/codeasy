#!/usr/bin/env bash
set -e

# Check if the argument is to run supervisor for background services
if [ "$1" = "supervisor" ]; then
  echo "=== Starting Supervisor to manage queue workers and Reverb server ==="
  
  # Still need to set up Laravel first
  echo "=== Running Composer install ==="
  composer install --no-dev --optimize-autoloader
  composer dump-autoload
  
  echo "=== Running Artisan optimize commands ==="
  php artisan optimize:clear || true
  php artisan optimize || true
  
  echo "=== Setting up permissions ==="
  chown -R www-data:www-data /var/www/html
  chmod -R 777 /var/www/html/storage
  
  exec /usr/bin/supervisord -c /etc/supervisor/conf.d/supervisord.conf
fi

#!/usr/bin/env bash
set -e

# Check if the argument is to run supervisor for background services
if [ "$1" = "supervisor" ]; then
  echo "[Production Entrypoint] Starting Supervisor to manage queue workers and Reverb server..."
  
  # Ensure dependencies are installed
  composer install --no-dev --optimize-autoloader
  
  # Set up permissions
  chown -R www-data:www-data /var/www/html
  chmod -R 777 /var/www/html/storage
  
  # Start supervisor
  exec /usr/bin/supervisord -c /etc/supervisor/conf.d/supervisord.conf
fi

# Jalankan php-fpm di background / standard
# Tapi sebelum itu, lakukan perintah laravel

echo "=== Running NPM and Composer ==="
composer install --no-dev --optimize-autoloader
npm install
npm run build
composer dump-autoload

echo "=== Running Artisan optimize commands ==="
php artisan optimize:clear || true
# php artisan migrate --force || true
# php artisan db:seed || true
# php artisan storage:link || true
php artisan optimize || true

echo "=== Setting up permissions ==="
chown -R www-data:www-data /var/www/html
chmod -R 777 /var/www/html/storage

# Lalu exec php-fpm
exec php-fpm -F
