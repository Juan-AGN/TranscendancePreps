// ============================================================================
// MIDDLEWARE DE AUTENTICACIÓN JWT
// ============================================================================
import { FastifyRequest, FastifyReply } from 'fastify';
import jwt from 'jsonwebtoken';

// Extender el tipo de Request de Fastify para incluir el usuario autenticado
declare module 'fastify' {
  interface FastifyRequest {
    user?: {
      id: number;
      email: string;
    };
  }
}

// declarar el método authenticate
interface FastifyInstance {
    authenticate: (
        request: FastifyRequest,
        reply: FastifyReply
    ) => Promise<void>;
} 

// ============================================================================
// FUNCIÓN PRINCIPAL: Verificar token JWT
// ============================================================================
export async function authenticate(
  peticionDelCliente: FastifyRequest,
  respuestaAlCliente: FastifyReply
) {
  try {
    // PASO 1: Obtener el token del header Authorization
    // El formato esperado es: "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
    const authHeader = peticionDelCliente.headers.authorization;
    
    // PASO 2: Verificar que exista el header
    if (!authHeader) {
      return respuestaAlCliente.status(401).send({
        error: 'Token de autenticación no proporcionado'
      });
    }
    
    // PASO 3: Extraer el token (quitar la palabra "Bearer ")
    const token = authHeader.replace('Bearer ', '');
    
    if (!token) {
      return respuestaAlCliente.status(401).send({
        error: 'Token inválido'
      });
    }
    
    // PASO 4: Verificar y decodificar el token
    const secreto = process.env.JWT_SECRET || 'secreto-super-seguro';
    
    const decoded = jwt.verify(token, secreto) as {
      id: number;
      email: string;
    };
    
    // PASO 5: Agregar los datos del usuario a la petición
    // Ahora cualquier ruta puede acceder a peticionDelCliente.user
    peticionDelCliente.user = {
      id: decoded.id,
      email: decoded.email
    };
    
    // PASO 6: Continuar con la siguiente función (la ruta solicitada)
    // No se envía respuesta aquí, solo se valida y se pasa al siguiente
    
  } catch (error) {
    // Si el token es inválido o ha expirado, jwt.verify lanza un error
    return respuestaAlCliente.status(401).send({
      error: 'Token inválido o expirado'
    });
  }
}