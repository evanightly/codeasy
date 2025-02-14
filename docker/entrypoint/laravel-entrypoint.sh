#!/usr/bin/env bash
set -e

# Jalankan php-fpm di background / standard
# Tapi sebelum itu, lakukan perintah laravel
echo "=== Running Artisan optimize commands ==="
php artisan optimize:clear || true
php artisan migrate --force || true

# Lalu exec php-fpm
exec php-fpm -F
