import Fastify from 'fastify';
import cors from '@fastify/cors';
import {promises as fs} from 'fs';
import {PrismaClient} from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const fastify = Fastify();
    await fastify.register(cors, {
        methods: ['GET', 'POST', 'DELETE', 'PUT']
    });

    // INTERFACES
    interface interf_Usuarios {
        id_user: number;
        nombre: string;
        email: string;
        password: string;
        amigos: number[]; // IDs de amigos
        solicitudes_enviadas: number[];
        solicitudes_recibidas: number[];
    }

    interface interf_posts {
        id_post: number;
        user_id: number;
        contenido: string;
    }

    // ARRAYS
    let array_Usuarios: interf_Usuarios[] = await leerUsuarios();
    let array_Posts: interf_posts[] = await leerPosts();


    // Generar id de cada usuario
    function generarIdUsuario(): number {
        if (array_Usuarios.length === 0)
            return 1;
        else{
            const idsExistentes = array_Usuarios.map(usuario => usuario.id_user);
            const idMasAlto = Math.max(...idsExistentes);
            return idMasAlto + 1;
        }
    }

    // ================ FUNCIONES DE GESTIÓN DE ARCHIVOS ================
    async function leerPosts(){
        try {
            const datos_leidos = await fs.readFile('posts.json', 'utf-8');
            return JSON.parse(datos_leidos);
        }catch(error){
            return [];
        }
    }

    async function guardarPosts(array_Posts: interf_posts[]) {
        await fs.writeFile('posts.json', JSON.stringify(array_Posts, null, 2));
    }
    
    async function leerUsuarios() {
        try {
            const datos = await fs.readFile('usuarios.json', 'utf-8'); //devuelve una cadena larga
            return JSON.parse(datos); // convierte texto a objeto JS
        }catch(error){
            return [];
        }
    }

    async function guardarUsuarios(array_Usuarios: interf_Usuarios[]) {
            // JSON.stringify = convierte objeto JS a texto (stringifica...)
        await fs.writeFile('usuarios.json', JSON.stringify(array_Usuarios, null, 2));
    }


    // ================ RUTAS PARA GESTIÓN DE USUARIOS ================
    const TOKEN = 'mi_token';
    
    /* RUTA DE REGISTRO SIN BD
    fastify.post('/registro', async (request, response) => {  
        // en POST los datos se extraen del "body" no de "params"
            // necesita que la request (CURL) contenga el "content-type: application/json"
        
        const nuevo_ID = generarIdUsuario();
        const nombre = (request.body as interf_Usuarios).nombre;
        const email = (request.body as interf_Usuarios).email;
        const password = (request.body as interf_Usuarios).password;

        // Comrpobar si ya existe el mail
        const existe = array_Usuarios.find(user => user.email === email);
        if(existe)
            return response.status(400).send("Ya existe el usuario");

        // creo un objeto para poderlo pushear
        const new_user: interf_Usuarios = { // no es obligatorio expecificar el tipado pero es + seguro
            id_user: nuevo_ID, 
            nombre, 
            email, 
            password, 
            amigos: [], // inicializo las var que no tengo q asignar con arrays vacíos 
            solicitudes_enviadas: [], // vacíos porque al ser nuevo usuario no tiene amigos...
            solicitudes_recibidas: []
        };
        
        // Push espera un objeto ({nombre}) por lo que no se puede mandar variables sueltas (nombre).
        array_Usuarios.push(new_user);

        // Guardado array en el archivo (await para que no avance el programa hasta q no termine de guardar)
        await guardarUsuarios(array_Usuarios);
        response.send('Usuario guardado'); // sin send se queda esperando...
    }); */

    // RUTA DE REGISTRO CON BD
    fastify.post('/registro', async (request, response) => {
        const {nombre, email, password} = request.body as {nombre: string, email: string, password: string};
        
        // Verificar si existe (Prisma lo hace automático por el @unique)
                              // con "prisma" obligatorio siempre con 'async' 'await'
        const usuarioExiste = await prisma.usuario.findUnique({
            where: { email }
        });
        
        if(usuarioExiste)
            return response.status(400).send('El email ya está registrado');

        // Crear usuario (Prisma genera el ID automáticamente)
        const nuevoUsuario = await prisma.usuario.create({
            data: {
                nombre,
                email,
                password
                // amigos, solicitudes... ya tienen valores por defecto
            }
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

    fastify.post('/login', async (request, response) => {
        const email = (request.body as {email:string}).email;
        const password = (request.body as {password:string}).password;

        /* // Obtengo el usuario que buscado en el array
        const usuario_Buscado = array_Usuarios.find(user => user.email === email); */
        
        // Obtengo el usuario que buscado en la BD
        const usuario_Buscado = await prisma.usuario.findUnique({
            where: {email}
        });

        //Compruebo que esté registrado ese email
        if (!usuario_Buscado)
            return response.status(401).send("Usuario no registrado");

        //Compruebo la contraseña
        if(password !== usuario_Buscado.password) // sin async/await peta
            return response.status(401).send("Contraseña incorrecta");

        // Login exitoso
        response.send({
            mensaje: 'Login exitoso',
            token: `${TOKEN}_${usuario_Buscado.id}`,  // Token con ID del usuario
            usuario: {
                id: usuario_Buscado.id,
                nombre: usuario_Buscado.nombre
            }
        });
        // NOTAS:
        //  - el "login" se hace con "POST" en vez de con "GET" porque 
        // GET envía todo por URL -> datos sensibles visibles, 
        // POST no solo crea, también cuando se modifica/actualizan datos en el servidor
    });

    
/*  RUTA DE OBTENCION DE TODOS LOS USUARIOS SIN BD  
    fastify.get('/get_usuarios', (request, response) => {
        response.send(array_Usuarios);
    }); */

    // RUTA DE OBTENCION DE TODOS LOS USUARIOS CON BD
    fastify.get('/get_usuarios', async (request, response) => {
        const usuarios = await prisma.usuario.findMany({
            select: {
                id: true,
                nombre: true,
                email: true,
                createdAt: true
                // password: false (no lo devolvemos)
        }
    });
    
    response.send(usuarios);
});

    fastify.get('/get_usuario/:id', async(request, response) => {
        // Extraigo el id del usuario que busca de los parámetros
        const id_buscado = (request.params as {id: string}).id;

        /* // Extraigo el usuario buscado del array
        const usuario_buscado = array_Usuarios.find(user => user.id_user === parseInt(id_buscado)); */
        // Extraigo el usuario buscado de la BD
        const usuario_buscado = await prisma.usuario.findUnique({
            where: {
                id: parseInt(id_buscado)
            },
            select: {
                id: true,
                nombre: true,
                email: true,
                createdAt: true
                // password: false -> no queremos que lo muestre
            }
        });

        // Compruebo que el usuario buscado exista
        if (!usuario_buscado)
            return response.status(404).send({error: 'Usuario no existe'});

        // Devuelvo el usuario buscado
        response.send(usuario_buscado);
    });

    /*  ENDPOINT BORRAR USUARIO POR ID (CON ARRAY)   
    fastify.delete('/delete_usuarios/:id', async (request, response) => {
        const token = request.headers['authorization'];
        if(!token)
            return response.status(401).send('Unauthorized');
        
        const {id} = request.params as {id: string};

        const nombre_a_borrar = array_Usuarios.findIndex(user => user.id_user === parseInt(id));

        if (nombre_a_borrar == -1)
            return response.status(404).send("no existe ese usuario");
        array_Usuarios.splice(nombre_a_borrar, 1);
        response.send("nombre eliminado");
        await guardarUsuarios(array_Usuarios);
    }); */

    // ENDPOINT BORRAR USUARIO POR ID (CON ARRAY)   
    fastify.delete('/delete_usuarios/:id', async (request, response) => {
        const token = request.headers['authorization'];
        if (token !== TOKEN)  // verificar TOKEN
            return response.status(401).send('Unauthorized');

        const {id} = request.params as {id: string};

        try {
            // Todo en una línea con Prisma
            await prisma.usuario.delete({ // Si lo encuentra, lo borra directamente
                where: { id: parseInt(id) } // Busca el user con ese ID
            });
            // ↑ Busca + Elimina + Guarda automáticamente
            // Si no existe, lanza error (por eso el try/catch)
            
            response.send("Usuario eliminado");
        } catch (error) {
            return response.status(404).send("Usuario no existe");
        }
    });

    fastify.put('/put_usuario/:id', async (request, response) => {
        const id_Buscado = (request.params as {nombre: string}).nombre;
        const nombre_buscado = (request.params as {nombre:string}).nombre;
        const email_buscado = (request.params as {email:string}).email;

        const usuario_Encontrado = array_Usuarios.find(user => user.nombre === id_Buscado);

        if (!usuario_Encontrado)
            response.send('No encontrado');
        else{
            const {email} = request.body as {email: string};
            usuario_Encontrado.email = email;

            // Guardo en archivo
            await guardarUsuarios(array_Usuarios);

            response.send('Actualizado');
        }
    });


    // ==================== RUTAS PARA AMIGOS ====================
    // Enviar solicitud de amistad
    fastify.post('/usuarios/:id/solicitud_amistad/:id_amigo', async (request, response) => {
                                                //":" indica campo dinámico -> que lo aportas tu
        // Compruebo el TOKEN
        const token = request.headers['authorization'];
        if(token !== TOKEN)
            return response.status(401).send('Unauthorized');

        // Extraigo ambos ID's
        const id_solicita = (request.params as {id:string}).id; // id corresponde a ":id" en la RUTA
        const id_recibe = (request.params as {id_amigo:string}).id_amigo;

        // Obtengo objeto de ambos usuarios mediante comprobación del ID
        const usuario_solicita = array_Usuarios.find(user=> user.id_user === parseInt(id_solicita));
        const usuario_recibe = array_Usuarios.find(user => user.id_user === parseInt(id_recibe));

        // Compruebo que ambos existan
        if(!usuario_solicita || !usuario_recibe)
            return response.status(400).send("Usuario no encontado");

        // Compruebo si ya son amigos
        if(usuario_solicita.amigos.includes(parseInt(id_recibe)))
            return response.status(400).send("Ya son amigos");

        // Pusheo solicitudes al usuario correspondiente
        usuario_solicita.solicitudes_enviadas.push(parseInt(id_recibe));
        usuario_recibe.solicitudes_recibidas.push(parseInt(id_solicita));

        // Guardo cambios en archivo
        await guardarUsuarios(array_Usuarios);
        response.send('Solicitud enviada');
    });

    // Aceptar la solicitud de amistad
    fastify.post('/usuarios/:id_recibido/aceptar_amistad/:id_enviado', async (request, response) => {
        const token = request.headers['authorization'];

        // Verificar el TOKEN
        if (token !== TOKEN)
            return response.status(401).send('Unauthorizated');

        // Extraer ID de ambos amigos
        const id_param_sol_recibida = (request.params as {id_recibido: string}).id_recibido;
        const id_param_sol_enviada = (request.params as {id_enviado: string}).id_enviado;

        // Buscar ambos usuarios
        const usuario_sol_recibida = array_Usuarios.find(user => user.id_user === parseInt(id_param_sol_recibida));
        const usuario_sol_enviada = array_Usuarios.find(user => user.id_user === parseInt(id_param_sol_enviada));

        // Verificar que ambos usuarios existen
        if(!usuario_sol_enviada || !usuario_sol_recibida)
            return response.status(404).send('Usuario no encontrado');

        // Verificar que existe la solicitud pendiente de ese ID (el array del solicitado 'incluye' el ID del solicitante)
        const tiene_solicitud = usuario_sol_recibida?.solicitudes_recibidas.includes(parseInt(id_param_sol_enviada));
        
        // Verificar que no sean ya amigos
        if(!tiene_solicitud)
            return response.status(404).send('Ya son amigos');

        // Añadir a la lista de amigos de ambos usuarios
        usuario_sol_recibida?.amigos.push(parseInt(id_param_sol_enviada));
        usuario_sol_enviada?.amigos.push(parseInt(id_param_sol_recibida));

        // Eliminar de solicitudes_amistad del que acepta
        const index_sol_recibida = usuario_sol_recibida?.solicitudes_recibidas.indexOf(parseInt(id_param_sol_enviada));
        usuario_sol_recibida?.solicitudes_recibidas.splice(index_sol_recibida, 1);

        // Eliminar de solicitudes_enviadas del que envió
        const index_sol_enviada = usuario_sol_enviada?.solicitudes_enviadas.indexOf(parseInt(id_param_sol_recibida));
        usuario_sol_enviada?.solicitudes_enviadas.splice(index_sol_enviada, 1);

        // Guardar cambios
        await guardarUsuarios(array_Usuarios);
        
        // Devolver respuesta con cambios realizados
        response.send({
            mensaje: ' Amistad recibida',
            usuario1: {
                "id": usuario_sol_enviada?.id_user,
                "nombre": usuario_sol_enviada?.nombre,
                "totalAmigos": usuario_sol_enviada?.amigos.length,
                "amigos": usuario_sol_enviada?.amigos
            },
            usuario2: {
                "id": usuario_sol_recibida?.id_user,
                "nombre": usuario_sol_recibida?.nombre,
                "totalAmigos": usuario_sol_recibida?.amigos.length,
                "amigos": usuario_sol_recibida?.amigos
            }
        });
    });
    


    // ==================== RUTAS PARA GESTIONAR MI PERFIL ====================
    // Ruta para ver MI perfil (requiere autenticación)
    fastify.get('/api/users/mi_perfil', async (request, response) => {

        // Compruebo el Token
        const token = request.headers['authorization']; // se usan [] en vez de '.' xq con '.' no admite nombres con guiones
        if(!token || token !== TOKEN)                   // funciona igual si accedes a las prop. del obj con [] q con '.'
            response.status(401).send('Unauthorized');

        // Buscar mi usuario en array (provisional)
        const usuario = array_Usuarios[7];

        // Devolver los datos de mi usuario
        response.send({
            // tu decides como llamar a los campos (id, nombre, etc)
            id: usuario?.id_user, 
            nombre: usuario?.nombre,
            email: usuario?.email,
            amigos: usuario?.amigos.length
        });
    })

    // Ruta para editar MI perfil
    fastify.put('/api/users/mi_perfil', async (request, response) => {
        
        // Compruebo el Token
        const token = request.headers['authorization'];
        if(!token || token !== TOKEN)
            return response.status(401).send('Unathorized');

        // Extraigo el nuevo nopmbre y/o email de la request
        const nuevo_nombre = (request.body as {nombre: string}).nombre;
        const nuevo_email = (request.body as {email: string}).email;

        // Obtengo mi usuario (como objeto)
        const mi_usuario = array_Usuarios[7]; //simulación [7]

        // Compruebo que mi usuario exista
        if(!mi_usuario)
            return response.status(404).send('Usuario no encontrado');
        // Actualizo el campo que haya enviado a cambiar (nombre y/o email)
        if (nuevo_nombre)
            mi_usuario.nombre = nuevo_nombre;

        if (nuevo_email)
            mi_usuario.email = nuevo_email;

        // Guardo cambios en el array
        await guardarUsuarios(array_Usuarios);

        // Envío respuesta
        response.send({mensaje: 'Perfil actualizado', mi_usuario});
                                // mi_usuario, al ser una variable (no le asigno texto, 
                                // no me la puedo inventar, debe coincidir)
    });

    // Listar MIS amigos
    fastify.get('/api/users/mi_perfil/mis_amigos', async (request, response) => {
        const token = request.headers['authorization'];
        if(!token || token !== TOKEN)
            return response.status(401).send('Unauthorizated');

        // Extraigo el objeto de mi usuario
        const mi_usuario = array_Usuarios[8];

        // Compruebo que mi usuario existe (necesario para usarlo + adelante)
        if (!mi_usuario)
            return response.status(404).send('No existe el usuario');

        const mis_amigos = array_Usuarios.filter(user => 
            mi_usuario.amigos.includes(user.id_user));

        response.send({
            totalAmigos: mis_amigos.length,
            amigos: mis_amigos.map(a => ({ // "map" sirve para filtrar lo q quieres q devuelva
                id: a.id_user,             // ideal para no mostrar contraseñas, etc.
                nombre: a.nombre,
                email: a.email
            }))
        });
    });

    // Eliminar amigo
    fastify.delete('/api/users/:id/eliminar_amigo', async (request, response) => {
        const token = request.headers['authorization'];
        if(!token)
            return response.status(401).send('Unauthorized');

        const id_buscado = (request.params as {id: string}).id;
        const usuario_actual = array_Usuarios[8];

        // Compruebo que he podido obtener el usuario actual
        if(!usuario_actual)
            return response.status(401).send('Usuario no encontrado');

        // ELIMINAR DE AMBAS LISTAS DE AMIGOS
        // Busco posición del amigo en el array de amigos
        const pos_amigo = usuario_actual?.amigos.indexOf(parseInt(id_buscado));

        // Compruebo que son amigos
        if (pos_amigo === -1)
            return response.status(404).send('No son amigos');

        // Elimino al amigo de mi array
        usuario_actual?.amigos.splice(pos_amigo, 1);

        // Elimino mi usuario del array de mi ex-amigo 
        // Obtengo el objeto de mi amigo
        const ex_amigo = array_Usuarios.find(u => u.id_user === parseInt(id_buscado));
        
        // Compruebo que exista
        if(ex_amigo){ // error sin {} x el const...
            const index = ex_amigo.amigos.indexOf(usuario_actual?.id_user);

            // si lo encuentra, lo elimino del array
            if(index !== -1)
                ex_amigo.amigos.splice(index, 1);
        }
        

        await guardarUsuarios(array_Usuarios);
        response.send({mensaje: 'Amigo eliminado'});
    })


    
    // ==================== RUTAS PARA POSTS ====================
    // Generar id de cada Post
    function generarIdPost(): number {
        if (array_Posts.length === 0)
            return 1;
        const idsExistentes = array_Posts.map(post => post.id_post);
        const idMasAlto = Math.max(...idsExistentes);
        return idMasAlto + 1;
    }

    fastify.post('/usuarios/:user_ID/posts', async (request, response) => {
        // Checkeo del token
        const token_recibido = request.headers['authorization'];
        if(token_recibido !== TOKEN)
            return response.status(401).send({error: 'Unauthorized'});
        
        // Extraer ID del usuario y contenido del post
        const {user_ID} = request.params as {user_ID: string}; // mismo nombre q en la ruta
        const {contenido} = request.body as {contenido: string}; // el contenido viene en "body" no "params"
        
        // Verificar si el usuario existe
        const usuario = array_Usuarios.find(user => user.id_user === parseInt(user_ID));
        if(!usuario)
            return response.status(404).send({error: 'Usuario no encontrado'});
        
        // Creación del post
        const nuevo_post: interf_posts = {
            id_post: generarIdPost(),
            user_id: parseInt(user_ID),
            contenido: contenido
        };
        
        // Guardado del Post
        array_Posts.push(nuevo_post);
        await guardarPosts(array_Posts);
        
        // Respuesta
        response.status(201).send({ // admite enviar cualquier objeto JS)
            mensaje: 'Post creado',
            post: nuevo_post,
            usuario: {
                id: usuario.id_user,
                nombre: usuario.nombre
            }
        });
    });
    
    // RUTA PARA OBTENER POST DE UN USUARIO
    fastify.get('/usuarios/:user_ID/posts', (request, response) => { // aunque tenga misma ruta, el método es distinto(get)
        const {user_ID} = request.params as {user_ID: string}; // ambos deben ser iguales (user_ID)

        // Comprobar si el ID de usuario existe
        const usuario_buscado = array_Usuarios.find(user => user.id_user === parseInt(user_ID));

        // Sino, devuelve mensaje de error
        if (!usuario_buscado)
            return response.status(404).send("no existe ese usuario");

        // Busco cuantos posts tiene ese usuario
        const posts_del_usuario = array_Posts.filter(posts => posts.user_id === parseInt(user_ID));

        // Comprobar si ese usuario tiene almenos un post

        // devuelvo todos los posts de ese usuario
        response.send({
            usuarioBuscado: 
            {
                id: usuario_buscado.id_user,
                nombre: usuario_buscado.nombre
            },
            totalDePosts: posts_del_usuario.length,
            posts: posts_del_usuario
        });

    });


    // ======================== LISTEN ========================
    fastify.listen({port:3000}, () => {
        console.log('🚀 API escuchando en http://localhost:3000\n');
        console.log('📚 Rutas disponibles:\n');
        console.log('👥 USUARIOS:');
        console.log('   POST   /usuarios           → Crear usuario');
        console.log('   GET    /usuarios           → Listar usuarios');
        console.log('   GET    /usuarios/:id       → Obtener usuario');
        console.log('   PUT    /usuarios/:id       → Actualizar usuario');
        console.log('   DELETE /usuarios/:id       → Eliminar usuario\n');
        console.log('📝 POSTS:');
        console.log('   POST   /usuarios/:userId/posts         → Crear post');
        console.log('   GET    /usuarios/:userId/posts         → Listar posts del usuario');
        console.log('   GET    /usuarios/:userId/posts/:postId → Obtener post');
        console.log('   DELETE /usuarios/:userId/posts/:postId → Eliminar post');
        console.log('   DELETE /usuarios/:userId/posts         → Eliminar todos los posts');
    });
    
}

main();