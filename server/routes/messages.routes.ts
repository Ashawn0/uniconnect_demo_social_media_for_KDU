import { Router } from 'express';
import { requireAuth } from '../middleware/auth.middleware';
import { messagesService } from '../services/messages.service';
import { insertMessageSchema } from '@shared/schema';
import { broadcastNewMessage } from '../websocket';

const router = Router();

router.use(requireAuth);

router.get('/conversations', async (req, res) => {
    try {
        const userId = (req as any).userId;
        const conversations = await messagesService.getRecentConversations(userId);
        res.json(conversations);
    } catch (error) {
        console.error('Error fetching conversations:', error);
        res.status(500).json({ message: 'Failed to fetch conversations' });
    }
});

router.get('/:userId', async (req, res) => {
    try {
        const currentUserId = (req as any).userId;
        const { userId } = req.params;
        const messages = await messagesService.getConversation(currentUserId, userId);
        res.json(messages);
    } catch (error) {
        console.error('Error fetching messages:', error);
        res.status(500).json({ message: 'Failed to fetch messages' });
    }
});

router.post('/', async (req, res) => {
    try {
        const userId = (req as any).userId;
        const validatedData = insertMessageSchema.parse(req.body);

        // Ensure sender matches auth user
        if (validatedData.senderId !== userId) {
            return res.status(403).json({ message: 'Unauthorized sender' });
        }

        const message = await messagesService.createMessage(validatedData);
        broadcastNewMessage(message.receiverId, message);
        res.json(message);
    } catch (error) {
        console.error('Error sending message:', error);
        res.status(500).json({ message: 'Failed to send message' });
    }
});

export default router;
