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
      return await apiRequest(`/api/posts/user/${user.id}`);
    },
    enabled: !!user,
  });

  const { data: userStats } = useQuery<UserWithStats>({
    queryKey: ["/api/users", user?.id, "stats"],
    queryFn: async () => {
      if (!user?.id) throw new Error("No user ID");
      return await apiRequest(`/api/users/${user.id}/stats`);
    },
    enabled: !!user,
  });

  const handleUpdateProfile = async (firstName: string, bio: string) => {
    try {
      await apiRequest("/api/users/profile", {
        method: "PATCH",
        body: JSON.stringify({ firstName, lastName: user?.lastName || "", bio }),
        headers: { "Content-Type": "application/json" },
      });
      queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
      queryClient.invalidateQueries({ queryKey: ["/api/users", user?.id, "stats"] });
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
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="grid gap-8 lg:grid-cols-[1fr,2fr]">
        <div className="space-y-6">
          <ProfileHeader
            avatar={user.profileImageUrl || "/placeholder.png"}
            name={user.firstName || "User"}
            bio={user.bio || "No bio yet"}
            postsCount={posts.length}
            followersCount={userStats?.followersCount || 0}
            followingCount={userStats?.followingCount || 0}
            onUpdate={handleUpdateProfile}
          />
          <div className="rounded-3xl border border-border bg-card/70 p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-kdu-blue">
              Campus summary
            </p>
            <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
              <li>Program: {user.department || "Not specified"}</li>
              <li>Batch: {user.batch || "Not specified"}</li>
              <li>Email: {user.email}</li>
            </ul>
          </div>
        </div>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-foreground">My Posts</h2>
            <span className="text-sm text-muted-foreground">{posts.length} published</span>
          </div>
          {isLoading ? (
            <div className="text-center py-8">
              <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-2 border-kdu-light-blue border-t-transparent" />
              <p className="text-muted-foreground">Loading posts…</p>
            </div>
          ) : posts.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border bg-card/60 py-12 text-center">
              <p className="text-muted-foreground">No posts yet. Share your first moment!</p>
            </div>
          ) : (
            posts.map((post) => <PostCard key={post.id} {...post} />)
          )}
        </div>
      </div>
    </div>
  );
}
