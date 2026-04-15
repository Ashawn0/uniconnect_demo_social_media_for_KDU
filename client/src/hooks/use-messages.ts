import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "../lib/api";
import { MessageWithSender, InsertMessage } from "@shared/schema";
import { useEffect, useRef } from "react";
import { useAuth } from "./use-auth";

export function useConversations() {
    return useQuery<any[]>({
        queryKey: ["/api/messages/conversations"],
        queryFn: async () => {
            return await apiRequest("GET", "/api/messages/conversations");
        },
    });
}

export function useMessages(userId: string) {
    return useQuery<MessageWithSender[]>({
        queryKey: ["/api/messages", userId],
        queryFn: async () => {
            // If no userId, don't fetch
            if (!userId) return [];
            return await apiRequest("GET", `/api/messages/${userId}`);
        },
        enabled: !!userId,
    });
}

export function useWebSocket() {
    const { user } = useAuth();
    const queryClient = useQueryClient();
    const ws = useRef<WebSocket | null>(null);

    useEffect(() => {
        if (!user) return;

        // Current host
        const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
        const wsUrl = `${protocol}//${window.location.host}/ws`;

        ws.current = new WebSocket(wsUrl);

        ws.current.onmessage = (event) => {
            const message = JSON.parse(event.data);

            if (message.type === 'new_message') {
                const newMsg = message.payload;

                // Update conversation list
                queryClient.invalidateQueries({ queryKey: ["/api/messages/conversations"] });

                // Update specific chat if open (using senderId as key)
                queryClient.setQueryData(["/api/messages", newMsg.senderId], (old: MessageWithSender[] | undefined) => {
                    if (!old) return [newMsg];
                    return [...old, newMsg];
                });

                // Also update if we are the sender (confirmation) - though we might want to do this optimistically instead
                queryClient.setQueryData(["/api/messages", newMsg.receiverId], (old: MessageWithSender[] | undefined) => {
                    if (!old) return [newMsg];
                    return [...old, newMsg];
                });
            }
        };

        return () => {
            ws.current?.close();
        };
    }, [user, queryClient]);

    const sendMessage = (receiverId: string, content: string) => {
        if (ws.current?.readyState === WebSocket.OPEN) {
            ws.current.send(JSON.stringify({
                type: 'chat_message',
                payload: { receiverId, content }
            }));

            // Optimistic update logic could go here, but for now we rely on the WS response or React Query invalidation
            // Actually, let's just use the REST API for sending to ensure persistence, and WS for real-time receiving?
            // Or use WS for both. The backend handler does both.
            // Let's rely on WS for sending to verify the implementation.
        }
    };

    return { sendMessage };
}
