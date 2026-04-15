import { useState } from 'react';
import { TrendingUp, Sparkles, Users, Calendar, BookOpen, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { CreatePost } from './CreatePost';
import { PostCard } from './PostCard';
import { Card } from '../ui/card';
import { Badge } from '../ui/badge';
import { Avatar } from '../ui/avatar';
import { usePosts, useCreatePost, useToggleLike, useCreateComment } from '../../hooks/use-posts';
import { useAuth } from '../../hooks/use-auth';
import { PostWithDetails } from '@shared/schema';

interface CampusFeedProps {
  currentUserId: string;
}

export const CampusFeed = ({ currentUserId }: CampusFeedProps) => {
  const { data: posts, isLoading } = usePosts();
  const { user } = useAuth();
  const createPostMutation = useCreatePost();
  const toggleLikeMutation = useToggleLike();
  const createCommentMutation = useCreateComment();

  const handleCreatePost = (content: string, image?: string) => {
    createPostMutation.mutate({
      content,
      imageUrl: image,
    });
  };

  const handleLike = (postId: string) => {
    toggleLikeMutation.mutate(postId);
  };

  const handleComment = (postId: string, content: string) => {
    createCommentMutation.mutate({ postId, content });
  };

  const trendingTopics = [
    { tag: '#Finals2025', count: 156, trend: '+24%' },
    { tag: '#RoboticsDemo', count: 89, trend: '+45%' },
    { tag: '#StudyGroup', count: 67, trend: '+12%' },
    { tag: '#CampusLife', count: 234, trend: '+8%' }
  ];

  // TODO: Fetch real suggested users
  const suggestedUsers: any[] = [];

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* Main Feed */}
      <div className="lg:col-span-8 space-y-6">
        {user && (
          <CreatePost
            onCreatePost={handleCreatePost}
            currentUser={{
              name: `${user.firstName} ${user.lastName}`,
              avatar: user.profileImageUrl || undefined
            }}
          />
        )}

        <div className="space-y-6">
          {posts?.map((post, index) => (
            <motion.div
              key={post.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1, duration: 0.4, ease: 'easeOut' }}
            >
              <PostCard
                post={post}
                currentUserId={currentUserId}
                onLike={handleLike}
                onComment={handleComment}
              />
            </motion.div>
          ))}

          {posts?.length === 0 && (
            <Card className="p-12 text-center" glass>
              <div className="w-20 h-20 bg-gradient-soft rounded-3xl flex items-center justify-center mx-auto mb-4">
                <BookOpen className="w-10 h-10 text-[rgb(var(--primary))]" />
              </div>
              <h3 className="text-[rgb(var(--foreground))] mb-2">No posts yet</h3>
              <p className="text-[rgb(var(--muted-foreground))]">
                Be the first to share something with your campus!
              </p>
            </Card>
          )}
        </div>
      </div>

      {/* Sidebar */}
      <div className="hidden lg:block lg:col-span-4 space-y-6">
        {/* Trending Topics */}
        <Card className="p-6" glass glow>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-gradient-soft rounded-2xl flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-[rgb(var(--primary))]" />
            </div>
            <h3 className="text-[rgb(var(--foreground))]">Trending</h3>
          </div>
          <div className="space-y-3">
            {trendingTopics.map((topic, index) => (
              <motion.div
                key={topic.tag}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ x: 4 }}
                className="p-4 rounded-2xl hover:bg-[rgb(var(--muted))] transition-all duration-300 cursor-pointer group"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="text-gradient font-semibold mb-1">{topic.tag}</p>
                    <p className="text-sm text-[rgb(var(--muted-foreground))]">
                      {topic.count} posts
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-[rgb(var(--accent))]" />
                    <Badge variant="success" size="sm">{topic.trend}</Badge>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </Card>

        {/* Suggested Connections */}
        <Card className="p-6" glass>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-gradient-soft rounded-2xl flex items-center justify-center">
              <Users className="w-5 h-5 text-[rgb(var(--primary))]" />
            </div>
            <h3 className="text-[rgb(var(--foreground))]">Connect</h3>
          </div>
          <div className="space-y-4">
            {suggestedUsers.map((user) => (
              <motion.div
                key={user.id}
                whileHover={{ x: 4 }}
                className="flex items-center gap-3 p-3 rounded-2xl hover:bg-[rgb(var(--muted))] transition-all duration-300 cursor-pointer"
              >
                <Avatar src={user.avatar} alt={user.name} size="md" gradient />
                <div className="flex-1 min-w-0">
                  <h5 className="text-[rgb(var(--foreground))] truncate">{user.name}</h5>
                  <p className="text-sm text-[rgb(var(--muted-foreground))] truncate">
                    {user.department}
                  </p>
                </div>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-4 py-2 bg-gradient-primary text-white rounded-xl text-sm font-medium shadow-soft"
                >
                  Follow
                </motion.button>
              </motion.div>
            ))}
            {suggestedUsers.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">No suggestions right now</p>
            )}
          </div>
        </Card>

        {/* Quick Links */}
        <Card className="p-6" glass>
          <h3 className="text-[rgb(var(--foreground))] mb-4">Quick Links</h3>
          <div className="space-y-2">
            {[
              { icon: Calendar, label: 'Academic Calendar', color: 'primary' },
              { icon: BookOpen, label: 'Library Hours', color: 'accent' },
              { icon: Users, label: 'Campus Events', color: 'success' },
            ].map((link) => {
              const Icon = link.icon;
              return (
                <motion.a
                  key={link.label}
                  href="#"
                  whileHover={{ x: 4 }}
                  className="flex items-center gap-3 px-4 py-3 rounded-2xl text-[rgb(var(--muted-foreground))] hover:text-[rgb(var(--foreground))] hover:bg-[rgb(var(--muted))] transition-all duration-300 group"
                >
                  <div className={`w-8 h-8 bg-[rgb(var(--${link.color})/0.1)] rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform`}>
                    <Icon className={`w-4 h-4 text-[rgb(var(--${link.color}))]`} />
                  </div>
                  <span className="text-sm font-medium">{link.label}</span>
                </motion.a>
              );
            })}
          </div>
        </Card>
      </div>
    </div>
  );
};
