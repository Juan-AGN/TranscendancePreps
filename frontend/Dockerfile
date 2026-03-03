# ============================================================================
# DOCKERFILE DEL FRONTEND (React + Vite)
# ============================================================================
# Este Dockerfile crea un contenedor con Node.js que ejecuta el servidor
# de desarrollo de Vite (el que compila y sirve el código React).

# IMAGEN BASE: Node.js 20 con Alpine Linux (versión ligera)
FROM node:20-alpine

# DIRECTORIO DE TRABAJO dentro del contenedor
WORKDIR /app

# ============================================================================
# PASO 1: Copiar solo los archivos de dependencias primero
# ============================================================================
# Copiamos package.json antes que el resto del código.
# Esto permite que Docker use la caché si las dependencias no han cambiado,
# evitando reinstalar node_modules cada vez que cambiamos código.
COPY package*.json ./

# ============================================================================
# PASO 2: Instalar dependencias
# ============================================================================
RUN npm install

# ============================================================================
# PASO 3: Copiar el resto del código
# ============================================================================
COPY . .

# ============================================================================
# PASO 4: Exponer el puerto de Vite
# ============================================================================
EXPOSE 5173

# ============================================================================
# PASO 5: Comando de inicio
# ============================================================================
# 'npm run dev' arranca el servidor de desarrollo de Vite
# '--host' permite que sea accesible desde fuera del contenedor (necesario en Docker)
CMD ["npm", "run", "dev", "--", "--host"]
