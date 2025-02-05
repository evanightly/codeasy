# docker/laravel.Dockerfile

FROM php:8.3-fpm-alpine

# 1. Install system dependencies
RUN apk update && apk add \
    git \
    curl \
    libzip-dev \
    zip \
    unzip \
    openssl \
    bash \
    # Node, npm, python3 (untuk node-gyp) dsb. 
    # Sesuaikan/kurangi jika tak perlu
    nodejs \
    npm \
    python3 \
    make \
    g++ \
    && docker-php-ext-install zip pdo pdo_mysql

# 2. Install Composer
COPY --from=composer:2 /usr/bin/composer /usr/local/bin/composer

# 3. Set workdir
WORKDIR /var/www/html

# 4. Opsional: copy composer.json & install dependencies (bisa di-build time)
# COPY laravel/composer.json laravel/composer.lock ./
# RUN composer install --no-interaction --no-scripts --no-autoloader

# 5. Copy source code (opsional; kita mount volume anyway)
# COPY laravel/ ./

# 6. Expose ports
# php-fpm
EXPOSE 9000  
# artisan serve
EXPOSE 9001  
# vite dev
EXPOSE 9002  

# 7. Default command php-fpm. 
CMD ["php-fpm", "-F"]
