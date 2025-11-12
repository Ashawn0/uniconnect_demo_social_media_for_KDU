import { useState } from "react";
import { Heart, MessageCircle } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";

interface Comment {
  id: string;
  author: string;
  authorAvatar: string;
  content: string;
  timestamp: string;
}

interface PostCardProps {
  id: string;
  author: string;
  authorAvatar: string;
  timestamp: string;
  content: string;
  image?: string;
  likes: number;
  isLiked?: boolean;
  comments: Comment[];
}

export default function PostCard({
  author,
  authorAvatar,
  timestamp,
  content,
  image,
  likes: initialLikes,
  isLiked: initialIsLiked = false,
  comments: initialComments,
}: PostCardProps) {
  const [likes, setLikes] = useState(initialLikes);
  const [isLiked, setIsLiked] = useState(initialIsLiked);
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState(initialComments);
  const [commentText, setCommentText] = useState("");

  const handleLike = () => {
    setIsLiked(!isLiked);
    setLikes(isLiked ? likes - 1 : likes + 1);
    console.log('Like toggled');
  };

  const handleComment = () => {
    if (commentText.trim()) {
      const newComment: Comment = {
        id: Date.now().toString(),
        author: "You",
        authorAvatar: "/placeholder-avatar.png",
        content: commentText,
        timestamp: "Just now",
      };
      setComments([...comments, newComment]);
      setCommentText("");
      console.log('Comment added:', commentText);
    }
  };

  return (
    <Card className="overflow-hidden hover-elevate transition-all">
      <div className="p-4">
        <div className="flex items-center gap-3 mb-3">
          <Avatar className="w-12 h-12 ring-2 ring-primary/20" data-testid={`avatar-${author}`}>
            <AvatarImage src={authorAvatar} alt={author} />
            <AvatarFallback>{author[0]}</AvatarFallback>
          </Avatar>
          <div>
            <p className="font-semibold text-foreground" data-testid={`text-author-${author}`}>{author}</p>
            <p className="text-sm text-muted-foreground" data-testid="text-timestamp">{timestamp}</p>
          </div>
        </div>
        
        <p className="text-foreground mb-3 whitespace-pre-wrap" data-testid="text-content">{content}</p>
        
        {image && (
          <div className="mb-3 rounded-lg overflow-hidden">
            <img 
              src={image} 
              alt="Post content" 
              className="w-full h-auto max-h-96 object-cover"
              data-testid="img-post"
            />
          </div>
        )}
        
        <div className="flex items-center gap-4 pt-2 border-t border-border">
          <Button
            variant="ghost"
            size="sm"
            className={`gap-2 ${isLiked ? 'text-red-500' : 'text-muted-foreground'}`}
            onClick={handleLike}
            data-testid="button-like"
          >
            <Heart className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
            <span data-testid="text-likes">{likes}</span>
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            className="gap-2 text-muted-foreground"
            onClick={() => setShowComments(!showComments)}
            data-testid="button-comment"
          >
            <MessageCircle className="w-5 h-5" />
            <span data-testid="text-comments-count">{comments.length}</span>
          </Button>
        </div>
      </div>
      
      {showComments && (
        <div className="px-4 pb-4 border-t border-border bg-muted/20">
          <div className="mt-4 space-y-3">
            {comments.map((comment) => (
              <div key={comment.id} className="flex gap-2" data-testid={`comment-${comment.id}`}>
                <Avatar className="w-8 h-8">
                  <AvatarImage src={comment.authorAvatar} alt={comment.author} />
                  <AvatarFallback>{comment.author[0]}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="bg-card rounded-lg p-2">
                    <p className="font-medium text-sm" data-testid={`text-comment-author-${comment.id}`}>{comment.author}</p>
                    <p className="text-sm text-foreground" data-testid={`text-comment-content-${comment.id}`}>{comment.content}</p>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1 ml-2">{comment.timestamp}</p>
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-3 flex gap-2">
            <Textarea
              placeholder="Write a comment..."
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              className="resize-none min-h-[60px]"
              data-testid="input-comment"
            />
            <Button 
              onClick={handleComment}
              disabled={!commentText.trim()}
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
