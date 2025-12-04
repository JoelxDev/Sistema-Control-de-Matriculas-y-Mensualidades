FROM nginx:alpine

# Crear estructura de directorios necesaria
RUN mkdir -p /usr/share/nginx/html/js/api \
    && mkdir -p /usr/share/nginx/html/css \
    && mkdir -p /usr/share/nginx/html/img \
    && mkdir -p /usr/share/nginx/html/views

# Copiar configuración de nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Crear archivos dummy para que los montajes funcionen
RUN touch /usr/share/nginx/html/js/.keep \
    && touch /usr/share/nginx/html/js/api/.keep

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]