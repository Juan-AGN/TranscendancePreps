// ============================================================================
// IMPORTACIONES
// ============================================================================
import type { FastifyInstance } from 'fastify';  // Tipo para TypeScript
import { PrismaClient } from '@prisma/client';   // Cliente de base de datos

// Crear conexión con la base de datos
const prisma = new PrismaClient();

// ============================================================================
// FUNCIÓN PRINCIPAL: Registrar todas las rutas de usuarios
// ============================================================================
export async function usuariosRoutes(fastify: FastifyInstance) {
    
    // ========================================================================
    // RUTA 1: REGISTRO DE USUARIOS
    // ========================================================================
    fastify.post('/registro', async (request, response) => {
        
        // Obtener datos del body de la petición
        const body = request.body as { 
            nombre: string, 
            email: string, 
            password: string 
        };
        
        const nombre = body.nombre;
        const email = body.email;
        const password = body.password;
        
        // PASO 1: Verificar que el email no esté ya registrado
        const usuarioExiste = await prisma.usuario.findUnique({
            where: { email: email }
        });
        
        // Si el email ya existe, retornar error
        if (usuarioExiste) {
            return response.status(400).send({
                error: 'El email ya está registrado',
                mensaje: 'Usa otro email o haz login'
            });
        }
        
        // PASO 2: Crear el nuevo usuario en la base de datos
        const nuevoUsuario = await prisma.usuario.create({
            data: {
                nombre: nombre,
                email: email,
                password: password  // ⚠️ En producción, cifrar la contraseña
            }
        });
        
        // PASO 3: Retornar respuesta exitosa (sin mostrar el password)
        response.send({
            mensaje: 'Usuario registrado exitosamente',
            usuario: {
                id: nuevoUsuario.id,
                nombre: nuevoUsuario.nombre,
                email: nuevoUsuario.email,
                fechaCreacion: nuevoUsuario.createdAt
            }
        });
    });
    
    // ========================================================================
    // RUTA 2: LOGIN (Iniciar sesión)
    // ========================================================================
    fastify.post('/login', async (request, response) => {
        
        // Obtener email y password del body
        const body = request.body as { email: string, password: string };
        const email = body.email;
        const password = body.password;
        
        // PASO 1: Buscar el usuario por email
        const usuario = await prisma.usuario.findUnique({
            where: { email: email }
        });
        
        // Si no existe el usuario, retornar error
        if (!usuario) {
            return response.status(401).send({
                error: 'Usuario no encontrado',
                mensaje: 'El email no está registrado'
            });
        }
        
        // PASO 2: Verificar que la contraseña sea correcta
        if (password !== usuario.password) {
            return response.status(401).send({
                error: 'Contraseña incorrecta',
                mensaje: 'Verifica tu contraseña'
            });
        }
        
        // PASO 3: Crear un token JWT con los datos del usuario
        const token = fastify.jwt.sign(
            {
                id: usuario.id,
                email: usuario.email,
                nombre: usuario.nombre
            },
            {
                expiresIn: '7d'  // El token expira en 7 días
            }
        );
        
        // PASO 4: Retornar el token y los datos del usuario
        response.send({
            mensaje: 'Login exitoso',
            token: token,  // Este token se usa en todas las peticiones protegidas
            usuario: {
                id: usuario.id,
                nombre: usuario.nombre,
                email: usuario.email
            }
        });
    });
    
    // ========================================================================
    // RUTA 3: LISTAR TODOS LOS USUARIOS (ruta pública)
    // ========================================================================
    fastify.get('/get_usuarios', async (request, response) => {
        
        // Obtener todos los usuarios de la base de datos
        const usuarios = await prisma.usuario.findMany({
            select: {
                id: true,
                nombre: true,
                email: true,
                createdAt: true,
                password: false  // NO enviar las contraseñas
            }
        });
        
        // Retornar la lista de usuarios
        response.send({
            total: usuarios.length,
            usuarios: usuarios
        });
    });
    
    // ========================================================================
    // RUTA 4: OBTENER UN USUARIO POR ID (ruta pública)
    // ========================================================================
    fastify.get('/get_usuario/:id', async (request, response) => {
        
        // Obtener el ID de los parámetros de la URL
        const params = request.params as { id: string };
        const id = parseInt(params.id);  // Convertir string a número
        
        // Buscar el usuario en la base de datos
        const usuario = await prisma.usuario.findUnique({
            where: { id: id },
            select: {
                id: true,
                nombre: true,
                email: true,
                createdAt: true,
                password: false  // NO enviar la contraseña
            }
        });
        
        // Si no existe, retornar error
        if (!usuario) {
            return response.status(404).send({
                error: 'Usuario no encontrado',
                mensaje: `No existe un usuario con ID ${id}`
            });
        }
        
        // Retornar el usuario encontrado
        response.send(usuario);
    });
    
    // ========================================================================
    // RUTA 5: ACTUALIZAR USUARIO (ruta protegida - necesita token)
    // ========================================================================
    fastify.put('/put_usuario/:id', {
        onRequest: [fastify.authenticate]  // ← Verificar token antes de ejecutar
    }, async (request, response) => {
        
        // PASO 1: Obtener datos del token JWT verificado
        const tokenData = request.user as { 
            id: number, 
            email: string, 
            nombre: string 
        };
        
        // PASO 2: Obtener el ID de la URL
        const params = request.params as { id: string };
        const idUrl = parseInt(params.id);
        
        // PASO 3: Verificar que el usuario solo pueda editar SU propio perfil
        if (tokenData.id !== idUrl) {
            return response.status(403).send({
                error: 'Acceso denegado',
                mensaje: 'Solo puedes editar tu propio perfil'
            });
        }
        
        // PASO 4: Obtener los nuevos datos del body
        const body = request.body as { nombre?: string, email?: string };
        
        // PASO 5: Actualizar el usuario en la base de datos
        const usuarioActualizado = await prisma.usuario.update({
            where: { id: idUrl },
            data: {
                // Solo actualizar si se envió el campo
                ...(body.nombre && { nombre: body.nombre }),
                ...(body.email && { email: body.email })
            }
        });
        
        // PASO 6: Retornar respuesta exitosa
        response.send({
            mensaje: 'Usuario actualizado correctamente',
            usuario: {
                id: usuarioActualizado.id,
                nombre: usuarioActualizado.nombre,
                email: usuarioActualizado.email
            }
        });
    });
    
    // ========================================================================
    // RUTA 6: ELIMINAR USUARIO (ruta protegida - necesita token)
    // ========================================================================
    fastify.delete('/delete_usuarios/:id', {
        onRequest: [fastify.authenticate]  // ← Verificar token antes de ejecutar
    }, async (request, response) => {
        
        // PASO 1: Obtener datos del token JWT
        const tokenData = request.user as { id: number };
        
        // PASO 2: Obtener el ID de la URL
        const params = request.params as { id: string };
        const idUrl = parseInt(params.id);
        
        // PASO 3: Verificar que el usuario solo pueda eliminar SU propia cuenta
        if (tokenData.id !== idUrl) {
            return response.status(403).send({
                error: 'Acceso denegado',
                mensaje: 'Solo puedes eliminar tu propia cuenta'
            });
        }
        
        // PASO 4: Verificar que el usuario exista
        const usuario = await prisma.usuario.findUnique({
            where: { id: idUrl }
        });
        
        if (!usuario) {
            return response.status(404).send({
                error: 'Usuario no encontrado'
            });
        }
        
        // PASO 5: Eliminar el usuario de la base de datos
        await prisma.usuario.delete({
            where: { id: idUrl }
        });
        
        // PASO 6: Retornar respuesta exitosa
        response.send({
            mensaje: 'Usuario eliminado correctamente',
            usuarioEliminado: {
                id: usuario.id,
                nombre: usuario.nombre
            }
        });
    });
}