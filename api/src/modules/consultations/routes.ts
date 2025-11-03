import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { ConsultationService } from './service';
import { createConsultationSchema } from './schemas';
import { successResponse } from '@/utils/response';
import { authMiddleware } from '@/middlewares/auth';
import { requireRole } from '@/middlewares/rbac';
import { UserRole } from '@prisma/client';
import { paginationSchema } from '@/utils/pagination';

const consultationRoutes = new Hono();
const consultationService = new ConsultationService();

// Create consultation
consultationRoutes.post(
  '/',
  authMiddleware,
  requireRole(UserRole.CUSTOMER),
  zValidator('json', createConsultationSchema),
  async (c) => {
    const user = c.get('user');
    const data = c.req.valid('json');
    const result = await consultationService.createConsultation(user.userId, data);
    return successResponse(c, result, 201);
  }
);

// Get consultations
consultationRoutes.get('/', authMiddleware, zValidator('query', paginationSchema), async (c) => {
  const user = c.get('user');
  const { page, limit } = c.req.valid('query');
  const result = await consultationService.getConsultations(user.userId, user.role, page, limit);
  return successResponse(c, result.data, 200, result.meta);
});

// Get consultation by ID
consultationRoutes.get('/:id', authMiddleware, async (c) => {
  const id = c.req.param('id');
  const result = await consultationService.getConsultationById(id);
  return successResponse(c, result);
});

// Close consultation
consultationRoutes.patch('/:id/close', authMiddleware, async (c) => {
  const id = c.req.param('id');
  const user = c.get('user');
  const result = await consultationService.closeConsultation(id, user.userId, user.role);
  return successResponse(c, result);
});

export default consultationRoutes;
