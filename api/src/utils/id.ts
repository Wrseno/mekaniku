import { nanoid } from 'nanoid';

export function generateId(prefix?: string): string {
  const id = nanoid(16);
  return prefix ? `${prefix}_${id}` : id;
}

export function generateChatId(): string {
  return `chat_${nanoid(20)}`;
}

export function generateMessageId(): string {
  return `msg_${nanoid(20)}`;
}
