# Imagen con servidor web Nginx
FROM nginx:alpine

# Borrar contenido por defecto
RUN rm -rf /usr/share/nginx/html/*

# Copiar SOLO la carpeta public al directorio web
COPY ./public /usr/share/nginx/html

# Exponer puerto 80
EXPOSE 80
