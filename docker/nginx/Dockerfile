FROM nginx:alpine

# Copier la configuration nginx
COPY conf.d/default.conf /etc/nginx/conf.d/default.conf

# Copier les fichiers publics depuis le contexte de build
COPY --from=app /var/www/html/public /var/www/html/public

EXPOSE 80 443
