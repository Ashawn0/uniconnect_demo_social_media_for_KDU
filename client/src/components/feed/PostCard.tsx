import { useState } from 'react';
import { Heart, MessageCircle, Share2, MoreHorizontal, Bookmark } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Avatar } from '../ui/avatar';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { PostWithDetails } from '@shared/schema';

interface PostCardProps {
  post: PostWithDetails;
  currentUserId: string;
  onLike: (postId: string) => void;
  onComment: (postId: string, content: string) => void;
}

export const PostCard = ({ post, currentUserId, onLike, onComment }: PostCardProps) => {
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [isBookmarked, setIsBookmarked] = useState(false);

  const author = post.author;
  const isLiked = post.isLiked;
  const likesCount = post.likesCount || 0;
  const commentsCount = post.comments?.length || 0;

  const handleComment = () => {
    if (commentText.trim()) {
      onComment(post.id, commentText);
      setCommentText('');
    }
  };

  const formatTimestamp = (date: Date | string) => {
    const d = new Date(date);
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));

    if (hours < 1) return 'Just now';
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d ago`;
    return d.toLocaleDateString();
  };

  return (
    <Card className="p-8 hover:shadow-card-xl transition-all duration-300" glow>
      {/* Author Header */}
      <div className="flex items-start gap-4 mb-6">
        <Avatar src={author.profileImageUrl || undefined} alt={author.firstName || 'User'} size="lg" gradient ring />
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <div>
              <h4 className="text-[rgb(var(--foreground))] mb-1">{author.firstName} {author.lastName}</h4>
              <div className="flex items-center gap-2 flex-wrap">
                <Badge variant="primary" size="sm">{author.role}</Badge>
                <span className="text-sm text-[rgb(var(--muted-foreground))]">
                  {author.department || 'General'}
                </span>
                <span className="text-sm text-[rgb(var(--muted-foreground))]">·</span>
                <span className="text-sm text-[rgb(var(--muted-foreground))]">
                  {formatTimestamp(post.createdAt || new Date())}
                </span>
              </div>
            </div>
            <motion.button
              whileHover={{ scale: 1.1, rotate: 90 }}
              whileTap={{ scale: 0.9 }}
              className="p-2.5 hover:bg-[rgb(var(--muted))] rounded-xl transition-colors"
            >
              <MoreHorizontal className="w-5 h-5 text-[rgb(var(--muted-foreground))]" />
            </motion.button>
          </div>
        </div>
      </div>

      {/* Post Content */}
      <div className="mb-6">
        <p className="text-[rgb(var(--foreground))] text-base leading-relaxed whitespace-pre-wrap">
          {post.content}
        </p>
        {post.imageUrl && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-6 rounded-2xl overflow-hidden shadow-card-lg"
          >
            <img
              src={post.imageUrl}
              alt="Post content"
              className="w-full object-cover max-h-96"
            />
          </motion.div>
        )}
      </div>

      {/* Engagement Stats */}
      {(likesCount > 0 || commentsCount > 0) && (
        <div className="flex items-center gap-4 text-sm text-[rgb(var(--muted-foreground))] mb-4 pb-4 border-b border-[rgb(var(--border))]">
          {likesCount > 0 && (
            <span>{likesCount} {likesCount === 1 ? 'like' : 'likes'}</span>
          )}
          {commentsCount > 0 && (
            <span>{commentsCount} {commentsCount === 1 ? 'comment' : 'comments'}</span>
          )}
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onLike(post.id)}
            className={`flex items-center gap-2.5 px-5 py-2.5 rounded-2xl transition-all duration-300 ${isLiked
                ? 'bg-[rgb(var(--destructive)/0.1)] text-[rgb(var(--destructive))] border border-[rgb(var(--destructive)/0.2)]'
                : 'bg-[rgb(var(--muted))] text-[rgb(var(--muted-foreground))] hover:bg-[rgb(var(--card-hover))]'
              }`}
          >
            <Heart className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
            <span className="text-sm font-medium">Like</span>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowComments(!showComments)}
            className="flex items-center gap-2.5 px-5 py-2.5 rounded-2xl bg-[rgb(var(--muted))] text-[rgb(var(--muted-foreground))] hover:bg-[rgb(var(--card-hover))] transition-all duration-300"
          >
            <MessageCircle className="w-5 h-5" />
            <span className="text-sm font-medium">Comment</span>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center gap-2.5 px-5 py-2.5 rounded-2xl bg-[rgb(var(--muted))] text-[rgb(var(--muted-foreground))] hover:bg-[rgb(var(--card-hover))] transition-all duration-300"
          >
            <Share2 className="w-5 h-5" />
            <span className="text-sm font-medium">Share</span>
          </motion.button>
        </div>

        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setIsBookmarked(!isBookmarked)}
          className={`p-2.5 rounded-2xl transition-all duration-300 ${isBookmarked
              ? 'bg-[rgb(var(--accent)/0.1)] text-[rgb(var(--accent))]'
              : 'hover:bg-[rgb(var(--muted))] text-[rgb(var(--muted-foreground))]'
            }`}
        >
          <Bookmark className={`w-5 h-5 ${isBookmarked ? 'fill-current' : ''}`} />
        </motion.button>
      </div>

      {/* Comments Section */}
      <AnimatePresence>
        {showComments && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="overflow-hidden border-t border-[rgb(var(--border))] pt-6"
          >
            <div className="space-y-5">
              {post.comments?.map((comment) => (
                <div key={comment.id} className="flex gap-3.5">
                  <Avatar src={comment.author.profileImageUrl || undefined} alt={comment.author.firstName || 'User'} size="sm" gradient />
                  <div className="flex-1">
                    <div className="bg-[rgb(var(--muted))] rounded-2xl px-5 py-3.5">
                      <p className="text-[rgb(var(--foreground))] text-sm leading-relaxed">
                        {comment.content}
                      </p>
                    </div>
                    <p className="text-xs text-[rgb(var(--muted-foreground))] mt-2 ml-2">
                      {formatTimestamp(comment.createdAt || new Date())}
                    </p>
                  </div>
                </div>
              ))}

              <div className="flex gap-3.5">
                <Avatar src={undefined} alt="You" size="sm" gradient />
                <div className="flex-1 flex gap-3">
                  <input
                    type="text"
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleComment()}
                    placeholder="Write a thoughtful comment..."
                    className="flex-1 px-5 py-3.5 bg-[rgb(var(--muted))] border border-[rgb(var(--border))] rounded-2xl text-[rgb(var(--foreground))] placeholder:text-[rgb(var(--muted-foreground))] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--primary)/0.5)] focus:border-[rgb(var(--primary))] transition-all duration-300"
                  />
                  <Button onClick={handleComment} size="md">
                    Post
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
};
