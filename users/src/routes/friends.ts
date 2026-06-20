// ============================================================================
// IMPORTS
// ============================================================================
import type { FastifyInstance } from 'fastify';
import { PrismaClient } from '@prisma/client';

// Create a Prisma client to access the database
const prismaClient = new PrismaClient();

// ============================================================================
// MAIN FUNCTION: Register all routes related to friendships
// ============================================================================
export async function friendsRoutes(server: FastifyInstance) {
    
    // ========================================================================
    // ROUTE 1: SEND FRIEND REQUEST
    // ========================================================================
    // HTTP Method: POST
    // URL: http://localhost:3000/users/:userId/send_request/:friendId
    server.post('/users/:userId/send_request/:friendId', {
        onRequest: [server.authenticate]
    }, async (request, reply) => {
        
        // STEP 1: Get the IDs from the URL
        const urlParams = request.params as {
            userId: string,
            friendId: string
        };
        const myUserId = parseInt(urlParams.userId);
        const targetUserId = parseInt(urlParams.friendId);

        // Verify that the authenticated user is the owner of the resource
        if ((request as any).user?.id !== myUserId) {
            return reply.status(403).send({ error: 'You do not have permission to modify this user' });
        }
        
        // STEP 2: Verify that the user is not trying to add themselves
        if (myUserId === targetUserId) {
            return reply.status(400).send({
                error: 'You cannot send a friend request to yourself'
            });
        }
        
        // STEP 3: Verify that both users exist
        const myUser = await prismaClient.user.findUnique({
            where: { id: myUserId }
        });
        const otherUser = await prismaClient.user.findUnique({
            where: { id: targetUserId }
        });
        
        if (!myUser || !otherUser) {
            return reply.status(404).send({
                error: 'One of the users does not exist'
            });
        }
        
        // STEP 4: Verify that a request does not already exist (in either direction)
        const existingRequest = await prismaClient.friendship.findFirst({
            where: {
                OR: [
                    {
                        requesterId: myUserId,
                        receiverId: targetUserId
                    },
                    {
                        requesterId: targetUserId,
                        receiverId: myUserId
                    }
                ]
            }
        });
        
        if (existingRequest) {
            if (existingRequest.status === 'aceptada') {
                return reply.status(400).send({
                    error: 'You are already friends'
                });
            } else {
                return reply.status(400).send({
                    error: 'A pending request already exists'
                });
            }
        }
        
        // STEP 5: Create the friend request
        await prismaClient.friendship.create({
            data: {
                requesterId: myUserId,
                receiverId: targetUserId
            }
        });
        
        // STEP 6: Return a successful response
        reply.status(201).send({
            message: 'Friend request sent successfully',
            from: myUser.name,
            to: otherUser.name
        });
    });
    
    // ========================================================================
    // ROUTE 2: ACCEPT FRIEND REQUEST
    // ========================================================================
    // HTTP Method: POST
    // URL: http://localhost:3000/users/:userId/accept_request/:friendId
    server.post('/users/:userId/accept_request/:friendId', {
        onRequest: [server.authenticate]
    }, async (request, reply) => {
        
        // STEP 1: Get the IDs from the URL
        const urlParams = request.params as {
            userId: string,
            friendId: string
        };
        const myUserId = parseInt(urlParams.userId);
        const requestSenderId = parseInt(urlParams.friendId);

        // Verify that the authenticated user is the owner of the resource
        if ((request as any).user?.id !== myUserId) {
            return reply.status(403).send({ error: 'You do not have permission to modify this user' });
        }
        
        // STEP 2: Find the pending request
        const pendingRequest = await prismaClient.friendship.findFirst({
            where: {
                requesterId: requestSenderId,
                receiverId: myUserId,
                status: 'pendiente'
            }
        });
        
        // STEP 3: Verify that the request exists
        if (!pendingRequest) {
            return reply.status(404).send({
                error: 'There is no pending request from this user'
            });
        }
        
        // STEP 4: Update the request status to 'aceptada'
        await prismaClient.friendship.update({
            where: {
                id: pendingRequest.id
            },
            data: {
                status: 'aceptada'
            }
        });
        
        // STEP 5: Get the name of the new friend
        const newFriend = await prismaClient.user.findUnique({
            where: { id: requestSenderId }
        });
        
        // STEP 6: Return a successful response
        reply.send({
            message: 'Request accepted. You are now friends',
            yourFriend: newFriend?.name
        });
    });
    
    // ========================================================================
    // ROUTE 3: LIST MY FRIENDS
    // ========================================================================
    // HTTP Method: GET
    // URL: http://localhost:3000/users/:userId/my_friends
    server.get('/users/:userId/my_friends', {
        onRequest: [server.authenticate]
    }, async (request, reply) => {
        
        // STEP 1: Get my ID from the URL
        const urlParams = request.params as { userId: string };
        const myUserId = parseInt(urlParams.userId);

        // Verify that the authenticated user is the owner of the resource
        if ((request as any).user?.id !== myUserId) {
            return reply.status(403).send({ error: 'You do not have permission to modify this user' });
        }
        
        // STEP 2: Find all my ACCEPTED friendships
        const allFriendships = await prismaClient.friendship.findMany({
            where: {
                AND: [
                    { status: 'aceptada' },
                    {
                        OR: [
                            { requesterId: myUserId },
                            { receiverId: myUserId }
                        ]
                    }
                ]
            },
            include: {
                requester: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        avatar: true,
                        onlineStatus: true
                    }
                },
                receiver: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        avatar: true,
                        onlineStatus: true
                    }
                }
            }
        });
        
        // STEP 3: Filter to get only the friend (not myself)
        const friendsList = allFriendships.map(friendship => {
            if (friendship.requesterId === myUserId) {
                return friendship.receiver;
            } else {
                return friendship.requester;
            }
        });
        
        // STEP 4: Return the friends list
        reply.send({
            message: `You have ${friendsList.length} friends`,
            total: friendsList.length,
            friends: friendsList
        });
    });
    
    // ========================================================================
    // ROUTE 4: REMOVE FRIEND
    // ========================================================================
    // HTTP Method: DELETE
    // URL: http://localhost:3000/users/:userId/remove_friend/:friendId
    server.delete('/users/:userId/remove_friend/:friendId', {
        onRequest: [server.authenticate]
    }, async (request, reply) => {
        
        // STEP 1: Get the IDs from the URL
        const urlParams = request.params as {
            userId: string,
            friendId: string
        };
        const myUserId = parseInt(urlParams.userId);
        const friendToRemoveId = parseInt(urlParams.friendId);

        // Verify that the authenticated user is the owner of the resource
        if ((request as any).user?.id !== myUserId) {
            return reply.status(403).send({ error: 'You do not have permission to modify this user' });
        }
        
        // STEP 2: Find the accepted friendship (in either direction)
        const friendshipToRemove = await prismaClient.friendship.findFirst({
            where: {
                AND: [
                    { status: 'aceptada' },
                    {
                        OR: [
                            {
                                requesterId: myUserId,
                                receiverId: friendToRemoveId
                            },
                            {
                                requesterId: friendToRemoveId,
                                receiverId: myUserId
                            }
                        ]
                    }
                ]
            }
        });
        
        // STEP 3: Verify that they are friends
        if (!friendshipToRemove) {
            return reply.status(400).send({
                error: 'You are not friends'
            });
        }
        
        // STEP 4: Delete the friendship from the database
        await prismaClient.friendship.delete({
            where: {
                id: friendshipToRemove.id
            }
        });
        
        // STEP 5: Get the name of the removed friend
        const removedFriend = await prismaClient.user.findUnique({
            where: { id: friendToRemoveId }
        });
        
        // STEP 6: Return confirmation
        reply.send({
            message: 'Friend removed successfully',
            removedFriend: removedFriend?.name
        });
    });

    // ========================================================================
    // ROUTE 5: VIEW PENDING REQUESTS (sent to me)
    // ========================================================================
    server.get('/users/:userId/pending_requests', {
        onRequest: [server.authenticate]
    }, async (request, reply) => {
        
        const { userId } = request.params as { userId: string };
        const myUserId = parseInt(userId);

        // Verify that the authenticated user is the owner of the resource
        if ((request as any).user?.id !== myUserId) {
            return reply.status(403).send({ error: 'You do not have permission to modify this user' });
        }
        
        // Find requests that have been sent TO ME and are pending
        const pendingRequests = await prismaClient.friendship.findMany({
            where: {
                receiverId: myUserId,
                status: 'pendiente'
            },
            include: {
                requester: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        avatar: true,
                        onlineStatus: true
                    }
                }
            }
        });
        
        reply.send({
            total: pendingRequests.length,
            requests: pendingRequests
        });
    });
    
    // ========================================================================
    // ROUTE 6: REJECT FRIEND REQUEST
    // ========================================================================
    server.delete('/users/:userId/reject_request/:friendId', {
        onRequest: [server.authenticate]
    }, async (request, reply) => {
        
        const { userId, friendId } = request.params as {
            userId: string,
            friendId: string
        };
        const myUserId = parseInt(userId);
        const requestSenderId = parseInt(friendId);

        // Verify that the authenticated user is the owner of the resource
        if ((request as any).user?.id !== myUserId) {
            return reply.status(403).send({ error: 'You do not have permission to modify this user' });
        }
        
        // Find the pending request
        const friendRequest = await prismaClient.friendship.findFirst({
            where: {
                requesterId: requestSenderId,
                receiverId: myUserId,
                status: 'pendiente'
            }
        });
        
        if (!friendRequest) {
            return reply.status(404).send({
                error: 'No pending request found'
            });
        }
        
        // Delete the request
        await prismaClient.friendship.delete({
            where: { id: friendRequest.id }
        });
        
        reply.send({
            message: 'Request rejected'
        });
    });
    
    // ========================================================================
    // ROUTE 7: SEARCH USERS (to add friends)
    // ========================================================================
    server.get('/users/search', async (request, reply) => {
        
        const { query } = request.query as { query: string };
        
        if (!query || query.length < 2) {
            return reply.status(400).send({
                error: 'Search must be at least 2 characters long'
            });
        }

        if (query.length > 50) {
            return reply.status(400).send({
                error: 'Search query cannot exceed 50 characters'
            });
        }
        
        // Search users by name or email
        const foundUsers = await prismaClient.user.findMany({
            where: {
                OR: [
                    { name: { contains: query, mode: 'insensitive' } },
                    { email: { contains: query, mode: 'insensitive' } }
                ]
            },
            select: {
                id: true,
                name: true,
                email: true,
                avatar: true,
                onlineStatus: true
            },
            take: 10 // Limit to 10 results
        });
        
        reply.send({
            total: foundUsers.length,
            users: foundUsers
        });
    });
}