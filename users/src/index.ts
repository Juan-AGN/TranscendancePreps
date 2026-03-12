// ============================================================================
// IMPORTS - EXTERNAL DEPENDENCIES
// ============================================================================
import 'dotenv/config';
import Fastify from 'fastify';  // web framework import
import fastifyCors from '@fastify/cors';  // Plugin to allow requests from other domains (CORS)
import { PrismaClient } from '@prisma/client';  // Prisma client (ORM for database)
import { authRoutes } from './routes/auth.js';

// ============================================================================
// IMPORTS - CUSTOM ROUTES (files with endpoints)
// ============================================================================
import { usersRoutes } from './routes/usuarios.js';  // User routes (register, login, avatar...)
import { friendsRoutes } from './routes/amigos.js';  // Friend routes (add, remove, list...)

// ============================================================================
// IMPORTS - UTILITIES AND PLUGINS
// ============================================================================
import jwt from 'jsonwebtoken';  // Library to create and verify JWT tokens (authentication)
import fastifyStatic from '@fastify/static';  // Plugin to serve static files (HTML, CSS, images)
import fastifyMultipart from '@fastify/multipart';  // Plugin to receive files from client (avatars, PDFs...)
import path from 'path';  // Native Node.js module to handle file/folder paths
import { fileURLToPath } from 'url';  // Function to convert ES module URLs to file paths

// ============ Import middleware ============
import { authenticate } from './middleware/auth.js';

// ============================================================================
// INITIAL CONFIGURATION
// ============================================================================
// Get the full path of the current directory (index.ts's directory)
const __filename = fileURLToPath(import.meta.url);  //'__' -> Node.js convention
const __dirname = path.dirname(__filename); 

const server = Fastify({ logger: true });
const prismaClient = new PrismaClient();

// ============================================================================
// MIDDLEWARE: CORS
// ============================================================================
// middleware: intermediary functions that execute between the client request
// and the server response, acting as filters or validators of the request
await server.register(fastifyCors, {
    origin: '*', // '*' -> indicates all domains can make requests
    methods: ['GET', 'POST', 'PUT', 'DELETE']
});

// ============================================================================
// MIDDLEWARE: SERVE STATIC FILES (HTML, CSS, JS)
// ============================================================================
await server.register(fastifyStatic, { // Fastify plugin that serves static files
    root: path.join(__dirname, '..', 'public'),  // Files are located in the public/ folder
    prefix: '/'  // Available at URL (from root) -> http://localhost:3000/
});

// ============================================================================
// MIDDLEWARE: MULTIPART (ALLOWS FILE UPLOADS)
// ============================================================================
await server.register(fastifyMultipart, { // fastify plugin to receive files
    limits: {
        fileSize: 5 * 1024 * 1024  // Limit: 5MB -> CONVERSION TO BYTES: ( 5MB * 1 KB * 1MB)
    }
});

// ============================================================================
// MIDDLEWARE: JWT AUTHENTICATION
// ============================================================================
// 'decorate' -> Adds the custom 'authenticate' function to Fastify
// This avoids having to import the function every time it's needed ('import....')
server.decorate('authenticate', async (request: any, reply: any) => {
    try {
        // Extract the 'Bearer' keyword from the token("Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...")
        const token = request.headers.authorization?.replace('Bearer ', '');
        
        if (!token) {
            return reply.status(401).send({ error: 'Token not provided' });
        }
        
        // Verify the TOKEN is valid, hasn't expired and decode its content
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        // Save the decoded info in 'request.user' so all routes can access it
        request.user = decoded;
        
    } catch (error) {
        return reply.status(401).send({ error: 'Invalid or expired token' });
    }
});

// ============================================================================
// REGISTER ROUTES (functions containing the endpoints I created)
// ============================================================================
await server.register(usersRoutes);
await server.register(friendsRoutes);
await server.register(authRoutes);

// ============================================================================
// START SERVER
// ============================================================================
try {
    await server.listen({ port: 3000, host: '0.0.0.0' });
    console.log('Server running at http://localhost:3000');
    console.log('Frontend available at http://localhost:3000/');
} catch (error) {
    console.error('Error starting server:', error);
    process.exit(1);
}