import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { prisma } from '@/db/prisma';
import { successResponse } from '@/utils/response';
import { authMiddleware } from '@/middlewares/auth';
import { requireRole } from '@/middlewares/rbac';
import { UserRole } from '@prisma/client';
import { NotFoundError } from '@/utils/response';

const reportRoutes = new Hono();

const generateReportSchema = z.object({
  summary: z.string().min(10),
});

// Generate report for booking
reportRoutes.post(
  '/:bookingId/report',
  authMiddleware,
  requireRole(UserRole.WORKSHOP, UserRole.ADMIN),
  zValidator('json', generateReportSchema),
  async (c) => {
    const bookingId = c.req.param('bookingId');
    const data = c.req.valid('json');

    const booking = await prisma.booking.findFirst({
      where: { id: bookingId, deletedAt: null },
      include: {
        service: true,
        workOrder: true,
        payment: true,
      },
    });

    if (!booking) throw new NotFoundError('Booking not found');

    // Calculate total cost
    const totalCost = booking.payment?.amount || booking.service.basePrice;

    // Generate PDF URL (stub - in production, use actual PDF generation)
    const pdfUrl = `https://storage.example.com/reports/${bookingId}.pdf`;

    const report = await prisma.report.create({
      data: {
        bookingId,
        summary: data.summary,
        totalCost,
        pdfUrl,
      },
    });

    return successResponse(c, report, 201);
  }
);

// Get report by ID
reportRoutes.get('/:id', authMiddleware, async (c) => {
  const id = c.req.param('id');

  const report = await prisma.report.findUnique({
    where: { id },
    include: {
      booking: {
        include: {
          customer: { select: { id: true, name: true, email: true } },
          workshop: { select: { id: true, name: true } },
          service: true,
          workOrder: true,
          payment: true,
        },
      },
    },
  });

  if (!report) throw new NotFoundError('Report not found');

  return successResponse(c, report);
});

export default reportRoutes;
