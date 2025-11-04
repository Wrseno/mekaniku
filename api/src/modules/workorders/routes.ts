import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { prisma } from '@/db/prisma';
import { successResponse } from '@/utils/response';
import { authMiddleware } from '@/middlewares/auth';
import { requireRole } from '@/middlewares/rbac';
import { UserRole, WorkStatus } from '@prisma/client';
import { NotFoundError } from '@/utils/response';

const workOrderRoutes = new Hono();

const createWorkOrderSchema = z.object({
  tasks: z.record(z.any()),
  parts: z.record(z.any()),
  laborHours: z.number().min(0).default(0),
  subtotal: z.number().min(0).default(0),
});

const updateWorkOrderStatusSchema = z.object({
  status: z.nativeEnum(WorkStatus),
  tasks: z.record(z.any()).optional(),
  parts: z.record(z.any()).optional(),
  laborHours: z.number().optional(),
  subtotal: z.number().optional(),
});

// Create work order for booking
workOrderRoutes.post(
  '/:bookingId/workorder',
  authMiddleware,
  requireRole(UserRole.WORKSHOP, UserRole.ADMIN),
  zValidator('json', createWorkOrderSchema),
  async (c) => {
    const bookingId = c.req.param('bookingId');
    const data = c.req.valid('json');

    const booking = await prisma.booking.findFirst({
      where: { id: bookingId, deletedAt: null },
    });

    if (!booking) throw new NotFoundError('Booking not found');

    const workOrder = await prisma.workOrder.create({
      data: {
        bookingId,
        tasks: data.tasks as any,
        parts: data.parts as any,
        laborHours: data.laborHours,
        subtotal: data.subtotal,
        status: WorkStatus.QUEUED,
      },
    });

    return successResponse(c, workOrder, 201);
  }
);

// Update work order status
workOrderRoutes.patch(
  '/:id/status',
  authMiddleware,
  requireRole(UserRole.WORKSHOP, UserRole.ADMIN),
  zValidator('json', updateWorkOrderStatusSchema),
  async (c) => {
    const id = c.req.param('id');
    const data = c.req.valid('json');
    const user = c.get('user');

    const workOrder = await prisma.workOrder.findUnique({ where: { id } });
    if (!workOrder) throw new NotFoundError('Work order not found');

    const updated = await prisma.$transaction(async (tx: any) => {
      const updatedWO = await tx.workOrder.update({
        where: { id },
        data: {
          status: data.status,
          ...(data.tasks && { tasks: data.tasks }),
          ...(data.parts && { parts: data.parts }),
          ...(data.laborHours !== undefined && { laborHours: data.laborHours }),
          ...(data.subtotal !== undefined && { subtotal: data.subtotal }),
        },
      });

      await tx.auditLog.create({
        data: {
          actorId: user.userId,
          entityType: 'WorkOrder',
          entityId: id,
          action: 'STATUS_UPDATE',
          fromStatus: workOrder.status,
          toStatus: data.status,
        },
      });

      return updatedWO;
    });

    return successResponse(c, updated);
  }
);

export default workOrderRoutes;
