import type { FastifyInstance } from 'fastify';
// El type le dice a TypeScript que solo es para tipado, 
// no para importar código.

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const TOKEN = 'mi_token';

export async function usuariosRoutes(fastify: FastifyInstance) {
    
    // ==================== REGISTRO ====================
    fastify.post('/registro', async (request, response) => {
        const {nombre, email, password} = request.body as {nombre: string, email: string, password: string};
        
        const usuarioExiste = await prisma.usuario.findUnique({
            where: { email }
        });
        
        if(usuarioExiste)
            return response.status(400).send('El email ya está registrado');

        const nuevoUsuario = await prisma.usuario.create({
            data: { nombre, email, password }
        });
        
        response.send({
            mensaje: 'Usuario registrado', 
            usuario: {
                id: nuevoUsuario.id,
                nombre: nuevoUsuario.nombre,
                email: nuevoUsuario.email
            }
        });
    });

    // ==================== LOGIN ====================
    fastify.post('/login', async (request, response) => {
        const {email, password} = request.body as {email: string, password: string};
        
        const usuario_Buscado = await prisma.usuario.findUnique({
            where: {email}
        });

        if (!usuario_Buscado)
            return response.status(401).send("Usuario no registrado");

        if(password !== usuario_Buscado.password)
            return response.status(401).send("Contraseña incorrecta");

        response.send({
            mensaje: 'Login exitoso',
            token: `${TOKEN}_${usuario_Buscado.id}`,
            usuario: {
                id: usuario_Buscado.id,
                nombre: usuario_Buscado.nombre
            }
        });
    });

    // ==================== LISTAR TODOS ====================
    fastify.get('/get_usuarios', async (request, response) => {
        const usuarios = await prisma.usuario.findMany({
            select: {
                id: true,
                nombre: true,
                email: true,
                createdAt: true
            }
        });
        response.send(usuarios);
    });

    // ==================== OBTENER UNO ====================
    fastify.get('/get_usuario/:id', async(request, response) => {
        const {id} = request.params as {id: string};
        
        const usuario_buscado = await prisma.usuario.findUnique({
            where: { id: parseInt(id) },
            select: {
                id: true,
                nombre: true,
                email: true,
                createdAt: true
            }
        });

        if (!usuario_buscado)
            return response.status(404).send({error: 'Usuario no existe'});

        response.send(usuario_buscado);
    });

    // ==================== ACTUALIZAR ====================
    fastify.put('/put_usuario/:id', async (request, response) => {
        const {id} = request.params as {id: string};
        const {nombre, email} = request.body as {nombre?: string, email?: string};

        try {
            const usuarioActualizado = await prisma.usuario.update({
                where: { id: parseInt(id) },
                data: {
                    ...(nombre && { nombre }),
                    ...(email && { email })
                }
            });

            response.send({
                mensaje: 'Usuario actualizado',
                usuario: {
                    id: usuarioActualizado.id,
                    nombre: usuarioActualizado.nombre,
                    email: usuarioActualizado.email
                }
            });
        } catch (error) {
            return response.status(404).send('Usuario no encontrado');
        }
    });

    // ==================== ELIMINAR ====================
    fastify.delete('/delete_usuarios/:id', async (request, response) => {
        const token = request.headers['authorization'];
        if (token !== TOKEN)
            return response.status(401).send('Unauthorized');

        const {id} = request.params as {id: string};

        try {
            await prisma.usuario.delete({
                where: { id: parseInt(id) }
            });
            response.send("Usuario eliminado");
        } catch (error) {
            return response.status(404).send("Usuario no existe");
        }
    });
}