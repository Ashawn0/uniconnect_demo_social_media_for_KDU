import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import CreatePost from "@/components/CreatePost";
import PostCard from "@/components/PostCard";
import type { PostWithDetails } from "@shared/schema";
import { apiRequest, queryClient, resolveApiUrl } from "@/lib/queryClient";

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
        formData.append('file', blob, 'image.jpg');

        const uploadResponse = await fetch(resolveApiUrl('/api/upload'), {
          method: 'POST',
          body: formData,
        });

        if (!uploadResponse.ok) {
          throw new Error('Upload failed');
        }

        const result = await uploadResponse.json();
        imageUrl = result.url;
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
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="grid gap-8 lg:grid-cols-[2fr,1fr]">
        <div className="space-y-6">
          <div className="relative overflow-hidden rounded-2xl bg-kdu-navy px-6 py-8 text-white shadow-lg">
            <div className="relative z-10 flex flex-col gap-4">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.35em] text-kdu-gold">Kyungdong University</p>
                  <h1 className="mt-1 text-3xl font-semibold">Academic Network &amp; Community Feed</h1>
                  <p className="mt-2 text-sm text-white/80">
                    Official space for announcements, peer collaboration, and departmental highlights.
                  </p>
                </div>
                <div className="rounded-xl bg-kdu-gold/15 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-kdu-gold">
                  Semester {new Date().getFullYear()}
                </div>
              </div>
            </div>
            <div className="absolute inset-y-0 right-0 w-1/2 bg-gradient-to-l from-white/15 to-transparent opacity-60" />
          </div>

          <CreatePost
            userAvatar={user?.profileImageUrl || "/placeholder.png"}
            userName={user?.firstName || "User"}
            onPost={handleCreatePost}
          />

          {isLoading ? (
            <div className="py-10 text-center">
              <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-2 border-kdu-light-blue border-t-transparent" />
              <p className="text-sm text-muted-foreground">Loading the latest campus updates…</p>
            </div>
          ) : posts.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border bg-card/50 px-6 py-10 text-center">
              <p className="text-sm text-muted-foreground">
                No posts yet. Start the conversation with your classmates.
              </p>
            </div>
          ) : (
            posts.map((post) => <PostCard key={post.id} {...post} />)
          )}
        </div>

        <aside className="space-y-5">
          <div className="rounded-2xl border border-border bg-card/60 p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-kdu-blue">
              Campus Bulletin
            </p>
            <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
              <li>
                <span className="font-medium text-foreground">Midterm Review Workshops</span>
                <p>Sign-up closes this Friday at 17:00.</p>
              </li>
              <li>
                <span className="font-medium text-foreground">Smart Computing Colloquium</span>
                <p>Join the faculty roundtable on AI ethics.</p>
              </li>
              <li>
                <span className="font-medium text-foreground">Global Mobility Office</span>
                <p>Exchange program briefing scheduled on campus TV Hall.</p>
              </li>
            </ul>
          </div>

          <div className="rounded-2xl border border-border bg-card/60 p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-kdu-blue">
              Upcoming Deadlines
            </p>
            <div className="mt-4 space-y-3 text-sm">
              <div className="flex items-start justify-between gap-3 rounded-lg bg-kdu-gray-light p-3">
                <div>
                  <p className="font-semibold text-foreground">Capstone Proposal</p>
                  <p className="text-xs text-muted-foreground">Engineering Department</p>
                </div>
                <span className="text-xs font-semibold text-kdu-red">Mar 15</span>
              </div>
              <div className="flex items-start justify-between gap-3 rounded-lg bg-kdu-gray-light p-3">
                <div>
                  <p className="font-semibold text-foreground">Scholarship Renewal</p>
                  <p className="text-xs text-muted-foreground">Student Services</p>
                </div>
                <span className="text-xs font-semibold text-kdu-red">Mar 20</span>
              </div>
              <div className="flex items-start justify-between gap-3 rounded-lg bg-kdu-gray-light p-3">
                <div>
                  <p className="font-semibold text-foreground">Club Funding Report</p>
                  <p className="text-xs text-muted-foreground">Student Union</p>
                </div>
                <span className="text-xs font-semibold text-kdu-red">Mar 25</span>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
