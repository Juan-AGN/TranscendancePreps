// ============================================================================
// IMPORTACIONES
// ============================================================================
import type { FastifyInstance } from 'fastify';
import { leerPosts, guardarPosts, generarIdPost } from '../utils/archivos.js';

// ============================================================================
// FUNCIÓN PRINCIPAL: Registrar todas las rutas de posts
// ============================================================================
export async function postsRoutes(fastify: FastifyInstance) {
    
    // ========================================================================
    // RUTA 1: CREAR UN POST
    // ========================================================================
    // URL: POST /usuarios/:userId/posts
    // Ejemplo: POST /usuarios/1/posts
    fastify.post('/usuarios/:userId/posts', {
        onRequest: [fastify.authenticate]  // ← Necesita token
    }, async (request, response) => {
        
        // PASO 1: Obtener el ID del usuario de la URL
        const params = request.params as { userId: string };
        const idUsuario = parseInt(params.userId);
        
        // PASO 2: Obtener el contenido del post del body
        const body = request.body as { contenido: string };
        const contenido = body.contenido;
        
        // PASO 3: Validar que el contenido no esté vacío
        if (!contenido || contenido.trim() === '') {
            return response.status(400).send({
                error: 'El contenido del post no puede estar vacío'
            });
        }
        
        // PASO 4: Leer todos los posts existentes
        const posts = leerPosts();
        
        // PASO 5: Crear el nuevo post
        const nuevoPost = {
            id_post: generarIdPost(),              // Generar ID único
            id_user: idUsuario,                     // ID del autor
            contenido: contenido,                   // Texto del post
            fecha: new Date().toISOString()        // Fecha actual en formato ISO
        };
        
        // PASO 6: Añadir el nuevo post a la lista
        posts.push(nuevoPost);
        
        // PASO 7: Guardar los cambios en el archivo JSON
        guardarPosts(posts);
        
        // PASO 8: Retornar respuesta exitosa
        response.send({
            mensaje: 'Post creado exitosamente',
            post: nuevoPost
        });
    });
    
    // ========================================================================
    // RUTA 2: LISTAR TODOS LOS POSTS DE UN USUARIO
    // ========================================================================
    // URL: GET /usuarios/:userId/posts
    // Ejemplo: GET /usuarios/1/posts
    fastify.get('/usuarios/:userId/posts', async (request, response) => {
        
        // PASO 1: Obtener el ID del usuario de la URL
        const params = request.params as { userId: string };
        const idUsuario = parseInt(params.userId);
        
        // PASO 2: Leer todos los posts
        const posts = leerPosts();
        
        // PASO 3: Filtrar solo los posts de este usuario
        const postsDelUsuario = posts.filter(post => post.id_user === idUsuario);
        
        // PASO 4: Verificar si el usuario tiene posts
        if (postsDelUsuario.length === 0) {
            return response.send({
                mensaje: 'Este usuario no tiene posts',
                total: 0,
                posts: []
            });
        }
        
        // PASO 5: Ordenar los posts por fecha (más recientes primero)
        const postsOrdenados = postsDelUsuario.sort((a, b) => {
            // Convertir fechas a timestamps para comparar
            const fechaA = new Date(a.fecha).getTime();
            const fechaB = new Date(b.fecha).getTime();
            return fechaB - fechaA;  // Más reciente primero
        });
        
        // PASO 6: Retornar la lista de posts
        response.send({
            mensaje: `Este usuario tiene ${postsOrdenados.length} posts`,
            total: postsOrdenados.length,
            posts: postsOrdenados
        });
    });
    
    // ========================================================================
    // RUTA 3: OBTENER UN POST ESPECÍFICO
    // ========================================================================
    // URL: GET /usuarios/:userId/posts/:postId
    // Ejemplo: GET /usuarios/1/posts/5
    fastify.get('/usuarios/:userId/posts/:postId', async (request, response) => {
        
        // PASO 1: Obtener los IDs de la URL
        const params = request.params as { userId: string, postId: string };
        const idUsuario = parseInt(params.userId);
        const idPost = parseInt(params.postId);
        
        // PASO 2: Leer todos los posts
        const posts = leerPosts();
        
        // PASO 3: Buscar el post específico
        const post = posts.find(p => 
            p.id_post === idPost && p.id_user === idUsuario
        );
        
        // PASO 4: Verificar si el post existe
        if (!post) {
            return response.status(404).send({
                error: 'Post no encontrado',
                mensaje: 'Este post no existe o no pertenece a este usuario'
            });
        }
        
        // PASO 5: Retornar el post
        response.send({
            post: post
        });
    });
    
    // ========================================================================
    // RUTA 4: ELIMINAR UN POST
    // ========================================================================
    // URL: DELETE /usuarios/:userId/posts/:postId
    // Ejemplo: DELETE /usuarios/1/posts/5
    fastify.delete('/usuarios/:userId/posts/:postId', {
        onRequest: [fastify.authenticate]  // ← Necesita token
    }, async (request, response) => {
        
        // PASO 1: Obtener los IDs de la URL
        const params = request.params as { userId: string, postId: string };
        const idUsuario = parseInt(params.userId);
        const idPost = parseInt(params.postId);
        
        // PASO 2: Obtener datos del token JWT
        const tokenData = request.user as { id: number };
        
        // PASO 3: Verificar que solo puedas eliminar TUS posts
        if (tokenData.id !== idUsuario) {
            return response.status(403).send({
                error: 'Acceso denegado',
                mensaje: 'Solo puedes eliminar tus propios posts'
            });
        }
        
        // PASO 4: Leer todos los posts
        const posts = leerPosts();
        
        // PASO 5: Buscar el post a eliminar
        const post = posts.find(p => 
            p.id_post === idPost && p.id_user === idUsuario
        );
        
        // PASO 6: Verificar si el post existe
        if (!post) {
            return response.status(404).send({
                error: 'Post no encontrado'
            });
        }
        
        // PASO 7: Eliminar el post de la lista
        const postsActualizados = posts.filter(p => p.id_post !== idPost);
        
        // PASO 8: Guardar los cambios
        guardarPosts(postsActualizados);
        
        // PASO 9: Retornar respuesta exitosa
        response.send({
            mensaje: 'Post eliminado correctamente',
            postEliminado: {
                id: post.id_post,
                contenido: post.contenido
            }
        });
    });
    
    // ========================================================================
    // RUTA 5: ELIMINAR TODOS LOS POSTS DE UN USUARIO
    // ========================================================================
    // URL: DELETE /usuarios/:userId/posts
    // Ejemplo: DELETE /usuarios/1/posts
    fastify.delete('/usuarios/:userId/posts', {
        onRequest: [fastify.authenticate]  // ← Necesita token
    }, async (request, response) => {
        
        // PASO 1: Obtener el ID del usuario de la URL
        const params = request.params as { userId: string };
        const idUsuario = parseInt(params.userId);
        
        // PASO 2: Obtener datos del token JWT
        const tokenData = request.user as { id: number };
        
        // PASO 3: Verificar que solo puedas eliminar TUS posts
        if (tokenData.id !== idUsuario) {
            return response.status(403).send({
                error: 'Acceso denegado',
                mensaje: 'Solo puedes eliminar tus propios posts'
            });
        }
        
        // PASO 4: Leer todos los posts
        const posts = leerPosts();
        
        // PASO 5: Contar cuántos posts tiene el usuario
        const misPostsAntes = posts.filter(p => p.id_user === idUsuario);
        const totalEliminados = misPostsAntes.length;
        
        // PASO 6: Eliminar TODOS los posts del usuario
        const postsActualizados = posts.filter(p => p.id_user !== idUsuario);
        
        // PASO 7: Guardar los cambios
        guardarPosts(postsActualizados);
        
        // PASO 8: Retornar respuesta exitosa
        response.send({
            mensaje: 'Todos tus posts han sido eliminados',
            totalEliminados: totalEliminados
        });
    });
}