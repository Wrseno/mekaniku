import { z } from 'zod';
import { BookingStatus } from '@prisma/client';

export const createBookingSchema = z.object({
  workshopId: z.string().min(1, 'Workshop ID is required'),
  vehicleId: z.string().min(1, 'Vehicle ID is required'),
  serviceId: z.string().min(1, 'Service ID is required'),
  consultationId: z.string().optional(),
  scheduledAt: z.string().datetime('Invalid datetime format'),
  notes: z.string().optional(),
});

export const updateBookingStatusSchema = z.object({
  status: z.nativeEnum(BookingStatus),
});

export const bookingQuerySchema = z.object({
  status: z.nativeEnum(BookingStatus).optional(),
  workshopId: z.string().optional(),
  customerId: z.string().optional(),
});

export type CreateBookingInput = z.infer<typeof createBookingSchema>;
export type UpdateBookingStatusInput = z.infer<typeof updateBookingStatusSchema>;
export type BookingQueryInput = z.infer<typeof bookingQuerySchema>;
