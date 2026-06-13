// ============= NOTES
// CORRECT ROUTE ORDER (order matters here):
// 1. Fixed-text routes: /users/register
// 2. Fixed-text routes: /users/login
// 3. Fixed-text routes: /users/filter/online
// 4. Parameter + text routes: /users/:userId/avatar
// 5. Parameter + text routes: /users/:userId/status
// 6. Parameter-only routes: /users/:userId  <- LAST
// ====================

// ============================================================================
// REQUIRED IMPORTS
// ============================================================================
import type { FastifyInstance } from 'fastify';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

// For file handling (avatar)
import { randomUUID } from 'crypto';
import fs from 'fs'; // file System
import { pipeline } from 'stream/promises';
import path from 'path';
import { fileURLToPath } from 'url';

// Create Prisma client to access the database
const prismaClient = new PrismaClient();

// File path configuration
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ============================================================================
// MAIN FUNCTION: Register all user-related routes
// ============================================================================
export async function usersRoutes(server: FastifyInstance) {
    
    // ========================================================================
    // ROUTE 1: REGISTER NEW USER
    // ========================================================================
    // HTTP Method: POST
    // URL: http://localhost:3000/users/register
    server.post('/users/register', async (request, reply) => {
        
        // STEP 1: Get the data coming in the body (JSON)
        const bodyData = request.body as {
            name: string,
            email: string,
            password: string
        };
        
        // STEP 2: Validate all required fields are present
        if (!bodyData.name || !bodyData.email || !bodyData.password) {
            return reply.status(400).send({
                error: 'Missing required fields: name, email, password'
            });
        }

        if (bodyData.name.length < 3 || bodyData.name.length > 20) {
            return reply.status(400).send({ error: 'Username must be between 3 and 20 characters' });
        }

        const validEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(bodyData.email);
        if (!validEmail) {
            return reply.status(400).send({ error: 'The email format is not valid' });
        }

        if (bodyData.password.length < 8 || bodyData.password.length > 64) {
            return reply.status(400).send({ error: 'Password must be between 8 and 64 characters' });
        }

        const validPassword = /^(?=.*[A-Z])(?=.*[0-9.!@#$%^&*])/.test(bodyData.password);
        if (!validPassword) {
            return reply.status(400).send({ error: 'Password must contain at least one uppercase letter and one number or special character' });
        }
        
        // STEP 3: Check if the email is already registered in the database
        const existingUser = await prismaClient.user.findUnique({
            where: {
                email: bodyData.email
            }
        });
        
        // If the email already exists, return error
        if (existingUser) {
            return reply.status(400).send({
                error: 'This email is already registered'
            });
        }
        
        // STEP 4: HASH THE PASSWORD
        // bcrypt.hash() converts the password into an irreversible hash
        // - First param: plain text password (e.g.: "MyPassword123")
        // - Second param: number of rounds (10 = good security/speed balance)
        // - Result: 60-character hash (e.g.: "$2b$10$N9qo8uLO...")
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(bodyData.password, saltRounds);
        
        // STEP 5: Create the new user in the database
        const newUser = await prismaClient.user.create({
            data: {
                name: bodyData.name,
                email: bodyData.email,
                password: hashedPassword
            }
        });
        
        // STEP 6: Return successful response (WITHOUT showing the hashed password)
        reply.status(201).send({
            message: 'User created successfully',
            user: {
                id: newUser.id,
                name: newUser.name,
                email: newUser.email,
                avatar: newUser.avatar,
                onlineStatus: newUser.onlineStatus,
                lastConnection: newUser.lastConnection,
                createdAt: newUser.createdAt
            }
        });
    });
    
    // ========================================================================
    // ROUTE 2: LOGIN
    // ========================================================================
    // HTTP Method: POST
    // URL: http://localhost:3000/users/login
    server.post('/users/login', async (request, reply) => {
        
        // STEP 1: Get email and password from the body
        const bodyData = request.body as {
            email: string,
            password: string
        };
        
        // STEP 2: Validate required fields are present
        if (!bodyData.email || !bodyData.password) {
            return reply.status(400).send({
                error: 'Email and password are required'
            });
        }
        
        // STEP 3: Find the user in the database by email
        const user = await prismaClient.user.findUnique({
            where: {
                email: bodyData.email
            }
        });
        
        // STEP 4: Verify the user exists
        if (!user) {
            return reply.status(401).send({
                error: 'Incorrect email or password'
            });
        }
        
        // STEP 5: VERIFY THE PASSWORD WITH BCRYPT
        // bcrypt.compare() compares the plain text password with the stored hash
        // - First param: submitted password (e.g.: "MyPassword123")
        // - Second param: stored hash (e.g.: "$2b$10$N9qo8...")
        // - Result: true if they match, false if not
        const passwordIsCorrect = await bcrypt.compare(
            bodyData.password,
            user.password
        );
        
        // STEP 6: If the password does NOT match, return error
        if (!passwordIsCorrect) {
            return reply.status(401).send({
                error: 'Incorrect email or password'
            });
        }

        // STEP 7: Update online status on login 
        await prismaClient.user.update({
            where: { id: user.id },
            data: { onlineStatus: true }
        });
        
        // STEP 8: Generate the JWT token (because login was successful)
        const token = jwt.sign(
            { 
                id: user.id, 
                email: user.email 
            },
            process.env.JWT_SECRET || 'super-secure-secret',
            { expiresIn: '24h' }
        );
        
        // STEP 9: Return the token to the client
        reply.send({
            message: 'Login successful',
            token: token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                avatar: user.avatar,
                onlineStatus: true
            }
        });
    });
    
    // ========================================================================
    // ROUTE 3: GET ONLINE USERS
    // ========================================================================
    // HTTP Method: GET
    // URL: http://localhost:3000/users/filter/online
    server.get('/users/filter/online', async (request, reply) => {  
        try {
            // STEP 1: Find only users with onlineStatus = true
            const onlineUsers = await prismaClient.user.findMany({
                where: {
                    onlineStatus: true
                },
                select: {
                    id: true,
                    name: true,
                    email: true,
                    avatar: true,
                    onlineStatus: true,
                    lastConnection: true,
                    createdAt: true
                }
            });
            
            // STEP 2: Return the list of online users
            reply.send({
                total: onlineUsers.length,
                users: onlineUsers
            });
            
        } catch (error) {
            console.error('Error fetching online users:', error);
            reply.status(500).send({
                error: 'Error fetching online users'
            });
        }
    });

    // ========================================================================
    // ROUTE 4: GET LIST OF ALL USERS
    // ========================================================================
    // HTTP Method: GET
    // URL: http://localhost:3000/users
    server.get('/users', async (request, reply) => {
        
        // Find all users in the database
        const allUsers = await prismaClient.user.findMany({
            select: {
                id: true,
                name: true,
                email: true,
                avatar: true,
                onlineStatus: true,
                lastConnection: true,
                createdAt: true
            }
        });
        
        // Return the list of users
        reply.send({
            total: allUsers.length,
            users: allUsers
        });
    });
       
    // ========================================================================
    // ROUTE 5: GET AVATAR
    // ========================================================================
    server.get('/users/:userId/avatar', async (request, reply) => {
        
        // STEP 1: Get the user ID
        const urlParams = request.params as { userId: string };
        const userId = parseInt(urlParams.userId);
        
        // STEP 2: Find the user
        const user = await prismaClient.user.findUnique({
            where: { id: userId },
            select: { avatar: true }
        });
        
        if (!user) {
            return reply.status(404).send({
                error: 'User not found'
            });
        }
        
        // STEP 3: Return the avatar URL
        reply.send({
            avatarUrl: user.avatar || '/avatars/default-avatar.svg'
        });
    });
    
    // ========================================================================
    // ROUTE 6: UPLOAD AVATAR
    // ========================================================================
    server.post('/users/:userId/avatar', {
        onRequest: [server.authenticate]
    }, async (request, reply) => {
        
        try {
            // STEP 1: Get the user ID
            const urlParams = request.params as { userId: string };
            const userId = parseInt(urlParams.userId);

            // Verify that the authenticated user is the owner of the resource
            if ((request as any).user?.id !== userId) {
                return reply.status(403).send({ error: 'You do not have permission to modify this user' });
            }
            
            // STEP 2: Receive and validate the file
            const data = await request.file();
            
            if (!data) {
                return reply.status(400).send({
                    error: 'No file was sent'
                });
            }
            
            // STEP 3: Validate file type (images only)
            const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
            
            // 'data.mimetype' -> Contains the file type to check if it is one of the allowed ones
            if (!allowedTypes.includes(data.mimetype)) { 
                return reply.status(400).send({
                    error: 'Only images are allowed (JPEG, PNG, GIF, WEBP)'
                });
            }
            
            // STEP 4: Validate size (max 5MB)
            const maxSize = 5 * 1024 * 1024; // 5MB
            const buffer = await data.toBuffer(); // converts the image to bytes to measure it
            
            if (buffer.length > maxSize) {
                return reply.status(400).send({
                    error: 'The image cannot exceed 5MB'
                });
            }
            
            // STEP 5: Validate real file content using magic bytes
            // Checks the actual first bytes of the file, not just the extension or mimetype
            const magicBytes: Record<string, number[][]> = {
                'image/jpeg': [[0xFF, 0xD8, 0xFF]],
                'image/png':  [[0x89, 0x50, 0x4E, 0x47]],
                'image/gif':  [[0x47, 0x49, 0x46, 0x38]],
                'image/webp': [[0x52, 0x49, 0x46, 0x46]],
            };

            const fileSignature = [...buffer.slice(0, 4)];
            const isValidImage = Object.values(magicBytes).some(signatures =>
                signatures.some(sig => sig.every((byte, i) => fileSignature[i] === byte))
            );

            if (!isValidImage) {
                return reply.status(400).send({ error: 'File content does not match a valid image' });
            }

            // STEP 6: Generate a unique file name (to avoid overwriting if more than one is uploaded)
            const extension = data.filename.split('.').pop(); // gets the type (.jpg)
            const fileName = `avatar-${userId}-${randomUUID()}.${extension}`;
                                    // E.g.: "avatar-5-a3f5b2c8-1d4e-4f7a-9b2c-8e3f1a5d6c7b.png"
            
            // STEP 6: Save the file to /public/avatars/
            const fullPath = path.join(__dirname, '..', '..', 'public', 'avatars', fileName);
                // 'path' -> import path from 'path'
                // E.g.: "/Users/daniel/Documents/transcendence/TranscendancePreps/public/avatars/avatar-5-a3f5b2c8-1d4e-4f7a-9b2c-8e3f1a5d6c7b.jpg"
            
            // Create directory if it does not exist
            const avatarsDir = path.join(__dirname, '..', '..', 'public', 'avatars');
            if (!fs.existsSync(avatarsDir)) 
            { // 'fs' -> File system
                fs.mkdirSync(avatarsDir, 
                { 
                    recursive: true 
                });
            }
            
            // Save the file
            fs.writeFileSync(fullPath, buffer); // saves the buffer, not the data object
            
            // STEP 7: Get the previous avatar (to delete it)
            const previousAvatar = await prismaClient.user.findUnique({ // finds exactly one user (unique)
                where: { id: userId }, // specifically the user with ID ...
                select: { avatar: true } // Only retrieves the avatar field
            });
            
            // STEP 8: Update the DB with the URL of the new avatar
            const updatedUser = await prismaClient.user.update({
                where: {
                    id: userId
                },
                data: {
                    avatar: `/avatars/${fileName}`
                },
                // Even if only 'avatar' changes, all fields are returned in the response in case they are needed
                select: {
                    id: true,
                    name: true,
                    email: true,
                    avatar: true,
                    onlineStatus: true,
                    lastConnection: true,
                    createdAt: true
                }
            });
            
            // STEP 9: Delete the previous avatar (if it is not the default)
            if (previousAvatar?.avatar && 
                previousAvatar.avatar !== '/avatars/default-avatar.svg' &&
                previousAvatar.avatar.startsWith('/avatars/')) // If it is a valid avatar (checks the path)
                {
                // Build the full path to delete it
                const previousAvatarPath = path.join(__dirname, '..', '..', 'public', previousAvatar.avatar);
                                                                    // '.avatar' -> "avatars/avatar.jpg"

                if (fs.existsSync(previousAvatarPath)) // Does the file exist?
                    fs.unlinkSync(previousAvatarPath); // If so, delete it
            }
            
            // STEP 10: Return a successful response
            reply.send({
                message: 'Avatar uploaded successfully',
                avatarUrl: `/avatars/${fileName}`,
                user: updatedUser
            });
            
        // If any of steps 1 to 10 fail:
        } catch (error) {
            console.error('Error uploading avatar:', error);
            reply.status(500).send({
                error: 'Error uploading the avatar'
            });
        }
    });

    // ========================================================================
    // ROUTE 7: DELETE AVATAR
    // ========================================================================
    server.delete('/users/:userId/avatar', {
        onRequest: [server.authenticate]
    }, async (request, reply) => {
        
        try {
            // STEP 1: Get the user ID
            const urlParams = request.params as { userId: string };
            const userId = parseInt(urlParams.userId);

            // Verify that the authenticated user is the owner of the resource
            if ((request as any).user?.id !== userId) {
                return reply.status(403).send({ error: 'You do not have permission to modify this user' });
            }
            
            // STEP 2: Get the current avatar
            const user = await prismaClient.user.findUnique({
                where: { id: userId },
                select: { avatar: true }
            });
            
            if (!user) {
                return reply.status(404).send({
                    error: 'User not found'
                });
            }
            
            // STEP 3: Delete the physical file (if not the default)
            if (user.avatar && 
                user.avatar !== '/avatars/default-avatar.svg' &&
                user.avatar.startsWith('/avatars/')) {
                
                const avatarPath = path.join(__dirname, '..', '..', 'public', user.avatar);
                if (fs.existsSync(avatarPath)) {
                    fs.unlinkSync(avatarPath);
                }
            }
            
            // STEP 4: Update the DB to the default avatar
            const updatedUser = await prismaClient.user.update({
                where: { id: userId },
                data: { avatar: '/avatars/default-avatar.svg' },
                select: {
                    id: true,
                    name: true,
                    email: true,
                    avatar: true
                }
            });
            
            // STEP 5: Return a successful response
            reply.send({
                message: 'Avatar deleted successfully',
                user: updatedUser
            });
            
        } catch (error) {
            console.error('Error deleting avatar:', error);
            reply.status(500).send({
                error: 'Error deleting the avatar'
            });
        }
    });

    // ========================================================================
    // ROUTE 8: UPDATE ONLINE STATUS
    // ========================================================================
    // HTTP Method: PUT
    // URL: http://localhost:3000/users/:userId/status
    server.put('/users/:userId/status', {
        onRequest: [server.authenticate]
    }, async (request, reply) => {
        
        try {
            // STEP 1: Get the user ID
            const urlParams = request.params as { userId: string };
            const userId = parseInt(urlParams.userId);

            // Verify that the authenticated user is the owner of the resource
            if ((request as any).user?.id !== userId) {
                return reply.status(403).send({ error: 'You do not have permission to modify this user' });
            }
            
            // STEP 2: Get the new status from the body
            const bodyData = request.body as {
                onlineStatus: boolean
            };
            
            // STEP 3: Validate that the onlineStatus field is provided
            if (typeof bodyData.onlineStatus !== 'boolean') {
                return reply.status(400).send({
                    error: 'The onlineStatus field must be a boolean (true/false)'
                });
            }
            
            // STEP 4: Prepare data to update
            const dataToUpdate: any = {
                onlineStatus: bodyData.onlineStatus
            };
            
            // If the user is going offline, save the last connection time
            if (!bodyData.onlineStatus) {
                dataToUpdate.lastConnection = new Date();
            }
            
            // STEP 5: Update the status in the DB
            const updatedUser = await prismaClient.user.update({
                where: { id: userId },
                data: dataToUpdate,
                select: {
                    id: true,
                    name: true,
                    email: true,
                    avatar: true,
                    onlineStatus: true,
                    lastConnection: true,
                    createdAt: true
                }
            });
            
            // STEP 6: Return a successful response
            reply.send({
                message: 'Status updated successfully',
                user: updatedUser
            });
            
        } catch (error) {
            console.error('Error updating status:', error);
            reply.status(500).send({
                error: 'Error updating the status'
            });
        }
    });

    // ========================================================================
    // ROUTE 9: GET A SPECIFIC USER BY ID
    // ========================================================================
    // HTTP Method: GET
    // URL: http://localhost:3000/users/:userId
    server.get('/users/:userId', async (request, reply) => {
        
        // STEP 1: Get the user ID from the URL
        const urlParams = request.params as { userId: string };
        const userId = parseInt(urlParams.userId);

        // STEP 2: Find the user in the database
        const user = await prismaClient.user.findUnique({
            where: {
                id: userId
            },
            select: {
                id: true,
                name: true,
                email: true,
                avatar: true,
                onlineStatus: true,
                lastConnection: true,
                createdAt: true
            }
        });
        
        // STEP 3: If the user does not exist, return an error
        if (!user) {
            return reply.status(404).send({
                error: 'User not found'
            });
        }
        
        // STEP 4: Return the found user
        reply.send(user);
    });

    // ========================================================================
    // ROUTE 10: UPDATE A USER
    // ========================================================================
    // HTTP Method: PUT
    // URL: http://localhost:3000/users/:userId
    server.put('/users/:userId', {
        onRequest: [server.authenticate]
    }, async (request, reply) => {
        
        // STEP 1: Get the user ID from the URL
        const urlParams = request.params as { userId: string };
        const userId = parseInt(urlParams.userId);

        // Verify that the authenticated user is the owner of the resource
        if ((request as any).user?.id !== userId) {
            return reply.status(403).send({ error: 'You do not have permission to modify this user' });
        }
        
        // STEP 2: Get the data to update from the body
        const bodyData = request.body as {
            name?: string,
            email?: string,
            password?: string
        };
        
        // STEP 3: If a new password is provided, hash it
        let hashedPassword: string | undefined;
        if (bodyData.password) {
            const saltRounds = 10;
            hashedPassword = await bcrypt.hash(bodyData.password, saltRounds);
        }
        
        // STEP 4: Build the object of data to update
        // Build the object manually to use 'password' (DB field name)
        // instead of relying purely on the body field name
        const dataToUpdate: any = {};
        
        if (bodyData.name)      dataToUpdate.name = bodyData.name;
        if (bodyData.email)     dataToUpdate.email = bodyData.email;
        if (hashedPassword)     dataToUpdate.password = hashedPassword; // store the hashed password in the DB field
        
        // STEP 5: Update the user in the database
        const updatedUser = await prismaClient.user.update({
            where: {
                id: userId
            },
            data: dataToUpdate, // use dataToUpdate, not bodyData
            select: {
                id: true,
                name: true,
                email: true,
                avatar: true,
                onlineStatus: true,
                lastConnection: true,
                createdAt: true
            }
        });
        
        // STEP 6: Return the updated user
        reply.send({
            message: 'User updated successfully',
            user: updatedUser // return updatedUser, not bodyData
        });
    });
    
    // ========================================================================
    // ROUTE 11: DELETE A USER
    // ========================================================================
    // HTTP Method: DELETE
    // URL: http://localhost:3000/users/:userId
    server.delete('/users/:userId', {
        onRequest: [server.authenticate]
    }, async (request, reply) => {
        
        // STEP 1: Get the user ID from the URL
        const urlParams = request.params as { userId: string };
        const userId = parseInt(urlParams.userId);

        // Verify that the authenticated user is the owner of the resource
        if ((request as any).user?.id !== userId) {
            return reply.status(403).send({ error: 'You do not have permission to modify this user' });
        }
        
        // STEP 2: Delete the user from the database
        const deletedUser = await prismaClient.user.delete({
            where: {
                id: userId
            }
        });
        
        // STEP 3: Return confirmation
        reply.send({
            message: 'User deleted successfully',
            user: {
                id: deletedUser.id,
                name: deletedUser.name
            }
        });
    });
} 

