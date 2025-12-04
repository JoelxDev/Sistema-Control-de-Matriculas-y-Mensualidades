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
FROM node:18-alpine

# Establecer directorio de trabajo
WORKDIR /usr/src/app

# Copiar package.json y package-lock.json primero (para aprovechar caché)
COPY package*.json ./

# Instalar dependencias
RUN npm install

# Copiar el resto del código
COPY . .

# Exponer puerto
EXPOSE 3000

# Comando por defecto (se sobrescribe en docker-compose)
CMD ["npm", "run", "dev"]

