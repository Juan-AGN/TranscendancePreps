// ============================================================================
// IMPORTACIONES
// ============================================================================
import type { FastifyInstance } from 'fastify';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

const clienteDePrisma = new PrismaClient();

// ============================================================================
// RUTAS DE AUTENTICACIÓN OAUTH 2.0 CON 42
// ============================================================================
export async function authRoutes(servidorFastify: FastifyInstance) {

    // ========================================================================
    // RUTA 1: INICIAR LOGIN CON 42
    // ========================================================================
    // El usuario hace click en "Login con 42" y le redirigimos a la Intra
    // Metodo HTTP: GET
    // URL: http://localhost:3000/auth/42
    servidorFastify.get('/auth/42', async (peticionDelCliente, respuestaAlCliente) => {

        const clientId      = process.env.FORTY_TWO_CLIENT_ID;
        const redirectUri   = process.env.FORTY_TWO_REDIRECT_URI;

        // Construimos la URL de autorización de 42
        // 42 redirigirá al usuario aquí para que inicie sesión en su cuenta
        const urlDe42 = `https://api.intra.42.fr/oauth/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri!)}&response_type=code`;

        // Redirigir al usuario a la página de login de 42
        return respuestaAlCliente.redirect(urlDe42);
    });

    // ========================================================================
    // RUTA 2: CALLBACK — 42 nos devuelve el usuario aquí
    // ========================================================================
    // Después de que el usuario acepta en la Intra, 42 llama a esta URL
    // con un 'code' temporal que intercambiamos por un token de acceso
    // Metodo HTTP: GET
    // URL: http://localhost:3000/auth/42/callback?code=XXXXXX
    servidorFastify.get('/auth/42/callback', async (peticionDelCliente, respuestaAlCliente) => {

        try {
            // PASO 1: Obtener el 'code' que nos manda 42 en la URL
            const { code } = peticionDelCliente.query as { code: string };

            if (!code) {
                return respuestaAlCliente.status(400).send({ error: 'No se recibió el código de autorización' });
            }

            // PASO 2: Intercambiar el 'code' por un access_token de 42
            // Hacemos un POST a la API de 42 con nuestras credenciales + el code
            const respuestaDe42 = await fetch('https://api.intra.42.fr/oauth/token', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    grant_type:    'authorization_code',
                    client_id:     process.env.FORTY_TWO_CLIENT_ID,
                    client_secret: process.env.FORTY_TWO_CLIENT_SECRET,
                    code:          code,
                    redirect_uri:  process.env.FORTY_TWO_REDIRECT_URI
                })
            });

            const tokenData = await respuestaDe42.json() as { access_token: string };

            if (!tokenData.access_token) {
                return respuestaAlCliente.status(401).send({ error: 'No se pudo obtener el token de 42' });
            }

            // PASO 3: Usar el access_token para obtener los datos del usuario de 42
            const respuestaUsuario42 = await fetch('https://api.intra.42.fr/v2/me', {
                headers: { Authorization: `Bearer ${tokenData.access_token}` }
            });

            const datosUsuario42 = await respuestaUsuario42.json() as {
                id:         number;
                login:      string;
                email:      string;
                image:      { link: string };
            };

            // PASO 4: Buscar si el usuario ya existe en nuestra BD por su ID de 42
            let usuario = await clienteDePrisma.usuario.findUnique({
                where: { fortyTwoId: datosUsuario42.id }
            });

            // PASO 5: Si no existe, crearlo (primer login con 42)
            if (!usuario) {
                usuario = await clienteDePrisma.usuario.create({
                    data: {
                        nombre:     datosUsuario42.login,
                        email:      datosUsuario42.email,
                        password:   null,   // los usuarios de OAuth no tienen contraseña
                        avatar:     datosUsuario42.image?.link || 'default-avatar.png',
                        fortyTwoId: datosUsuario42.id,
                        estadoOnline: true
                    }
                });
            } else {
                // Si ya existe, actualizar estado a online
                await clienteDePrisma.usuario.update({
                    where: { id: usuario.id },
                    data: { estadoOnline: true }
                });
            }

            // PASO 6: Generar nuestro propio JWT (igual que en el login normal)
            const token = jwt.sign(
                { id: usuario.id, email: usuario.email },
                process.env.JWT_SECRET || 'secreto-super-seguro',
                { expiresIn: '24h' }
            );

            // PASO 7: Redirigir al frontend con el token en la URL
            // El frontend lo leerá y lo guardará en localStorage
            const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
            return respuestaAlCliente.redirect(
                `${frontendUrl}/perfil?token=${token}&userId=${usuario.id}`
            );

        } catch (error) {
            console.error('Error en OAuth callback:', error);
            const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
            return respuestaAlCliente.redirect(`${frontendUrl}/?error=oauth_failed`);
        }
    });
}