import { db } from "../db";
import { messages, users, type InsertMessage } from "@shared/schema";
import { eq, or, and, desc, ne, asc } from "drizzle-orm";
import { sanitizeUser } from "../storage";

export class MessagesService {
    async createMessage(data: InsertMessage) {
        const [message] = await db
            .insert(messages)
            .values(data)
            .returning();
        return message;
    }

    async getConversation(userId1: string, userId2: string) {
        // Get all messages between two users
        const conversation = await db.query.messages.findMany({
            where: or(
                and(eq(messages.senderId, userId1), eq(messages.receiverId, userId2)),
                and(eq(messages.senderId, userId2), eq(messages.receiverId, userId1))
            ),
            orderBy: asc(messages.createdAt),
            with: {
                sender: true,
            }
        });
        return conversation.map((message) => ({
            ...message,
            sender: sanitizeUser(message.sender),
        }));
    }

    async getRecentConversations(userId: string) {
        // This is a bit complex in standard SQL/ORM without a dedicated conversation table
        // For simplicity, we'll fetch distinct users the current user has interacted with

        // 1. Get all messages sent or received by the user
        const allMessages = await db.query.messages.findMany({
            where: or(eq(messages.senderId, userId), eq(messages.receiverId, userId)),
            orderBy: desc(messages.createdAt),
            with: {
                sender: true,
                receiver: true,
            }
        });

        // 2. Group by the "other" user
        const conversations = new Map<string, any>();

        for (const msg of allMessages) {
            const otherUserId = msg.senderId === userId ? msg.receiverId : msg.senderId;
            const otherUser = msg.senderId === userId ? msg.receiver : msg.sender;

            if (!conversations.has(otherUserId)) {
                conversations.set(otherUserId, {
                    user: sanitizeUser(otherUser),
                    lastMessage: msg,
                    unreadCount: 0
                });
            }

            const conv = conversations.get(otherUserId);
            if (msg.receiverId === userId && !msg.read) {
                conv.unreadCount++;
            }
        }

        return Array.from(conversations.values());
    }

    async markAsRead(senderId: string, receiverId: string) {
        return db
            .update(messages)
            .set({ read: true })
            .where(
                and(
                    eq(messages.senderId, senderId),
                    eq(messages.receiverId, receiverId),
                    eq(messages.read, false)
                )
            )
            .returning();
    }
}

export const messagesService = new MessagesService();
