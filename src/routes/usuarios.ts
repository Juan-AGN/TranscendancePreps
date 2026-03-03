// ============= NOTAS
// ORDEN CORRECTO DE LAS RUTAS (el orden aquí importa):
// 1. Rutas con texto fijo: /usuarios/registro
// 2. Rutas con texto fijo: /usuarios/login
// 3. Rutas con texto fijo: /usuarios/filtro/online
// 4. Rutas con parámetros + texto: /usuarios/:userId/avatar
// 5. Rutas con parámetros + texto: /usuarios/:userId/estado
// 6. Rutas solo con parámetros: /usuarios/:userId  ← AL FINAL
// ====================

// ============================================================================
// IMPORTACIONES NECESARIAS
// ============================================================================
import type { FastifyInstance } from 'fastify';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

// Para manejo de archivos (avatar)
import { randomUUID } from 'crypto';
import fs from 'fs'; // file System
import { pipeline } from 'stream/promises';
import path from 'path';
import { fileURLToPath } from 'url';

// Crear cliente de Prisma para acceder a la base de datos
const clienteDePrisma = new PrismaClient();

// Configuración de rutas de archivos
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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
                avatar: nuevoUsuario.avatar,
                estadoOnline: nuevoUsuario.estadoOnline,
                ultimaConexion: nuevoUsuario.ultimaConexion,
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

        // PASO 7: Actualizar estado online al hacer login 
        await clienteDePrisma.usuario.update({
            where: { id: usuario.id },
            data: { estadoOnline: true }
        });
        
        // PASO 8: Generar el token JWT (porque el login fue exitoso)
        const token = jwt.sign(
            { 
                id: usuario.id, 
                email: usuario.email 
            },
            process.env.JWT_SECRET || 'secreto-super-seguro',
            { expiresIn: '24h' }
        );
        
        // PASO 9: Retornar el token al cliente
        respuestaAlCliente.send({
            mensaje: 'Login exitoso',
            token: token,
            usuario: {
                id: usuario.id,
                nombre: usuario.nombre,
                email: usuario.email,
                avatar: usuario.avatar,
                estadoOnline: true
            }
        });
    });
    
    // ========================================================================
    // RUTA NUMERO 3: PARA OBTENER USUARIOS ONLINE
    // ========================================================================
    // Metodo HTTP: GET
    // URL: http://localhost:3000/usuarios/filtro/online
    servidorFastify.get('/usuarios/filtro/online', async (peticionDelCliente, respuestaAlCliente) => {  
        try {
            // PASO 1: Buscar solo usuarios con estadoOnline = true
            const usuariosOnline = await clienteDePrisma.usuario.findMany({
                where: {
                    estadoOnline: true
                },
                select: {
                    id: true,
                    nombre: true,
                    email: true,
                    avatar: true,
                    estadoOnline: true,
                    ultimaConexion: true,
                    createdAt: true
                }
            });
            
            // PASO 2: Retornar la lista de usuarios online
            respuestaAlCliente.send({
                total: usuariosOnline.length,
                usuarios: usuariosOnline
            });
            
        } catch (error) {
            console.error('Error al obtener usuarios online:', error);
            respuestaAlCliente.status(500).send({
                error: 'Error al obtener usuarios online'
            });
        }
    });

    // ========================================================================
    // RUTA NUMERO 4: OBTENER LISTA DE TODOS LOS USUARIOS
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
                avatar: true,
                estadoOnline: true,
                ultimaConexion: true,
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
    // RUTA NUMERO 5: PARA OBTENER AVATAR
    // ========================================================================
    servidorFastify.get('/usuarios/:userId/avatar', async (peticionDelCliente, respuestaAlCliente) => {
        
        // PASO 1: Obtener el ID del usuario
        const parametrosDeLaURL = peticionDelCliente.params as { userId: string };
        const idDelUsuario = parseInt(parametrosDeLaURL.userId);
        
        // PASO 2: Buscar el usuario
        const usuario = await clienteDePrisma.usuario.findUnique({
            where: { id: idDelUsuario },
            select: { avatar: true }
        });
        
        if (!usuario) {
            return respuestaAlCliente.status(404).send({
                error: 'Usuario no encontrado'
            });
        }
        
        // PASO 3: Retornar la URL del avatar
        respuestaAlCliente.send({
            avatarUrl: usuario.avatar || 'default-avatar.png'
        });
    });
    
    // ========================================================================
    // RUTA NUMERO 6: PARA SUBIR AVATAR
    // ========================================================================
    servidorFastify.post('/usuarios/:userId/avatar', {
        onRequest: [servidorFastify.authenticate]
    }, async (peticionDelCliente, respuestaAlCliente) => {
        
        try {
            // PASO 1: Obtener el ID del usuario
            const parametrosDeLaURL = peticionDelCliente.params as { userId: string };
            const idDelUsuario = parseInt(parametrosDeLaURL.userId);
            
            // PASO 2: Recibir Y comprobar el archivo
            const data = await peticionDelCliente.file();
            
            if (!data) {
                return respuestaAlCliente.status(400).send({
                    error: 'No se envió ningún archivo'
                });
            }
            
            // PASO 3: Validar tipo de archivo (solo imágenes)
            const tiposPermitidos = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
            
            // 'data.mimetype' -> Incluye el tipo de archivo q intenta subir para comprobar si es uno d ellos
            if (!tiposPermitidos.includes(data.mimetype)) { 
                return respuestaAlCliente.status(400).send({
                    error: 'Solo se permiten imágenes (JPEG, PNG, GIF, WEBP)'
                });
            }
            
            // PASO 4: Validar tamaño (máximo 5MB)
            const maxSize = 5 * 1024 * 1024; // 5MB
            const buffer = await data.toBuffer(); // convierte la imagen a bytes para medirla 
            
            if (buffer.length > maxSize) {
                return respuestaAlCliente.status(400).send({
                    error: 'La imagen no puede superar los 5MB'
                });
            }
            
            // PASO 5: Generar nombre único para el archivo (para evitar que se sobreescriban si sube +d1)
            const extension = data.filename.split('.').pop(); // obtiene el tipo (.jpg)
            const nombreDelArchivo = `avatar-${idDelUsuario}-${randomUUID()}.${extension}`;
                                    // Ej: "avatar-5-a3f5b2c8-1d4e-4f7a-9b2c-8e3f1a5d6c7b.png"
            
            // PASO 6: Guardar el archivo en /public/avatares/
            const rutaCompleta = path.join(__dirname, '..', '..', 'public', 'avatares', nombreDelArchivo);
                // 'path' -> import path from 'path'.....
                //EJ: "/Users/daniel/Documents/transcendence/TranscendancePreps/public/avatares/avatar-5-a3f5b2c8-1d4e-4f7a-9b2c-8e3f1a5d6c7b.jpg"
            
            // Crear directorio si no existe
            const directorioAvatares = path.join(__dirname, '..', '..', 'public', 'avatares');
            if (!fs.existsSync(directorioAvatares)) 
            { // 'fs'- > File system
                fs.mkdirSync(directorioAvatares, 
                { 
                    recursive: true 
                });
            }
            
            // Guardar el archivo
            fs.writeFileSync(rutaCompleta, buffer); // no guarda el objeto ¡data¡ sino el buffer
            
            // PASO 7: Obtener el avatar anterior (para eliminarlo)
            const avatarAnterior = await clienteDePrisma.usuario.findUnique({ // busca 1 solo usuario (unique)
                where: { id: idDelUsuario }, // concretamente el usuario con ID ...
                select: { avatar: true } // Solo trae le campo avatar
            });
            
            // PASO 8: Actualizar la BD con la URL del nuevo avatar
            const usuarioActualizado = await clienteDePrisma.usuario.update({
                where: {
                    id: idDelUsuario
                },
                data: {
                    avatar: `/avatares/${nombreDelArchivo}`
                },
                // Aunque solo cambie 'avatar' se devuelven todos los campos en la response por si los necesita
                select: {
                    id: true,
                    nombre: true,
                    email: true,
                    avatar: true,
                    estadoOnline: true,
                    ultimaConexion: true,
                    createdAt: true
                }
            });
            
            // PASO 9: Eliminar el avatar anterior (si no es el default)
            if (avatarAnterior?.avatar && 
                avatarAnterior.avatar !== 'default-avatar.png' && 
                avatarAnterior.avatar.startsWith('/avatares/')) // Si es un avatar válido (comprueba la ruta)
                {
                // Construyo la ruta completa para eliminarlo
                const avatarAnteriorPath = path.join(__dirname, '..', '..', 'public', avatarAnterior.avatar);
                                                                    // '.avatar' -> "avatares/avatar,jpg"

                if (fs.existsSync(avatarAnteriorPath)) // Existe el archivo?
                    fs.unlinkSync(avatarAnteriorPath); // Si es así, lo elimina
            }
            
            // PASO 10: Retornar respuesta exitosa
            respuestaAlCliente.send({
                mensaje: 'Avatar subido correctamente',
                avatarUrl: `/avatares/${nombreDelArchivo}`,
                usuario: usuarioActualizado
            });
            
        // Si cualquiera de los pasos del 1 al 10 falla:
        } catch (error) {
            console.error('Error al subir avatar:', error);
            respuestaAlCliente.status(500).send({
                error: 'Error al subir el avatar'
            });
        }
    });

    // ========================================================================
    // RUTA NUMERO 7: PARA ELIMINAR AVATAR
    // ========================================================================
    servidorFastify.delete('/usuarios/:userId/avatar', {
        onRequest: [servidorFastify.authenticate]
    }, async (peticionDelCliente, respuestaAlCliente) => {
        
        try {
            // PASO 1: Obtener el ID del usuario
            const parametrosDeLaURL = peticionDelCliente.params as { userId: string };
            const idDelUsuario = parseInt(parametrosDeLaURL.userId);
            
            // PASO 2: Obtener el avatar actual
            const usuario = await clienteDePrisma.usuario.findUnique({
                where: { id: idDelUsuario },
                select: { avatar: true }
            });
            
            if (!usuario) {
                return respuestaAlCliente.status(404).send({
                    error: 'Usuario no encontrado'
                });
            }
            
            // PASO 3: Eliminar el archivo físico (si no es el default)
            if (usuario.avatar && 
                usuario.avatar !== 'default-avatar.png' && 
                usuario.avatar.startsWith('/avatares/')) {
                
                const avatarPath = path.join(__dirname, '..', '..', 'public', usuario.avatar);
                if (fs.existsSync(avatarPath)) {
                    fs.unlinkSync(avatarPath);
                }
            }
            
            // PASO 4: Actualizar la BD al avatar por defecto
            const usuarioActualizado = await clienteDePrisma.usuario.update({
                where: { id: idDelUsuario },
                data: { avatar: 'default-avatar.png' },
                select: {
                    id: true,
                    nombre: true,
                    email: true,
                    avatar: true
                }
            });
            
            // PASO 5: Retornar respuesta exitosa
            respuestaAlCliente.send({
                mensaje: 'Avatar eliminado correctamente',
                usuario: usuarioActualizado
            });
            
        } catch (error) {
            console.error('Error al eliminar avatar:', error);
            respuestaAlCliente.status(500).send({
                error: 'Error al eliminar el avatar'
            });
        }
    });

    // ========================================================================
    // RUTA NUMERO 8: PARA ACTUALIZAR ESTADO ONLINE
    // ========================================================================
    // Metodo HTTP: PUT
    // URL: http://localhost:3000/usuarios/:userId/estado
    servidorFastify.put('/usuarios/:userId/estado', {
        onRequest: [servidorFastify.authenticate]
    }, async (peticionDelCliente, respuestaAlCliente) => {
        
        try {
            // PASO 1: Obtener el ID del usuario
            const parametrosDeLaURL = peticionDelCliente.params as { userId: string };
            const idDelUsuario = parseInt(parametrosDeLaURL.userId);
            
            // PASO 2: Obtener el nuevo estado del body
            const datosDelBody = peticionDelCliente.body as {
                estadoOnline: boolean
            };
            
            // PASO 3: Validar que venga el campo estadoOnline
            if (typeof datosDelBody.estadoOnline !== 'boolean') {
                return respuestaAlCliente.status(400).send({
                    error: 'El campo estadoOnline debe ser booleano (true/false)'
                });
            }
            
            // PASO 4: Preparar datos para actualizar
            const datosParaActualizar: any = {
                estadoOnline: datosDelBody.estadoOnline
            };
            
            // Si el usuario se está desconectando, guardar última conexión
            if (!datosDelBody.estadoOnline) {
                datosParaActualizar.ultimaConexion = new Date();
            }
            
            // PASO 5: Actualizar el estado en la BD
            const usuarioActualizado = await clienteDePrisma.usuario.update({
                where: { id: idDelUsuario },
                data: datosParaActualizar,
                select: {
                    id: true,
                    nombre: true,
                    email: true,
                    avatar: true,
                    estadoOnline: true,
                    ultimaConexion: true,
                    createdAt: true
                }
            });
            
            // PASO 6: Retornar respuesta exitosa
            respuestaAlCliente.send({
                mensaje: 'Estado actualizado correctamente',
                usuario: usuarioActualizado
            });
            
        } catch (error) {
            console.error('Error al actualizar estado:', error);
            respuestaAlCliente.status(500).send({
                error: 'Error al actualizar el estado'
            });
        }
    });

    // ========================================================================
    // RUTA NUMERO 9: OBTENER UN USUARIO ESPECIFICO POR ID
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
                avatar: true,
                estadoOnline: true,
                ultimaConexion: true,
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
    // RUTA NUMERO 10: ACTUALIZAR UN USUARIO
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
            data: datosDelBody,
            select: {
                id: true,
                nombre: true,
                email: true,
                avatar: true,
                estadoOnline: true,
                ultimaConexion: true,
                createdAt: true
            }
        });
        
        // PASO 5: Retornar el usuario actualizado
        respuestaAlCliente.send({
            mensaje: 'Usuario actualizado correctamente',
            usuario: datosDelBody
        });
    });

    // ========================================================================
    // RUTA NUMERO 11: ELIMINAR UN USUARIO
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
