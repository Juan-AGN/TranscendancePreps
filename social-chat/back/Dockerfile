FROM node:20-alpine

WORKDIR /app

COPY content/package*.json ./
RUN npm ci

COPY content/ ./

# Prisma 7: necesitamos DATABASE_URL para cargar prisma.config.ts
# (no tiene por qué ser real, solo existir en build-time)
ENV DATABASE_URL="postgresql://dummy:dummy@localhost:5432/dummy?schema=public"

# Genera el Prisma Client basado en prisma/schema.prisma
RUN npx prisma generate

# Ahora TS ya conoce title, relations, etc.
RUN npm run build

EXPOSE 8890
CMD ["sh", "-c", "npx prisma migrate deploy && npm start"]