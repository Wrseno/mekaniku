import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { BookingService } from './service';
import { createBookingSchema, bookingQuerySchema } from './schemas';
import { successResponse } from '@/utils/response';
import { authMiddleware } from '@/middlewares/auth';
import { requireRole } from '@/middlewares/rbac';
import { UserRole } from '@prisma/client';
import { paginationSchema } from '@/utils/pagination';

const bookingRoutes = new Hono();
const bookingService = new BookingService();

// Create booking
bookingRoutes.post(
  '/',
  authMiddleware,
  requireRole(UserRole.CUSTOMER),
  zValidator('json', createBookingSchema),
  async (c) => {
    const user = c.get('user');
    const data = c.req.valid('json');
    const result = await bookingService.createBooking(user.userId, data);
    return successResponse(c, result, 201);
  }
);

// Get bookings
bookingRoutes.get(
  '/',
  authMiddleware,
  zValidator('query', bookingQuerySchema.merge(paginationSchema)),
  async (c) => {
    const user = c.get('user');
    const query = c.req.valid('query');
    const { page, limit, ...filters } = query;
    const result = await bookingService.getBookings(user.userId, user.role, filters, page, limit);
    return successResponse(c, result.data, 200, result.meta);
  }
);

// Get booking by ID
bookingRoutes.get('/:id', authMiddleware, async (c) => {
  const id = c.req.param('id');
  const result = await bookingService.getBookingById(id);
  return successResponse(c, result);
});

// Confirm booking
bookingRoutes.post('/:id/confirm', authMiddleware, async (c) => {
  const id = c.req.param('id');
  const user = c.get('user');
  const result = await bookingService.confirmBooking(id, user.userId, user.role);
  return successResponse(c, result);
});

// Cancel booking
bookingRoutes.post('/:id/cancel', authMiddleware, async (c) => {
  const id = c.req.param('id');
  const user = c.get('user');
  const result = await bookingService.cancelBooking(id, user.userId, user.role);
  return successResponse(c, result);
});

// Start booking
bookingRoutes.post('/:id/start', authMiddleware, async (c) => {
  const id = c.req.param('id');
  const user = c.get('user');
  const result = await bookingService.startBooking(id, user.userId, user.role);
  return successResponse(c, result);
});

// Complete booking
bookingRoutes.post('/:id/complete', authMiddleware, async (c) => {
  const id = c.req.param('id');
  const user = c.get('user');
  const result = await bookingService.completeBooking(id, user.userId, user.role);
  return successResponse(c, result);
});

export default bookingRoutes;
