import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { AuthService } from './service';
import { registerSchema, loginSchema, refreshTokenSchema } from './schemas';
import { successResponse } from '@/utils/response';
import { authMiddleware } from '@/middlewares/auth';

const authRoutes = new Hono();
const authService = new AuthService();

// Register
authRoutes.post('/register', zValidator('json', registerSchema), async (c) => {
  const data = c.req.valid('json');
  const result = await authService.register(data);
  return successResponse(c, result, 201);
});

// Login
authRoutes.post('/login', zValidator('json', loginSchema), async (c) => {
  const data = c.req.valid('json');
  const result = await authService.login(data);
  return successResponse(c, result);
});

// Refresh token
authRoutes.post('/refresh', zValidator('json', refreshTokenSchema), async (c) => {
  const { refreshToken } = c.req.valid('json');
  const tokens = await authService.refreshToken(refreshToken);
  return successResponse(c, tokens);
});

// Logout (client-side token removal, optionally implement token blacklist)
authRoutes.post('/logout', authMiddleware, async (c) => {
  return successResponse(c, { message: 'Logged out successfully' });
});

// Get current user
authRoutes.get('/me', authMiddleware, async (c) => {
  const user = c.get('user');
  return successResponse(c, user);
});

// Get Firebase custom token
authRoutes.get('/firebase-token', authMiddleware, async (c) => {
  const user = c.get('user');
  const result = await authService.getFirebaseToken(user.userId);
  return successResponse(c, result);
});

export default authRoutes;
