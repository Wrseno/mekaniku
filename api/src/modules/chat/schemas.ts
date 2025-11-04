import { z } from 'zod';

export const createChatSchema = z.object({
  workshopId: z.string().min(1),
  bookingId: z.string().optional(),
  consultationId: z.string().optional(),
  participants: z.array(z.string()).min(2),
});

export const sendMessageSchema = z.object({
  type: z.enum(['TEXT', 'IMAGE', 'SYSTEM']).default('TEXT'),
  text: z.string().optional(),
  attachments: z.array(z.string()).optional(),
});

export const addMemberSchema = z.object({
  userId: z.string().min(1),
});

export type CreateChatInput = z.infer<typeof createChatSchema>;
export type SendMessageInput = z.infer<typeof sendMessageSchema>;
export type AddMemberInput = z.infer<typeof addMemberSchema>;
