import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { prisma } from '@/db/prisma';
import { successResponse } from '@/utils/response';
import { authMiddleware } from '@/middlewares/auth';
import { requireRole } from '@/middlewares/rbac';
import { UserRole } from '@prisma/client';
import { NotFoundError } from '@/utils/response';

const vehicleRoutes = new Hono();

const createVehicleSchema = z.object({
  plateNo: z.string().min(1, 'Plate number is required'),
  brand: z.string().min(1, 'Brand is required'),
  model: z.string().min(1, 'Model is required'),
  year: z.number().int().min(1900).max(new Date().getFullYear() + 1),
});

const updateVehicleSchema = createVehicleSchema.partial();

// Create vehicle
vehicleRoutes.post(
  '/',
  authMiddleware,
  requireRole(UserRole.CUSTOMER),
  zValidator('json', createVehicleSchema),
  async (c) => {
    const user = c.get('user');
    const data = c.req.valid('json');

    const vehicle = await prisma.vehicle.create({
      data: {
        ...data,
        customerId: user.userId,
      },
    });

    return successResponse(c, vehicle, 201);
  }
);

// Get my vehicles
vehicleRoutes.get('/', authMiddleware, requireRole(UserRole.CUSTOMER), async (c) => {
  const user = c.get('user');

  const vehicles = await prisma.vehicle.findMany({
    where: { customerId: user.userId },
    orderBy: { createdAt: 'desc' },
  });

  return successResponse(c, vehicles);
});

// Get vehicle by ID
vehicleRoutes.get('/:id', authMiddleware, async (c) => {
  const id = c.req.param('id');

  const vehicle = await prisma.vehicle.findUnique({
    where: { id },
  });

  if (!vehicle) {
    throw new NotFoundError('Vehicle not found');
  }

  return successResponse(c, vehicle);
});

// Update vehicle
vehicleRoutes.patch(
  '/:id',
  authMiddleware,
  requireRole(UserRole.CUSTOMER),
  zValidator('json', updateVehicleSchema),
  async (c) => {
    const id = c.req.param('id');
    const user = c.get('user');
    const data = c.req.valid('json');

    // Verify ownership
    const vehicle = await prisma.vehicle.findFirst({
      where: { id, customerId: user.userId },
    });

    if (!vehicle) {
      throw new NotFoundError('Vehicle not found or not owned by you');
    }

    const updated = await prisma.vehicle.update({
      where: { id },
      data,
    });

    return successResponse(c, updated);
  }
);

// Delete vehicle
vehicleRoutes.delete('/:id', authMiddleware, requireRole(UserRole.CUSTOMER), async (c) => {
  const id = c.req.param('id');
  const user = c.get('user');

  // Verify ownership
  const vehicle = await prisma.vehicle.findFirst({
    where: { id, customerId: user.userId },
  });

  if (!vehicle) {
    throw new NotFoundError('Vehicle not found or not owned by you');
  }

  await prisma.vehicle.delete({
    where: { id },
  });

  return successResponse(c, { message: 'Vehicle deleted successfully' });
});

export default vehicleRoutes;
