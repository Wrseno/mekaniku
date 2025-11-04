import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { ChatService } from './service';
import { createChatSchema, sendMessageSchema, addMemberSchema } from './schemas';
import { successResponse } from '@/utils/response';
import { authMiddleware } from '@/middlewares/auth';
import { requireRole } from '@/middlewares/rbac';
import { UserRole } from '@prisma/client';

const chatRoutes = new Hono();
const chatService = new ChatService();

// Create chat (WORKSHOP/ADMIN)
chatRoutes.post(
  '/',
  authMiddleware,
  requireRole(UserRole.WORKSHOP, UserRole.ADMIN),
  zValidator('json', createChatSchema),
  async (c) => {
    const data = c.req.valid('json');
    const chatId = await chatService.createChat(data);
    return successResponse(c, { chatId }, 201);
  }
);

// Get chat metadata
chatRoutes.get('/:id', authMiddleware, async (c) => {
  const id = c.req.param('id');
  const user = c.get('user');

  // Verify membership
  const isMember = await chatService.checkMembership(id, user.userId);
  if (!isMember && user.role !== UserRole.ADMIN) {
    return successResponse(c, { error: 'Forbidden' }, 403);
  }

  const chat = await chatService.getChat(id);
  return successResponse(c, chat);
});

// Get messages
chatRoutes.get('/:id/messages', authMiddleware, async (c) => {
  const id = c.req.param('id');
  const user = c.get('user');
  const limit = parseInt(c.req.query('limit') || '50');

  // Verify membership
  const isMember = await chatService.checkMembership(id, user.userId);
  if (!isMember && user.role !== UserRole.ADMIN) {
    return successResponse(c, { error: 'Forbidden' }, 403);
  }

  const messages = await chatService.getMessages(id, limit);
  return successResponse(c, { messages });
});

// Send message (server-initiated, typically SYSTEM messages)
chatRoutes.post(
  '/:id/messages',
  authMiddleware,
  requireRole(UserRole.WORKSHOP, UserRole.ADMIN),
  zValidator('json', sendMessageSchema),
  async (c) => {
    const id = c.req.param('id');
    const user = c.get('user');
    const data = c.req.valid('json');

    const messageId = await chatService.sendMessage(id, user.userId, user.role, data);
    return successResponse(c, { messageId }, 201);
  }
);

// Add member
chatRoutes.post(
  '/:id/members',
  authMiddleware,
  requireRole(UserRole.WORKSHOP, UserRole.ADMIN),
  zValidator('json', addMemberSchema),
  async (c) => {
    const id = c.req.param('id');
    const { userId } = c.req.valid('json');

    await chatService.addMember(id, userId);
    return successResponse(c, { message: 'Member added successfully' });
  }
);

// Remove member
chatRoutes.delete(
  '/:id/members/:userId',
  authMiddleware,
  requireRole(UserRole.WORKSHOP, UserRole.ADMIN),
  async (c) => {
    const id = c.req.param('id');
    const userId = c.req.param('userId');

    await chatService.removeMember(id, userId);
    return successResponse(c, { message: 'Member removed successfully' });
  }
);

export default chatRoutes;
