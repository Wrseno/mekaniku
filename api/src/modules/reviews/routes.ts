import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { prisma } from '@/db/prisma';
import { successResponse } from '@/utils/response';
import { authMiddleware } from '@/middlewares/auth';
import { requireRole } from '@/middlewares/rbac';
import { UserRole, BookingStatus } from '@prisma/client';
import { NotFoundError, ValidationError } from '@/utils/response';

const reviewRoutes = new Hono();

const createReviewSchema = z.object({
  rating: z.number().int().min(1).max(5),
  comment: z.string().optional(),
});

// Create review for booking
reviewRoutes.post(
  '/:bookingId/review',
  authMiddleware,
  requireRole(UserRole.CUSTOMER),
  zValidator('json', createReviewSchema),
  async (c) => {
    const bookingId = c.req.param('bookingId');
    const data = c.req.valid('json');
    const user = c.get('user');

    const booking = await prisma.booking.findFirst({
      where: { id: bookingId, deletedAt: null },
      include: { review: true },
    });

    if (!booking) throw new NotFoundError('Booking not found');
    if (booking.customerId !== user.userId) {
      throw new ValidationError('You can only review your own bookings');
    }
    if (booking.status !== BookingStatus.COMPLETED) {
      throw new ValidationError('Can only review completed bookings');
    }
    if (booking.review) {
      throw new ValidationError('Review already exists for this booking');
    }

    const review = await prisma.review.create({
      data: {
        bookingId,
        customerId: user.userId,
        rating: data.rating,
        comment: data.comment,
      },
      include: {
        booking: {
          select: {
            workshop: { select: { id: true, name: true } },
          },
        },
      },
    });

    return successResponse(c, review, 201);
  }
);

export default reviewRoutes;
