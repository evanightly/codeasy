#!/usr/bin/env bash
set -e

# Jalankan php-fpm di background / standard
# Tapi sebelum itu, lakukan perintah laravel
echo "=== Setting up permissions ==="
chown -R www-data:www-data /var/www/html
chmod -R 777 /var/www/html/storage

echo "=== Running NPM and Composer ==="
composer install
npm install
npm run build

echo "=== Running Artisan optimize commands ==="
php artisan optimize:clear || true
php artisan migrate --force || true
php artisan storage:link || true
php artisan optimize || true
# Lalu exec php-fpm
exec php-fpm -F
