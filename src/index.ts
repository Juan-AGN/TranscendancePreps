import Fastify from 'fastify';
import cors from '@fastify/cors';
import { usuariosRoutes } from './routes/usuarios';
import { amigosRoutes } from './routes/amigos';
import { postsRoutes } from './routes/posts';

async function main() {
    const fastify = Fastify();
    
    await fastify.register(cors, {
        methods: ['GET', 'POST', 'DELETE', 'PUT']
    });

    // Registrar todas las rutas
    await fastify.register(usuariosRoutes);
    await fastify.register(amigosRoutes);
    await fastify.register(postsRoutes);

    // Servidor
    fastify.listen({port: 3000}, () => {
        console.log('🚀 API escuchando en http://localhost:3000\n');
        console.log('📚 Módulo de Gestión de Usuarios - Daniel\n');
        console.log('\n✅ USUARIOS:');
        console.log('   POST   /registro');
        console.log('   POST   /login');
        console.log('   GET    /get_usuarios');
        console.log('   GET    /get_usuario/:id');
        console.log('   PUT    /put_usuario/:id');
        console.log('   DELETE /delete_usuarios/:id');
        console.log('\n✅ AMIGOS:');
        console.log('   POST   /usuarios/:userId/enviar_solicitud/:amigo_id');
        console.log('   POST   /usuarios/:userId/aceptar_solicitud/:amigo_id');
        console.log('   GET    /usuarios/:userId/mis_amigos');
        console.log('   DELETE /usuarios/:userId/eliminar_amigo/:amigo_id');
        console.log('\n✅ POSTS:');
        console.log('   POST   /usuarios/:userId/posts');
        console.log('   GET    /usuarios/:userId/posts');
        console.log('   GET    /usuarios/:userId/posts/:postId');
        console.log('   DELETE /usuarios/:userId/posts/:postId');
        console.log('   DELETE /usuarios/:userId/posts');
    });
}

main();