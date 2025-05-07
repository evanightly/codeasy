FROM php:8.3-fpm-alpine

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
    # Add dependencies for GD extension
    freetype-dev \
    libjpeg-turbo-dev \
    libpng-dev \
    # DSN
    && docker-php-ext-configure gd --with-freetype --with-jpeg \
    && docker-php-ext-install pdo pdo_mysql zip gd

# Copy Composer
COPY --from=composer:2 /usr/bin/composer /usr/local/bin/composer

# Initialize Git LFS
RUN git lfs install

# Copy source code
WORKDIR /var/www/html

# (Opsional) Build assets Vite di local atau pakai multi-stage Node.
# RUN npm install && npm run build
# RUN rm -rf node_modules

# Copy entrypoint script
COPY docker/entrypoint/laravel-prod-entrypoint.sh /usr/local/bin/laravel-prod-entrypoint.sh
RUN chmod +x /usr/local/bin/laravel-prod-entrypoint.sh

EXPOSE 9000
CMD ["laravel-prod-entrypoint.sh"]
