import { useMutation, useQuery } from '@tanstack/react-query';
import { apiRequest, queryClient, resolveApiUrl } from '@/lib/queryClient';
import type { User } from '@shared/schema';

interface RegisterData {
    email: string;
    password: string;
    firstName?: string;
    lastName?: string;
}

interface LoginData {
    email: string;
    password: string;
}

interface UpdateUserData {
    firstName?: string;
    lastName?: string;
    bio?: string;
    profileImageUrl?: string;
}

export function useAuth() {
    // Get current user
    const { data: user, isLoading, error } = useQuery<User | null>({
        queryKey: ['/api/auth/me'],
        retry: false,
        // Return null on 401 instead of throwing
        queryFn: async () => {
            try {
                const response = await fetch(resolveApiUrl('/api/auth/me'), {
                    credentials: 'include',
                });

                if (response.status === 401) {
                    return null;
                }

                if (!response.ok) {
                    throw new Error('Failed to fetch user');
                }

                return await response.json();
            } catch (error) {
                return null;
            }
        },
    });

    // Register mutation
    const registerMutation = useMutation({
        mutationFn: async (data: RegisterData) => {
            return await apiRequest('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['/api/auth/me'] });
        },
    });

    // Login mutation
    const loginMutation = useMutation({
        mutationFn: async (data: LoginData) => {
            return await apiRequest('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['/api/auth/me'] });
        },
    });

    // Logout mutation
    const logoutMutation = useMutation({
        mutationFn: async () => {
            return await apiRequest('/api/auth/logout', {
                method: 'POST',
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['/api/auth/me'] });
        },
    });

    // Update User mutation
    const updateUserMutation = useMutation({
        mutationFn: async (data: UpdateUserData) => {
            return await apiRequest('/api/users/profile', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['/api/auth/me'] });
        },
    });

    return {
        user,
        isLoading,
        isAuthenticated: !!user,
        // Expose raw mutations for flexibility
        loginMutation,
        registerMutation,
        logoutMutation,
        updateUserMutation,
        // Helper functions
        register: registerMutation.mutate,
        login: loginMutation.mutate,
        logout: logoutMutation.mutate,
        updateUser: updateUserMutation.mutate,
    };
}
