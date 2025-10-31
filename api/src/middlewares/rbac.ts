import { Context, Next } from 'hono';
import { UserRole } from '@prisma/client';
import { ForbiddenError, UnauthorizedError } from '@/utils/response';

export function requireRole(...allowedRoles: UserRole[]) {
  return async (c: Context, next: Next) => {
    const user = c.get('user');

    if (!user) {
      throw new UnauthorizedError('Authentication required');
    }

    if (!allowedRoles.includes(user.role)) {
      throw new ForbiddenError(`Access denied. Required roles: ${allowedRoles.join(', ')}`);
    }

    await next();
  };
}

export function requireWorkshopAccess(workshopIdParam = 'id') {
  return async (c: Context, next: Next) => {
    const user = c.get('user');

    if (!user) {
      throw new UnauthorizedError('Authentication required');
    }

    // Admin can access all workshops
    if (user.role === UserRole.ADMIN) {
      return next();
    }

    const workshopId = c.req.param(workshopIdParam);

    // Workshop owner/mechanic can only access their own workshop
    if (user.role === UserRole.WORKSHOP) {
      if (!user.workshopId || user.workshopId !== workshopId) {
        throw new ForbiddenError('You can only access your own workshop');
      }
    } else {
      throw new ForbiddenError('Only workshop staff can access this resource');
    }

    await next();
  };
}

export function requireOwnership(getUserIdFromParam: (c: Context) => string | Promise<string>) {
  return async (c: Context, next: Next) => {
    const user = c.get('user');

    if (!user) {
      throw new UnauthorizedError('Authentication required');
    }

    // Admin can access everything
    if (user.role === UserRole.ADMIN) {
      return next();
    }

    const resourceUserId = await getUserIdFromParam(c);

    if (user.userId !== resourceUserId) {
      throw new ForbiddenError('You can only access your own resources');
    }

    await next();
  };
}
