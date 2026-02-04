// ============================================================================
// PASO 1: IMPORTAR LIBRERÍAS
// ============================================================================
import 'dotenv/config';
import Fastify from 'fastify';
import fastifyJWT from '@fastify/jwt';
import cors from '@fastify/cors';
import fastifyStatic from '@fastify/static';  
import path from 'path';                      
import { fileURLToPath } from 'url';          

import { usuariosRoutes } from './routes/usuarios.js';
import { amigosRoutes } from './routes/amigos.js';
import { postsRoutes } from './routes/posts.js';

// DECLARACIÓN DE TIPOS
declare module 'fastify' {
    interface FastifyInstance {
        authenticate: any;
    }
}

// Obtener la ruta de este archivo
const filename = fileURLToPath(import.meta.url);

// Obtener la carpeta donde se encuentra este archivo
const dirname = path.dirname(filename);

// ============================================================================
// PASO 2: VALIDAR QUE EXISTAN LAS VARIABLES IMPORTANTES
// ============================================================================
if (!process.env.JWT_SECRET) {
    console.error('ERROR: Falta JWT_SECRET en el archivo .env');
    process.exit(1);
}

if (!process.env.DATABASE_URL) {
    console.error('ERROR: Falta DATABASE_URL en el archivo .env');
    process.exit(1);
}

const JWT_SECRET = process.env.JWT_SECRET;
const DATABASE_URL = process.env.DATABASE_URL;

console.log('Variables de entorno cargadas correctamente\n');

// ============================================================================
// PASO 3: CREAR EL SERVIDOR
// ============================================================================
const fastify = Fastify({ 
    logger: true
});

// ============================================================================
// PASO 4: CONFIGURAR CORS
// ============================================================================
await fastify.register(cors, {
    origin: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE']
});

// ============================================================================
// PASO 4.5: REGISTRAR FASTIFY STATIC (SERVIR ARCHIVOS HTML/CSS/JS)
// ============================================================================
await fastify.register(fastifyStatic, {
    root: path.join(dirname, '../public'),  // Carpeta public/
    prefix: '/'  // Servir desde la raíz: http://localhost:3000/
});

// ============================================================================
// PASO 5: INSTALACION DEL PLUGIN: Fastify JWT
// ============================================================================
await fastify.register(fastifyJWT, {
    secret: JWT_SECRET
});

// ============================================================================
// PASO 6: CREAR FUNCIÓN 'authenticate' PARA VERIFICAR TOKENS
// ============================================================================
fastify.decorate('authenticate', async function(request: any, response: any) {
    try {
        await request.jwtVerify();
    } catch (error) {
        response.status(401).send({ 
            error: 'Token inválido o expirado',
            mensaje: 'Debes hacer login de nuevo'
        });
    }
});

// ============================================================================
// PASO 7: REGISTRAR TODAS LAS RUTAS
// ============================================================================
await fastify.register(usuariosRoutes);
await fastify.register(amigosRoutes);
await fastify.register(postsRoutes);

// ============================================================================
// PASO 8: ARRANCAR EL SERVIDOR
// ============================================================================
const PORT = 3000;

try {
    await fastify.listen({ 
        port: PORT, 
        host: '0.0.0.0'
    });    

    console.log(' ¡Servidor arrancado exitosamente!');
    console.log(` Escuchando en: http://localhost:${PORT}`);
    console.log(' Sistema JWT: Activado');
    console.log('  Base de datos: Conectada');
    console.log('  Archivos estáticos: public/');  
    console.log('\n RUTAS DISPONIBLES:\n');
    console.log(' USUARIOS:');
    console.log('   POST   /registro');
    console.log('   POST   /login');
    console.log('   GET    /get_usuarios');
    console.log('   GET    /get_usuario/:id');
    console.log('   PUT    /put_usuario/:id');
    console.log('   DELETE /delete_usuarios/:id');
    console.log('\n AMIGOS:');
    console.log('   POST   /usuarios/:userId/enviar_solicitud/:amigoId');
    console.log('   POST   /usuarios/:userId/aceptar_solicitud/:amigoId');
    console.log('   GET    /usuarios/:userId/mis_amigos');
    console.log('   DELETE /usuarios/:userId/eliminar_amigo/:amigoId');
    console.log('\n POSTS:');
    console.log('   POST   /usuarios/:userId/posts');
    console.log('   GET    /usuarios/:userId/posts');
    console.log('   DELETE /usuarios/:userId/posts/:postId\n');
    
} catch (error) {
    console.error(' Error al arrancar el servidor:', error);
    process.exit(1);
}