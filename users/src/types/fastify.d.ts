import { FastifyRequest, FastifyReply } from 'fastify';

declare module 'fastify' {
  interface FastifyRequest {
    user?: {
      id: number;
      email: string;
    };
}

  interface FastifyInstance {
    authenticate(
      request: FastifyRequest,
      reply: FastifyReply
    ): Promise<void>;
  }
}