import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import CreatePost from "@/components/CreatePost";
import PostCard from "@/components/PostCard";
import type { PostWithDetails } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";

export default function Feed() {
  const { user, isLoading: authLoading } = useAuth();
  const { toast } = useToast();

  const { data: posts = [], isLoading } = useQuery<PostWithDetails[]>({
    queryKey: ["/api/posts"],
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

  if (authLoading) {
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
      {/* KDU Hero Banner */}
      <div className="relative overflow-hidden rounded-md bg-gradient-to-br from-kdublue via-kdublue/95 to-kdublue/90 p-8 md:p-12">
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-full bg-kdugold flex items-center justify-center">
              <span className="text-2xl font-bold text-kdublue">KDU</span>
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-white">
                Kyungdong University
              </h1>
              <p className="text-kdugold text-sm md:text-base font-medium">
                Connect. Share. Learn Together.
              </p>
            </div>
          </div>
          <p className="text-white/90 text-sm md:text-base max-w-xl">
            Welcome to the official KDU student platform. Share your thoughts, join study groups, 
            access resources, and connect with fellow students across campus.
          </p>
        </div>
        
        {/* Decorative Elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-kdugold/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-kdugold/5 rounded-full blur-2xl" />
      </div>
      
      <CreatePost
        userAvatar={user?.profileImageUrl || "/placeholder.png"}
        userName={user?.firstName || "User"}
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
  );
}
