import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import ProfileHeader from "@/components/ProfileHeader";
import PostCard from "@/components/PostCard";
import type { PostWithDetails, UserWithStats } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";

export default function Profile() {
  const { user, isLoading: authLoading } = useAuth();
  const { toast } = useToast();

  const { data: posts = [], isLoading } = useQuery<PostWithDetails[]>({
    queryKey: ["/api/posts/user", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      return await fetch(`/api/posts/user/${user.id}`).then(r => r.json());
    },
    enabled: !!user,
  });

  const { data: userStats } = useQuery<UserWithStats>({
    queryKey: ["/api/users", user?.id, "stats"],
    queryFn: async () => {
      if (!user?.id) throw new Error("No user ID");
      return await fetch(`/api/users/${user.id}/stats`).then(r => r.json());
    },
    enabled: !!user,
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

  if (authLoading || !user) {
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
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
      <ProfileHeader
        avatar={user.profileImageUrl || "/placeholder.png"}
        name={user.firstName || "User"}
        bio={user.bio || "No bio yet"}
        postsCount={posts.length}
        followersCount={userStats?.followersCount || 0}
        followingCount={userStats?.followingCount || 0}
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
  );
}
