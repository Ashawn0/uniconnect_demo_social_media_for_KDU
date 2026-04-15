import { WebSocket, WebSocketServer } from 'ws';
import { Server } from 'http';
import { db } from './db';
import { parse } from 'url';
import { sessionMiddleware } from './index'; // detailed in step below
import { NextFunction, Request, Response } from 'express';
import { messagesService } from './services/messages.service';

// Basic session type augmentation for TS
declare module 'http' {
    interface IncomingMessage {
        session: any;
    }
}

interface ExtendedWebSocket extends WebSocket {
    userId?: string;
    isAlive?: boolean;
}

let activeWss: WebSocketServer | null = null;

export function setupWebSocket(server: Server) {
    const wss = new WebSocketServer({ noServer: true });
    activeWss = wss;

    // Heartbeat to keep connections alive
    const interval = setInterval(() => {
        wss.clients.forEach((ws: WebSocket) => {
            const extWs = ws as ExtendedWebSocket;
            if (extWs.isAlive === false) return ws.terminate();

            extWs.isAlive = false;
            ws.ping();
        });
    }, 30000);

    wss.on('close', () => {
        clearInterval(interval);
    });

    server.on('upgrade', (request, socket, head) => {
        const { pathname } = parse(request.url || '', true);

        // Only handle upgrades for our chat/notification path
        if (pathname !== '/ws') {
            // Allow other listeners (like Vite) to handle this
            return;
        }

        // This looks hacky but we need to parse the session from the upgrade request
        // @ts-ignore
        sessionMiddleware(request as Request, {} as Response, () => {
            // @ts-ignore
            if (!request.session || !request.session.userId) {
                socket.write('HTTP/1.1 401 Unauthorized\r\n\r\n');
                socket.destroy();
                return;
            }

            wss.handleUpgrade(request, socket, head, (ws) => {
                wss.emit('connection', ws, request);
            });
        });
    });

    wss.on('connection', (ws: ExtendedWebSocket, req: any) => {
        // @ts-ignore
        const userId = req.session.userId;
        ws.userId = userId;
        ws.isAlive = true;

        console.log(`User ${userId} connected to WebSocket`);

        ws.on('pong', () => {
            ws.isAlive = true;
        });

        ws.on('message', async (data: string) => {
            try {
                const message = JSON.parse(data.toString());

                if (message.type === 'chat_message') {
                    const { receiverId, content } = message.payload;

                    // Store message in DB
                    const savedMessage = await messagesService.createMessage({
                        senderId: userId,
                        receiverId,
                        content,
                    });

                    // Send to receiver if online
                    wss.clients.forEach((client: WebSocket) => {
                        const extClient = client as ExtendedWebSocket;
                        if (extClient.userId === receiverId && extClient.readyState === WebSocket.OPEN) {
                            extClient.send(JSON.stringify({
                                type: 'new_message',
                                payload: savedMessage
                            }));
                        }
                    });

                    // Emit a single normalized event type for sender/receiver listeners.
                    ws.send(JSON.stringify({
                        type: 'new_message',
                        payload: savedMessage
                    }));
                }

                if (message.type === 'mark_read') {
                    const { senderId } = message.payload;
                    await messagesService.markAsRead(senderId, userId);
                }

            } catch (err) {
                console.error('WebSocket message error:', err);
            }
        });

        ws.on('close', () => {
            console.log(`User ${userId} disconnected`);
        });
    });

    return wss;
}

// Helper to broadcast notifications from other parts of the app
export function broadcastNotification(userId: string, type: string, payload: any) {
    // We need to export/import the wss instance or attach it to app
    // For now, let's assume this function is called where wss is available or assign it to a global
}

export function broadcastNewMessage(receiverId: string, payload: any) {
    if (!activeWss) return;
    activeWss.clients.forEach((client: WebSocket) => {
        const extClient = client as ExtendedWebSocket;
        if (extClient.userId === receiverId && extClient.readyState === WebSocket.OPEN) {
            extClient.send(JSON.stringify({
                type: 'new_message',
                payload,
            }));
        }
    });
}
