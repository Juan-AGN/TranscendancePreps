// ============================================================================
// IMPORTACIONES NECESARIAS
// ============================================================================
// FastifyInstance: Es el tipo de dato que representa el servidor Fastify
import type { FastifyInstance } from 'fastify';

// PrismaClient: Es el cliente para conectarnos a la base de datos PostgreSQL
import { PrismaClient } from '@prisma/client';

// Crear una instancia del cliente de Prisma
// Esta variable nos permite hacer consultas a la base de datos
const clienteDePrisma = new PrismaClient();

// ============================================================================
// FUNCION PRINCIPAL: Registrar todas las rutas relacionadas con usuarios
// ============================================================================
// Esta funcion se llama desde index.ts para registrar todas las rutas
// Parametro: fastify = el servidor donde registramos las rutas
export async function usuariosRoutes(servidorFastify: FastifyInstance) {
    
    // ========================================================================
    // RUTA NUMERO 1: REGISTRO DE NUEVOS USUARIOS
    // ========================================================================
    // Metodo HTTP: POST (para crear datos nuevos)
    // URL completa: http://localhost:3000/registro
    // Que hace: Permite que un usuario nuevo se registre en la aplicacion
    servidorFastify.post('/registro', async (peticionDelCliente, respuestaAlCliente) => {
        
        // PASO 1: Extraer los datos que el cliente envio en el body
        // IMPORTANTE: El HTML envia "contrasenya", no "password"
        const datosDelBody = peticionDelCliente.body as { 
            nombre: string, 
            email: string, 
            contrasenya: string  // ← CORREGIDO: ahora coincide con el HTML
        };
        
        // Guardar cada dato en una variable separada para mas claridad
        const nombreDelNuevoUsuario = datosDelBody.nombre;
        const emailDelNuevoUsuario = datosDelBody.email;
        const passwordDelNuevoUsuario = datosDelBody.contrasenya;  // ← CORREGIDO
        
        // PASO 1.5: VALIDAR que todos los campos existan
        if (!nombreDelNuevoUsuario || !emailDelNuevoUsuario || !passwordDelNuevoUsuario) {
            return respuestaAlCliente.status(400).send({
                error: 'Faltan campos obligatorios',
                mensaje: 'Debes enviar nombre, email y contrasenya'
            });
        }
        
        // PASO 2: Verificar si el email ya esta registrado en la base de datos
        // Hacemos una consulta a PostgreSQL para buscar si existe un usuario con ese email
        const usuarioYaExiste = await clienteDePrisma.usuario.findUnique({
            where: { email: emailDelNuevoUsuario }
        });
        
        // PASO 3: Si el email ya existe, retornar un error
        if (usuarioYaExiste) {
            return respuestaAlCliente.status(400).send({
                error: 'El email ya esta registrado',
                mensaje: 'Usa otro email o haz login'
            });
        }
        
        // PASO 4: Crear el nuevo usuario en la base de datos PostgreSQL
        // IMPORTANTE: Los nombres de campos deben coincidir con el schema.prisma
        const usuarioRecienCreado = await clienteDePrisma.usuario.create({
            data: {
                nombreCompleto: nombreDelNuevoUsuario,        // ← Schema usa "nombreCompleto"
                email: emailDelNuevoUsuario,
                passwordHasheado: passwordDelNuevoUsuario     // ← Schema usa "passwordHasheado"
                // NOTA IMPORTANTE: En produccion, la password deberia estar cifrada con bcrypt
            }
        });
        
        // PASO 5: Retornar una respuesta exitosa al cliente
        // NO enviamos la password en la respuesta (seguridad)
        respuestaAlCliente.send({
            mensaje: 'Usuario registrado exitosamente',
            usuario: {
                id: usuarioRecienCreado.id,
                nombre: usuarioRecienCreado.nombreCompleto,
                email: usuarioRecienCreado.email,
                fechaCreacion: usuarioRecienCreado.fechaDeCreacion
            }
        });
    });
    
    // ========================================================================
    // RUTA NUMERO 2: LOGIN (Iniciar sesion)
    // ========================================================================
    // Metodo HTTP: POST
    // URL completa: http://localhost:3000/login
    // Que hace: Verifica email y password, y devuelve un token JWT
    servidorFastify.post('/login', async (peticionDelCliente, respuestaAlCliente) => {
        
        // PASO 1: Obtener el email y password que el cliente envio
        const datosDelBody = peticionDelCliente.body as { 
            email: string, 
            contrasenya: string  // ← CORREGIDO: coincide con HTML
        };
        const emailIngresado = datosDelBody.email;
        const passwordIngresada = datosDelBody.contrasenya;  // ← CORREGIDO
        
        // PASO 2: Buscar el usuario en la base de datos por su email
        const usuarioEncontrado = await clienteDePrisma.usuario.findUnique({
            where: { email: emailIngresado }
        });
        
        // PASO 3: Si el usuario no existe, retornar error
        if (!usuarioEncontrado) {
            return respuestaAlCliente.status(401).send({
                error: 'Usuario no encontrado',
                mensaje: 'El email no esta registrado'
            });
        }
        
        // PASO 4: Verificar que la password sea correcta
        // Comparamos la password ingresada con la guardada en la base de datos
        const passwordEsCorrecta = (passwordIngresada === usuarioEncontrado.passwordHasheado);  // ← CORREGIDO
        
        if (!passwordEsCorrecta) {
            return respuestaAlCliente.status(401).send({
                error: 'Password incorrecta',
                mensaje: 'Verifica tu password'
            });
        }
        
        // PASO 5: Crear un token JWT con los datos del usuario
        // Este token es como un "carnet de identidad" digital
        // El cliente guardara este token y lo enviara en cada peticion protegida
        const tokenJWT = servidorFastify.jwt.sign(
            {
                // Datos que guardamos en el token
                id: usuarioEncontrado.id,
                email: usuarioEncontrado.email,
                nombre: usuarioEncontrado.nombreCompleto  // ← CORREGIDO
            },
            {
                // Tiempo de expiracion del token
                expiresIn: '7d'  // El token dura 7 dias
            }
        );
        
        // PASO 6: Retornar el token y los datos del usuario
        respuestaAlCliente.send({
            mensaje: 'Login exitoso',
            token: tokenJWT,
            usuario: {
                id: usuarioEncontrado.id,
                nombre: usuarioEncontrado.nombreCompleto,  // ← CORREGIDO
                email: usuarioEncontrado.email
            }
        });
    });
    
    // ========================================================================
    // RUTA NUMERO 3: LISTAR TODOS LOS USUARIOS (ruta publica, no necesita token)
    // ========================================================================
    // Metodo HTTP: GET (para obtener datos)
    // URL completa: http://localhost:3000/get_usuarios
    // Que hace: Retorna la lista completa de usuarios registrados
    servidorFastify.get('/get_usuarios', async (peticionDelCliente, respuestaAlCliente) => {
        
        // PASO 1: Obtener todos los usuarios de la base de datos
        // findMany() = "SELECT * FROM usuarios"
        const listaDeTodosLosUsuarios = await clienteDePrisma.usuario.findMany({
            select: {
                // Especificamos que campos queremos obtener
                id: true,                     // SI queremos el ID
                nombreCompleto: true,         // SI queremos el nombre (CORREGIDO)
                email: true,                  // SI queremos el email
                fechaDeCreacion: true,        // SI queremos la fecha de creacion (CORREGIDO)
                passwordHasheado: false       // NO queremos la password (seguridad)
            }
        });
        
        // PASO 2: Retornar la lista de usuarios al cliente
        respuestaAlCliente.send({
            total: listaDeTodosLosUsuarios.length,
            usuarios: listaDeTodosLosUsuarios
        });
    });
    
    // ========================================================================
    // RUTA NUMERO 4: OBTENER UN USUARIO ESPECIFICO POR SU ID
    // ========================================================================
    // Metodo HTTP: GET
    // URL completa: http://localhost:3000/get_usuario/5
    // Que hace: Retorna los datos de un usuario especifico
    servidorFastify.get('/get_usuario/:id', async (peticionDelCliente, respuestaAlCliente) => {
        
        // PASO 1: Obtener el ID de los parametros de la URL
        // Si la URL es /get_usuario/5, entonces params.id = "5"
        const parametrosDeLaURL = peticionDelCliente.params as { id: string };
        const idDelUsuarioBuscado = parseInt(parametrosDeLaURL.id);
        
        // PASO 2: Buscar el usuario en la base de datos por su ID
        const usuarioEncontrado = await clienteDePrisma.usuario.findUnique({
            where: { id: idDelUsuarioBuscado },
            select: {
                id: true,
                nombreCompleto: true,         // CORREGIDO
                email: true,
                fechaDeCreacion: true,        // CORREGIDO
                passwordHasheado: false       // NO enviamos la password
            }
        });
        
        // PASO 3: Si no existe el usuario, retornar error 404
        if (!usuarioEncontrado) {
            return respuestaAlCliente.status(404).send({
                error: 'Usuario no encontrado',
                mensaje: `No existe un usuario con ID ${idDelUsuarioBuscado}`
            });
        }
        
        // PASO 4: Retornar los datos del usuario encontrado
        respuestaAlCliente.send(usuarioEncontrado);
    });
    
    // ========================================================================
    // RUTA NUMERO 5: ACTUALIZAR DATOS DE UN USUARIO (ruta protegida)
    // ========================================================================
    // Metodo HTTP: PUT (para actualizar datos)
    // URL completa: http://localhost:3000/put_usuario/5
    // Que hace: Permite actualizar nombre o email de un usuario
    // IMPORTANTE: Necesita token JWT (solo puedes editar TU perfil)
    servidorFastify.put('/put_usuario/:id', {
        onRequest: [servidorFastify.authenticate]
    }, async (peticionDelCliente, respuestaAlCliente) => {
        
        // PASO 1: Obtener los datos del token JWT verificado
        // Cuando se verifica el token, Fastify guarda los datos en request.user
        const datosDelTokenJWT = peticionDelCliente.user as { 
            id: number, 
            email: string, 
            nombre: string 
        };
        
        // PASO 2: Obtener el ID de la URL
        const parametrosDeLaURL = peticionDelCliente.params as { id: string };
        const idDeLaURLQueQuieroActualizar = parseInt(parametrosDeLaURL.id);
        
        // PASO 3: Verificar que el usuario solo pueda editar SU PROPIO perfil
        // El ID del token debe ser igual al ID de la URL
        const elUsuarioPuedeEditarEstePerfil = (datosDelTokenJWT.id === idDeLaURLQueQuieroActualizar);
        
        if (!elUsuarioPuedeEditarEstePerfil) {
            return respuestaAlCliente.status(403).send({
                error: 'Acceso denegado',
                mensaje: 'Solo puedes editar tu propio perfil'
            });
        }
        
        // PASO 4: Obtener los nuevos datos del body
        const datosNuevosDelBody = peticionDelCliente.body as { 
            nombre?: string, 
            email?: string 
        };
        
        // PASO 5: Actualizar el usuario en la base de datos
        // Solo actualizamos los campos que se enviaron
        const usuarioDespuesDeActualizar = await clienteDePrisma.usuario.update({
            where: { id: idDeLaURLQueQuieroActualizar },
            data: {
                // Si se envio nombre, actualizarlo
                ...(datosNuevosDelBody.nombre && { nombreCompleto: datosNuevosDelBody.nombre }),  // CORREGIDO
                // Si se envio email, actualizarlo
                ...(datosNuevosDelBody.email && { email: datosNuevosDelBody.email })
            }
        });
        
        // PASO 6: Retornar respuesta exitosa
        respuestaAlCliente.send({
            mensaje: 'Usuario actualizado correctamente',
            usuario: {
                id: usuarioDespuesDeActualizar.id,
                nombre: usuarioDespuesDeActualizar.nombreCompleto,  // CORREGIDO
                email: usuarioDespuesDeActualizar.email
            }
        });
    });
    
    // ========================================================================
    // RUTA NUMERO 6: ELIMINAR UN USUARIO (ruta protegida)
    // ========================================================================
    // Metodo HTTP: DELETE (para eliminar datos)
    // URL completa: http://localhost:3000/delete_usuarios/5
    // Que hace: Elimina un usuario de la base de datos
    // IMPORTANTE: Solo puedes eliminar TU PROPIA cuenta
    servidorFastify.delete('/delete_usuarios/:id', {
        onRequest: [servidorFastify.authenticate]
    }, async (peticionDelCliente, respuestaAlCliente) => {
        
        // PASO 1: Obtener datos del token JWT
        const datosDelTokenJWT = peticionDelCliente.user as { id: number };
        
        // PASO 2: Obtener el ID de la URL
        const parametrosDeLaURL = peticionDelCliente.params as { id: string };
        const idQueQuieroEliminar = parseInt(parametrosDeLaURL.id);
        
        // PASO 3: Verificar que solo puedas eliminar TU cuenta
        const puedeEliminarEstaCuenta = (datosDelTokenJWT.id === idQueQuieroEliminar);
        
        if (!puedeEliminarEstaCuenta) {
            return respuestaAlCliente.status(403).send({
                error: 'Acceso denegado',
                mensaje: 'Solo puedes eliminar tu propia cuenta'
            });
        }
        
        // PASO 4: Verificar que el usuario exista antes de eliminarlo
        const usuarioQueVamosAEliminar = await clienteDePrisma.usuario.findUnique({
            where: { id: idQueQuieroEliminar }
        });
        
        if (!usuarioQueVamosAEliminar) {
            return respuestaAlCliente.status(404).send({
                error: 'Usuario no encontrado'
            });
        }
        
        // PASO 5: Eliminar el usuario de la base de datos
        // DELETE FROM usuarios WHERE id = ?
        await clienteDePrisma.usuario.delete({
            where: { id: idQueQuieroEliminar }
        });
        
        // PASO 6: Retornar respuesta exitosa
        respuestaAlCliente.send({
            mensaje: 'Usuario eliminado correctamente',
            usuarioEliminado: {
                id: usuarioQueVamosAEliminar.id,
                nombre: usuarioQueVamosAEliminar.nombreCompleto  // CORREGIDO
            }
        });
    });
}