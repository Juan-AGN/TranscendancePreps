// ============================================================================
// PASO 1: IMPORTAR TODAS LAS LIBRERIAS NECESARIAS
// ============================================================================
// -------------------------------------------------
// Cuando ejecutas -> npm install fastify
// 1. npm busca en npmjs.com (registro de paquetes)
// 2. Descarga el código de fastify
// 3. Lo guarda en node_modules/fastify/
// 4. También descarga las DEPENDENCIAS de fastify
// 5. Todo queda en tu disco duro (node_modules/)
// -------------------------------------------------

// Carga las variables de entorno desde el archivo .env
import 'dotenv/config'; // dotenv -> libería de Node q lee .env y carga las var en process.env
                        // A dif de la siguientes no necesita asignar a const xq solo ejecuta código

// El framework del servidor web (del backend)
import Fastify from 'fastify'; // Importo la FUNCIÓN 'Fastify' del paquete 'fastify' y la guardo en la constante 'Fastify'

// Plugins de Fastify
import fastifyJWT from '@fastify/jwt';      // Para crear y verificar tokens JWT
import cors from '@fastify/cors';            // Para permitir peticiones desde otros dominios
import fastifyStatic from '@fastify/static';  // Para servir archivos HTML/CSS/JS

// Modulos de Node.js para manejar rutas de archivos
import path from 'path'; // Manipula rutas para compatibilizarlas con cualquier OS
import { fileURLToPath } from 'url'; // convierte URLs en rutas normales del OS

// Importar las rutas que necesito de mis archivos
import { usuariosRoutes } from './routes/usuarios.js';
import { amigosRoutes } from './routes/amigos.js';
import { postsRoutes } from './routes/posts.js';

// ============================================================================
// PASO 2: EXTENDER FASTIFY CON PLUGIN DE AUTENTICACIÓN PERSONALIZADO
// ============================================================================
// Le avisamos a TypeScript que vamos a añadir una propiedad 'authenticate'
// al objeto FastifyInstance. Esto evita errores de tipos.
// La función real se crea después con .decorate() en el PASO 9 
declare module 'fastify' {
    interface FastifyInstance {
        authenticate: any; 
    }
}

// ============================================================================
// PASO 3: OBTENER RUTA DE ARCHIVO 'index.js' + DIRECTORIO DEL MISMO
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
    console.error('Crea un archivo .env y añade: JWT_SECRET=tu_secreto_aqui');
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
// PASO 5: CREAR EL SERVIDOR (el objeto) FASTIFY
// ============================================================================
const servidorFastify = Fastify({ // ahora puedes usar todas las funcionalidades del servidor
    logger: true  // Activar logs para ver las peticiones en consola
});

// ============================================================================
// PASO 6: CONFIGURAR CORS (plugin)
// ============================================================================
// es necesario si tu frontend esta en otro puerto, para permitir peticiones externas
await servidorFastify.register(cors, { // Register -> añade funcionalidades extra al servidor
    origin: true,  // Permitir todos los origenes (en produccion, especificar dominio)
    methods: ['GET', 'POST', 'PUT', 'DELETE']  // Metodos HTTP permitidos
});

// ============================================================================
// PASO 7: CONFIGURAR FASTIFY STATIC (servir archivos HTML/CSS/JS)
// ============================================================================
// hace que el servidor pueda servir archivos estaticos desde la carpeta public/
await servidorFastify.register(fastifyStatic, { // <- Plugin a instalar
    root: path.join(carpetaDondeEstaEsteArchivo, '../public'), // ruta desde donde se sirven los HTML, etc
    prefix: '/'  // Los archivos se sirven desde la raiz: http://localhost:3000/ -> '/'
});

// ============================================================================
// PASO 8: CONFIGURAR JWT (JSON Web Tokens) 
// ============================================================================
// permite crear y verificar (firmar) tokens de autenticacion
await servidorFastify.register(fastifyJWT, {
    secret: SECRET_PARA_JWT  // Clave secreta para firmar los tokens
});

// ============================================================================
// PASO 9: CREAR FUNCION PARA VERIFICAR (y firmar) TOKENS JWT
// ============================================================================
// Esta funcion se ejecuta antes de las rutas protegidas
// Verifica que el token JWT que envió el cliente sea valido
servidorFastify.decorate('authenticate', async function(request: any, response: any) {
    try { // Intentar verificar el token
        // Si el token es valido, los datos se guardan en request.user automáticamente
        await request.jwtVerify();
    } catch (error) { // Si el token es invalido o esta expirado, retornar error 401
        response.status(401).send({ 
            error: 'Token invalido o expirado'
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
const PUERTO_DEL_SERVIDOR = 3000; // -> el más usado en Node.js
                                  // 5173 -> Frontend/vite)
                                  // 5432 -> PostgreSQL

try { // Intentar iniciar el servidor
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