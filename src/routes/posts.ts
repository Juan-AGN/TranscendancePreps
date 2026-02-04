// ============================================================================
// IMPORTACIONES NECESARIAS
// ============================================================================
import type { FastifyInstance } from 'fastify';
import { PrismaClient } from '@prisma/client';

// Crear cliente de Prisma
const clienteDePrisma = new PrismaClient();

// ============================================================================
// FUNCION PRINCIPAL: Registrar todas las rutas relacionadas con posts
// ============================================================================
export async function postsRoutes(servidorFastify: FastifyInstance) {
    
    // ========================================================================
    // RUTA NUMERO 1: CREAR UN NUEVO POST
    // ========================================================================
    // Metodo HTTP: POST
    // URL: http://localhost:3000/usuarios/1/posts
    // Que hace: Usuario 1 crea un nuevo post con texto
    servidorFastify.post('/usuarios/:userId/posts', {
        onRequest: [servidorFastify.authenticate]
    }, async (peticionDelCliente, respuestaAlCliente) => {
        
        // PASO 1: Obtener el ID del usuario de la URL
        const parametrosDeLaURL = peticionDelCliente.params as { userId: string };
        const idDelUsuarioQueEscribeElPost = parseInt(parametrosDeLaURL.userId);
        
        // PASO 2: Obtener el contenido del post del body
        const datosDelBody = peticionDelCliente.body as { contenido: string };
        const textoDelPost = datosDelBody.contenido;
        
        // PASO 3: Validar que el contenido no este vacio
        if (!textoDelPost || textoDelPost.trim() === '') {
            return respuestaAlCliente.status(400).send({
                error: 'El contenido del post no puede estar vacio'
            });
        }
        
        // PASO 4: Verificar que el usuario exista
        const usuarioExiste = await clienteDePrisma.usuario.findUnique({
            where: { id: idDelUsuarioQueEscribeElPost }
        });
        
        if (!usuarioExiste) {
            return respuestaAlCliente.status(404).send({
                error: 'Usuario no encontrado'
            });
        }
        
        // PASO 5: Crear el nuevo post en la base de datos
        const nuevoPostCreado = await clienteDePrisma.post.create({
            data: {
                contenidoDelPost: textoDelPost,
                idDelUsuarioQueEscribioEstePost: idDelUsuarioQueEscribeElPost
            }
        });
        
        // PASO 6: Retornar respuesta exitosa
        respuestaAlCliente.send({
            mensaje: 'Post creado exitosamente',
            post: {
                id: nuevoPostCreado.idDelPost,
                contenido: nuevoPostCreado.contenidoDelPost,
                fecha: nuevoPostCreado.fechaDeCreacionDelPost,
                autorId: nuevoPostCreado.idDelUsuarioQueEscribioEstePost
            }
        });
    });
    
    // ========================================================================
    // RUTA NUMERO 2: LISTAR TODOS LOS POSTS DE UN USUARIO
    // ========================================================================
    // Metodo HTTP: GET
    // URL: http://localhost:3000/usuarios/1/posts
    // Que hace: Obtiene todos los posts que escribio el Usuario 1
    servidorFastify.get('/usuarios/:userId/posts', async (peticionDelCliente, respuestaAlCliente) => {
        
        // PASO 1: Obtener el ID del usuario de la URL
        const parametrosDeLaURL = peticionDelCliente.params as { userId: string };
        const idDelUsuario = parseInt(parametrosDeLaURL.userId);
        
        // PASO 2: Buscar todos los posts de este usuario en la base de datos
        const todosLosPostsDelUsuario = await clienteDePrisma.post.findMany({
            where: {
                idDelUsuarioQueEscribioEstePost: idDelUsuario
            },
            orderBy: {
                // Ordenar por fecha: mas recientes primero
                fechaDeCreacionDelPost: 'desc'
            },
            include: {
                // Incluir informacion del autor
                usuarioQueEscribioEstePost: {
                    select: {
                        id: true,
                        nombreCompleto: true
                    }
                }
            }
        });
        
        // PASO 3: Verificar si el usuario tiene posts
        if (todosLosPostsDelUsuario.length === 0) {
            return respuestaAlCliente.send({
                mensaje: 'Este usuario no tiene posts',
                total: 0,
                posts: []
            });
        }
        
        // PASO 4: Retornar la lista de posts
        respuestaAlCliente.send({
            mensaje: `Este usuario tiene ${todosLosPostsDelUsuario.length} posts`,
            total: todosLosPostsDelUsuario.length,
            posts: todosLosPostsDelUsuario
        });
    });
    
    // ========================================================================
    // RUTA NUMERO 3: ELIMINAR UN POST ESPECIFICO
    // ========================================================================
    // Metodo HTTP: DELETE
    // URL: http://localhost:3000/usuarios/1/posts/5
    // Que hace: Usuario 1 elimina su post con ID 5
    servidorFastify.delete('/usuarios/:userId/posts/:postId', {
        onRequest: [servidorFastify.authenticate]
    }, async (peticionDelCliente, respuestaAlCliente) => {
        
        // PASO 1: Obtener los IDs de la URL
        const parametrosDeLaURL = peticionDelCliente.params as { 
            userId: string, 
            postId: string 
        };
        const idDelUsuario = parseInt(parametrosDeLaURL.userId);
        const idDelPostAEliminar = parseInt(parametrosDeLaURL.postId);
        
        // PASO 2: Obtener datos del token JWT
        const datosDelTokenJWT = peticionDelCliente.user as { id: number };
        
        // PASO 3: Verificar que solo puedas eliminar TUS posts
        if (datosDelTokenJWT.id !== idDelUsuario) {
            return respuestaAlCliente.status(403).send({
                error: 'Acceso denegado',
                mensaje: 'Solo puedes eliminar tus propios posts'
            });
        }
        
        // PASO 4: Buscar el post a eliminar
        const postAEliminar = await clienteDePrisma.post.findUnique({
            where: {
                idDelPost: idDelPostAEliminar
            }
        });
        
        // PASO 5: Verificar que el post exista
        if (!postAEliminar) {
            return respuestaAlCliente.status(404).send({
                error: 'Post no encontrado'
            });
        }
        
        // PASO 6: Verificar que el post pertenezca a este usuario
        if (postAEliminar.idDelUsuarioQueEscribioEstePost !== idDelUsuario) {
            return respuestaAlCliente.status(403).send({
                error: 'Este post no te pertenece'
            });
        }
        
        // PASO 7: Eliminar el post de la base de datos
        await clienteDePrisma.post.delete({
            where: {
                idDelPost: idDelPostAEliminar
            }
        });
        
        // PASO 8: Retornar respuesta exitosa
        respuestaAlCliente.send({
            mensaje: 'Post eliminado correctamente',
            postEliminado: {
                id: postAEliminar.idDelPost,
                contenido: postAEliminar.contenidoDelPost
            }
        });
    });
}