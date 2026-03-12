// ============================================================================
// IMPORTACIONES NECESARIAS
// ============================================================================
import type { FastifyInstance } from 'fastify';
import { PrismaClient } from '@prisma/client';

// Crear cliente de Prisma para acceder a la base de datos
const clienteDePrisma = new PrismaClient();

// ============================================================================
// FUNCION PRINCIPAL: Registrar todas las rutas relacionadas con amistades
// ============================================================================
export async function amigosRoutes(servidorFastify: FastifyInstance) {
    
    // ========================================================================
    // RUTA NUMERO 1: ENVIAR SOLICITUD DE AMISTAD
    // ========================================================================
    // Metodo HTTP: POST
    // URL: http://localhost:3000/usuarios/:userId/enviar_solicitud/:amigoId
    servidorFastify.post('/usuarios/:userId/enviar_solicitud/:amigoId', {
        onRequest: [servidorFastify.authenticate]
    }, async (peticionDelCliente, respuestaAlCliente) => {
        
        // PASO 1: Obtener los IDs desde la URL
        const parametrosDeLaURL = peticionDelCliente.params as {
            userId: string,
            amigoId: string
        };
        const miIdDeUsuario = parseInt(parametrosDeLaURL.userId);
        const idDelUsuarioQueQuieroAgregar = parseInt(parametrosDeLaURL.amigoId);

        // Verificar que el usuario autenticado es el dueño del recurso
        if ((peticionDelCliente as any).user?.id !== miIdDeUsuario) {
            return respuestaAlCliente.status(403).send({ error: 'No tienes permiso para modificar este usuario' });
        }
        
        // PASO 2: Verificar que no intente agregarse a sí mismo
        if (miIdDeUsuario === idDelUsuarioQueQuieroAgregar) {
            return respuestaAlCliente.status(400).send({
                error: 'No puedes enviarte una solicitud a ti mismo'
            });
        }
        
        // PASO 3: Verificar que ambos usuarios existan
        const miUsuario = await clienteDePrisma.usuario.findUnique({
            where: { id: miIdDeUsuario }
        });
        const elOtroUsuario = await clienteDePrisma.usuario.findUnique({
            where: { id: idDelUsuarioQueQuieroAgregar }
        });
        
        if (!miUsuario || !elOtroUsuario) {
            return respuestaAlCliente.status(404).send({
                error: 'Uno de los usuarios no existe'
            });
        }
        
        // PASO 4: Verificar que no exista ya una solicitud (en cualquier dirección)
        const yaTienenSolicitudPendiente = await clienteDePrisma.amistad.findFirst({
            where: {
                OR: [
                    {
                        solicitanteId: miIdDeUsuario,
                        receptorId: idDelUsuarioQueQuieroAgregar
                    },
                    {
                        solicitanteId: idDelUsuarioQueQuieroAgregar,
                        receptorId: miIdDeUsuario
                    }
                ]
            }
        });
        
        if (yaTienenSolicitudPendiente) {
            if (yaTienenSolicitudPendiente.estado === 'aceptada') {
                return respuestaAlCliente.status(400).send({
                    error: 'Ya son amigos'
                });
            } else {
                return respuestaAlCliente.status(400).send({
                    error: 'Ya existe una solicitud pendiente'
                });
            }
        }
        
        // PASO 5: Crear la solicitud de amistad
        await clienteDePrisma.amistad.create({
            data: {
                solicitanteId: miIdDeUsuario,
                receptorId: idDelUsuarioQueQuieroAgregar
            }
        });
        
        // PASO 6: Retornar respuesta exitosa
        respuestaAlCliente.status(201).send({
            mensaje: 'Solicitud de amistad enviada correctamente',
            de: miUsuario.nombre,
            para: elOtroUsuario.nombre
        });
    });
    
    // ========================================================================
    // RUTA NUMERO 2: ACEPTAR SOLICITUD DE AMISTAD
    // ========================================================================
    // Metodo HTTP: POST
    // URL: http://localhost:3000/usuarios/:userId/aceptar_solicitud/:amigoId
    servidorFastify.post('/usuarios/:userId/aceptar_solicitud/:amigoId', {
        onRequest: [servidorFastify.authenticate]
    }, async (peticionDelCliente, respuestaAlCliente) => {
        
        // PASO 1: Obtener los IDs desde la URL
        const parametrosDeLaURL = peticionDelCliente.params as {
            userId: string,
            amigoId: string
        };
        const miIdDeUsuario = parseInt(parametrosDeLaURL.userId);
        const idDelUsuarioQueEnvioLaSolicitud = parseInt(parametrosDeLaURL.amigoId);

        // Verificar que el usuario autenticado es el dueño del recurso
        if ((peticionDelCliente as any).user?.id !== miIdDeUsuario) {
            return respuestaAlCliente.status(403).send({ error: 'No tienes permiso para modificar este usuario' });
        }
        
        // PASO 2: Buscar la solicitud pendiente
        const solicitudPendiente = await clienteDePrisma.amistad.findFirst({
            where: {
                solicitanteId: idDelUsuarioQueEnvioLaSolicitud,
                receptorId: miIdDeUsuario,
                estado: 'pendiente'
            }
        });
        
        // PASO 3: Verificar que exista la solicitud
        if (!solicitudPendiente) {
            return respuestaAlCliente.status(404).send({
                error: 'No hay ninguna solicitud pendiente de este usuario'
            });
        }
        
        // PASO 4: Actualizar el estado de la solicitud a 'aceptada'
        await clienteDePrisma.amistad.update({
            where: {
                id: solicitudPendiente.id
            },
            data: {
                estado: 'aceptada'
            }
        });
        
        // PASO 5: Obtener el nombre del nuevo amigo
        const elAmigo = await clienteDePrisma.usuario.findUnique({
            where: { id: idDelUsuarioQueEnvioLaSolicitud }
        });
        
        // PASO 6: Retornar respuesta exitosa
        respuestaAlCliente.send({
            mensaje: 'Solicitud aceptada. Ahora son amigos',
            tuAmigo: elAmigo?.nombre
        });
    });
    
    // ========================================================================
    // RUTA NUMERO 3: LISTAR MIS AMIGOS
    // ========================================================================
    // Metodo HTTP: GET
    // URL: http://localhost:3000/usuarios/:userId/mis_amigos
    servidorFastify.get('/usuarios/:userId/mis_amigos', {
        onRequest: [servidorFastify.authenticate]
    }, async (peticionDelCliente, respuestaAlCliente) => {
        
        // PASO 1: Obtener mi ID de la URL
        const parametrosDeLaURL = peticionDelCliente.params as { userId: string };
        const miIdDeUsuario = parseInt(parametrosDeLaURL.userId);

        // Verificar que el usuario autenticado es el dueño del recurso
        if ((peticionDelCliente as any).user?.id !== miIdDeUsuario) {
            return respuestaAlCliente.status(403).send({ error: 'No tienes permiso para modificar este usuario' });
        }
        
        // PASO 2: Buscar todas mis amistades ACEPTADAS
        const todasMisAmistades = await clienteDePrisma.amistad.findMany({
            where: {
                AND: [
                    { estado: 'aceptada' },
                    {
                        OR: [
                            { solicitanteId: miIdDeUsuario },
                            { receptorId: miIdDeUsuario }
                        ]
                    }
                ]
            },
            include: {
                solicitante: {
                    select: {
                        id: true,
                        nombre: true,
                        email: true
                    }
                },
                receptor: {
                    select: {
                        id: true,
                        nombre: true,
                        email: true
                    }
                }
            }
        });
        
        // PASO 3: Filtrar para obtener solo el amigo (no yo mismo)
        const listaDeMisAmigos = todasMisAmistades.map(amistad => {
            if (amistad.solicitanteId === miIdDeUsuario) {
                return amistad.receptor;
            } else {
                return amistad.solicitante;
            }
        });
        
        // PASO 4: Retornar la lista de amigos
        respuestaAlCliente.send({
            mensaje: `Tienes ${listaDeMisAmigos.length} amigos`,
            total: listaDeMisAmigos.length,
            amigos: listaDeMisAmigos
        });
    });
    
    // ========================================================================
    // RUTA NUMERO 4: ELIMINAR AMIGO
    // ========================================================================
    // Metodo HTTP: DELETE
    // URL: http://localhost:3000/usuarios/:userId/eliminar_amigo/:amigoId
    servidorFastify.delete('/usuarios/:userId/eliminar_amigo/:amigoId', {
        onRequest: [servidorFastify.authenticate]
    }, async (peticionDelCliente, respuestaAlCliente) => {
        
        // PASO 1: Obtener los IDs desde la URL
        const parametrosDeLaURL = peticionDelCliente.params as {
            userId: string,
            amigoId: string
        };
        const miIdDeUsuario = parseInt(parametrosDeLaURL.userId);
        const idDelAmigoQueQuieroEliminar = parseInt(parametrosDeLaURL.amigoId);

        // Verificar que el usuario autenticado es el dueño del recurso
        if ((peticionDelCliente as any).user?.id !== miIdDeUsuario) {
            return respuestaAlCliente.status(403).send({ error: 'No tienes permiso para modificar este usuario' });
        }
        
        // PASO 2: Buscar la amistad aceptada (en cualquier dirección)
        const amistadAEliminar = await clienteDePrisma.amistad.findFirst({
            where: {
                AND: [
                    { estado: 'aceptada' },
                    {
                        OR: [
                            {
                                solicitanteId: miIdDeUsuario,
                                receptorId: idDelAmigoQueQuieroEliminar
                            },
                            {
                                solicitanteId: idDelAmigoQueQuieroEliminar,
                                receptorId: miIdDeUsuario
                            }
                        ]
                    }
                ]
            }
        });
        
        // PASO 3: Verificar que sean amigos
        if (!amistadAEliminar) {
            return respuestaAlCliente.status(400).send({
                error: 'No son amigos'
            });
        }
        
        // PASO 4: Eliminar la amistad de la base de datos
        await clienteDePrisma.amistad.delete({
            where: {
                id: amistadAEliminar.id
            }
        });
        
        // PASO 5: Obtener el nombre del ex-amigo
        const amigoEliminado = await clienteDePrisma.usuario.findUnique({
            where: { id: idDelAmigoQueQuieroEliminar }
        });
        
        // PASO 6: Retornar confirmación
        respuestaAlCliente.send({
            mensaje: 'Amigo eliminado correctamente',
            amigoEliminado: amigoEliminado?.nombre
        });
    });

    // ========================================================================
    // RUTA NUMERO 5: VER SOLICITUDES PENDIENTES (que me han enviado)
    // ========================================================================
    servidorFastify.get('/usuarios/:userId/solicitudes_pendientes', {
        onRequest: [servidorFastify.authenticate]
    }, async (peticionDelCliente, respuestaAlCliente) => {
        
        const { userId } = peticionDelCliente.params as { userId: string };
        const miIdDeUsuario = parseInt(userId);

        // Verificar que el usuario autenticado es el dueño del recurso
        if ((peticionDelCliente as any).user?.id !== miIdDeUsuario) {
            return respuestaAlCliente.status(403).send({ error: 'No tienes permiso para modificar este usuario' });
        }
        
        // Buscar solicitudes que ME han enviado y están pendientes
        const solicitudesPendientes = await clienteDePrisma.amistad.findMany({
            where: {
                receptorId: miIdDeUsuario,
                estado: 'pendiente'
            },
            include: {
                solicitante: {
                    select: {
                        id: true,
                        nombre: true,
                        email: true,
                        avatar: true,
                        estadoOnline: true
                    }
                }
            }
        });
        
        respuestaAlCliente.send({
            total: solicitudesPendientes.length,
            solicitudes: solicitudesPendientes
        });
    });
    
    // ========================================================================
    // RUTA NUMERO 6: RECHAZAR SOLICITUD DE AMISTAD
    // ========================================================================
    servidorFastify.delete('/usuarios/:userId/rechazar_solicitud/:amigoId', {
        onRequest: [servidorFastify.authenticate]
    }, async (peticionDelCliente, respuestaAlCliente) => {
        
        const { userId, amigoId } = peticionDelCliente.params as {
            userId: string,
            amigoId: string
        };
        const miIdDeUsuario = parseInt(userId);
        const idDelSolicitante = parseInt(amigoId);

        // Verificar que el usuario autenticado es el dueño del recurso
        if ((peticionDelCliente as any).user?.id !== miIdDeUsuario) {
            return respuestaAlCliente.status(403).send({ error: 'No tienes permiso para modificar este usuario' });
        }
        
        // Buscar la solicitud pendiente
        const solicitud = await clienteDePrisma.amistad.findFirst({
            where: {
                solicitanteId: idDelSolicitante,
                receptorId: miIdDeUsuario,
                estado: 'pendiente'
            }
        });
        
        if (!solicitud) {
            return respuestaAlCliente.status(404).send({
                error: 'No hay solicitud pendiente'
            });
        }
        
        // Eliminar la solicitud
        await clienteDePrisma.amistad.delete({
            where: { id: solicitud.id }
        });
        
        respuestaAlCliente.send({
            mensaje: 'Solicitud rechazada'
        });
    });
    
    // ========================================================================
    // RUTA NUMERO 7: BUSCAR USUARIOS (para añadir amigos)
    // ========================================================================
    servidorFastify.get('/usuarios/buscar', async (peticionDelCliente, respuestaAlCliente) => {
        
        const { query } = peticionDelCliente.query as { query: string };
        
        if (!query || query.length < 2) {
            return respuestaAlCliente.status(400).send({
                error: 'La búsqueda debe tener al menos 2 caracteres'
            });
        }
        
        // Buscar usuarios por nombre o email
        const usuariosEncontrados = await clienteDePrisma.usuario.findMany({
            where: {
                OR: [
                    { nombre: { contains: query, mode: 'insensitive' } },
                    { email: { contains: query, mode: 'insensitive' } }
                ]
            },
            select: {
                id: true,
                nombre: true,
                email: true,
                avatar: true,
                estadoOnline: true
            },
            take: 10 // Limitar a 10 resultados
        });
        
        respuestaAlCliente.send({
            total: usuariosEncontrados.length,
            usuarios: usuariosEncontrados
        });
    });
}