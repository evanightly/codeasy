# docker/laravel.Dockerfile

FROM php:8.3-fpm-alpine

RUN apk update && apk upgrade && apk add --no-cache \
    git \
    curl \
    libzip-dev \
    zip \
    unzip \
    openssl \
    bash \
    python3 \
    make \
    g++ \
    sqlite-libs \
    nodejs-current \
    npm \
    && docker-php-ext-install zip pdo pdo_mysql

COPY --from=composer:2 /usr/bin/composer /usr/local/bin/composer

WORKDIR /var/www/html

EXPOSE 9000 9001 9002

CMD ["php-fpm", "-F"]

HEALTHCHECK --interval=30s --timeout=30s --start-period=5s --retries=3 \
    CMD php artisan health:check || exit 1