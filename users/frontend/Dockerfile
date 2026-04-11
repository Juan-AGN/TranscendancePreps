# ============================================================================
# FRONTEND DOCKERFILE (React + Vite)
# ============================================================================
# This Dockerfile creates a Node.js container that runs the Vite
# development server (which compiles and serves the React code).

# BASE IMAGE: Node.js 20 with Alpine Linux (lightweight version)
FROM node:20-alpine

# WORKING DIRECTORY inside the container
WORKDIR /app

# ============================================================================
# STEP 1: Copy only the dependency files first
# ============================================================================
# We copy package.json before the rest of the code.
# This allows Docker to use the cache if dependencies haven't changed,
# avoiding reinstalling node_modules every time we change code.
COPY package*.json ./

# ============================================================================
# STEP 2: Install dependencies
# ============================================================================
RUN npm install

# ============================================================================
# STEP 3: Copy the rest of the code
# ============================================================================
COPY . .

# ============================================================================
# STEP 4: Expose Vite's port
# ============================================================================
EXPOSE 5174

# ============================================================================
# STEP 5: Start command
# ============================================================================
# 'npm run dev' starts the Vite development server
# '--host' makes it accessible from outside the container (required in Docker)
CMD ["npm", "run", "dev", "--", "--host"]
