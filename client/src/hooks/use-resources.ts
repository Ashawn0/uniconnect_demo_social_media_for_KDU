import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest } from "../lib/api";
import { queryClient } from "../lib/queryClient";
import { ResourceWithDetails, InsertResource } from "@shared/schema";

export function useResources(groupId?: string) {
    return useQuery<ResourceWithDetails[]>({
        queryKey: groupId ? ["/api/resources", groupId] : ["/api/resources"],
        queryFn: async () => {
            const url = groupId ? `/api/resources?groupId=${groupId}` : "/api/resources";
            return await apiRequest("GET", url);
        },
    });
}

export function useCreateResource() {
    return useMutation({
        mutationFn: async (resource: InsertResource) => {
            return await apiRequest("POST", "/api/resources", resource);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/resources"] });
        },
    });
}

export function useDeleteResource() {
    return useMutation({
        mutationFn: async (resourceId: string) => {
            return await apiRequest("DELETE", `/api/resources/${resourceId}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/resources"] });
        },
    });
}
