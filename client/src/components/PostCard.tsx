import { useState } from "react";
import { Heart, MessageCircle, Smile, ThumbsUp, Laugh, Frown, Sparkles, UserPlus, UserMinus, PartyPopper } from "lucide-react";
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
  { type: 'like', icon: ThumbsUp, label: 'Like' },
  { type: 'love', icon: Heart, label: 'Love' },
  { type: 'laugh', icon: Laugh, label: 'Laugh' },
  { type: 'wow', icon: Sparkles, label: 'Wow' },
  { type: 'sad', icon: Frown, label: 'Sad' },
  { type: 'celebrate', icon: PartyPopper, label: 'Celebrate' },
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
      return await apiRequest("/api/comments", {
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
      return await apiRequest(`/api/posts/${post.id}/react`, {
        method: "POST",
        body: JSON.stringify({ type: reactionType }),
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
    <Card className="overflow-hidden hover-elevate transition-all">
      <div className="p-4">
        <div className="flex items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-3">
            <Avatar className="w-12 h-12 ring-2 ring-primary/20" data-testid={`avatar-${authorName}`}>
              <AvatarImage src={post.author.profileImageUrl || "/placeholder.png"} alt={authorName} />
              <AvatarFallback>{authorName[0]}</AvatarFallback>
            </Avatar>
            <div>
              <p className="font-semibold text-foreground" data-testid={`text-author-${authorName}`}>{authorName}</p>
              <p className="text-sm text-muted-foreground" data-testid="text-timestamp">
                {timestamp}
              </p>
            </div>
          </div>
          {!isOwnPost && (
            <Button
              variant="outline"
              size="sm"
              className="gap-2 shrink-0"
              onClick={() => followMutation.mutate(post.author.id)}
              disabled={followMutation.isPending}
              data-testid={`button-follow-${post.author.id}`}
            >
              <UserPlus className="w-4 h-4" />
              <span className="hidden sm:inline">Follow</span>
            </Button>
          )}
        </div>
        
        <p className="text-foreground mb-3 whitespace-pre-wrap" data-testid="text-content">{post.content}</p>
        
        {post.imageUrl && (
          <div className="mb-3 rounded-lg overflow-hidden">
            <img 
              src={post.imageUrl} 
              alt="Post content" 
              className="w-full h-auto max-h-96 object-cover"
              data-testid="img-post"
            />
          </div>
        )}
        
        {/* Display Reactions Summary */}
        {Object.keys(reactionCounts).length > 0 && (
          <div className="flex flex-wrap items-center gap-2 mb-3">
            {Object.entries(reactionCounts).map(([type, count]) => {
              const reaction = REACTIONS.find(r => r.type === type);
              if (!reaction) return null;
              const IconComponent = reaction.icon;
              return (
                <div 
                  key={type}
                  className="flex items-center gap-1 bg-muted px-2 py-1 rounded-full text-sm"
                  data-testid={`reaction-${type}`}
                >
                  <IconComponent className="w-3 h-3" />
                  <span className="text-muted-foreground font-medium">{count}</span>
                </div>
              );
            })}
          </div>
        )}
        
        <div className="flex items-center gap-4 pt-2 border-t border-border">
          <Button
            variant="ghost"
            size="sm"
            className={`gap-2 ${post.isLiked ? 'text-red-500' : 'text-muted-foreground'}`}
            onClick={handleLike}
            disabled={likeMutation.isPending}
            data-testid="button-like"
          >
            <Heart className={`w-5 h-5 ${post.isLiked ? 'fill-current' : ''}`} />
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
              <Smile className="w-5 h-5" />
              <span>React</span>
            </Button>
            
            {/* Reaction Picker Popup */}
            {showReactions && (
              <div className="absolute bottom-full left-0 mb-2 bg-card border border-border rounded-md shadow-lg p-2 flex gap-1 z-10">
                {REACTIONS.map((reaction) => {
                  const IconComponent = reaction.icon;
                  return (
                    <Button
                      key={reaction.type}
                      variant="ghost"
                      size="icon"
                      className="hover-elevate"
                      onClick={() => handleReaction(reaction.type)}
                      disabled={reactionMutation.isPending}
                      title={reaction.label}
                      data-testid={`button-reaction-${reaction.type}`}
                    >
                      <IconComponent className="w-5 h-5" />
                    </Button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
      
      {showComments && (
        <div className="px-4 pb-4 border-t border-border bg-muted/20">
          <div className="mt-4 space-y-3">
            {post.comments.map((comment) => {
              const commentAuthorName = comment.author.firstName || comment.author.email || "User";
              return (
                <div key={comment.id} className="flex gap-2" data-testid={`comment-${comment.id}`}>
                  <Avatar className="w-8 h-8">
                    <AvatarImage src={comment.author.profileImageUrl || "/placeholder.png"} alt={commentAuthorName} />
                    <AvatarFallback>{commentAuthorName[0]}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="bg-card rounded-lg p-2">
                      <p className="font-medium text-sm" data-testid={`text-comment-author-${comment.id}`}>{commentAuthorName}</p>
                      <p className="text-sm text-foreground" data-testid={`text-comment-content-${comment.id}`}>{comment.content}</p>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1 ml-2">
                      {comment.createdAt ? formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true }) : "Just now"}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
          
          <div className="mt-3 flex gap-2">
            <Textarea
              placeholder="Write a comment..."
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              className="resize-none min-h-[60px]"
              disabled={commentMutation.isPending}
              data-testid="input-comment"
            />
            <Button 
              onClick={handleComment}
              disabled={!commentText.trim() || commentMutation.isPending}
              data-testid="button-submit-comment"
            >
              Post
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
}
