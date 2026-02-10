// ============================================================================
// IMPORTACIONES NECESARIAS
// ============================================================================
import type { FastifyInstance } from 'fastify';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

// Crear cliente de Prisma para acceder a la base de datos
const clienteDePrisma = new PrismaClient();

// ============================================================================
// FUNCION PRINCIPAL: Registrar todas las rutas relacionadas con usuarios
// ============================================================================
export async function usuariosRoutes(servidorFastify: FastifyInstance) {
    
    // ========================================================================
    // RUTA NUMERO 1: REGISTRAR NUEVO USUARIO
    // ========================================================================
    // Metodo HTTP: POST
    // URL: http://localhost:3000/usuarios/registro
    servidorFastify.post('/usuarios/registro', async (peticionDelCliente, respuestaAlCliente) => {
        
        // PASO 1: Obtener los datos que vienen en el body (JSON)
        const datosDelBody = peticionDelCliente.body as {
            nombre: string,
            email: string,
            contraseña: string
        };
        
        // PASO 2: Validar que vengan todos los campos obligatorios
        if (!datosDelBody.nombre || !datosDelBody.email || !datosDelBody.contraseña) {
            return respuestaAlCliente.status(400).send({
                error: 'Faltan campos obligatorios: nombre, email, contraseña'
            });
        }
        
        // PASO 3: Verificar si el email ya está registrado en la base de datos
        const usuarioExistente = await clienteDePrisma.usuario.findUnique({
            where: {
                email: datosDelBody.email
            }
        });
        
        // Si el email ya existe, retornar error
        if (usuarioExistente) {
            return respuestaAlCliente.status(400).send({
                error: 'Este email ya está registrado'
            });
        }
        
        // PASO 4: HASHEAR LA CONTRASEÑA
        // bcrypt.hash() convierte la contraseña en un hash irreversible
        // - Primer parámetro: contraseña en texto plano (ej: "MiPassword123")
        // - Segundo parámetro: número de rounds (10 = buena seguridad/velocidad)
        // - Resultado: hash de 60 caracteres (ej: "$2b$10$N9qo8uLO...")
        const saltRounds = 10;
        const passwordHasheado = await bcrypt.hash(datosDelBody.contraseña, saltRounds);
        
        // PASO 5: Crear el nuevo usuario en la base de datos
        const nuevoUsuario = await clienteDePrisma.usuario.create({
            data: {
                nombre: datosDelBody.nombre,
                email: datosDelBody.email,
                password: passwordHasheado
            }
        });
        
        // PASO 6: Retornar respuesta exitosa (SIN mostrar la contraseña hasheada)
        respuestaAlCliente.status(201).send({
            mensaje: 'Usuario creado exitosamente',
            usuario: {
                id: nuevoUsuario.id,
                nombre: nuevoUsuario.nombre,
                email: nuevoUsuario.email,
                fechaCreacion: nuevoUsuario.createdAt
            }
        });
    });
    
    // ========================================================================
    // RUTA NUMERO 2: LOGIN (INICIAR SESION)
    // ========================================================================
    // Metodo HTTP: POST
    // URL: http://localhost:3000/usuarios/login
    servidorFastify.post('/usuarios/login', async (peticionDelCliente, respuestaAlCliente) => {
        
        // PASO 1: Obtener email y contraseña del body
        const datosDelBody = peticionDelCliente.body as {
            email: string,
            contraseña: string
        };
        
        // PASO 2: Validar que vengan los campos obligatorios
        if (!datosDelBody.email || !datosDelBody.contraseña) {
            return respuestaAlCliente.status(400).send({
                error: 'Email y contraseña son requeridos'
            });
        }
        
        // PASO 3: Buscar el usuario en la base de datos por email
        const usuario = await clienteDePrisma.usuario.findUnique({
            where: {
                email: datosDelBody.email
            }
        });
        
        // PASO 4: Verificar que el usuario exista
        if (!usuario) {
            return respuestaAlCliente.status(401).send({
                error: 'Email o contraseña incorrectos'
            });
        }
        
        // PASO 5: VERIFICAR LA CONTRASEÑA CON BCRYPT
        // bcrypt.compare() compara la contraseña en texto plano con el hash guardado
        // - Primer parámetro: contraseña enviada (ej: "MiPassword123")
        // - Segundo parámetro: hash guardado en BD (ej: "$2b$10$N9qo8...")
        // - Resultado: true si coinciden, false si no coinciden
        const passwordEsCorrecta = await bcrypt.compare(
            datosDelBody.contraseña,
            usuario.password
        );
        
        // PASO 6: Si la contraseña NO coincide, retornar error
        if (!passwordEsCorrecta) {
            return respuestaAlCliente.status(401).send({
                error: 'Email o contraseña incorrectos'
            });
        }
        
        // PASO 7: Generar el token JWT (porque el login fue exitoso)
        const token = jwt.sign(
            { 
                id: usuario.id, 
                email: usuario.email 
            },
            process.env.JWT_SECRET || 'secreto-super-seguro',
            { expiresIn: '24h' }
        );
        
        // PASO 8: Retornar el token al cliente
        respuestaAlCliente.send({
            mensaje: 'Login exitoso',
            token: token,
            usuario: {
                id: usuario.id,
                nombre: usuario.nombre,
                email: usuario.email
            }
        });
    });
    
    // ========================================================================
    // RUTA NUMERO 3: OBTENER LISTA DE TODOS LOS USUARIOS
    // ========================================================================
    // Metodo HTTP: GET
    // URL: http://localhost:3000/usuarios
    servidorFastify.get('/usuarios', async (peticionDelCliente, respuestaAlCliente) => {
        
        // Buscar todos los usuarios en la base de datos
        const todosLosUsuarios = await clienteDePrisma.usuario.findMany({
            select: {
                id: true,
                nombre: true,
                email: true,
                createdAt: true
            }
        });
        
        // Retornar la lista de usuarios
        respuestaAlCliente.send({
            total: todosLosUsuarios.length,
            usuarios: todosLosUsuarios
        });
    });
    
    // ========================================================================
    // RUTA NUMERO 4: OBTENER UN USUARIO ESPECIFICO POR ID
    // ========================================================================
    // Metodo HTTP: GET
    // URL: http://localhost:3000/usuarios/:userId
    servidorFastify.get('/usuarios/:userId', async (peticionDelCliente, respuestaAlCliente) => {
        
        // PASO 1: Obtener el ID del usuario desde la URL
        const parametrosDeLaURL = peticionDelCliente.params as { userId: string };
        const idDelUsuario = parseInt(parametrosDeLaURL.userId);
        
        // PASO 2: Buscar el usuario en la base de datos
        const usuario = await clienteDePrisma.usuario.findUnique({
            where: {
                id: idDelUsuario
            },
            select: {
                id: true,
                nombre: true,
                email: true,
                createdAt: true
            }
        });
        
        // PASO 3: Si no existe el usuario, retornar error
        if (!usuario) {
            return respuestaAlCliente.status(404).send({
                error: 'Usuario no encontrado'
            });
        }
        
        // PASO 4: Retornar el usuario encontrado
        respuestaAlCliente.send(usuario);
    });
    
    // ========================================================================
    // RUTA NUMERO 5: ACTUALIZAR UN USUARIO
    // ========================================================================
    // Metodo HTTP: PUT
    // URL: http://localhost:3000/usuarios/:userId
    servidorFastify.put('/usuarios/:userId', {
        onRequest: [servidorFastify.authenticate]
    }, async (peticionDelCliente, respuestaAlCliente) => {
        
        // PASO 1: Obtener el ID del usuario desde la URL
        const parametrosDeLaURL = peticionDelCliente.params as { userId: string };
        const idDelUsuario = parseInt(parametrosDeLaURL.userId);
        
        // PASO 2: Obtener los datos a actualizar del body
        const datosDelBody = peticionDelCliente.body as {
            nombre?: string,
            email?: string,
            contraseña?: string
        };
        
        // PASO 3: Si viene una nueva contraseña, hashearla
        let passwordHasheado: string | undefined;
        if (datosDelBody.contraseña) {
            const saltRounds = 10;
            passwordHasheado = await bcrypt.hash(datosDelBody.contraseña, saltRounds);
        }
        
        // PASO 4: Actualizar el usuario en la base de datos
        const usuarioActualizado = await clienteDePrisma.usuario.update({
            where: {
                id: idDelUsuario
            },
            data: {
                nombre: datosDelBody.nombre,
                email: datosDelBody.email,
                password: passwordHasheado
            }
        });
        
        // PASO 5: Retornar el usuario actualizado
        respuestaAlCliente.send({
            mensaje: 'Usuario actualizado correctamente',
            usuario: {
                id: usuarioActualizado.id,
                nombre: usuarioActualizado.nombre,
                email: usuarioActualizado.email
            }
        });
    });
    
    // ========================================================================
    // RUTA NUMERO 6: ELIMINAR UN USUARIO
    // ========================================================================
    // Metodo HTTP: DELETE
    // URL: http://localhost:3000/usuarios/:userId
    servidorFastify.delete('/usuarios/:userId', {
        onRequest: [servidorFastify.authenticate]
    }, async (peticionDelCliente, respuestaAlCliente) => {
        
        // PASO 1: Obtener el ID del usuario desde la URL
        const parametrosDeLaURL = peticionDelCliente.params as { userId: string };
        const idDelUsuario = parseInt(parametrosDeLaURL.userId);
        
        // PASO 2: Eliminar el usuario de la base de datos
        const usuarioEliminado = await clienteDePrisma.usuario.delete({
            where: {
                id: idDelUsuario
            }
        });
        
        // PASO 3: Retornar confirmación
        respuestaAlCliente.send({
            mensaje: 'Usuario eliminado correctamente',
            usuario: {
                id: usuarioEliminado.id,
                nombre: usuarioEliminado.nombre
            }
        });
    });
}