import { Context, Next } from 'hono';
import { env } from '@/config/env';
import { errorResponse } from '@/utils/response';

interface RateLimitStore {
  [key: string]: {
    count: number;
    resetTime: number;
  };
}

const store: RateLimitStore = {};

// Clean up old entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  Object.keys(store).forEach((key) => {
    if (store[key].resetTime < now) {
      delete store[key];
    }
  });
}, 5 * 60 * 1000);

export function rateLimit(options?: { max?: number; windowMs?: number }) {
  const max = options?.max ?? env.RATE_LIMIT_MAX;
  const windowMs = options?.windowMs ?? env.RATE_LIMIT_WINDOW_MS;

  return async (c: Context, next: Next) => {
    // Get client identifier (IP or user ID)
    const user = c.get('user');
    const ip = c.req.header('x-forwarded-for') || c.req.header('x-real-ip') || 'unknown';
    const key = user?.userId || ip;

    const now = Date.now();
    const record = store[key];

    if (!record || record.resetTime < now) {
      // First request or window expired
      store[key] = {
        count: 1,
        resetTime: now + windowMs,
      };
      return next();
    }

    if (record.count >= max) {
      const retryAfter = Math.ceil((record.resetTime - now) / 1000);
      c.header('Retry-After', retryAfter.toString());
      c.header('X-RateLimit-Limit', max.toString());
      c.header('X-RateLimit-Remaining', '0');
      c.header('X-RateLimit-Reset', record.resetTime.toString());

      return errorResponse(c, 'Too many requests', 429, 'RATE_LIMIT_EXCEEDED');
    }

    record.count++;
    c.header('X-RateLimit-Limit', max.toString());
    c.header('X-RateLimit-Remaining', (max - record.count).toString());
    c.header('X-RateLimit-Reset', record.resetTime.toString());

    return next();
  };
}
