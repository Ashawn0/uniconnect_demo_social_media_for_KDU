import { useState } from "react";
import {
  Heart,
  MessageCircle,
  ThumbsUp,
  Flame,
  Lightbulb,
  Brain,
  UserPlus,
  ChevronDown,
} from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { PostWithDetails } from "@shared/schema";
import { formatDistanceToNow } from "date-fns";
import { type LucideIcon } from "lucide-react";

const REACTIONS: { type: string; icon: LucideIcon; label: string }[] = [
  { type: "like", icon: ThumbsUp, label: "Like" },
  { type: "love", icon: Heart, label: "Appreciate" },
  { type: "fire", icon: Flame, label: "Inspiring" },
  { type: "lightbulb", icon: Lightbulb, label: "Insightful" },
  { type: "thinking", icon: Brain, label: "Consider" },
];

export default function PostCard(post: PostWithDetails) {
  const { toast } = useToast();
  const { user } = useAuth();
  const [showComments, setShowComments] = useState(false);
  const [showReactions, setShowReactions] = useState(false);
  const [commentText, setCommentText] = useState("");
  const isOwnPost = user?.id === post.author.id;

  const likeMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest(`/api/posts/${post.id}/like`, {
        method: "POST",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/posts"] });
      queryClient.invalidateQueries({ queryKey: ["/api/posts/user"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: "Failed to like post",
        variant: "destructive",
      });
    },
  });

  const commentMutation = useMutation({
    mutationFn: async (content: string) => {
      return await apiRequest("/api/posts/comments", {
        method: "POST",
        body: JSON.stringify({ postId: post.id, content }),
        headers: { "Content-Type": "application/json" },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/posts"] });
      queryClient.invalidateQueries({ queryKey: ["/api/posts/user"] });
      setCommentText("");
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: "Failed to add comment",
        variant: "destructive",
      });
    },
  });

  const reactionMutation = useMutation({
    mutationFn: async (reactionType: string) => {
      return await apiRequest(`/api/posts/${post.id}/reactions`, {
        method: "POST",
        body: JSON.stringify({ emojiType: reactionType }),
        headers: { "Content-Type": "application/json" },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/posts"] });
      queryClient.invalidateQueries({ queryKey: ["/api/posts/user"] });
      setShowReactions(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: "Failed to add reaction",
        variant: "destructive",
      });
    },
  });

  const followMutation = useMutation({
    mutationFn: async (targetUserId: string) => {
      return await apiRequest(`/api/users/${targetUserId}/follow`, {
        method: "POST",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/posts"] });
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
      toast({
        title: "Success",
        description: "Follow status updated",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update follow status",
        variant: "destructive",
      });
    },
  });

  const handleLike = () => {
    likeMutation.mutate();
  };

  const handleComment = () => {
    if (commentText.trim()) {
      commentMutation.mutate(commentText);
    }
  };

  const handleReaction = (reactionType: string) => {
    reactionMutation.mutate(reactionType);
  };

  // Count reactions by type
  const reactionCounts = post.reactions?.reduce((acc, reaction) => {
    acc[reaction.emojiType] = (acc[reaction.emojiType] || 0) + 1;
    return acc;
  }, {} as Record<string, number>) || {};

  const authorName = post.author.firstName || post.author.email || "User";
  const timestamp = post.createdAt ? formatDistanceToNow(new Date(post.createdAt), { addSuffix: true }) : "Just now";

  return (
    <Card className="rounded-2xl border border-border bg-card/90 p-5 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex min-w-0 flex-1 items-start gap-3">
          <Avatar className="h-12 w-12 border border-border sm:shrink-0" data-testid={`avatar-${authorName}`}>
            <AvatarImage src={post.author.profileImageUrl || "/placeholder.png"} alt={authorName} />
            <AvatarFallback>{authorName[0]}</AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <p className="break-words font-semibold text-foreground" data-testid={`text-author-${authorName}`}>
              {authorName}
            </p>
            <p className="text-xs uppercase tracking-widest text-muted-foreground">Student Community</p>
            <p className="text-xs text-muted-foreground" data-testid="text-timestamp">
              {timestamp}
            </p>
          </div>
        </div>
        {!isOwnPost && (
          <Button
            variant="outline"
            size="sm"
            className="w-full gap-2 border-kdu-blue text-kdu-blue hover:bg-kdu-blue/10 sm:w-auto"
            onClick={() => followMutation.mutate(post.author.id)}
            disabled={followMutation.isPending}
            data-testid={`button-follow-${post.author.id}`}
          >
            <UserPlus className="w-4 h-4" />
            <span className="hidden sm:inline">Follow</span>
          </Button>
        )}
      </div>

      <div className="mt-4 space-y-4">
        <p className="break-words text-[15px] leading-relaxed text-foreground" data-testid="text-content">
          {post.content}
        </p>

        {post.imageUrl && (
          <div className="overflow-hidden rounded-xl border border-border">
            <img
              src={post.imageUrl}
              alt="Post content"
              className="h-auto max-h-[28rem] w-full object-cover"
              data-testid="img-post"
            />
          </div>
        )}

        {Object.keys(reactionCounts).length > 0 && (
          <div className="flex flex-wrap gap-2">
            {Object.entries(reactionCounts).map(([type, count]) => {
              const reaction = REACTIONS.find((r) => r.type === type);
              if (!reaction) return null;
              const IconComponent = reaction.icon;
              return (
                <span
                  key={type}
                  className="flex items-center gap-1 rounded-full border border-border bg-kdu-gray-light px-3 py-1 text-xs font-medium text-kdu-blue"
                  data-testid={`reaction-${type}`}
                >
                  <IconComponent className="h-3.5 w-3.5" />
                  {count}
                </span>
              );
            })}
          </div>
        )}
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-2 border-t border-dashed border-border pt-4">
        <Button
          variant="ghost"
          size="sm"
          className={`gap-2 ${post.isLiked ? "text-kdu-red" : "text-muted-foreground"}`}
          onClick={handleLike}
          disabled={likeMutation.isPending}
          data-testid="button-like"
        >
          <Heart className={`w-5 h-5 ${post.isLiked ? "fill-current" : ""}`} />
          <span data-testid="text-likes">{post.likesCount}</span>
        </Button>

        <Button
          variant="ghost"
          size="sm"
          className="gap-2 text-muted-foreground"
          onClick={() => setShowComments(!showComments)}
          data-testid="button-comment"
        >
          <MessageCircle className="w-5 h-5" />
          <span data-testid="text-comments-count">{post.comments.length}</span>
        </Button>

        <div className="relative">
          <Button
            variant="ghost"
            size="sm"
            className="gap-2 text-muted-foreground"
            onClick={() => setShowReactions(!showReactions)}
            data-testid="button-react"
          >
            <ChevronDown className="w-4 h-4" />
            Reactions
          </Button>

          {showReactions && (
            <div className="absolute left-0 top-10 z-10 flex gap-1 rounded-xl border border-border bg-card p-2 shadow-lg">
              {REACTIONS.map((reaction) => {
                const IconComponent = reaction.icon;
                return (
                  <Button
                    key={reaction.type}
                    variant="ghost"
                    size="icon"
                    className="text-kdu-blue hover:bg-kdu-gray-light"
                    onClick={() => handleReaction(reaction.type)}
                    disabled={reactionMutation.isPending}
                    title={reaction.label}
                    data-testid={`button-reaction-${reaction.type}`}
                  >
                    <IconComponent className="h-4 w-4" />
                  </Button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {showComments && (
        <div className="mt-5 space-y-4 rounded-2xl border border-dashed border-border bg-muted/20 p-4">
          <div className="space-y-3">
            {post.comments.map((comment) => {
              const commentAuthorName = comment.author.firstName || comment.author.email || "User";
              return (
                <div key={comment.id} className="flex gap-3" data-testid={`comment-${comment.id}`}>
                  <Avatar className="h-8 w-8 sm:shrink-0">
                    <AvatarImage
                      src={comment.author.profileImageUrl || "/placeholder.png"}
                      alt={commentAuthorName}
                    />
                    <AvatarFallback>{commentAuthorName[0]}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 rounded-xl border border-border bg-card/80 p-3">
                    <p className="break-words text-sm font-semibold" data-testid={`text-comment-author-${comment.id}`}>
                      {commentAuthorName}
                    </p>
                    <p className="break-words text-sm text-foreground" data-testid={`text-comment-content-${comment.id}`}>
                      {comment.content}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {comment.createdAt
                        ? formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })
                        : "Just now"}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex gap-2">
            <Textarea
              placeholder="Contribute to the discussion…"
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              className="min-h-[60px] flex-1"
              disabled={commentMutation.isPending}
              data-testid="input-comment"
            />
            <Button
              onClick={handleComment}
              disabled={!commentText.trim() || commentMutation.isPending}
              className="bg-kdu-blue text-white hover:bg-kdu-navy"
              data-testid="button-submit-comment"
            >
              Comment
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
}
