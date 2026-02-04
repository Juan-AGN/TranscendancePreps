# ============================================================================
# ETAPA 1: BUILD (COMPILACIÓN)
# ============================================================================
FROM node:20-slim AS builder

WORKDIR /app

# Instalar OpenSSL (necesario para Prisma)
RUN apt-get update -y && apt-get install -y openssl

# Copiar archivos de configuración
COPY package*.json ./
COPY tsconfig.json ./
COPY prisma ./prisma

# Instalar TODAS las dependencias
RUN npm ci

# IMPORTANTE: Copiar TODO el código fuente
COPY src ./src
COPY public ./public

# Generar cliente Prisma
RUN npx prisma generate

# Compilar TypeScript (esto debe generar dist/routes/)
RUN npm run build

# 🔍 DEBUG: Verificar que dist/ se creó correctamente
RUN ls -la dist/
RUN ls -la dist/routes/ || echo " No existe dist/routes/"

# ============================================================================
# ETAPA 2: PRODUCTION (EJECUCIÓN)
# ============================================================================
FROM node:20-slim

WORKDIR /app

# Instalar OpenSSL
RUN apt-get update -y && apt-get install -y openssl

# Copiar archivos de configuración
COPY package*.json ./

# Instalar solo dependencias de producción
RUN npm ci --omit=dev

# Copiar TODA la carpeta dist/ desde builder
COPY --from=builder /app/dist ./dist

# Copiar dependencias de Prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma
COPY prisma ./prisma
COPY public ./public

# Exponer puerto
EXPOSE 3000

# Usuario no-root
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nodejs && \
    chown -R nodejs:nodejs /app

USER nodejs

# 🔍 DEBUG: Verificar estructura antes de ejecutar
RUN ls -la /app/dist/ || echo " No existe /app/dist/"
RUN ls -la /app/dist/routes/ || echo " No existe /app/dist/routes/"

# Comando de inicio
CMD ["node", "dist/index.js"]