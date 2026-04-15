import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest } from "../lib/api";
import { queryClient } from "../lib/queryClient";
import { GroupWithMembers, InsertGroup } from "@shared/schema";

export function useGroups(type?: string) {
    return useQuery<GroupWithMembers[]>({
        queryKey: ["/api/groups", type],
        queryFn: async () => {
            const url = type ? `/api/groups?type=${type}` : "/api/groups";
            return await apiRequest("GET", url);
        },
    });
}

export function useGroup(groupId: string) {
    return useQuery<GroupWithMembers>({
        queryKey: ["/api/groups", groupId],
        queryFn: async () => {
            return await apiRequest("GET", `/api/groups/${groupId}`);
        },
        enabled: !!groupId,
    });
}

export function useCreateGroup() {
    return useMutation({
        mutationFn: async (group: InsertGroup) => {
            return await apiRequest("POST", "/api/groups", group);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/groups"] });
        },
    });
}

export function useJoinGroup() {
    return useMutation({
        mutationFn: async (groupId: string) => {
            return await apiRequest("POST", `/api/groups/${groupId}/join`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/groups"] });
        },
    });
}

export function useLeaveGroup() {
    return useMutation({
        mutationFn: async (groupId: string) => {
            return await apiRequest("DELETE", `/api/groups/${groupId}/leave`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/groups"] });
        },
    });
}
