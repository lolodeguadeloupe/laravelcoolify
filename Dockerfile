FROM php:8.3-fpm

# Installer les dépendances système
RUN apt-get update && apt-get install -y \
    git \
    curl \
    libpng-dev \
    libonig-dev \
    libxml2-dev \
    zip \
    unzip \
    supervisor

# Installer les extensions PHP nécessaires
RUN docker-php-ext-install pdo_mysql mbstring exif pcntl bcmath gd

# Installer Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Créer un utilisateur non root
RUN useradd -ms /bin/bash -u 1337 app

# Définir le répertoire de travail
WORKDIR /var/www/html

# Copier les fichiers de l'application
COPY . .

# Changer le propriétaire des fichiers
RUN chown -R app:app /var/www/html
RUN chmod -R 755 /var/www/html/storage

# Installer les dépendances PHP
RUN composer install --no-dev --optimize-autoloader

# Installer les dépendances frontend
RUN npm install
RUN npm run build

# Changer de propriétaire après l'installation des dépendances
RUN chown -R app:app /var/www/html

# Passer à l'utilisateur non root
USER app

# Exposer le port
EXPOSE 9000

# Démarrer PHP-FPM
CMD ["php-fpm"]