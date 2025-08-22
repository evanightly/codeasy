FROM php:8.4-fpm-alpine

RUN apk update && apk add --no-cache \
    git \
    git-lfs \
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
    supervisor \
    # Add dependencies for GD extension
    freetype-dev \
    libjpeg-turbo-dev \
    libpng-dev \
    # DSN
    && docker-php-ext-configure gd --with-freetype --with-jpeg \
    && docker-php-ext-install pdo pdo_mysql zip gd pcntl

# Copy Composer
COPY --from=composer:2 /usr/bin/composer /usr/local/bin/composer

# Configure PHP for large file uploads (up to 1GB)
RUN { \
    echo 'upload_max_filesize = 1024M'; \
    echo 'post_max_size = 1024M'; \
    echo 'memory_limit = 1536M'; \
    echo 'max_execution_time = 600'; \
    echo 'max_input_time = 600'; \
    } > /usr/local/etc/php/conf.d/uploads.ini

# Initialize Git LFS
RUN git lfs install

# Copy source code
WORKDIR /var/www/html

# Create supervisor log directory
RUN mkdir -p /var/log/supervisor

# (Opsional) Build assets Vite di local atau pakai multi-stage Node.
# RUN npm install && npm run build
# RUN rm -rf node_modules

# Copy entrypoint script and supervisor config
COPY docker/entrypoint/laravel-prod-entrypoint.sh /usr/local/bin/laravel-prod-entrypoint.sh
COPY docker/supervisor/supervisord.conf /etc/supervisor/conf.d/supervisord.conf
RUN chmod +x /usr/local/bin/laravel-prod-entrypoint.sh

EXPOSE 9000 8080
CMD ["laravel-prod-entrypoint.sh"]
