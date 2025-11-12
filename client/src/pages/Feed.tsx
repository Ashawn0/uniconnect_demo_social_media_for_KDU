import { useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import Navbar from "@/components/Navbar";
import CreatePost from "@/components/CreatePost";
import PostCard from "@/components/PostCard";
import type { PostWithDetails } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";

export default function Feed() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const { toast } = useToast();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
    }
  }, [isAuthenticated, authLoading, toast]);

  const { data: posts = [], isLoading } = useQuery<PostWithDetails[]>({
    queryKey: ["/api/posts"],
    enabled: isAuthenticated,
  });

  const createPostMutation = useMutation({
    mutationFn: async (data: { content: string; imageUrl?: string }) => {
      return await apiRequest("/api/posts", {
        method: "POST",
        body: JSON.stringify(data),
        headers: { "Content-Type": "application/json" },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/posts"] });
    },
    onError: (error: Error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to create post",
        variant: "destructive",
      });
    },
  });

  const handleCreatePost = async (content: string, imageData?: string) => {
    let imageUrl: string | undefined;
    
    if (imageData) {
      try {
        const blob = await fetch(imageData).then(r => r.blob());
        const formData = new FormData();
        formData.append('image', blob);
        
        const response = await apiRequest("/api/upload", {
          method: "POST",
          body: formData,
        });
        
        imageUrl = response.url;
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to upload image",
          variant: "destructive",
        });
        return;
      }
    }
    
    createPostMutation.mutate({ content, imageUrl });
  };

  if (authLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        <CreatePost
          userAvatar={user?.profileImageUrl || "/placeholder.png"}
          userName={user?.firstName || user?.email || "User"}
          onPost={handleCreatePost}
        />
        
        {isLoading ? (
          <div className="text-center py-8">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading posts...</p>
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No posts yet. Be the first to share something!</p>
          </div>
        ) : (
          posts.map(post => (
            <PostCard key={post.id} {...post} />
          ))
        )}
      </div>
    </div>
  );
}
