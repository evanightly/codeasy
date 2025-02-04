# laravel/Dockerfile

# Gunakan base image PHP 8.3 (CLI) + Apache atau FPM.
# Sebagai contoh saya gunakan versi FPM + Alpine agar lebih ringan
FROM php:8.3-fpm-alpine

# Install dependencies sistem yang diperlukan
RUN apk update && apk add \
    git \
    curl \
    libzip-dev \
    zip \
    unzip \
    openssl \
    bash \
    # dsb, sesuaikan
    && docker-php-ext-install zip pdo pdo_mysql

# Install Composer
COPY --from=composer:2 /usr/bin/composer /usr/local/bin/composer

# Set working directory
WORKDIR /var/www/html

# Copy file composer.json & composer.lock, lalu install depedensi
COPY composer.json composer.lock ./
RUN composer install --no-interaction --no-scripts --no-autoloader

# Copy seluruh source code Laravel ke dalam container
COPY . .

# Jalankan composer lagi untuk autoload
RUN composer dump-autoload

# Pastikan permission
RUN chown -R www-data:www-data /var/www/html/storage /var/www/html/bootstrap/cache

# Expose port 9000 (karena FPM pada umumnya)
EXPOSE 9000

# Jalankan php-fpm
CMD ["php-fpm", "-F"]
