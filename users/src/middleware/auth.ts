// ============================================================================
// JWT AUTHENTICATION MIDDLEWARE
// ============================================================================
import { FastifyRequest, FastifyReply } from 'fastify';
import jwt from 'jsonwebtoken';

// Extend Fastify's Request type to include the authenticated user
declare module 'fastify' {
  interface FastifyRequest {
    user?: {
      id: number;
      email: string;
    };
  }
}

// declare the authenticate method
interface FastifyInstance {
    authenticate: (
        request: FastifyRequest,
        reply: FastifyReply
    ) => Promise<void>;
} 

// ============================================================================
// MAIN FUNCTION: Verify JWT token
// ============================================================================
export async function authenticate(
  request: FastifyRequest,
  reply: FastifyReply
) {
  try {
    // STEP 1: Get the token from the Authorization header
    // Expected format: "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
    const authHeader = request.headers.authorization;
    
    // STEP 2: Verify the header exists
    if (!authHeader) {
      return reply.status(401).send({
        error: 'Authentication token not provided'
      });
    }
    
    // STEP 3: Extract the token (remove the "Bearer " prefix)
    const token = authHeader.replace('Bearer ', '');
    
    if (!token) {
      return reply.status(401).send({
        error: 'Invalid token'
      });
    }
    
    // STEP 4: Verify and decode the token
    const secret = process.env.JWT_SECRET;
      if (!secret) throw new Error('JWT_SECRET is not configurate');    
    
      const decoded = jwt.verify(token, secret) as {
      id: number;
      email: string;
    };
    
    // STEP 5: Attach the user data to the request
    // Now any route can access request.user
    request.user = {
      id: decoded.id,
      email: decoded.email
    };
    
    // STEP 6: Continue to the next function (the requested route)
    // No response is sent here, only validates and passes to next handler
    
  } catch (error) {
    // If the token is invalid or expired, jwt.verify throws an error
    return reply.status(401).send({
      error: 'Invalid or expired token'
    });
  }
}