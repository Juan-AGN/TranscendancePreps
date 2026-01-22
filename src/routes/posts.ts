import type { FastifyInstance } from 'fastify';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const TOKEN = 'mi_token';

export async function postsRoutes(fastify: FastifyInstance) {

    // CREAR POST
    fastify.post('/usuarios/:userId/posts', async (request, response) => {
        const token = request.headers['authorization'];
        if (!token || token !== TOKEN)
            return response.status(401).send('Unauthorized');

        const { userId } = request.params as { userId: string };
        const { contenido } = request.body as { contenido: string };

        const usuario = await prisma.usuario.findUnique({ where: { id: parseInt(userId) } });

        if (!usuario)
            return response.status(404).send('Usuario no encontrado');

        const nuevoPost = await prisma.post.create({
            data: {
                contenido,
                usuario_id: parseInt(userId)
            }
        });

        response.send({ mensaje: 'Post creado', post: nuevoPost });
    });

    // OBTENER POSTS DE UN USUARIO
    fastify.get('/usuarios/:userId/posts', async (request, response) => {
        const { userId } = request.params as { userId: string };

        const posts = await prisma.post.findMany({
            where: { usuario_id: parseInt(userId) },
            include: { usuario: { select: { nombre: true, email: true } } },
            orderBy: { createdAt: 'desc' }
        });

        response.send(posts);
    });

    // OBTENER UN POST ESPECÍFICO
    fastify.get('/usuarios/:userId/posts/:postId', async (request, response) => {
        const { postId } = request.params as { postId: string };

        const post = await prisma.post.findUnique({
            where: { id: parseInt(postId) },
            include: { usuario: { select: { nombre: true, email: true } } }
        });

        if (!post)
            return response.status(404).send('Post no encontrado');

        response.send(post);
    });

    // ELIMINAR UN POST
    fastify.delete('/usuarios/:userId/posts/:postId', async (request, response) => {
        const token = request.headers['authorization'];
        if (!token || token !== TOKEN)
            return response.status(401).send('Unauthorized');

        const { postId } = request.params as { postId: string };

        await prisma.post.delete({ where: { id: parseInt(postId) } });

        response.send({ mensaje: 'Post eliminado' });
    });

    // ELIMINAR TODOS LOS POSTS DE UN USUARIO
    fastify.delete('/usuarios/:userId/posts', async (request, response) => {
        const token = request.headers['authorization'];
        if (!token || token !== TOKEN)
            return response.status(401).send('Unauthorized');

        const { userId } = request.params as { userId: string };

        await prisma.post.deleteMany({ where: { usuario_id: parseInt(userId) } });

        response.send({ mensaje: 'Posts eliminados' });
    });
}