// ============================================================================
// IMPORTACIONES NECESARIAS
// ============================================================================
import type { FastifyInstance } from 'fastify';
import { PrismaClient } from '@prisma/client';

// Crear cliente de Prisma para acceder a la base de datos
const clienteDePrisma = new PrismaClient();

// ============================================================================
// FUNCION PRINCIPAL: Registrar todas las rutas relacionadas con amigos
// ============================================================================
export async function amigosRoutes(servidorFastify: FastifyInstance) {
    
    // ========================================================================
    // RUTA NUMERO 1: ENVIAR SOLICITUD DE AMISTAD
    // ========================================================================
    // Metodo HTTP: POST
    // URL: http://localhost:3000/usuarios/1/enviar_solicitud/5
    servidorFastify.post('/usuarios/:userId/enviar_solicitud/:amigoId', {
        onRequest: [servidorFastify.authenticate] // verifica token antes de ejecutarse
    }, async (peticionDelCliente, respuestaAlCliente) => {
        
        // PASO 1: Obtener los IDs de la URL
        const parametrosDeLaURL = peticionDelCliente.params as { 
            userId: string, 
            amigoId: string 
        };
        const miIdDeUsuario = parseInt(parametrosDeLaURL.userId);
        const idDelUsuarioQueQuieroAgregar = parseInt(parametrosDeLaURL.amigoId);
        
        // PASO 2: Verificar que no me envie solicitud a mi mismo
        if (miIdDeUsuario === idDelUsuarioQueQuieroAgregar) {
            return respuestaAlCliente.status(400).send({
                error: 'No puedes enviarte solicitud a ti mismo'
            });
        }
        
        // PASO 3: Verificar que ambos usuarios existan en la base de datos
        const miUsuario = await clienteDePrisma.usuario.findUnique({
            where: { id: miIdDeUsuario }
        });
        
        const elOtroUsuario = await clienteDePrisma.usuario.findUnique({
            where: { id: idDelUsuarioQueQuieroAgregar }
        });
        
        if (!miUsuario) {
            return respuestaAlCliente.status(404).send({
                error: 'Tu usuario no existe'
            });
        }
        
        if (!elOtroUsuario) {
            return respuestaAlCliente.status(404).send({
                error: 'El usuario que quieres agregar no existe'
            });
        }
        
        // PASO 4: Verificar si ya existe una solicitud entre estos usuarios
        const yaTienenSolicitudPendiente = await clienteDePrisma.amistad.findFirst({
            where: {
                OR: [
                    // Caso 1: Yo le envie solicitud a el
                    {
                        idDelUsuarioQueSolicita: miIdDeUsuario,
                        idDelUsuarioQueRecibe: idDelUsuarioQueQuieroAgregar
                    },
                    // Caso 2: El me envio solicitud a mi
                    {
                        idDelUsuarioQueSolicita: idDelUsuarioQueQuieroAgregar,
                        idDelUsuarioQueRecibe: miIdDeUsuario
                    }
                ]
            }
        });
        
        // Verificar el estado de la solicitud
        if (yaTienenSolicitudPendiente) {
            if (yaTienenSolicitudPendiente.estadoDeLaSolicitud === 'aceptada') {
                return respuestaAlCliente.status(400).send({
                    error: 'Ya son amigos'
                });
            } else {
                return respuestaAlCliente.status(400).send({
                    error: 'Ya hay una solicitud pendiente entre ustedes'
                });
            }
        }
        
        // PASO 5: Crear la nueva solicitud de amistad en la base de datos
        const nuevaSolicitudDeAmistad = await clienteDePrisma.amistad.create({
            data: {                                         // amistad -> tabla de mi BD
                idDelUsuarioQueSolicita: miIdDeUsuario,
                idDelUsuarioQueRecibe: idDelUsuarioQueQuieroAgregar,
                estadoDeLaSolicitud: 'pendiente'
            }
        });
        
        // PASO 6: Retornar respuesta exitosa
        respuestaAlCliente.send({
            mensaje: 'Solicitud de amistad enviada',
            de: miUsuario.nombreCompleto,
            para: elOtroUsuario.nombreCompleto
        });
    });
    
    // ========================================================================
    // RUTA NUMERO 2: ACEPTAR SOLICITUD DE AMISTAD
    // ========================================================================
    servidorFastify.post('/usuarios/:userId/aceptar_solicitud/:amigoId', {
        onRequest: [servidorFastify.authenticate] // Verifica token antes de ejecutarse
    }, async (peticionDelCliente, respuestaAlCliente) => {
        
        // PASO 1: Obtener los IDs de la URL
        const parametrosDeLaURL = peticionDelCliente.params as { 
            userId: string, 
            amigoId: string 
        };
        const miIdDeUsuario = parseInt(parametrosDeLaURL.userId);
        const idDelUsuarioQueEnvioLaSolicitud = parseInt(parametrosDeLaURL.amigoId);
        
        // PASO 2: Buscar la solicitud de amistad pendiente
        const solicitudPendiente = await clienteDePrisma.amistad.findFirst({
            where: {
                idDelUsuarioQueSolicita: idDelUsuarioQueEnvioLaSolicitud,
                idDelUsuarioQueRecibe: miIdDeUsuario,
                estadoDeLaSolicitud: 'pendiente' // tiene que estar en 'pendiente' 
            }
        });
        
        // PASO 3: Verificar que exista la solicitud
        if (!solicitudPendiente) {
            return respuestaAlCliente.status(400).send({
                error: 'No tienes ninguna solicitud pendiente de este usuario'
            });
        }
        
        // PASO 4: Actualizar el estado de la solicitud a "aceptada"
        await clienteDePrisma.amistad.update({
            where: { // Donde el ID sea igual al ID...
                idDeLaSolicitudDeAmistad: solicitudPendiente.idDeLaSolicitudDeAmistad
            },
            data: { // cambia el estado a : 'aceptada'
                estadoDeLaSolicitud: 'aceptada'
            }
        });
        
        // PASO 5: Obtener el nombre del amigo para mostrarlo en la respuesta
        const elAmigo = await clienteDePrisma.usuario.findUnique({
            where: { id: idDelUsuarioQueEnvioLaSolicitud }
        });
        
        // PASO 6: Retornar respuesta exitosa
        respuestaAlCliente.send({
            mensaje: 'Solicitud aceptada, ahora son amigos',
            tuAmigo: elAmigo?.nombreCompleto
        });
    });
    
    // ========================================================================
    // RUTA NUMERO 3: VER MIS AMIGOS
    // ========================================================================
    servidorFastify.get('/usuarios/:userId/mis_amigos', {
        onRequest: [servidorFastify.authenticate] // Verifica antes de ejecutarse
    }, async (peticionDelCliente, respuestaAlCliente) => {
        
        // PASO 1: Obtener mi ID de la URL
        const parametrosDeLaURL = peticionDelCliente.params as { userId: string };
        const miIdDeUsuario = parseInt(parametrosDeLaURL.userId);
        
        // PASO 2: Buscar todas las amistades aceptadas donde yo participo
        const todasMisAmistades = await clienteDePrisma.amistad.findMany({
            where: {
                AND: [
                    {
                        estadoDeLaSolicitud: 'aceptada'
                    },
                    {
                        OR: [
                            { idDelUsuarioQueSolicita: miIdDeUsuario },
                            { idDelUsuarioQueRecibe: miIdDeUsuario }
                        ]
                    }
                ]
            },
            include: { // COMBINA DATOS DE UNA TABLA (IDs) CON DATOS DE OTRA (nombre, etc)
                usuarioQueSolicita: {
                    select: {
                        id: true,
                        nombreCompleto: true,
                        email: true
                    }
                },
                usuarioQueRecibe: {
                    select: {
                        id: true,
                        nombreCompleto: true,
                        email: true
                    }
                }
            }
        });
        
        // PASO 3: Crear la lista de amigos (excluyendome a mi)
            // 'map' -> por cada elemento (objeto) del array ejecuta esto:
            // y cuando llega al final, devuelve un nuevo array con los valores resultantes
        const listaDeMisAmigos = todasMisAmistades.map(amistad => {
            // Si yo soy el que solicitó, entonces mi amigo es el que recibió
            if (amistad.idDelUsuarioQueSolicita === miIdDeUsuario) { // si soy yo me excluye d la lista
                return amistad.usuarioQueRecibe; // devuelve el usuario q recibe + salta a la sig línea
            }
            // Si yo soy el que recibió, entonces mi amigo es el que solicitó
            else {
                return amistad.usuarioQueSolicita;
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
    servidorFastify.delete('/usuarios/:userId/eliminar_amigo/:amigoId', {
        onRequest: [servidorFastify.authenticate] // verifica antes de ejecutarse
    }, async (peticionDelCliente, respuestaAlCliente) => {
        
        // PASO 1: Obtener los IDs de la URL
        const parametrosDeLaURL = peticionDelCliente.params as { 
            userId: string, 
            amigoId: string 
        };
        const miIdDeUsuario = parseInt(parametrosDeLaURL.userId);
        const idDelAmigoQueQuieroEliminar = parseInt(parametrosDeLaURL.amigoId);
        
        // PASO 2: Buscar la amistad aceptada entre estos usuarios
        const amistadAEliminar = await clienteDePrisma.amistad.findFirst({
            where: {
                AND: [
                    { estadoDeLaSolicitud: 'aceptada' },
                    {
                        OR: [
                            {
                                idDelUsuarioQueSolicita: miIdDeUsuario,
                                idDelUsuarioQueRecibe: idDelAmigoQueQuieroEliminar
                            },
                            {
                                idDelUsuarioQueSolicita: idDelAmigoQueQuieroEliminar,
                                idDelUsuarioQueRecibe: miIdDeUsuario
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
        await clienteDePrisma.amistad.delete({ // borra esa linea de la bd)
            where: {
                idDeLaSolicitudDeAmistad: amistadAEliminar.idDeLaSolicitudDeAmistad
            }
        });
        
        // PASO 5: Obtener el nombre del amigo eliminado
        const amigoEliminado = await clienteDePrisma.usuario.findUnique({
            where: { id: idDelAmigoQueQuieroEliminar }
        });
        
        // PASO 6: Retornar respuesta exitosa
        respuestaAlCliente.send({
            mensaje: 'Amigo eliminado correctamente',
            amigoEliminado: amigoEliminado?.nombreCompleto
        });
    });
}