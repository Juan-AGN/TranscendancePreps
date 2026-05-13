// ============================================================================
// IMPORTS
// ============================================================================
import type { FastifyInstance } from 'fastify';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';
import { authenticate } from '../middleware/auth.js';

const prismaClient = new PrismaClient();

// ============================================================================
// OAUTH 2.0 AUTHENTICATION ROUTES WITH 42
// ============================================================================
export async function authRoutes(server: FastifyInstance) {

    // ========================================================================
    // ROUTE 1: START LOGIN WITH 42
    // ========================================================================
    // User clicks "Login with 42" and we redirect them to the Intra
    // HTTP Method: GET
    // URL: http://localhost:3000/auth/42
    server.get('/auth/42', async (request, reply) => {

        const clientId      = process.env.FORTY_TWO_CLIENT_ID;
        const redirectUri   = process.env.FORTY_TWO_REDIRECT_URI;

        // Build the 42 authorization URL
        // 42 will redirect the user here to log in to their account
        const fortyTwoAuthUrl = `https://api.intra.42.fr/oauth/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri!)}&response_type=code`;

        // Redirect the user to the 42 login page
        return reply.redirect(fortyTwoAuthUrl);
    });

    // ========================================================================
    // ROUTE 2: CALLBACK — 42 returns the user here
    // ========================================================================
    // After the user accepts on the Intra, 42 calls this URL
    // with a temporary 'code' that we exchange for an access token
    // HTTP Method: GET
    // URL: http://localhost:3000/auth/42/callback?code=XXXXXX
    server.get('/auth/42/callback', async (request, reply) => {

        try {
            // STEP 1: Get the 'code' that 42 sends in the URL
            const { code } = request.query as { code: string };

            if (!code) {
                return reply.status(400).send({ error: 'Authorization code not received' });
            }

            // STEP 2: Exchange the 'code' for a 42 access_token
            // We make a POST to the 42 API with our credentials + the code
            const fortyTwoResponse = await fetch('https://api.intra.42.fr/oauth/token', {
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

            const tokenData = await fortyTwoResponse.json() as { access_token: string };

            if (!tokenData.access_token) {
                return reply.status(401).send({ error: 'Could not obtain 42 token' });
            }

            // STEP 3: Use the access_token to get the 42 user data
            const fortyTwoUserResponse = await fetch('https://api.intra.42.fr/v2/me', {
                headers: { Authorization: `Bearer ${tokenData.access_token}` }
            });

            const fortyTwoUserData = await fortyTwoUserResponse.json() as {
                id:         number;
                login:      string;
                email:      string;
                image:      { link: string };
            };

            // STEP 4: Check if the user already exists in our DB by their 42 ID
            let user = await prismaClient.user.findUnique({
                where: { fortyTwoId: fortyTwoUserData.id }
            });

            // STEP 4.5: If not found by fortyTwoId, check if they exist by email
            // This prevents creating duplicate users if someone registered with email/password first
            if (!user) {
                user = await prismaClient.user.findUnique({
                    where: { email: fortyTwoUserData.email }
                });

                // If they exist by email but don't have a fortyTwoId, link them
                if (user && !user.fortyTwoId) {
                    await prismaClient.user.update({
                        where: { id: user.id },
                        data: { fortyTwoId: fortyTwoUserData.id }
                    });
                }
            }

            // STEP 5: If not found in any way, create them (first login with 42)
            if (!user) {
                user = await prismaClient.user.create({
                    data: {
                        name:        fortyTwoUserData.login,
                        email:       fortyTwoUserData.email,
                        password:    null,   // OAuth users have no password
                        avatar:      fortyTwoUserData.image?.link || 'default-avatar.png',
                        fortyTwoId:  fortyTwoUserData.id,
                        onlineStatus: true
                    }
                });
            } else {
                // If they exist, update status to online
                await prismaClient.user.update({
                    where: { id: user.id },
                    data: { onlineStatus: true }
                });
            }

            // STEP 6: Generate our own JWT (same as in normal login)
            const token = jwt.sign(
                { id: user.id, email: user.email },
                process.env.JWT_SECRET || 'super-secure-secret',
                { expiresIn: '24h' }
            );

            // STEP 7: Redirect to the frontend with the token in the URL
            // The frontend will read it and save it in localStorage
            const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5174';
            return reply.redirect(
                `${frontendUrl}/profile?token=${token}&userId=${user.id}`
            );

        } catch (error) {
            console.error('Error in OAuth callback:', error);
            const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5174';
            return reply.redirect(`${frontendUrl}/?error=oauth_failed`);
        }
    });

    // ========================================================================
    // ROUTE 3: VERIFY TOKEN
    // ========================================================================
    // HTTP Method: GET
    // URL: http://localhost:3000/auth/me
    // This endpoint verifies if the Bearer token is valid and returns user info
    server.get('/auth/me', { preHandler: authenticate }, async (request, reply) => {
        return reply.send({ ok: true, user: request.user });
    });
}