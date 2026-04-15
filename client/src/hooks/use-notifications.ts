import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest } from "../lib/api";
import { queryClient } from "../lib/queryClient";
import { NotificationWithDetails } from "@shared/schema";

export function useNotifications() {
    return useQuery<NotificationWithDetails[]>({
        queryKey: ["/api/notifications"],
        queryFn: async () => {
            return await apiRequest("GET", "/api/notifications");
        },
    });
}

export function useMarkNotificationAsRead() {
    return useMutation({
        mutationFn: async (notificationId: string) => {
            return await apiRequest("PATCH", `/api/notifications/${notificationId}/read`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/notifications"] });
        },
    });
}

export function useMarkAllNotificationsAsRead() {
    return useMutation({
        mutationFn: async () => {
            return await apiRequest("PATCH", "/api/notifications/read-all");
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/notifications"] });
        },
    });
}

export function useDeleteNotification() {
    return useMutation({
        mutationFn: async (notificationId: string) => {
            return await apiRequest("DELETE", `/api/notifications/${notificationId}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/notifications"] });
        },
    });
}
