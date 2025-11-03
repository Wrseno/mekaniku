import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { prisma } from '@/db/prisma';
import { successResponse } from '@/utils/response';
import { authMiddleware } from '@/middlewares/auth';
import { requireRole } from '@/middlewares/rbac';
import { UserRole } from '@prisma/client';
import { NotFoundError } from '@/utils/response';

const inspectionRoutes = new Hono();

const createInspectionSchema = z.object({
  findings: z.record(z.any()),
  photos: z.array(z.string().url()).optional().default([]),
});

// Create inspection for booking
inspectionRoutes.post(
  '/:bookingId/inspection',
  authMiddleware,
  requireRole(UserRole.WORKSHOP, UserRole.ADMIN),
  zValidator('json', createInspectionSchema),
  async (c) => {
    const bookingId = c.req.param('bookingId');
    const data = c.req.valid('json');

    const booking = await prisma.booking.findFirst({
      where: { id: bookingId, deletedAt: null },
    });

    if (!booking) throw new NotFoundError('Booking not found');

    const inspection = await prisma.inspection.create({
      data: {
        bookingId,
        findings: data.findings as any,
        photos: data.photos,
      },
    });

    return successResponse(c, inspection, 201);
  }
);

export default inspectionRoutes;
