// ============================================================================
// IMPORTACIONES
// ============================================================================
import type { FastifyInstance } from 'fastify';
import { leerUsuarios, guardarUsuarios } from '../utils/archivos';

// ============================================================================
// FUNCIÓN PRINCIPAL: Registrar todas las rutas de amigos
// ============================================================================
export async function amigosRoutes(fastify: FastifyInstance) {
    
    // ========================================================================
    // RUTA 1: ENVIAR SOLICITUD DE AMISTAD
    // ========================================================================
    // URL: POST /usuarios/:userId/enviar_solicitud/:amigoId
    // Ejemplo: POST /usuarios/1/enviar_solicitud/5
    fastify.post('/usuarios/:userId/enviar_solicitud/:amigoId', {
        onRequest: [fastify.authenticate]  // ← Necesita token
    }, async (request, response) => {
        
        // PASO 1: Obtener los IDs de la URL
        const params = request.params as { userId: string, amigoId: string };
        const miId = parseInt(params.userId);        // Mi ID
        const idAmigo = parseInt(params.amigoId);    // ID del amigo
        
        // PASO 2: Verificar que no me envíe solicitud a mí mismo
        if (miId === idAmigo) {
            return response.status(400).send({
                error: 'No puedes enviarte solicitud a ti mismo'
            });
        }
        
        // PASO 3: Leer todos los usuarios del archivo JSON
        const usuarios = leerUsuarios();
        
        // PASO 4: Buscar mi usuario en la lista
        const miUsuario = usuarios.find(u => u.id_user === miId);
        if (!miUsuario) {
            return response.status(404).send({
                error: 'Tu usuario no existe'
            });
        }
        
        // PASO 5: Buscar al usuario que quiero agregar
        const usuarioAmigo = usuarios.find(u => u.id_user === idAmigo);
        if (!usuarioAmigo) {
            return response.status(404).send({
                error: 'El usuario que quieres agregar no existe'
            });
        }
        
        // PASO 6: Inicializar arrays de amigos si no existen
        if (!miUsuario.amigos) {
            miUsuario.amigos = [];
        }
        if (!miUsuario.solicitudes_enviadas) {
            miUsuario.solicitudes_enviadas = [];
        }
        if (!usuarioAmigo.solicitudes_recibidas) {
            usuarioAmigo.solicitudes_recibidas = [];
        }
        
        // PASO 7: Verificar si ya son amigos
        const yaSonAmigos = miUsuario.amigos.includes(idAmigo);
        if (yaSonAmigos) {
            return response.status(400).send({
                error: 'Ya son amigos'
            });
        }
        
        // PASO 8: Verificar si ya envié una solicitud antes
        const yaEnvie = miUsuario.solicitudes_enviadas.includes(idAmigo);
        if (yaEnvie) {
            return response.status(400).send({
                error: 'Ya enviaste una solicitud a este usuario'
            });
        }
        
        // PASO 9: Verificar si él ya me envió una solicitud
        const elMeEnvio = usuarioAmigo.solicitudes_enviadas?.includes(miId);
        if (elMeEnvio) {
            return response.status(400).send({
                error: 'Este usuario ya te envió una solicitud',
                mensaje: 'Mejor acepta su solicitud'
            });
        }
        
        // PASO 10: Enviar la solicitud
        // Añadir a MIS solicitudes enviadas
        miUsuario.solicitudes_enviadas.push(idAmigo);
        
        // Añadir a SUS solicitudes recibidas
        usuarioAmigo.solicitudes_recibidas.push(miId);
        
        // PASO 11: Guardar los cambios en el archivo JSON
        guardarUsuarios(usuarios);
        
        // PASO 12: Retornar respuesta exitosa
        response.send({
            mensaje: 'Solicitud de amistad enviada',
            de: miUsuario.nombre,
            para: usuarioAmigo.nombre
        });
    });
    
    // ========================================================================
    // RUTA 2: ACEPTAR SOLICITUD DE AMISTAD
    // ========================================================================
    // URL: POST /usuarios/:userId/aceptar_solicitud/:amigoId
    // Ejemplo: POST /usuarios/5/aceptar_solicitud/1
    fastify.post('/usuarios/:userId/aceptar_solicitud/:amigoId', {
        onRequest: [fastify.authenticate]  // ← Necesita token
    }, async (request, response) => {
        
        // PASO 1: Obtener los IDs de la URL
        const params = request.params as { userId: string, amigoId: string };
        const miId = parseInt(params.userId);
        const idAmigo = parseInt(params.amigoId);
        
        // PASO 2: Leer todos los usuarios
        const usuarios = leerUsuarios();
        
        // PASO 3: Buscar mi usuario
        const miUsuario = usuarios.find(u => u.id_user === miId);
        if (!miUsuario) {
            return response.status(404).send({
                error: 'Tu usuario no existe'
            });
        }
        
        // PASO 4: Buscar al usuario que me envió la solicitud
        const usuarioAmigo = usuarios.find(u => u.id_user === idAmigo);
        if (!usuarioAmigo) {
            return response.status(404).send({
                error: 'El usuario no existe'
            });
        }
        
        // PASO 5: Inicializar arrays si no existen
        if (!miUsuario.solicitudes_recibidas) {
            miUsuario.solicitudes_recibidas = [];
        }
        if (!miUsuario.amigos) {
            miUsuario.amigos = [];
        }
        if (!usuarioAmigo.amigos) {
            usuarioAmigo.amigos = [];
        }
        if (!usuarioAmigo.solicitudes_enviadas) {
            usuarioAmigo.solicitudes_enviadas = [];
        }
        
        // PASO 6: Verificar que tengo una solicitud de este usuario
        const tengoSolicitud = miUsuario.solicitudes_recibidas.includes(idAmigo);
        if (!tengoSolicitud) {
            return response.status(400).send({
                error: 'No tienes ninguna solicitud de este usuario'
            });
        }
        
        // PASO 7: Aceptar la solicitud
        // Quitar de MIS solicitudes recibidas
        miUsuario.solicitudes_recibidas = miUsuario.solicitudes_recibidas.filter(
            id => id !== idAmigo
        );
        
        // Quitar de SUS solicitudes enviadas
        usuarioAmigo.solicitudes_enviadas = usuarioAmigo.solicitudes_enviadas.filter(
            id => id !== miId
        );
        
        // Añadir a MIS amigos
        miUsuario.amigos.push(idAmigo);
        
        // Añadir a SUS amigos
        usuarioAmigo.amigos.push(miId);
        
        // PASO 8: Guardar los cambios
        guardarUsuarios(usuarios);
        
        // PASO 9: Retornar respuesta exitosa
        response.send({
            mensaje: 'Solicitud aceptada, ahora son amigos',
            tuAmigo: usuarioAmigo.nombre
        });
    });
    
    // ========================================================================
    // RUTA 3: VER MIS AMIGOS
    // ========================================================================
    // URL: GET /usuarios/:userId/mis_amigos
    // Ejemplo: GET /usuarios/1/mis_amigos
    fastify.get('/usuarios/:userId/mis_amigos', {
        onRequest: [fastify.authenticate]  // ← Necesita token
    }, async (request, response) => {
        
        // PASO 1: Obtener el ID de la URL
        const params = request.params as { userId: string };
        const miId = parseInt(params.userId);
        
        // PASO 2: Leer todos los usuarios
        const usuarios = leerUsuarios();
        
        // PASO 3: Buscar mi usuario
        const miUsuario = usuarios.find(u => u.id_user === miId);
        if (!miUsuario) {
            return response.status(404).send({
                error: 'Usuario no encontrado'
            });
        }
        
        // PASO 4: Verificar si tengo amigos
        if (!miUsuario.amigos || miUsuario.amigos.length === 0) {
            return response.send({
                mensaje: 'Aún no tienes amigos',
                total: 0,
                amigos: []
            });
        }
        
        // PASO 5: Buscar la información de cada amigo
        const listaAmigos = miUsuario.amigos.map(idAmigo => {
            // Buscar el amigo en la lista de usuarios
            const amigo = usuarios.find(u => u.id_user === idAmigo);
            
            // Si el amigo existe, retornar sus datos
            if (amigo) {
                return {
                    id: amigo.id_user,
                    nombre: amigo.nombre,
                    email: amigo.email
                };
            }
            
            // Si el amigo no existe (usuario eliminado), retornar null
            return null;
        });
        
        // PASO 6: Filtrar los amigos que no existen (null)
        const amigosFiltrados = listaAmigos.filter(amigo => amigo !== null);
        
        // PASO 7: Retornar la lista de amigos
        response.send({
            mensaje: `Tienes ${amigosFiltrados.length} amigos`,
            total: amigosFiltrados.length,
            amigos: amigosFiltrados
        });
    });
    
    // ========================================================================
    // RUTA 4: VER SOLICITUDES PENDIENTES
    // ========================================================================
    // URL: GET /usuarios/:userId/solicitudes_pendientes
    // Ejemplo: GET /usuarios/1/solicitudes_pendientes
    fastify.get('/usuarios/:userId/solicitudes_pendientes', {
        onRequest: [fastify.authenticate]  // ← Necesita token
    }, async (request, response) => {
        
        // PASO 1: Obtener el ID de la URL
        const params = request.params as { userId: string };
        const miId = parseInt(params.userId);
        
        // PASO 2: Leer todos los usuarios
        const usuarios = leerUsuarios();
        
        // PASO 3: Buscar mi usuario
        const miUsuario = usuarios.find(u => u.id_user === miId);
        if (!miUsuario) {
            return response.status(404).send({
                error: 'Usuario no encontrado'
            });
        }
        
        // PASO 4: Verificar si tengo solicitudes
        if (!miUsuario.solicitudes_recibidas || miUsuario.solicitudes_recibidas.length === 0) {
            return response.send({
                mensaje: 'No tienes solicitudes pendientes',
                total: 0,
                solicitudes: []
            });
        }
        
        // PASO 5: Buscar información de cada usuario que me envió solicitud
        const listaSolicitudes = miUsuario.solicitudes_recibidas.map(idRemitente => {
            const remitente = usuarios.find(u => u.id_user === idRemitente);
            
            if (remitente) {
                return {
                    id: remitente.id_user,
                    nombre: remitente.nombre,
                    email: remitente.email
                };
            }
            
            return null;
        });
        
        // PASO 6: Filtrar solicitudes de usuarios eliminados
        const solicitudesFiltradas = listaSolicitudes.filter(s => s !== null);
        
        // PASO 7: Retornar la lista de solicitudes
        response.send({
            mensaje: `Tienes ${solicitudesFiltradas.length} solicitudes pendientes`,
            total: solicitudesFiltradas.length,
            solicitudes: solicitudesFiltradas
        });
    });
    
    // ========================================================================
    // RUTA 5: ELIMINAR AMIGO
    // ========================================================================
    // URL: DELETE /usuarios/:userId/eliminar_amigo/:amigoId
    // Ejemplo: DELETE /usuarios/1/eliminar_amigo/5
    fastify.delete('/usuarios/:userId/eliminar_amigo/:amigoId', {
        onRequest: [fastify.authenticate]  // ← Necesita token
    }, async (request, response) => {
        
        // PASO 1: Obtener los IDs de la URL
        const params = request.params as { userId: string, amigoId: string };
        const miId = parseInt(params.userId);
        const idAmigo = parseInt(params.amigoId);
        
        // PASO 2: Leer todos los usuarios
        const usuarios = leerUsuarios();
        
        // PASO 3: Buscar mi usuario
        const miUsuario = usuarios.find(u => u.id_user === miId);
        if (!miUsuario) {
            return response.status(404).send({
                error: 'Tu usuario no existe'
            });
        }
        
        // PASO 4: Buscar al amigo que quiero eliminar
        const usuarioAmigo = usuarios.find(u => u.id_user === idAmigo);
        if (!usuarioAmigo) {
            return response.status(404).send({
                error: 'El usuario no existe'
            });
        }
        
        // PASO 5: Verificar que sean amigos
        if (!miUsuario.amigos || !miUsuario.amigos.includes(idAmigo)) {
            return response.status(400).send({
                error: 'No son amigos'
            });
        }
        
        // PASO 6: Eliminar la amistad (bidireccional)
        // Quitar de MI lista de amigos
        miUsuario.amigos = miUsuario.amigos.filter(id => id !== idAmigo);
        
        // Quitar de SU lista de amigos
        if (usuarioAmigo.amigos) {
            usuarioAmigo.amigos = usuarioAmigo.amigos.filter(id => id !== miId);
        }
        
        // PASO 7: Guardar los cambios
        guardarUsuarios(usuarios);
        
        // PASO 8: Retornar respuesta exitosa
        response.send({
            mensaje: 'Amigo eliminado correctamente',
            amigoEliminado: usuarioAmigo.nombre
        });
    });
}