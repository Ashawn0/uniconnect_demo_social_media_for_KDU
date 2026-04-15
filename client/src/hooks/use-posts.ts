import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest } from "../lib/api";
import { queryClient } from "../lib/queryClient";
import { PostWithDetails, InsertPost, InsertComment } from "@shared/schema";

export function usePosts(filter: 'all' | 'following' = 'all') {
    return useQuery<PostWithDetails[]>({
        queryKey: ["/api/posts", filter],
        queryFn: async () => {
            const url = filter === 'following' ? "/api/posts?filter=following" : "/api/posts";
            return await apiRequest("GET", url);
        },
    });
}

export function useCreatePost() {
    return useMutation({
        mutationFn: async (post: InsertPost) => {
            return await apiRequest("POST", "/api/posts", post);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/posts"] });
        },
    });
}

export function useToggleLike() {
    return useMutation({
        mutationFn: async (postId: string) => {
            return await apiRequest("POST", `/api/posts/${postId}/like`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/posts"] });
        },
    });
}

export function useCreateComment() {
    return useMutation({
        mutationFn: async ({ postId, content }: { postId: string, content: string }) => {
            return await apiRequest("POST", `/api/posts/${postId}/comments`, { content });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/posts"] });
        },
    });
}
