FROM php:8.4-fpm-alpine

# Install dependencies
RUN apk update && apk add --no-cache \
    git \
    curl \
    bash \
    libzip-dev \
    zip \
    unzip \
    openssl \
    python3 \
    make \
    g++ \
    sqlite-libs \
    nodejs-current \
    npm \
    mariadb-client \
    # Add dependencies for GD extension
    freetype-dev \
    libjpeg-turbo-dev \
    libpng-dev \
    # DSN
    && docker-php-ext-configure gd --with-freetype --with-jpeg \
    && docker-php-ext-install pdo pdo_mysql zip gd

# Install Composer
COPY --from=composer:2 /usr/bin/composer /usr/local/bin/composer

# Configure PHP for large file uploads (up to 1GB)
RUN { \
    echo 'upload_max_filesize = 1024M'; \
    echo 'post_max_size = 1024M'; \
    echo 'memory_limit = 1536M'; \
    echo 'max_execution_time = 600'; \
    echo 'max_input_time = 600'; \
    } > /usr/local/etc/php/conf.d/uploads.ini

WORKDIR /var/www/html

# Copy entrypoint script only (do not copy app code, as code is mounted via volume in dev)
COPY ./docker/entrypoint/laravel-dev-entrypoint.sh /usr/local/bin/laravel-dev-entrypoint.sh
RUN chmod +x /usr/local/bin/laravel-dev-entrypoint.sh

# Set entrypoint
ENTRYPOINT ["/usr/local/bin/laravel-dev-entrypoint.sh"]

# Expose dev ports
EXPOSE 9001 9002

# Default command (can be overridden by docker-compose)
CMD ["php-fpm", "-F"]