import type { FastifyInstance } from 'fastify';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const TOKEN = 'mi_token';

export async function amigosRoutes(fastify: FastifyInstance) {
    
    // ============================================================================
    // ENVIAR SOLICITUD DE AMISTAD
    // ============================================================================
    // POST /usuarios/:id/solicitud_amistad/:id_amigo
    // Permite a un usuario enviar una solicitud de amistad a otro
    // ============================================================================
    fastify.post('/usuarios/:id/solicitud_amistad/:id_amigo', async (request, response) => {
        
        // 1️⃣ AUTENTICACIÓN
        // Verificar que el token sea válido
        const token = request.headers['authorization'];
        if (!token || token !== TOKEN)
            return response.status(401).send('Unauthorized');

        // 2️⃣ EXTRAER PARÁMETROS
        // Los nombres deben coincidir con los de la ruta (:id, :id_amigo)
        const { id, id_amigo } = request.params as { id: string; id_amigo: string };
        
        // 3️⃣ BUSCAR USUARIOS EN BD
        // prisma.usuario.findUnique() → Busca UN usuario por ID
        // where: { id: 5 } → Condición de búsqueda
        // await → Espera respuesta de la base de datos
        const usuario = await prisma.usuario.findUnique({ 
            where: { id: parseInt(id) }  // Convertir "5" → 5 (de string a numero)
        });
        
        const amigo = await prisma.usuario.findUnique({ 
            where: { id: parseInt(id_amigo) }  // Convertir "10" → 10
        });

        // 4️⃣ VALIDAR EXISTENCIA
        // Si alguno no existe, retornar error 404
        if (!usuario || !amigo)
            return response.status(404).send('Usuario no encontrado');

        // 5️⃣ PROCESAR ARRAYS JSON
        // Las solicitudes se guardan como strings JSON: "[1, 5, 10]"
        // JSON.parse() convierte string → array: [1, 5, 10]
        const solicitudesEnviadas = JSON.parse(usuario.solicitudes_enviadas);
        const solicitudesRecibidas = JSON.parse(amigo.solicitudes_recibidas);

        // 6️⃣ VALIDAR SOLICITUD DUPLICADA
        // .includes() verifica si el ID ya está en el array
        if (solicitudesEnviadas.includes(parseInt(id_amigo)))
            return response.status(400).send('Ya enviaste solicitud');

        // 7️⃣ AGREGAR IDs A LOS ARRAYS
        // .push() añade un elemento al final del array
        solicitudesEnviadas.push(parseInt(id_amigo));  // Usuario envía a amigo
        solicitudesRecibidas.push(parseInt(id));       // Amigo recibe de usuario

        // 8️⃣ ACTUALIZAR BASE DE DATOS
        // prisma.usuario.update() → Modifica un usuario existente
        // JSON.stringify() convierte array → string: [1,5,10] → "[1,5,10]"
        await prisma.usuario.update({
            where: { id: parseInt(id) },
            data: { solicitudes_enviadas: JSON.stringify(solicitudesEnviadas) }
        });

        await prisma.usuario.update({
            where: { id: parseInt(id_amigo) },
            data: { solicitudes_recibidas: JSON.stringify(solicitudesRecibidas) }
        });

        // 9️⃣ RESPONDER AL CLIENTE
        response.send({ mensaje: 'Solicitud enviada' });
    });

    
    // ============================================================================
    // ACEPTAR SOLICITUD DE AMISTAD
    // ============================================================================
    // POST /usuarios/:id_recibido/aceptar_amistad/:id_enviado
    // El receptor acepta la solicitud del emisor
    // ============================================================================
    fastify.post('/usuarios/:id_recibido/aceptar_amistad/:id_enviado', async (request, response) => {
        
        // 1️⃣ AUTENTICACIÓN
        const token = request.headers['authorization'];
        if (!token || token !== TOKEN)
            return response.status(401).send('Unauthorized');

        // 2️⃣ EXTRAER PARÁMETROS
        const { id_recibido, id_enviado } = request.params as { id_recibido: string; id_enviado: string };

        // 3️⃣ BUSCAR USUARIOS
                        // id -> es el nombre que tiene la propiedad del objeto en el que se busca
        const receptor = await prisma.usuario.findUnique({ where: { id: parseInt(id_recibido) } });
        const emisor = await prisma.usuario.findUnique({ where: { id: parseInt(id_enviado) } });

        // 4️⃣ VALIDAR EXISTENCIA
        if (!receptor || !emisor)
            return response.status(404).send('Usuario no encontrado');

        // 5️⃣ PARSEAR ARRAYS JSON
                                    // JSON.parese -> de JSON a JS
                                    // JSON.stringify -> de JS a JSON
        const solicitudesRecibidas = JSON.parse(receptor.solicitudes_recibidas);
        const solicitudesEnviadas = JSON.parse(emisor.solicitudes_enviadas);
        const amigosReceptor = JSON.parse(receptor.amigos);
        const amigosEmisor = JSON.parse(emisor.amigos);

        // 6️⃣ ELIMINAR DE SOLICITUDES
        // .filter() crea un nuevo array excluyendo el ID especificado 
        // por eso es: si es distinto (!==) lo saltas (si es TRUE) 
        // (id: number) => id !== 10  →  Mantener todos menos el 10
        const newSolicitudesRecibidas = solicitudesRecibidas.filter((id: number) => id !== parseInt(id_enviado));
        const newSolicitudesEnviadas = solicitudesEnviadas.filter((id: number) => id !== parseInt(id_recibido));

        // 7️⃣ AGREGAR A AMIGOS
        // Ambos se añaden mutuamente como amigos
        amigosReceptor.push(parseInt(id_enviado));
        amigosEmisor.push(parseInt(id_recibido));

        // 8️⃣ ACTUALIZAR BASE DE DATOS
        // Actualizar ambos usuarios con las nuevas listas
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

        // 9️⃣ RESPONDER AL CLIENTE
        response.send({ mensaje: 'Amistad aceptada' });
    });

    
    // ============================================================================
    // VER MIS AMIGOS
    // ============================================================================
    // GET /api/users/:user_id/mis_amigos
    // Devuelve la lista de amigos de un usuario
    // ============================================================================
    fastify.get('/api/users/:user_id/mis_amigos', async (request, response) => {
        
        // 1️⃣ AUTENTICACIÓN
        const token = request.headers['authorization'];
        if (!token || token !== TOKEN)
            return response.status(401).send('Unauthorized');

        // 2️⃣ EXTRAER PARÁMETRO
        const { user_id } = request.params as { user_id: string };

        // 3️⃣ BUSCAR USUARIO
        const usuario = await prisma.usuario.findUnique({ 
            where: { 
                id: parseInt(user_id) } 
            });

        // 4️⃣ VALIDAR EXISTENCIA
        if (!usuario)
            return response.status(404).send('Usuario no encontrado');

        // 5️⃣ OBTENER IDs DE AMIGOS
        // Convertir "[1, 5, 10]" → [1, 5, 10]
        const amigosIds = JSON.parse(usuario.amigos);
        
        // 6️⃣ BUSCAR MÚLTIPLES USUARIOS EN LA TABLA 'USUARIO'
        // prisma.usuario.findMany() → Busca VARIOS usuarios en la tabla 'usuario'
        // where: { id: { in: [1, 5, 10] } } → Busca IDs que estén EN el array
        // select → Especifica qué campos devolver
              // En TS no es necesario especificar qué contendrá la variable
        const amigos = await prisma.usuario.findMany({
            where: { id: { in: amigosIds } },
            select: { id: true, nombre: true, email: true }
        });
        /* Devuelve un array de objetos: amigos = [
            { id: 1, nombre: "Alice", email: "alice@test.com" },
            { id: 5, nombre: "Bob", email: "bob@test.com" },
            { id: 10, nombre: "Charlie", email: "charlie@test.com" }] */


        // 7️⃣ RESPONDER CON LISTA
        response.send({ 
            totalAmigos: amigos.length, 
            amigos // el array de objetos 'amigos'
        });
    });

    
    // ============================================================================
    // ELIMINAR AMIGO
    // ============================================================================
    // DELETE /api/users/:id/eliminar_amigo/:id_amigo
    // Elimina la relación de amistad entre dos usuarios
    // ============================================================================
    fastify.delete('/api/users/:id/eliminar_amigo/:id_amigo', async (request, response) => {
        
        // 1️⃣ AUTENTICACIÓN
        const token = request.headers['authorization'];
        if (!token || token !== TOKEN)
            return response.status(401).send('Unauthorized');

        // 2️⃣ EXTRAER PARÁMETROS
        const { id, id_amigo } = request.params as { id: string; id_amigo: string };

        // 3️⃣ BUSCAR USUARIOS
        const usuario = await prisma.usuario.findUnique({ where: { id: parseInt(id) } });
        const amigo = await prisma.usuario.findUnique({ where: { id: parseInt(id_amigo) } });

        // 4️⃣ VALIDAR EXISTENCIA
        if (!usuario || !amigo)
            return response.status(404).send('Usuario no encontrado');

        // 5️⃣ FILTRAR AMIGOS
        // Eliminar el ID del amigo de la lista de cada usuario
        // [1, 5, 10] → Eliminar 5 → [1, 10]
        const amigosUsuario = JSON.parse(usuario.amigos).filter((aid: number) => aid !== parseInt(id_amigo));
        const amigosAmigo = JSON.parse(amigo.amigos).filter((aid: number) => aid !== parseInt(id));

        // 6️⃣ ACTUALIZAR BASE DE DATOS
        // Guardar las nuevas listas sin el ID del otro
        await prisma.usuario.update({
            where: { id: parseInt(id) },
            data: { amigos: JSON.stringify(amigosUsuario) }
        });

        await prisma.usuario.update({
            where: { id: parseInt(id_amigo) },
            data: { amigos: JSON.stringify(amigosAmigo) }
        });

        // 7️⃣ RESPONDER AL CLIENTE
        response.send({ mensaje: 'Amigo eliminado' });
    });
}