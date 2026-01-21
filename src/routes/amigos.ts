import type { FastifyInstance } from 'fastify';
import { leerUsuarios, guardarUsuarios } from '../utils/archivos';

const TOKEN = 'mi_token';

export async function amigosRoutes(fastify: FastifyInstance) {
    
    // ==================== ENVIAR SOLICITUD DE AMISTAD ====================
    fastify.post('/usuarios/:userId/enviar_solicitud/:amigo_id', async (request, response) => {
        const token = request.headers['authorization'];
        if(!token || token !== TOKEN)
            return response.status(401).send('Unauthorized');

        const {userId, amigo_id} = request.params as {userId: string, amigo_id: string};
        const array_Usuarios = await leerUsuarios();

        const usuario = array_Usuarios.find(u => u.id_user === parseInt(userId));
        const amigo = array_Usuarios.find(u => u.id_user === parseInt(amigo_id));

        if(!usuario || !amigo)
            return response.status(404).send('Usuario no encontrado');

        if(usuario.solicitudes_enviadas.includes(parseInt(amigo_id)))
            return response.status(400).send('Solicitud ya enviada');

        if(usuario.amigos.includes(parseInt(amigo_id)))
            return response.status(400).send('Ya son amigos');

        usuario.solicitudes_enviadas.push(parseInt(amigo_id));
        amigo.solicitudes_recibidas.push(parseInt(userId));

        await guardarUsuarios(array_Usuarios);
        response.send({mensaje: 'Solicitud enviada'});
    });

    // ==================== ACEPTAR SOLICITUD DE AMISTAD ====================
    fastify.post('/usuarios/:userId/aceptar_solicitud/:amigo_id', async (request, response) => {
        const token = request.headers['authorization'];
        if(!token || token !== TOKEN)
            return response.status(401).send('Unauthorized');

        const {userId, amigo_id} = request.params as {userId: string, amigo_id: string};
        const array_Usuarios = await leerUsuarios();

        const usuario = array_Usuarios.find(u => u.id_user === parseInt(userId));
        const amigo = array_Usuarios.find(u => u.id_user === parseInt(amigo_id));

        if(!usuario || !amigo)
            return response.status(404).send('Usuario no encontrado');

        const pos_solicitud = usuario.solicitudes_recibidas.indexOf(parseInt(amigo_id));
        if(pos_solicitud === -1)
            return response.status(400).send('No hay solicitud pendiente');

        // Eliminar de solicitudes
        usuario.solicitudes_recibidas.splice(pos_solicitud, 1);
        const pos_enviada = amigo.solicitudes_enviadas.indexOf(parseInt(userId));
        if(pos_enviada !== -1)
            amigo.solicitudes_enviadas.splice(pos_enviada, 1);

        // Añadir como amigos
        usuario.amigos.push(parseInt(amigo_id));
        amigo.amigos.push(parseInt(userId));

        await guardarUsuarios(array_Usuarios);
        response.send({mensaje: 'Solicitud aceptada, ahora son amigos'});
    });

    // ==================== VER MIS AMIGOS ====================
    fastify.get('/usuarios/:userId/mis_amigos', async (request, response) => {
        const token = request.headers['authorization'];
        if(!token || token !== TOKEN)
            return response.status(401).send('Unauthorized');

        const {userId} = request.params as {userId: string};
        const array_Usuarios = await leerUsuarios();

        const usuario = array_Usuarios.find(u => u.id_user === parseInt(userId));
        if(!usuario)
            return response.status(404).send('Usuario no encontrado');

        const mis_amigos = array_Usuarios.filter(u => 
            usuario.amigos.includes(u.id_user)
        );

        response.send({
            totalAmigos: mis_amigos.length,
            amigos: mis_amigos.map(a => ({
                id: a.id_user,
                nombre: a.nombre,
                email: a.email
            }))
        });
    });

    // ==================== ELIMINAR AMIGO ====================
    fastify.delete('/usuarios/:userId/eliminar_amigo/:amigo_id', async (request, response) => {
        const token = request.headers['authorization'];
        if(!token || token !== TOKEN)
            return response.status(401).send('Unauthorized');

        const {userId, amigo_id} = request.params as {userId: string, amigo_id: string};
        const array_Usuarios = await leerUsuarios();

        const usuario = array_Usuarios.find(u => u.id_user === parseInt(userId));
        const amigo = array_Usuarios.find(u => u.id_user === parseInt(amigo_id));

        if(!usuario || !amigo)
            return response.status(404).send('Usuario no encontrado');

        const pos_amigo = usuario.amigos.indexOf(parseInt(amigo_id));
        if(pos_amigo === -1)
            return response.status(400).send('No son amigos');

        usuario.amigos.splice(pos_amigo, 1);
        const pos_amigo2 = amigo.amigos.indexOf(parseInt(userId));
        if(pos_amigo2 !== -1)
            amigo.amigos.splice(pos_amigo2, 1);

        await guardarUsuarios(array_Usuarios);
        response.send({mensaje: 'Amigo eliminado'});
    });
}