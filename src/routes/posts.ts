import type { FastifyInstance } from 'fastify';
import { leerUsuarios, leerPosts, guardarPosts, generarIdPost } from '../utils/archivos';

const TOKEN = 'mi_token';

export async function postsRoutes(fastify: FastifyInstance) {
    
    // ==================== CREAR POST ====================
    fastify.post('/usuarios/:userId/posts', async (request, response) => {
        const token = request.headers['authorization'];
        if(!token || token !== TOKEN)
            return response.status(401).send('Unauthorized');

        const {userId} = request.params as {userId: string};
        const {contenido} = request.body as {contenido: string};

        const array_Usuarios = await leerUsuarios();
        const usuario = array_Usuarios.find(u => u.id_user === parseInt(userId));

        if(!usuario)
            return response.status(404).send('Usuario no encontrado');

        const array_Posts = await leerPosts();
        const nuevo_post = {
            id_post: generarIdPost(array_Posts),
            user_id: parseInt(userId),
            contenido
        };

        array_Posts.push(nuevo_post);
        await guardarPosts(array_Posts);

        response.send({
            mensaje: 'Post creado',
            post: nuevo_post
        });
    });

    // ==================== LISTAR POSTS DE UN USUARIO ====================
    fastify.get('/usuarios/:userId/posts', async (request, response) => {
        const {userId} = request.params as {userId: string};

        const array_Posts = await leerPosts();
        const posts_usuario = array_Posts.filter(p => p.user_id === parseInt(userId));

        response.send({
            totalPosts: posts_usuario.length,
            posts: posts_usuario
        });
    });

    // ==================== OBTENER UN POST ====================
    fastify.get('/usuarios/:userId/posts/:postId', async (request, response) => {
        const {userId, postId} = request.params as {userId: string, postId: string};

        const array_Posts = await leerPosts();
        const post = array_Posts.find(p => 
            p.id_post === parseInt(postId) && p.user_id === parseInt(userId)
        );

        if(!post)
            return response.status(404).send('Post no encontrado');

        response.send(post);
    });

    // ==================== ELIMINAR POST ====================
    fastify.delete('/usuarios/:userId/posts/:postId', async (request, response) => {
        const token = request.headers['authorization'];
        if(!token || token !== TOKEN)
            return response.status(401).send('Unauthorized');

        const {userId, postId} = request.params as {userId: string, postId: string};

        const array_Posts = await leerPosts();
        const pos_post = array_Posts.findIndex(p => 
            p.id_post === parseInt(postId) && p.user_id === parseInt(userId)
        );

        if(pos_post === -1)
            return response.status(404).send('Post no encontrado');

        array_Posts.splice(pos_post, 1);
        await guardarPosts(array_Posts);

        response.send({mensaje: 'Post eliminado'});
    });

    // ==================== ELIMINAR TODOS LOS POSTS ====================
    fastify.delete('/usuarios/:userId/posts', async (request, response) => {
        const token = request.headers['authorization'];
        if(!token || token !== TOKEN)
            return response.status(401).send('Unauthorized');

        const {userId} = request.params as {userId: string};

        const array_Posts = await leerPosts();
        const posts_restantes = array_Posts.filter(p => p.user_id !== parseInt(userId));

        await guardarPosts(posts_restantes);
        response.send({mensaje: 'Todos los posts eliminados'});
    });
}