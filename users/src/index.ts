// ============================================================================
// IMPORTS - DEPENDENCIAS EXTERNAS
// ============================================================================
import 'dotenv/config';
import Fastify from 'fastify';  // importación del Framework web 
import fastifyCors from '@fastify/cors';  // Plugin para permitir peticiones desde otros dominios (CORS)
import { PrismaClient } from '@prisma/client';  // Cliente de Prisma (ORM para base de datos)
import { authRoutes } from './routes/auth.js';

// ============================================================================
// IMPORTS - RUTAS PROPIAS (archivos con endpoints)
// ============================================================================
import { usuariosRoutes } from './routes/usuarios.js';  // Rutas de usuarios (registro, login, avatar...)
import { amigosRoutes } from './routes/amigos.js';  // Rutas de amigos (añadir, eliminar, listar...)

// ============================================================================
// IMPORTS - UTILIDADES Y PLUGINS
// ============================================================================
import jwt from 'jsonwebtoken';  // Librería para crear y verificar tokens JWT (autenticación)
import fastifyStatic from '@fastify/static';  // Plugin para servir archivos estáticos (HTML, CSS, imágenes)
import fastifyMultipart from '@fastify/multipart';  // Plugin para recibir archivos del cliente (avatares, PDFs...)
import path from 'path';  // Módulo nativo de Node.js para manejar rutas de archivos/carpetas
import { fileURLToPath } from 'url';  // Función para convertir URLs de módulos ES(ECMA Script) a rutas de archivo

// ============ Importar middleware ============
import { authenticate } from './middleware/auth.js';

// ============================================================================
// CONFIGURACION INICIAL
// ============================================================================
// Obtención de la ruta completa del directorio actual (el de index.ts)
const __filename = fileURLToPath(import.meta.url);  //'__' -> convención de node
const __dirname = path.dirname(__filename); 

const servidorFastify = Fastify({ logger: true });
const clienteDePrisma = new PrismaClient();

// ============================================================================
// MIDDLEWARE: CORS
// ============================================================================
// middleware: funciones intermediarias que se ejecutan entre la petición del 
// cliente y la respuesta del servidor, actuando como filtro o validadores
// de la petición que ha hecho el cliente
await servidorFastify.register(fastifyCors, {
    origin: '*', // '*' -> indica que todos los dominios pueden hacer peticiones
    methods: ['GET', 'POST', 'PUT', 'DELETE']
});

// ============================================================================
// MIDDLEWARE: PERMITE SERVIR ARCHIVOS ESTÁTICOS (HTML, CSS, JS)
// ============================================================================
await servidorFastify.register(fastifyStatic, { // plugin de Fastify que permite servir archivos estáticos
    root: path.join(__dirname, '..', 'public'),  //  Los archivos se encuentran en la Carpeta public/
    prefix: '/'  //  Disponibles en la URL(desde la raíz) -> http://localhost:3000/
});

// ============================================================================
// MIDDLEWARE: MULTIPART (PERMITE SUBIDA DE ARCHIVOS)
// ============================================================================
await servidorFastify.register(fastifyMultipart, { // plugin de fastify que permite recibir archivos
    limits: {
        fileSize: 5 * 1024 * 1024  // Límite: 5MB -> CONVERSION A BYTES: ( 5MB * 1 KB * 1MB)
    }
});

// ============================================================================
// MIDDLEWARE: AUTENTICACION JWT
// ============================================================================
// 'decorate' -> Añade la función personalizada 'authenticate' a Fastify
// Esto evita tener que estar importando la función cada vez que se quiera usar ('import....')
servidorFastify.decorate('authenticate', async (request: any, reply: any) => {
    try {
        // Extrae la palabra clave 'Bearer' del token("Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...")
        const token = request.headers.authorization?.replace('Bearer ', '');
        
        if (!token) {
            return reply.status(401).send({ error: 'Token no proporcionado' });
        }
        
        // Verifica que el TOKEN sea válido, que no haya expirado y decodifica su contenido
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        // Guarda la info decodificada en 'request.user' para que puedan acceder desde todas las rutas
        request.user = decoded;
        
    } catch (error) {
        return reply.status(401).send({ error: 'Token inválido o expirado' });
    }
});

// ============================================================================
// REGISTRAR RUTAS (funciones que contienen los endpoints creados por mi)
// ============================================================================
await servidorFastify.register(usuariosRoutes);
await servidorFastify.register(amigosRoutes);
await servidorFastify.register(authRoutes);

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