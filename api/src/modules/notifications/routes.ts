import { Hono } from 'hono';
import { streamSSE } from 'hono/streaming';
import { prisma } from '@/db/prisma';
import { successResponse } from '@/utils/response';
import { authMiddleware } from '@/middlewares/auth';
import { EventEmitter } from 'events';

// Global event emitter for notifications
export const notificationEmitter = new EventEmitter();

const notificationRoutes = new Hono();

// SSE endpoint for real-time notifications
notificationRoutes.get('/stream', authMiddleware, async (c) => {
  const user = c.get('user');
  const userId = user.userId;

  return streamSSE(c, async (stream) => {
    // Send initial connection message
    await stream.writeSSE({
      data: JSON.stringify({ type: 'connected', message: 'Notification stream connected' }),
      event: 'connected',
      id: Date.now().toString(),
    });

    // Listen for notifications for this user
    const handler = async (notification: any) => {
      if (notification.toUserId === userId) {
        await stream.writeSSE({
          data: JSON.stringify(notification),
          event: 'notification',
          id: notification.id,
        });
      }
    };

    notificationEmitter.on('notification', handler);

    // Cleanup on close
    stream.onAbort(() => {
      notificationEmitter.off('notification', handler);
    });

    // Keep connection alive
    const keepAlive = setInterval(async () => {
      try {
        await stream.writeSSE({
          data: JSON.stringify({ type: 'ping' }),
          event: 'ping',
        });
      } catch (error) {
        clearInterval(keepAlive);
      }
    }, 30000); // Every 30 seconds

    // Clean up on close
    stream.onAbort(() => {
      clearInterval(keepAlive);
      notificationEmitter.off('notification', handler);
    });
  });
});

// Get notifications (paginated)
notificationRoutes.get('/', authMiddleware, async (c) => {
  const user = c.get('user');
  const page = parseInt(c.req.query('page') || '1');
  const limit = parseInt(c.req.query('limit') || '20');
  const skip = (page - 1) * limit;

  const [notifications, total] = await Promise.all([
    prisma.notification.findMany({
      where: { toUserId: user.userId },
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.notification.count({ where: { toUserId: user.userId } }),
  ]);

  return successResponse(
    c,
    notifications,
    200,
    {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      hasMore: page < Math.ceil(total / limit),
    }
  );
});

// Mark notification as read
notificationRoutes.patch('/:id/read', authMiddleware, async (c) => {
  const id = c.req.param('id');
  const user = c.get('user');

  const notification = await prisma.notification.findFirst({
    where: { id, toUserId: user.userId },
  });

  if (!notification) {
    return successResponse(c, { error: 'Notification not found' }, 404);
  }

  const updated = await prisma.notification.update({
    where: { id },
    data: { readAt: new Date() },
  });

  return successResponse(c, updated);
});

// Mark all as read
notificationRoutes.post('/mark-all-read', authMiddleware, async (c) => {
  const user = c.get('user');

  await prisma.notification.updateMany({
    where: {
      toUserId: user.userId,
      readAt: null,
    },
    data: {
      readAt: new Date(),
    },
  });

  return successResponse(c, { message: 'All notifications marked as read' });
});

export default notificationRoutes;

// Helper function to publish notification
export async function publishNotification(notification: any) {
  notificationEmitter.emit('notification', notification);
}
