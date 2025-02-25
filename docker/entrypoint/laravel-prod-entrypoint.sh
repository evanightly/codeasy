#!/usr/bin/env bash
set -e

# Jalankan php-fpm di background / standard
# Tapi sebelum itu, lakukan perintah laravel

echo "=== Running NPM and Composer ==="
composer install --no-dev --optimize-autoloader
npm install
npm run build

echo "=== Running Artisan optimize commands ==="
php artisan optimize:clear || true
php artisan migrate --force || true
php artisan db:seed || true
php artisan storage:link || true
php artisan optimize || true

echo "=== Setting up permissions ==="
chown -R www-data:www-data /var/www/html
chmod -R 777 /var/www/html/storage

# Lalu exec php-fpm
exec php-fpm -F
