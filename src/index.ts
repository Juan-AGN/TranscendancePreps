// ============================================================================
// PASO 1: IMPORTAR LIBRERÍAS
// ============================================================================
import 'dotenv/config';           // Lee el archivo .env y carga las variables
import Fastify from 'fastify';    // Framework para crear el servidor
import fastifyJWT from '@fastify/jwt';  // Plugin para manejar tokens JWT
import cors from '@fastify/cors'; // Plugin para permitir peticiones desde otros dominios

// Importar mis rutas personalizadas
import { usuariosRoutes } from './routes/usuarios';
import { amigosRoutes } from './routes/amigos';
import { postsRoutes } from './routes/posts';

// ============================================================================
// PASO 2: VALIDAR QUE EXISTAN LAS VARIABLES IMPORTANTES
// ============================================================================

// Verificar que JWT_SECRET existe en el archivo .env
if (!process.env.JWT_SECRET) {
    console.error('❌ ERROR: Falta JWT_SECRET en el archivo .env');
    process.exit(1);  // Detener el programa si falta
}

// Verificar que DATABASE_URL existe en el archivo .env
if (!process.env.DATABASE_URL) {
    console.error('❌ ERROR: Falta DATABASE_URL en el archivo .env');
    process.exit(1);  // Detener el programa si falta
}

// Guardar las variables en constantes para usarlas después
const JWT_SECRET = process.env.JWT_SECRET;
const DATABASE_URL = process.env.DATABASE_URL;

console.log('✅ Variables de entorno cargadas correctamente\n');

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
// PASO 5: CONFIGURAR JWT (tokens de autenticación)
// ============================================================================
await fastify.register(fastifyJWT, {
    secret: JWT_SECRET  // Clave secreta para firmar los tokens
});

// ============================================================================
// PASO 6: CREAR FUNCIÓN PARA VERIFICAR TOKENS (middleware)
// ============================================================================
// Esta función verifica que el usuario haya enviado un token válido
fastify.decorate('authenticate', async function(request: any, reply: any) {
    
    try {
        // Intentar verificar el token JWT del header Authorization
        await request.jwtVerify();
        
        // Si llega aquí, el token es válido ✅
        // request.user ahora contiene los datos del usuario: {id, email, nombre}
        
    } catch (error) {
        // Si falla, el token es inválido o ha expirado ❌
        reply.status(401).send({ 
            error: 'Token inválido o expirado',
            mensaje: 'Debes hacer login de nuevo'
        });
    }
});

// ============================================================================
// PASO 7: REGISTRAR TODAS LAS RUTAS
// ============================================================================
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
    console.log('🚀 ¡Servidor arrancado exitosamente!');
    console.log(`📡 Escuchando en: http://localhost:${PORT}`);
    console.log('🔐 Sistema JWT: Activado');
    console.log('🗄️  Base de datos: Conectada');
    console.log('\n📚 RUTAS DISPONIBLES:\n');
    console.log('👤 USUARIOS:');
    console.log('   POST   /registro');
    console.log('   POST   /login');
    console.log('   GET    /get_usuarios');
    console.log('   GET    /get_usuario/:id');
    console.log('   PUT    /put_usuario/:id');
    console.log('   DELETE /delete_usuarios/:id');
    console.log('\n👥 AMIGOS:');
    console.log('   POST   /usuarios/:userId/enviar_solicitud/:amigoId');
    console.log('   POST   /usuarios/:userId/aceptar_solicitud/:amigoId');
    console.log('   GET    /usuarios/:userId/mis_amigos');
    console.log('   DELETE /usuarios/:userId/eliminar_amigo/:amigoId');
    console.log('\n📝 POSTS:');
    console.log('   POST   /usuarios/:userId/posts');
    console.log('   GET    /usuarios/:userId/posts');
    console.log('   DELETE /usuarios/:userId/posts/:postId\n');
    
} catch (error) {
    // Si hay un error al arrancar el servidor
    console.error('❌ Error al arrancar el servidor:', error);
    process.exit(1);  // Detener el programa
}