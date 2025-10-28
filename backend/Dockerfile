# # Usa la imagen oficial de Node.js
# FROM node:18

# # Instalar pnpm de forma global (seguro y rápido)
# RUN npm install -g pnpm

# # Definir el directorio de trabajo
# WORKDIR /usr/src/app

# # Copiar archivos de dependencias
# COPY package*.json ./

# # Instalar dependencias usando pnpm
# RUN pnpm install

# # Copiar el resto del código
# COPY . .

# # Exponer el puerto del servidor
# EXPOSE 3000

# # Comando de inicio
# CMD ["pnpm", "run", "dev"]

# Imagen base de Node.js
# Imagen base
FROM node:18

# Instalar herramientas necesarias para compilar bcrypt
RUN apt-get update && apt-get install -y python3 make g++

# Crear carpeta de trabajo
WORKDIR /usr/src/app

# Copiar package.json y package-lock.json
COPY package*.json ./

# Instalar dependencias con npm
RUN npm install

# Recompilar bcrypt desde el código fuente (opcional, recomendado en Linux)
RUN npm rebuild bcrypt --build-from-source

# Copiar el resto del código
COPY . .

# Exponer puerto y comando por defecto
EXPOSE 3000
CMD ["npm", "run", "dev"]

