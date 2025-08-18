# Usa una imagen oficial de Node.js
FROM node:18

# Directorio de trabajo en el contenedor
WORKDIR /usr/src/app

# Copia los archivos de dependencias
COPY package*.json ./

# Instala las dependencias
RUN npm install

# Copia todo el proyecto al contenedor
COPY . .

# Expone el puerto que usa tu API (ajústalo si usas otro)
EXPOSE 3000

# Comando para iniciar el servidor
CMD ["npm","run" ,"dev"]
