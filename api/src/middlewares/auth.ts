import { Context, Next } from 'hono';
import jwt from 'jsonwebtoken';
import { env } from '@/config/env';
import { UnauthorizedError } from '@/utils/response';
import { UserRole } from '@prisma/client';

export interface JwtPayload {
  userId: string;
  email: string;
  role: UserRole;
  workshopId?: string;
}

declare module 'hono' {
  interface ContextVariableMap {
    user: JwtPayload;
  }
}

export async function authMiddleware(c: Context, next: Next) {
  const authHeader = c.req.header('Authorization');

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new UnauthorizedError('Missing or invalid token');
  }

  const token = authHeader.substring(7);

  try {
    const decoded = jwt.verify(token, env.JWT_SECRET) as JwtPayload;
    c.set('user', decoded);
    await next();
  } catch (error) {
    if (error instanceof Error) {
      if (error.name === 'TokenExpiredError') {
        throw new UnauthorizedError('Token expired');
      }
      if (error.name === 'JsonWebTokenError') {
        throw new UnauthorizedError('Invalid token');
      }
    }
    throw new UnauthorizedError('Authentication failed');
  }
}

export function optionalAuth(c: Context, next: Next) {
  const authHeader = c.req.header('Authorization');

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next();
  }

  const token = authHeader.substring(7);

  try {
    const decoded = jwt.verify(token, env.JWT_SECRET) as JwtPayload;
    c.set('user', decoded);
  } catch (error) {
    // Silently fail for optional auth
  }

  return next();
}
