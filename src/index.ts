import Fastify from 'fastify';
import fastifyCors from '@fastify/cors';
import { PrismaClient } from '@prisma/client';
import { usuariosRoutes } from './routes/usuarios.js';
import { amigosRoutes } from './routes/amigos.js';
import { postsRoutes } from './routes/posts.js';
import jwt from 'jsonwebtoken';
import fastifyStatic from '@fastify/static';  // Para servir archivos estáticos
import path from 'path';  
import { fileURLToPath } from 'url';  

// ============================================================================
// CONFIGURACION INICIAL
// ============================================================================
const __filename = fileURLToPath(import.meta.url);  
const __dirname = path.dirname(__filename); 

const servidorFastify = Fastify({ logger: true });
const clienteDePrisma = new PrismaClient();

// ============================================================================
// MIDDLEWARE: CORS
// ============================================================================
await servidorFastify.register(fastifyCors, {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE']
});

// ============================================================================
// MIDDLEWARE: ARCHIVOS ESTÁTICOS (HTML, CSS, JS)
// ============================================================================
await servidorFastify.register(fastifyStatic, {
    root: path.join(__dirname, '..', 'public'),  //  Carpeta public/
    prefix: '/'  //  Disponible en http://localhost:3000/
});

// ============================================================================
// MIDDLEWARE: AUTENTICACION JWT
// ============================================================================
servidorFastify.decorate('authenticate', async (request: any, reply: any) => {
    try {
        const token = request.headers.authorization?.replace('Bearer ', '');
        
        if (!token) {
            return reply.status(401).send({ error: 'Token no proporcionado' });
        }
        
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secreto-super-seguro');
        request.user = decoded;
        
    } catch (error) {
        return reply.status(401).send({ error: 'Token inválido o expirado' });
    }
});

// ============================================================================
// REGISTRAR RUTAS
// ============================================================================
await servidorFastify.register(usuariosRoutes);
await servidorFastify.register(amigosRoutes);
await servidorFastify.register(postsRoutes);

// ============================================================================
// INICIAR SERVIDOR
// ============================================================================
try {
    await servidorFastify.listen({ port: 3000, host: '0.0.0.0' });
    console.log('Servidor corriendo en http://localhost:3000');
    console.log('Frontend disponible en http://localhost:3000/');
} catch (error) {
    console.error('Error al iniciar servidor:', error);
    process.exit(1);
}