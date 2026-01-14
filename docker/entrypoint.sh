#!/bin/bash
set -e

# Corriger les permissions du storage
chown -R www-data:www-data /var/www/html/storage /var/www/html/bootstrap/cache
chmod -R 775 /var/www/html/storage /var/www/html/bootstrap/cache

# Attendre que la base de données soit prête
echo "Waiting for database..."
while ! php artisan db:monitor --databases=pgsql 2>/dev/null; do
    sleep 2
done
echo "Database is ready!"

# Exécuter les migrations
php artisan migrate --force

# Optimiser l'application
php artisan config:cache
php artisan route:cache
php artisan view:cache

# Démarrer supervisor (nginx + php-fpm)
exec /usr/bin/supervisord -c /etc/supervisor/conf.d/supervisord.conf
