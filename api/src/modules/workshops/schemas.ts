import { z } from 'zod';

export const createWorkshopSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  address: z.string().min(5, 'Address is required'),
  city: z.string().min(2, 'City is required'),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
  openHours: z
    .object({
      monday: z.string().optional(),
      tuesday: z.string().optional(),
      wednesday: z.string().optional(),
      thursday: z.string().optional(),
      friday: z.string().optional(),
      saturday: z.string().optional(),
      sunday: z.string().optional(),
    })
    .optional(),
});

export const updateWorkshopSchema = createWorkshopSchema.partial();

export const workshopQuerySchema = z.object({
  city: z.string().optional(),
  lat: z.string().optional().transform((v) => (v ? parseFloat(v) : undefined)),
  lng: z.string().optional().transform((v) => (v ? parseFloat(v) : undefined)),
  radius: z.string().optional().default('10').transform(Number), // km
});

// Service Catalog
export const createServiceSchema = z.object({
  name: z.string().min(2, 'Service name is required'),
  description: z.string().optional(),
  basePrice: z.number().positive('Price must be positive'),
  estDurationMin: z.number().int().positive('Duration must be positive'),
});

export const updateServiceSchema = createServiceSchema.partial();

// Mechanic
export const createMechanicSchema = z.object({
  userId: z.string().min(1, 'User ID is required'),
  specialization: z.array(z.string()).min(1, 'At least one specialization required'),
  isActive: z.boolean().optional().default(true),
});

export const updateMechanicSchema = z.object({
  specialization: z.array(z.string()).optional(),
  isActive: z.boolean().optional(),
});

export type CreateWorkshopInput = z.infer<typeof createWorkshopSchema>;
export type UpdateWorkshopInput = z.infer<typeof updateWorkshopSchema>;
export type WorkshopQueryInput = z.infer<typeof workshopQuerySchema>;
export type CreateServiceInput = z.infer<typeof createServiceSchema>;
export type UpdateServiceInput = z.infer<typeof updateServiceSchema>;
export type CreateMechanicInput = z.infer<typeof createMechanicSchema>;
export type UpdateMechanicInput = z.infer<typeof updateMechanicSchema>;
