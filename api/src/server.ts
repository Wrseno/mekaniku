import { serve } from '@hono/node-server';
import app from './app';
import { env } from './config/env';
import { logger } from './utils/logger';
import { initializeFirebase } from './lib/firebase';

// Initialize Firebase
try {
  initializeFirebase();
} catch (error) {
  logger.warn('Firebase initialization failed. Chat features will be unavailable.');
  logger.warn(error);
}

// Start server
const port = env.PORT;

serve(
  {
    fetch: app.fetch,
    port,
  },
  (info) => {
    logger.info(`🚀 Server is running on http://localhost:${info.port}`);
    logger.info(`📝 Environment: ${env.NODE_ENV}`);
    logger.info(`🔧 Health check: http://localhost:${info.port}/health`);
  }
);

// Graceful shutdown
process.on('SIGINT', () => {
  logger.info('Received SIGINT, shutting down gracefully...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  logger.info('Received SIGTERM, shutting down gracefully...');
  process.exit(0);
});
