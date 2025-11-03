import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { prisma } from '@/db/prisma';
import { successResponse } from '@/utils/response';
import { authMiddleware } from '@/middlewares/auth';
import { NotFoundError, ValidationError } from '@/utils/response';
import { PaymentStatus } from '@prisma/client';

const paymentRoutes = new Hono();

const createPaymentSchema = z.object({
  amount: z.number().positive(),
  method: z.enum(['CASH', 'CREDIT_CARD', 'DEBIT_CARD', 'BANK_TRANSFER', 'E_WALLET']),
});

// Create/process payment for booking (Mock gateway)
paymentRoutes.post(
  '/:bookingId/pay',
  authMiddleware,
  zValidator('json', createPaymentSchema),
  async (c) => {
    const bookingId = c.req.param('bookingId');
    const data = c.req.valid('json');
    const user = c.get('user');

    const booking = await prisma.booking.findFirst({
      where: { id: bookingId, deletedAt: null },
      include: { payment: true },
    });

    if (!booking) throw new NotFoundError('Booking not found');
    if (booking.customerId !== user.userId) {
      throw new ValidationError('Only the customer can make payment');
    }
    if (booking.payment) {
      throw new ValidationError('Payment already exists for this booking');
    }

    // Mock payment gateway - simulate random success/failure
    const isSuccess = Math.random() > 0.1; // 90% success rate
    const status = isSuccess ? PaymentStatus.PAID : PaymentStatus.FAILED;
    const externalRef = `PAY_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const payment = await prisma.$transaction(async (tx: any) => {
      const newPayment = await tx.payment.create({
        data: {
          bookingId,
          amount: data.amount,
          method: data.method,
          status,
          paidAt: isSuccess ? new Date() : null,
          externalRef,
        },
      });

      if (isSuccess) {
        // Create notification
        await tx.notification.create({
          data: {
            toUserId: booking.customerId,
            type: 'PAYMENT_CONFIRMED',
            payload: {
              bookingId,
              amount: data.amount,
              externalRef,
            },
          },
        });

        // Audit log
        await tx.auditLog.create({
          data: {
            actorId: user.userId,
            entityType: 'Payment',
            entityId: newPayment.id,
            action: 'PAYMENT_SUCCESS',
            toStatus: PaymentStatus.PAID,
            meta: { amount: data.amount, method: data.method },
          },
        });
      }

      return newPayment;
    });

    // Send chat message if payment successful
    if (isSuccess && booking.chatId) {
      const { ChatService } = await import('@/modules/chat/service');
      const chatService = new ChatService();
      await chatService.sendSystemMessage(
        booking.chatId,
        `Payment of ${data.amount} received via ${data.method}`
      );
    }

    return successResponse(c, payment, 201);
  }
);

// Get payment by ID
paymentRoutes.get('/:id', authMiddleware, async (c) => {
  const id = c.req.param('id');

  const payment = await prisma.payment.findUnique({
    where: { id },
    include: { booking: true },
  });

  if (!payment) throw new NotFoundError('Payment not found');

  return successResponse(c, payment);
});

export default paymentRoutes;
