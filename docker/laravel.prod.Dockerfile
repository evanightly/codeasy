FROM php:8.3-fpm-alpine

RUN apk update && apk add --no-cache \
    git \
    curl \
    bash \
    libzip-dev \
    zip \
    unzip \
    openssl \
    # *Tanpa* nodejs, npm, dsb.
    && docker-php-ext-install pdo pdo_mysql zip

# Copy Composer
COPY --from=composer:2 /usr/bin/composer /usr/local/bin/composer

# Copy source code
WORKDIR /var/www/html
COPY laravel/ ./

# (Opsional) Jalankan composer install (autoloader, dsb)
RUN composer install --no-dev --optimize-autoloader

# (Opsional) Build assets Vite di local atau pakai multi-stage Node.
# RUN npm install && npm run build
# RUN rm -rf node_modules

# Copy entrypoint script
COPY docker/entrypoint/laravel-entrypoint.sh /usr/local/bin/laravel-entrypoint.sh
RUN chmod +x /usr/local/bin/laravel-entrypoint.sh

EXPOSE 9000
CMD ["laravel-entrypoint.sh"]
