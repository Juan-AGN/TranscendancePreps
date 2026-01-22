// ============================================================================
// IMPORTACIONES
// ============================================================================
// IMPORTAR TIPO DE TYPESCRIPT
// 'type' -> solo importa el tipo, nada de código ejecutable
// 'FastifyInstance' -> Nombre del tipo a importar
import type { FastifyInstance } from 'fastify';

// IMPORTAR CLASE DE PRISMA
// 'PrismaClient' -> Clase para conectarse a la base de datos
import { PrismaClient } from '@prisma/client';

// ============================================================================
// CONFIGURACIÓN
// ============================================================================
// CREAR INSTANCIA DE PRISMA (prisma)
// 'new' -> crea una nueva instancia
// 'PrismaClient()' -> Clase importada (arriba)
const prisma = new PrismaClient();
const TOKEN = 'mi_token';

// ============================================================================
// FUNCIÓN QUE EMPAQUETA TODOS LOS ENDPOINTS (RUTAS) DE POSTS (MODULARIDAD)
// ============================================================================
// Sirve para poder usar las rutas desde otros archivos
// 'export' -> para que permita la exportación
// Como se importa desde otro archivo: import { postsRoutes } from './routes/posts';
// ============================================================================
export async function postsRoutes(fastify: FastifyInstance) {

    // ============================================================================
    // CREAR POST
    // ============================================================================
    // POST /usuarios/:userId/posts
    // Permite a un usuario crear un nuevo post
    // ============================================================================
    fastify.post('/usuarios/:userId/posts', async (request, response) => {
        
        // 1️⃣ AUTENTICACIÓN
        // Verificar que el token sea válido
        const token = request.headers['authorization'];
        if (!token || token !== TOKEN)
            return response.status(401).send('Unauthorized');

        // 2️⃣ EXTRAER PARÁMETROS Y BODY
        // Extraer userId de la URL
        const { userId } = request.params as { userId: string };
        // Extraer contenido del cuerpo de la petición
        const { contenido } = request.body as { contenido: string };

        // 3️⃣ VERIFICAR QUE EL USUARIO EXISTE
        // Buscar usuario en la base de datos
        const usuario = await prisma.usuario.findUnique({ 
            where: { id: parseInt(userId) } 
        });

        // 4️⃣ VALIDAR EXISTENCIA
        if (!usuario)
            return response.status(404).send('Usuario no encontrado');

        // 5️⃣ CREAR POST EN LA BASE DE DATOS
        // prisma.post.create() → Crea un nuevo post
        // data → Datos del nuevo post
        const nuevoPost = await prisma.post.create({
            data: {
                contenido,
                usuario_id: parseInt(userId)
            }
        });

        // 6️⃣ RESPONDER AL CLIENTE
        response.send({ mensaje: 'Post creado', post: nuevoPost });
    });


    // ============================================================================
    // OBTENER POSTS DE UN USUARIO
    // ============================================================================
    // GET /usuarios/:userId/posts
    // Devuelve todos los posts de un usuario específico
    // ============================================================================
    fastify.get('/usuarios/:userId/posts', async (request, response) => {
        
        // 1️⃣ EXTRAER PARÁMETRO
        const { userId } = request.params as { userId: string };

        // 2️⃣ BUSCAR POSTS EN LA BASE DE DATOS
        // prisma.post.findMany() → Busca VARIOS posts
        // where → Filtra por usuario_id
        // include → Incluye datos del usuario relacionado
        // orderBy → Ordena por fecha de creación descendente (más recientes primero)
        const posts = await prisma.post.findMany({
            where: { usuario_id: parseInt(userId) },
            include: { usuario: { select: { nombre: true, email: true } } },
            orderBy: { createdAt: 'desc' }
        });

        // 3️⃣ RESPONDER CON LISTA DE POSTS
        response.send(posts);
    });


    // ============================================================================
    // OBTENER UN POST ESPECÍFICO
    // ============================================================================
    // GET /usuarios/:userId/posts/:postId
    // Devuelve un post específico por su ID
    // ============================================================================
    fastify.get('/usuarios/:userId/posts/:postId', async (request, response) => {
        
        // 1️⃣ EXTRAER PARÁMETRO
        const { postId } = request.params as { postId: string };

        // 2️⃣ BUSCAR POST POR ID
        // prisma.post.findUnique() → Busca UN post por ID
        // include → Incluye datos del usuario que lo creó
        const post = await prisma.post.findUnique({
            where: { id: parseInt(postId) },
            include: { usuario: { select: { nombre: true, email: true } } }
        });

        // 3️⃣ VALIDAR EXISTENCIA
        if (!post)
            return response.status(404).send('Post no encontrado');

        // 4️⃣ RESPONDER CON EL POST
        response.send(post);
    });


    // ============================================================================
    // ELIMINAR UN POST
    // ============================================================================
    // DELETE /usuarios/:userId/posts/:postId
    // Elimina un post específico por su ID
    // ============================================================================
    fastify.delete('/usuarios/:userId/posts/:postId', async (request, response) => {
        
        // 1️⃣ AUTENTICACIÓN
        const token = request.headers['authorization'];
        if (!token || token !== TOKEN)
            return response.status(401).send('Unauthorized');

        // 2️⃣ EXTRAER PARÁMETRO
        const { postId } = request.params as { postId: string };

        // 3️⃣ ELIMINAR POST DE LA BASE DE DATOS
        // prisma.post.delete() → Elimina UN post
        await prisma.post.delete({ 
            where: { id: parseInt(postId) } 
        });

        // 4️⃣ RESPONDER AL CLIENTE
        response.send({ mensaje: 'Post eliminado' });
    });


    // ============================================================================
    // ELIMINAR TODOS LOS POSTS DE UN USUARIO
    // ============================================================================
    // DELETE /usuarios/:userId/posts
    // Elimina todos los posts de un usuario específico
    // ============================================================================
    fastify.delete('/usuarios/:userId/posts', async (request, response) => {
        
        // 1️⃣ AUTENTICACIÓN
        const token = request.headers['authorization'];
        if (!token || token !== TOKEN)
            return response.status(401).send('Unauthorized');

        // 2️⃣ EXTRAER PARÁMETRO
        const { userId } = request.params as { userId: string };

        // 3️⃣ ELIMINAR TODOS LOS POSTS DEL USUARIO
        // prisma.post.deleteMany() → Elimina VARIOS posts que cumplan la condición
        // where → Filtra por usuario_id
        await prisma.post.deleteMany({ 
            where: { usuario_id: parseInt(userId) } 
        });

        // 4️⃣ RESPONDER AL CLIENTE
        response.send({ mensaje: 'Posts eliminados' });
    });
}