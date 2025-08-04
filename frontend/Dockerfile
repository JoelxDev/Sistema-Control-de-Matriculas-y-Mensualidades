# Imagen con servidor web Nginx
FROM nginx:alpine

# Borra los archivos por defecto de Nginx
RUN rm -rf /usr/share/nginx/html/*

# Copia tus archivos del frontend al directorio de Nginx
COPY . /usr/share/nginx/html

# Expone el puerto 80 (HTTP)
EXPOSE 80
