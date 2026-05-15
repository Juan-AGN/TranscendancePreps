# ============================================================================
# STAGE 1: BUILD (COMPILATION)
# ============================================================================
FROM node:20-slim AS builder

WORKDIR /app

# Install OpenSSL (required for Prisma)
RUN apt-get update -y && apt-get install -y openssl

# Copy configuration files
COPY package*.json ./
COPY tsconfig.json ./
COPY prisma ./prisma

# Install ALL dependencies
RUN npm ci

# IMPORTANT: Copy ALL source code
COPY src ./src
COPY public ./public

# Generate Prisma client
RUN npx prisma generate

# Compile TypeScript (this should generate dist/routes/)
RUN npm run build

# 🔍 DEBUG: Verify that dist/ was created correctly
RUN ls -la dist/
RUN ls -la dist/routes/ || echo " dist/routes/ does not exist"

# ============================================================================
# STAGE 2: PRODUCTION (RUNTIME)
# ============================================================================
FROM node:20-slim

WORKDIR /app

# Install OpenSSL
RUN apt-get update -y && apt-get install -y openssl

# Copy configuration files
COPY package*.json ./
RUN groupadd -g 1001 nodejs && \
    useradd -u 1001 -g nodejs -m nodejs

# Copy configuration files
COPY --chown=nodejs:nodejs package*.json ./

# Install only production dependencies
RUN npm ci --omit=dev

# Copy the entire dist/ folder from builder
COPY --from=builder /app/dist ./dist

# Copy Prisma dependencies
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma
COPY prisma ./prisma
COPY public ./public
COPY --from=builder --chown=nodejs:nodejs /app/dist ./dist

# Copy Prisma dependencies
COPY --from=builder --chown=nodejs:nodejs /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder --chown=nodejs:nodejs /app/node_modules/@prisma ./node_modules/@prisma
COPY --chown=nodejs:nodejs prisma ./prisma
COPY --chown=nodejs:nodejs public ./public

# Expose port
EXPOSE 3000

# Non-root user
USER nodejs

# 🔍 DEBUG: Verify structure before running
RUN ls -la /app/dist/ || echo " /app/dist/ does not exist"
RUN ls -la /app/dist/routes/ || echo " /app/dist/routes/ does not exist"

# Start command
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/index.js"]