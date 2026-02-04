// ============================================================================
// PASO 1: IMPORTAR TODAS LAS LIBRERIAS NECESARIAS
// ============================================================================
// dotenv/config: Carga las variables de entorno desde el archivo .env
import 'dotenv/config';

// Fastify: El framework del servidor web
import Fastify from 'fastify';

// Plugins de Fastify para diferentes funcionalidades
import fastifyJWT from '@fastify/jwt';      // Para crear y verificar tokens JWT
import cors from '@fastify/cors';            // Para permitir peticiones desde otros dominios
import fastifyStatic from '@fastify/static';  // Para servir archivos HTML/CSS/JS

// Modulos de Node.js para manejar rutas de archivos
import path from 'path';
import { fileURLToPath } from 'url';

// Importar las rutas de la aplicacion
import { usuariosRoutes } from './routes/usuarios.js';
import { amigosRoutes } from './routes/amigos.js';
import { postsRoutes } from './routes/posts.js';

// ============================================================================
// PASO 2: DECLARACION DE TIPOS PARA TYPESCRIPT
// ============================================================================
// Esto le dice a TypeScript que el objeto fastify tiene una propiedad authenticate
declare module 'fastify' {
    interface FastifyInstance {
        authenticate: any;
    }
}

// ============================================================================
// PASO 3: OBTENER RUTAS DE ARCHIVOS
// ============================================================================
// Necesario para ES Modules (cuando usas import en vez de require)
const rutaDeEsteArchivo = fileURLToPath(import.meta.url);
const carpetaDondeEstaEsteArchivo = path.dirname(rutaDeEsteArchivo);

// ============================================================================
// PASO 4: VALIDAR QUE EXISTAN LAS VARIABLES DE ENTORNO IMPORTANTES
// ============================================================================
// Si no existe JWT_SECRET, mostrar error y salir
if (!process.env.JWT_SECRET) {
    console.error('ERROR CRITICO: Falta JWT_SECRET en el archivo .env');
    console.error('Crea un archivo .env y annade: JWT_SECRET=tu_secreto_aqui');
    process.exit(1);  // Salir del programa con codigo de error
}

// Si no existe DATABASE_URL, mostrar error y salir
if (!process.env.DATABASE_URL) {
    console.error('ERROR CRITICO: Falta DATABASE_URL en el archivo .env');
    console.error('Annade: DATABASE_URL=postgresql://usuario:pass@localhost:5432/database');
    process.exit(1);
}

// Guardar las variables en constantes para usarlas despues
const SECRET_PARA_JWT = process.env.JWT_SECRET;
const URL_DE_LA_BASE_DE_DATOS = process.env.DATABASE_URL;

console.log('Variables de entorno cargadas correctamente');
console.log('');

// ============================================================================
// PASO 5: CREAR EL SERVIDOR FASTIFY
// ============================================================================
const servidorFastify = Fastify({ 
    logger: true  // Activar logs para ver las peticiones en consola
});

// ============================================================================
// PASO 6: CONFIGURAR CORS (permitir peticiones desde otros dominios)
// ============================================================================
// Esto es necesario si tu frontend esta en otro puerto
await servidorFastify.register(cors, {
    origin: true,  // Permitir todos los origenes (en produccion, especificar dominio)
    methods: ['GET', 'POST', 'PUT', 'DELETE']  // Metodos HTTP permitidos
});

// ============================================================================
// PASO 7: CONFIGURAR FASTIFY STATIC (servir archivos HTML/CSS/JS)
// ============================================================================
// Esto hace que el servidor pueda servir archivos estaticos desde la carpeta public/
await servidorFastify.register(fastifyStatic, {
    root: path.join(carpetaDondeEstaEsteArchivo, '../public'),
    prefix: '/'  // Los archivos se sirven desde la raiz: http://localhost:3000/
});

// ============================================================================
// PASO 8: CONFIGURAR JWT (JSON Web Tokens)
// ============================================================================
// Esto permite crear y verificar tokens de autenticacion
await servidorFastify.register(fastifyJWT, {
    secret: SECRET_PARA_JWT  // Clave secreta para firmar los tokens
});

// ============================================================================
// PASO 9: CREAR FUNCION PARA VERIFICAR TOKENS JWT
// ============================================================================
// Esta funcion se ejecuta antes de las rutas protegidas
// Verifica que el token JWT sea valido
servidorFastify.decorate('authenticate', async function(peticionDelCliente: any, respuestaAlCliente: any) {
    try {
        // Intentar verificar el token
        // Si el token es valido, los datos se guardan en peticionDelCliente.user
        await peticionDelCliente.jwtVerify();
    } catch (error) {
        // Si el token es invalido o esta expirado, retornar error 401
        respuestaAlCliente.status(401).send({ 
            error: 'Token invalido o expirado',
            mensaje: 'Debes hacer login de nuevo'
        });
    }
});

// ============================================================================
// PASO 10: REGISTRAR TODAS LAS RUTAS DE LA APLICACION
// ============================================================================
// Estas funciones registran todas las rutas definidas en cada archivo
await servidorFastify.register(usuariosRoutes);  // Rutas de usuarios
await servidorFastify.register(amigosRoutes);    // Rutas de amigos
await servidorFastify.register(postsRoutes);     // Rutas de posts

// ============================================================================
// PASO 11: ARRANCAR EL SERVIDOR
// ============================================================================
const PUERTO_DEL_SERVIDOR = 3000;

try {
    // Intentar iniciar el servidor
    await servidorFastify.listen({ 
        port: PUERTO_DEL_SERVIDOR,
        host: '0.0.0.0'  // Escuchar en todas las interfaces (necesario para Docker)
    });
    
    // Si todo sale bien, mostrar mensaje de exito
    console.log('');
    console.log('===============================================');
    console.log('SERVIDOR ARRANCADO EXITOSAMENTE');
    console.log('===============================================');
    console.log('');
    console.log(`URL: http://localhost:${PUERTO_DEL_SERVIDOR}`);
    console.log('Sistema JWT: Activado');
    console.log('Base de datos: PostgreSQL (conectada)');
    console.log('Archivos estaticos: public/');
    console.log('');
    console.log('RUTAS DISPONIBLES:');
    console.log('');
    console.log('USUARIOS:');
    console.log('  POST   /registro');
    console.log('  POST   /login');
    console.log('  GET    /get_usuarios');
    console.log('  GET    /get_usuario/:id');
    console.log('  PUT    /put_usuario/:id');
    console.log('  DELETE /delete_usuarios/:id');
    console.log('');
    console.log('AMIGOS:');
    console.log('  POST   /usuarios/:userId/enviar_solicitud/:amigoId');
    console.log('  POST   /usuarios/:userId/aceptar_solicitud/:amigoId');
    console.log('  GET    /usuarios/:userId/mis_amigos');
    console.log('  DELETE /usuarios/:userId/eliminar_amigo/:amigoId');
    console.log('');
    console.log('POSTS:');
    console.log('  POST   /usuarios/:userId/posts');
    console.log('  GET    /usuarios/:userId/posts');
    console.log('  DELETE /usuarios/:userId/posts/:postId');
    console.log('');
    console.log('===============================================');
    console.log('');
    
} catch (error) {
    // Si hay un error al arrancar, mostrar mensaje y salir
    console.error('');
    console.error('ERROR AL ARRANCAR EL SERVIDOR:');
    console.error(error);
    console.error('');
    process.exit(1);
}