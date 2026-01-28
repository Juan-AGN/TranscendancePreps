// ============================================================================
// PASO 1: IMPORTAR LIBRERÍAS
// ============================================================================
import 'dotenv/config';           // Lee el archivo .env y carga las variables
import Fastify from 'fastify';    // Framework para crear el servidor
import fastifyJWT from '@fastify/jwt';  // Plugin para manejar tokens JWT
import cors from '@fastify/cors'; // Plugin para permitir peticiones desde otros dominios

// Importar (leer) funciones concretas de un archivo específico 
import { usuariosRoutes } from './routes/usuarios'; // no necesita el .ts
import { amigosRoutes } from './routes/amigos';
import { postsRoutes } from './routes/posts';

// ============================================================================
// PASO 2: VALIDAR QUE EXISTAN LAS VARIABLES IMPORTANTES
// ============================================================================

// Verificar que JWT_SECRET existe en el archivo .env
    // 'process' es un objeto global de NODE ( puede acceder a .env)
if (!process.env.JWT_SECRET) {
    console.error('ERROR: Falta JWT_SECRET en el archivo .env');
    process.exit(1);  // Detener el programa (antes de arrancar) si falta el JWT
}

// Verificar que DATABASE_URL existe en el archivo .env
if (!process.env.DATABASE_URL) {
    console.error('ERROR: Falta DATABASE_URL en el archivo .env');
    process.exit(1);  // Detener el programa si falta
}

// Guardar las variables en constantes para usarlas después
const JWT_SECRET = process.env.JWT_SECRET;
const DATABASE_URL = process.env.DATABASE_URL;

console.log('Variables de entorno cargadas correctamente\n');

// ============================================================================
// PASO 3: CREAR EL SERVIDOR
// ============================================================================
const fastify = Fastify({ 
    logger: true  // Activar logs para ver qué pasa en el servidor
});

// ============================================================================
// PASO 4: CONFIGURAR CORS (para que el frontend pueda conectarse)
// ============================================================================
await fastify.register(cors, {
    origin: true,  // Permitir peticiones desde cualquier origen
    methods: ['GET', 'POST', 'PUT', 'DELETE']  // Métodos HTTP permitidos
});

// ============================================================================
// PASO 5: INSTALACION DEL PLUGIN: Fastify JWT (en el servidor)
// ============================================================================
await fastify.register(fastifyJWT, {
    secret: JWT_SECRET  // Asigna la clave secreta al plugin
    // ahora el servidor puede crear y verificar tokens (middleware)
    // el servidor tiene 1 sola claves secreta, cada usuario tiene su propio TOKEN
});

// ============================================================================
// PASO 6: CREAR FUNCIÓN ('authenticate') PARA VERIFICAR TOKENS (middleware -> portero)
// ============================================================================
// Esta función verificará que el usuario haya enviado un token válido
fastify.decorate('authenticate', async function(request: any, response: any) {
    
    try {
        // Intentar verificar el token JWT (en el header.authorization) del cliente
        await request.jwtVerify();
        
        // Si llega aquí, el token es válido 
        // request.user ahora contiene los datos del usuario: {id, email, nombre}
        
    } catch (error) {
        // Si falla, el token es inválido o ha expirado 
        response.status(401).send({ 
            error: 'Token inválido o expirado',
            mensaje: 'Debes hacer login de nuevo'
        });
    }
});

// ============================================================================
// PASO 7: REGISTRAR TODAS LAS RUTAS ( de los demás archivos ) EN EL SERVIDOR 
// ============================================================================
    // Fastify necesita saber qué rutas existen antes de arrancar el servidor:
    // 'usuariosRoutes' es la ft que contiene todas las rutas en usuarios.ts
await fastify.register(usuariosRoutes);  // Rutas de usuarios (/registro, /login, etc)
await fastify.register(amigosRoutes);    // Rutas de amigos
await fastify.register(postsRoutes);     // Rutas de posts

// ============================================================================
// PASO 8: ARRANCAR EL SERVIDOR
// ============================================================================
const PORT = 3000;  // Puerto donde escuchará el servidor

try {
    // Iniciar el servidor en el puerto 3000
    await fastify.listen({ port: PORT });
    
    // Mostrar mensajes de éxito
    console.log(' ¡Servidor arrancado exitosamente!');
    console.log(` Escuchando en: http://localhost:${PORT}`);
    console.log(' Sistema JWT: Activado');
    console.log('  Base de datos: Conectada');
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
    // Si hay un error al arrancar el servidor
    console.error(' Error al arrancar el servidor:', error);
    process.exit(1);  // Detener el programa
}