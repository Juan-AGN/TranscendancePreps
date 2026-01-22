import type { FastifyInstance } from 'fastify';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const TOKEN = 'mi_token';

export async function amigosRoutes(fastify: FastifyInstance) {
    
    // ENVIAR SOLICITUD
    fastify.post('/usuarios/:id/solicitud_amistad/:id_amigo', async (request, response) => {
        const token = request.headers['authorization'];
        if (!token || token !== TOKEN)
            return response.status(401).send('Unauthorized');

        const { id, id_amigo } = request.params as { id: string; id_amigo: string };
        
        const usuario = await prisma.usuario.findUnique({ where: { id: parseInt(id) } });
        const amigo = await prisma.usuario.findUnique({ where: { id: parseInt(id_amigo) } });

        if (!usuario || !amigo)
            return response.status(404).send('Usuario no encontrado');

        // Actualizar arrays JSON
        const solicitudesEnviadas = JSON.parse(usuario.solicitudes_enviadas);
        const solicitudesRecibidas = JSON.parse(amigo.solicitudes_recibidas);

        if (solicitudesEnviadas.includes(parseInt(id_amigo)))
            return response.status(400).send('Ya enviaste solicitud');

        solicitudesEnviadas.push(parseInt(id_amigo));
        solicitudesRecibidas.push(parseInt(id));

        await prisma.usuario.update({
            where: { id: parseInt(id) },
            data: { solicitudes_enviadas: JSON.stringify(solicitudesEnviadas) }
        });

        await prisma.usuario.update({
            where: { id: parseInt(id_amigo) },
            data: { solicitudes_recibidas: JSON.stringify(solicitudesRecibidas) }
        });

        response.send({ mensaje: 'Solicitud enviada' });
    });

    // ACEPTAR SOLICITUD
    fastify.post('/usuarios/:id_recibido/aceptar_amistad/:id_enviado', async (request, response) => {
        const token = request.headers['authorization'];
        if (!token || token !== TOKEN)
            return response.status(401).send('Unauthorized');

        const { id_recibido, id_enviado } = request.params as { id_recibido: string; id_enviado: string };

        const receptor = await prisma.usuario.findUnique({ where: { id: parseInt(id_recibido) } });
        const emisor = await prisma.usuario.findUnique({ where: { id: parseInt(id_enviado) } });

        if (!receptor || !emisor)
            return response.status(404).send('Usuario no encontrado');

        const solicitudesRecibidas = JSON.parse(receptor.solicitudes_recibidas);
        const solicitudesEnviadas = JSON.parse(emisor.solicitudes_enviadas);
        const amigosReceptor = JSON.parse(receptor.amigos);
        const amigosEmisor = JSON.parse(emisor.amigos);

        // Eliminar de solicitudes
        const newSolicitudesRecibidas = solicitudesRecibidas.filter((id: number) => id !== parseInt(id_enviado));
        const newSolicitudesEnviadas = solicitudesEnviadas.filter((id: number) => id !== parseInt(id_recibido));

        // Agregar a amigos
        amigosReceptor.push(parseInt(id_enviado));
        amigosEmisor.push(parseInt(id_recibido));

        await prisma.usuario.update({
            where: { id: parseInt(id_recibido) },
            data: {
                solicitudes_recibidas: JSON.stringify(newSolicitudesRecibidas),
                amigos: JSON.stringify(amigosReceptor)
            }
        });

        await prisma.usuario.update({
            where: { id: parseInt(id_enviado) },
            data: {
                solicitudes_enviadas: JSON.stringify(newSolicitudesEnviadas),
                amigos: JSON.stringify(amigosEmisor)
            }
        });

        response.send({ mensaje: 'Amistad aceptada' });
    });

    // VER MIS AMIGOS
    fastify.get('/api/users/:user_id/mis_amigos', async (request, response) => {
        const token = request.headers['authorization'];
        if (!token || token !== TOKEN)
            return response.status(401).send('Unauthorized');

        const { user_id } = request.params as { user_id: string };

        const usuario = await prisma.usuario.findUnique({ where: { id: parseInt(user_id) } });

        if (!usuario)
            return response.status(404).send('Usuario no encontrado');

        const amigosIds = JSON.parse(usuario.amigos);
        
        const amigos = await prisma.usuario.findMany({
            where: { id: { in: amigosIds } },
            select: { id: true, nombre: true, email: true }
        });

        response.send({ totalAmigos: amigos.length, amigos });
    });

    // ELIMINAR AMIGO
    fastify.delete('/api/users/:id/eliminar_amigo/:id_amigo', async (request, response) => {
        const token = request.headers['authorization'];
        if (!token || token !== TOKEN)
            return response.status(401).send('Unauthorized');

        const { id, id_amigo } = request.params as { id: string; id_amigo: string };

        const usuario = await prisma.usuario.findUnique({ where: { id: parseInt(id) } });
        const amigo = await prisma.usuario.findUnique({ where: { id: parseInt(id_amigo) } });

        if (!usuario || !amigo)
            return response.status(404).send('Usuario no encontrado');

        const amigosUsuario = JSON.parse(usuario.amigos).filter((aid: number) => aid !== parseInt(id_amigo));
        const amigosAmigo = JSON.parse(amigo.amigos).filter((aid: number) => aid !== parseInt(id));

        await prisma.usuario.update({
            where: { id: parseInt(id) },
            data: { amigos: JSON.stringify(amigosUsuario) }
        });

        await prisma.usuario.update({
            where: { id: parseInt(id_amigo) },
            data: { amigos: JSON.stringify(amigosAmigo) }
        });

        response.send({ mensaje: 'Amigo eliminado' });
    });
}