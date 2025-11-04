import { getFirebaseDatabase } from '@/lib/firebase';
import { generateChatId, generateMessageId } from '@/utils/id';
import { NotFoundError, ForbiddenError } from '@/utils/response';
import { CreateChatInput, SendMessageInput } from './schemas';

export class ChatService {
  private db = getFirebaseDatabase();

  async createChat(data: CreateChatInput & { consultationId?: string | null }): Promise<string> {
    const chatId = generateChatId();

    // Create chat metadata
    const chatData = {
      chatId,
      workshopId: data.workshopId,
      bookingId: data.bookingId || null,
      consultationId: data.consultationId || null,
      participants: data.participants,
      createdAt: Date.now(),
    };

    await this.db.ref(`chats/${chatId}`).set(chatData);

    // Add members
    const memberUpdates: any = {};
    data.participants.forEach((userId) => {
      memberUpdates[`chatMembers/${chatId}/${userId}`] = true;
    });
    await this.db.ref().update(memberUpdates);

    return chatId;
  }

  async getChat(chatId: string): Promise<any> {
    const snapshot = await this.db.ref(`chats/${chatId}`).once('value');
    const chat = snapshot.val();

    if (!chat) {
      throw new NotFoundError('Chat not found');
    }

    return chat;
  }

  async checkMembership(chatId: string, userId: string): Promise<boolean> {
    const snapshot = await this.db.ref(`chatMembers/${chatId}/${userId}`).once('value');
    return snapshot.val() === true;
  }

  async sendSystemMessage(chatId: string, text: string): Promise<string> {
    const messageId = generateMessageId();

    const message = {
      senderId: 'system',
      senderRole: 'SYSTEM',
      type: 'SYSTEM',
      text,
      createdAt: Date.now(),
    };

    await this.db.ref(`messages/${chatId}/${messageId}`).set(message);

    return messageId;
  }

  async sendMessage(
    chatId: string,
    senderId: string,
    senderRole: string,
    data: SendMessageInput
  ): Promise<string> {
    // Verify membership
    const isMember = await this.checkMembership(chatId, senderId);
    if (!isMember) {
      throw new ForbiddenError('You are not a member of this chat');
    }

    const messageId = generateMessageId();

    const message = {
      senderId,
      senderRole,
      type: data.type,
      text: data.text || null,
      attachments: data.attachments || [],
      createdAt: Date.now(),
    };

    await this.db.ref(`messages/${chatId}/${messageId}`).set(message);

    return messageId;
  }

  async addMember(chatId: string, userId: string): Promise<void> {
    // Verify chat exists
    await this.getChat(chatId);

    // Add member
    const updates: any = {};
    updates[`chatMembers/${chatId}/${userId}`] = true;

    // Update participants in chat metadata
    const chatSnapshot = await this.db.ref(`chats/${chatId}/participants`).once('value');
    const participants: string[] = chatSnapshot.val() || [];
    if (!participants.includes(userId)) {
      participants.push(userId);
      updates[`chats/${chatId}/participants`] = participants;
    }

    await this.db.ref().update(updates);

    // Send system message
    await this.sendSystemMessage(chatId, `User ${userId} joined the chat`);
  }

  async removeMember(chatId: string, userId: string): Promise<void> {
    // Remove member
    await this.db.ref(`chatMembers/${chatId}/${userId}`).remove();

    // Update participants
    const chatSnapshot = await this.db.ref(`chats/${chatId}/participants`).once('value');
    const participants: string[] = chatSnapshot.val() || [];
    const filtered = participants.filter((id) => id !== userId);
    await this.db.ref(`chats/${chatId}/participants`).set(filtered);

    // Send system message
    await this.sendSystemMessage(chatId, `User ${userId} left the chat`);
  }

  async setTyping(chatId: string, userId: string, isTyping: boolean): Promise<void> {
    await this.db.ref(`typing/${chatId}/${userId}`).set(isTyping);

    if (isTyping) {
      // Auto-remove after 3 seconds
      setTimeout(async () => {
        await this.db.ref(`typing/${chatId}/${userId}`).remove();
      }, 3000);
    }
  }

  async setPresence(userId: string, online: boolean): Promise<void> {
    await this.db.ref(`presence/${userId}`).set({
      online,
      lastSeen: Date.now(),
    });
  }

  async getMessages(chatId: string, limit: number = 50): Promise<any[]> {
    const snapshot = await this.db
      .ref(`messages/${chatId}`)
      .orderByChild('createdAt')
      .limitToLast(limit)
      .once('value');

    const messages: any[] = [];
    snapshot.forEach((child) => {
      messages.push({
        id: child.key,
        ...child.val(),
      });
    });

    return messages;
  }
}
