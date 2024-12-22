// src/utils/chatStorage.ts
import Dexie from 'dexie';

interface ChatMessage {
  id?: number;
  timestamp: number;
  chatId: string;
  message: string;
  sender: string;
}

const db = new Dexie('chatDatabase');
db.version(1).stores({
  messages: '++id, timestamp, chatId, message, sender',
});

export async function saveMessage(chatId: string, message: string, sender: string): Promise<void> {
  await db.messages.add({
    timestamp: new Date().getTime(),
    chatId,
    message,
    sender,
  });
}

export async function getMessagesByChatId(chatId: string): Promise<ChatMessage[]> {
  return await db.messages.where('chatId').equals(chatId).toArray();
}