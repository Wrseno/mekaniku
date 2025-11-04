import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { WorkshopService } from './service';
import {
  createWorkshopSchema,
  updateWorkshopSchema,
  workshopQuerySchema,
  createServiceSchema,
  updateServiceSchema,
  createMechanicSchema,
  updateMechanicSchema,
} from './schemas';
import { successResponse } from '@/utils/response';
import { authMiddleware } from '@/middlewares/auth';
import { requireRole, requireWorkshopAccess } from '@/middlewares/rbac';
import { UserRole } from '@prisma/client';
import { paginationSchema } from '@/utils/pagination';

const workshopRoutes = new Hono();
const workshopService = new WorkshopService();

// Create workshop (WORKSHOP or ADMIN)
workshopRoutes.post(
  '/',
  authMiddleware,
  requireRole(UserRole.WORKSHOP, UserRole.ADMIN),
  zValidator('json', createWorkshopSchema),
  async (c) => {
    const user = c.get('user');
    const data = c.req.valid('json');
    const result = await workshopService.createWorkshop(user.userId, data);
    return successResponse(c, result, 201);
  }
);

// Get workshops (public with filters)
workshopRoutes.get('/', zValidator('query', workshopQuerySchema.merge(paginationSchema)), async (c) => {
  const query = c.req.valid('query');
  const { page, limit, ...filters } = query;
  const result = await workshopService.getWorkshops(filters, page, limit);
  return successResponse(c, result.data, 200, result.meta);
});

// Get workshop by ID (public)
workshopRoutes.get('/:id', async (c) => {
  const id = c.req.param('id');
  const result = await workshopService.getWorkshopById(id);
  return successResponse(c, result);
});

// Update workshop
workshopRoutes.patch(
  '/:id',
  authMiddleware,
  requireRole(UserRole.WORKSHOP, UserRole.ADMIN),
  zValidator('json', updateWorkshopSchema),
  async (c) => {
    const id = c.req.param('id');
    const user = c.get('user');
    const data = c.req.valid('json');
    const result = await workshopService.updateWorkshop(id, data, user.userId, user.role);
    return successResponse(c, result);
  }
);

// Delete workshop
workshopRoutes.delete(
  '/:id',
  authMiddleware,
  requireRole(UserRole.WORKSHOP, UserRole.ADMIN),
  async (c) => {
    const id = c.req.param('id');
    const user = c.get('user');
    const result = await workshopService.deleteWorkshop(id, user.userId, user.role);
    return successResponse(c, result);
  }
);

// === Service Catalog Routes ===

// Create service
workshopRoutes.post(
  '/:id/services',
  authMiddleware,
  requireWorkshopAccess(),
  zValidator('json', createServiceSchema),
  async (c) => {
    const workshopId = c.req.param('id');
    const data = c.req.valid('json');
    const result = await workshopService.createService(workshopId, data);
    return successResponse(c, result, 201);
  }
);

// Get services
workshopRoutes.get('/:id/services', async (c) => {
  const workshopId = c.req.param('id');
  const result = await workshopService.getServices(workshopId);
  return successResponse(c, result);
});

// Update service
workshopRoutes.patch(
  '/:id/services/:serviceId',
  authMiddleware,
  requireWorkshopAccess(),
  zValidator('json', updateServiceSchema),
  async (c) => {
    const serviceId = c.req.param('serviceId');
    const data = c.req.valid('json');
    const result = await workshopService.updateService(serviceId, data);
    return successResponse(c, result);
  }
);

// Delete service
workshopRoutes.delete(
  '/:id/services/:serviceId',
  authMiddleware,
  requireWorkshopAccess(),
  async (c) => {
    const serviceId = c.req.param('serviceId');
    const result = await workshopService.deleteService(serviceId);
    return successResponse(c, result);
  }
);

// === Mechanic Routes ===

// Create mechanic
workshopRoutes.post(
  '/:id/mechanics',
  authMiddleware,
  requireWorkshopAccess(),
  zValidator('json', createMechanicSchema),
  async (c) => {
    const workshopId = c.req.param('id');
    const data = c.req.valid('json');
    const result = await workshopService.createMechanic(workshopId, data);
    return successResponse(c, result, 201);
  }
);

// Get mechanics
workshopRoutes.get('/:id/mechanics', async (c) => {
  const workshopId = c.req.param('id');
  const result = await workshopService.getMechanics(workshopId);
  return successResponse(c, result);
});

// Update mechanic
workshopRoutes.patch(
  '/:id/mechanics/:mechanicId',
  authMiddleware,
  requireWorkshopAccess(),
  zValidator('json', updateMechanicSchema),
  async (c) => {
    const mechanicId = c.req.param('mechanicId');
    const data = c.req.valid('json');
    const result = await workshopService.updateMechanic(mechanicId, data);
    return successResponse(c, result);
  }
);

// Delete mechanic
workshopRoutes.delete(
  '/:id/mechanics/:mechanicId',
  authMiddleware,
  requireWorkshopAccess(),
  async (c) => {
    const mechanicId = c.req.param('mechanicId');
    const result = await workshopService.deleteMechanic(mechanicId);
    return successResponse(c, result);
  }
);

export default workshopRoutes;
