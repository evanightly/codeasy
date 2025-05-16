FROM php:8.3-fpm-alpine

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

# Expose dev ports
EXPOSE 9001 9002

CMD ["php-fpm", "-F"]