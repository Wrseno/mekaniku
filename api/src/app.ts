import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger as honoLogger } from 'hono/logger';
import { prettyJSON } from 'hono/pretty-json';
import { env } from '@/config/env';
import { errorHandler } from '@/middlewares/error';
import { rateLimit } from '@/middlewares/rateLimit';

// Import routes
import authRoutes from '@/modules/auth/routes';
import workshopRoutes from '@/modules/workshops/routes';
import vehicleRoutes from '@/modules/vehicles/routes';
import consultationRoutes from '@/modules/consultations/routes';
import bookingRoutes from '@/modules/bookings/routes';
import chatRoutes from '@/modules/chat/routes';
import inspectionRoutes from '@/modules/inspections/routes';
import workOrderRoutes from '@/modules/workorders/routes';
import paymentRoutes from '@/modules/payments/routes';
import reviewRoutes from '@/modules/reviews/routes';
import reportRoutes from '@/modules/reports/routes';
import notificationRoutes from '@/modules/notifications/routes';

const app = new Hono();

// Global middlewares
app.use('*', honoLogger());
app.use('*', prettyJSON());
app.use(
  '*',
  cors({
    origin: env.ALLOWED_ORIGINS_ARRAY,
    credentials: true,
  })
);
app.use('*', errorHandler);

// Rate limiting (optional - apply globally or per route)
app.use('/api/*', rateLimit());

// Health check
app.get('/health', (c) => {
  return c.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// API routes
app.route('/api/auth', authRoutes);
app.route('/api/workshops', workshopRoutes);
app.route('/api/vehicles', vehicleRoutes);
app.route('/api/consultations', consultationRoutes);
app.route('/api/bookings', bookingRoutes);
app.route('/api/chats', chatRoutes);
app.route('/api/bookings', inspectionRoutes);
app.route('/api/bookings', workOrderRoutes);
app.route('/api/bookings', paymentRoutes);
app.route('/api/bookings', reviewRoutes);
app.route('/api/bookings', reportRoutes);
app.route('/api/notifications', notificationRoutes);

// 404 handler
app.notFound((c) => {
  return c.json(
    {
      success: false,
      error: {
        message: 'Route not found',
        code: 'NOT_FOUND',
      },
    },
    404
  );
});

export default app;
