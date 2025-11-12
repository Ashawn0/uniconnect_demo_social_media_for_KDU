import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import Navbar from "@/components/Navbar";
import ProfileHeader from "@/components/ProfileHeader";
import PostCard from "@/components/PostCard";
import type { PostWithDetails } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";

export default function Profile() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const { toast } = useToast();

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
    queryKey: ["/api/posts/user", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      return await fetch(`/api/posts/user/${user.id}`).then(r => r.json());
    },
    enabled: isAuthenticated && !!user,
  });

  const handleUpdateProfile = async (firstName: string, bio: string) => {
    try {
      await apiRequest("/api/user/profile", {
        method: "PATCH",
        body: JSON.stringify({ firstName, lastName: user?.lastName || "", bio }),
        headers: { "Content-Type": "application/json" },
      });
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      toast({
        title: "Success",
        description: "Profile updated successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update profile",
        variant: "destructive",
      });
    }
  };

  if (authLoading || !isAuthenticated || !user) {
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
        <ProfileHeader
          avatar={user.profileImageUrl || "/placeholder.png"}
          name={user.firstName || user.email || "User"}
          bio={user.bio || "No bio yet"}
          postsCount={posts.length}
          onUpdate={handleUpdateProfile}
        />
        
        <div className="space-y-6">
          <h2 className="text-xl font-semibold text-foreground">My Posts</h2>
          {isLoading ? (
            <div className="text-center py-8">
              <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading posts...</p>
            </div>
          ) : posts.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No posts yet. Share your first moment!</p>
            </div>
          ) : (
            posts.map(post => (
              <PostCard key={post.id} {...post} />
            ))
          )}
        </div>
      </div>
    </div>
  );
}
