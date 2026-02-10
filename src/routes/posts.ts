// ============================================================================
// IMPORTACIONES NECESARIAS
// ============================================================================
import type { FastifyInstance } from 'fastify';
import { PrismaClient } from '@prisma/client';

// Crear cliente de Prisma para acceder a la base de datos
const clienteDePrisma = new PrismaClient();

// ============================================================================
// FUNCION PRINCIPAL: Registrar todas las rutas relacionadas con posts
// ============================================================================
export async function postsRoutes(servidorFastify: FastifyInstance) {
    
    // ========================================================================
    // RUTA NUMERO 1: CREAR UN NUEVO POST
    // ========================================================================
    // Metodo HTTP: POST
    // URL: http://localhost:3000/usuarios/:userId/posts
    servidorFastify.post('/usuarios/:userId/posts', {
        onRequest: [servidorFastify.authenticate]
    }, async (peticionDelCliente, respuestaAlCliente) => {
        
        // PASO 1: Obtener el ID del usuario desde la URL
        const parametrosDeLaURL = peticionDelCliente.params as { userId: string };
        const idDelUsuario = parseInt(parametrosDeLaURL.userId);
        
        // PASO 2: Obtener el contenido del post del body
        const datosDelBody = peticionDelCliente.body as {
            contenido: string
        };
        const textoDelPost = datosDelBody.contenido;
        
        // PASO 3: Validar que venga el contenido
        if (!textoDelPost) {
            return respuestaAlCliente.status(400).send({
                error: 'El contenido del post es obligatorio'
            });
        }
        
        // PASO 4: Crear el post en la base de datos
        const nuevoPostCreado = await clienteDePrisma.post.create({
            data: {
                contenido: textoDelPost,
                usuarioId: idDelUsuario
            }
        });
        
        // PASO 5: Retornar el post creado
        respuestaAlCliente.status(201).send({
            mensaje: 'Post creado exitosamente',
            post: {
                id: nuevoPostCreado.id,
                contenido: nuevoPostCreado.contenido,
                fecha: nuevoPostCreado.createdAt,
                autorId: nuevoPostCreado.usuarioId
            }
        });
    });
    
    // ========================================================================
    // RUTA NUMERO 2: OBTENER TODOS LOS POSTS DE UN USUARIO
    // ========================================================================
    // Metodo HTTP: GET
    // URL: http://localhost:3000/usuarios/:userId/posts
    servidorFastify.get('/usuarios/:userId/posts', async (peticionDelCliente, respuestaAlCliente) => {
        
        // PASO 1: Obtener el ID del usuario desde la URL
        const parametrosDeLaURL = peticionDelCliente.params as { userId: string };
        const idDelUsuario = parseInt(parametrosDeLaURL.userId);
        
        // PASO 2: Buscar todos los posts de ese usuario
        const todosLosPostsDelUsuario = await clienteDePrisma.post.findMany({
            where: {
                usuarioId: idDelUsuario
            },
            orderBy: {
                createdAt: 'desc'
            },
            include: {
                usuario: {
                    select: {
                        id: true,
                        nombre: true,
                        email: true
                    }
                }
            }
        });
        
        // PASO 3: Retornar la lista de posts
        respuestaAlCliente.send({
            total: todosLosPostsDelUsuario.length,
            posts: todosLosPostsDelUsuario
        });
    });
    
    // ========================================================================
    // RUTA NUMERO 3: OBTENER TODOS LOS POSTS (DE TODOS LOS USUARIOS)
    // ========================================================================
    // Metodo HTTP: GET
    // URL: http://localhost:3000/posts
    servidorFastify.get('/posts', async (peticionDelCliente, respuestaAlCliente) => {
        
        // Buscar todos los posts de todos los usuarios
        const todosLosPosts = await clienteDePrisma.post.findMany({
            orderBy: {
                createdAt: 'desc'
            },
            include: {
                usuario: {
                    select: {
                        id: true,
                        nombre: true,
                        email: true
                    }
                }
            }
        });
        
        // Retornar la lista completa de posts
        respuestaAlCliente.send({
            total: todosLosPosts.length,
            posts: todosLosPosts
        });
    });
    
    // ========================================================================
    // RUTA NUMERO 4: ELIMINAR UN POST
    // ========================================================================
    // Metodo HTTP: DELETE
    // URL: http://localhost:3000/usuarios/:userId/posts/:postId
    servidorFastify.delete('/usuarios/:userId/posts/:postId', {
        onRequest: [servidorFastify.authenticate]
    }, async (peticionDelCliente, respuestaAlCliente) => {
        
        // PASO 1: Obtener los IDs desde la URL
        const parametrosDeLaURL = peticionDelCliente.params as {
            userId: string,
            postId: string
        };
        const idDelUsuario = parseInt(parametrosDeLaURL.userId);
        const idDelPostAEliminar = parseInt(parametrosDeLaURL.postId);
        
        // PASO 2: Buscar el post a eliminar
        const postAEliminar = await clienteDePrisma.post.findUnique({
            where: {
                id: idDelPostAEliminar
            }
        });
        
        // PASO 3: Verificar que el post exista
        if (!postAEliminar) {
            return respuestaAlCliente.status(404).send({
                error: 'Post no encontrado'
            });
        }
        
        // PASO 4: Verificar que el post pertenezca al usuario
        if (postAEliminar.usuarioId !== idDelUsuario) {
            return respuestaAlCliente.status(403).send({
                error: 'No puedes eliminar un post que no es tuyo'
            });
        }
        
        // PASO 5: Eliminar el post de la base de datos
        await clienteDePrisma.post.delete({
            where: {
                id: idDelPostAEliminar
            }
        });
        
        // PASO 6: Retornar confirmación
        respuestaAlCliente.send({
            mensaje: 'Post eliminado correctamente',
            post: {
                id: postAEliminar.id,
                contenido: postAEliminar.contenido
            }
        });
    });
}