import { z } from 'zod';
import { ConsultationStatus } from '@prisma/client';

export const createConsultationSchema = z.object({
  workshopId: z.string().min(1, 'Workshop ID is required'),
  message: z.string().min(10, 'Message must be at least 10 characters'),
});

export const closeConsultationSchema = z.object({
  status: z.nativeEnum(ConsultationStatus),
});

export type CreateConsultationInput = z.infer<typeof createConsultationSchema>;
export type CloseConsultationInput = z.infer<typeof closeConsultationSchema>;
