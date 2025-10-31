import { Context, Next } from 'hono';
import { AppError, errorResponse } from '@/utils/response';
import { logger } from '@/utils/logger';
import { ZodError } from 'zod';
import { Prisma } from '@prisma/client';

export async function errorHandler(c: Context, next: Next): Promise<Response> {
  try {
    await next();
    return c.res;
  } catch (error) {
    logger.error({ error }, 'Request error');

    // Handle custom AppError
    if (error instanceof AppError) {
      return errorResponse(
        c,
        error.message,
        error.statusCode as any,
        error.code,
        error.details
      );
    }

    // Handle Zod validation errors
    if (error instanceof ZodError) {
      return errorResponse(
        c,
        'Validation failed',
        422,
        'VALIDATION_ERROR',
        error.errors
      );
    }

    // Handle Prisma errors
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        return errorResponse(
          c,
          'A record with this value already exists',
          409,
          'UNIQUE_CONSTRAINT'
        );
      }
      if (error.code === 'P2025') {
        return errorResponse(
          c,
          'Record not found',
          404,
          'NOT_FOUND'
        );
      }
    }

    // Default error
    const message = error instanceof Error ? error.message : 'Internal server error';
    return errorResponse(c, message, 500, 'INTERNAL_ERROR');
  }
}
