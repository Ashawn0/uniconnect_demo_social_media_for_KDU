import { useState } from 'react';
import { TrendingUp, Sparkles, Users, Calendar, BookOpen } from 'lucide-react';
import { motion } from 'motion/react';
import { CreatePost } from './CreatePost';
import { PostCard } from './PostCard';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Avatar } from '../ui/Avatar';
import { Post, User, mockPosts, mockUsers, mockGroups } from '../../lib/mockData';

interface CampusFeedProps {
  currentUserId: string;
}

export const CampusFeed = ({ currentUserId }: CampusFeedProps) => {
  const [posts, setPosts] = useState<Post[]>(mockPosts);
  const currentUser = mockUsers.find(u => u.id === currentUserId) || mockUsers[0];

  const handleCreatePost = (content: string, image?: string) => {
    const newPost: Post = {
      id: Date.now().toString(),
      userId: currentUserId,
      content,
      image,
      likes: 0,
      comments: [],
      likedBy: [],
      timestamp: new Date()
    };
    setPosts([newPost, ...posts]);
  };

  const handleLike = (postId: string) => {
    setPosts(posts.map(post => {
      if (post.id === postId) {
        const isLiked = post.likedBy.includes(currentUserId);
        return {
          ...post,
          likes: isLiked ? post.likes - 1 : post.likes + 1,
          likedBy: isLiked
            ? post.likedBy.filter(id => id !== currentUserId)
            : [...post.likedBy, currentUserId]
        };
      }
      return post;
    }));
  };

  const handleComment = (postId: string, content: string) => {
    setPosts(posts.map(post => {
      if (post.id === postId) {
        return {
          ...post,
          comments: [
            ...post.comments,
            {
              id: Date.now().toString(),
              userId: currentUserId,
              content,
              timestamp: new Date()
            }
          ]
        };
      }
      return post;
    }));
  };

  const trendingTopics = [
    { tag: '#Finals2025', count: 156, trend: '+24%' },
    { tag: '#RoboticsDemo', count: 89, trend: '+45%' },
    { tag: '#StudyGroup', count: 67, trend: '+12%' },
    { tag: '#CampusLife', count: 234, trend: '+8%' }
  ];

  const suggestedUsers = mockUsers.filter(u => u.id !== currentUserId).slice(0, 3);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* Main Feed */}
      <div className="lg:col-span-8 space-y-6">
        <CreatePost onCreatePost={handleCreatePost} currentUser={currentUser} />

        <div className="space-y-6">
          {posts.map((post, index) => {
            const author = mockUsers.find(u => u.id === post.userId) || mockUsers[0];
            return (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.4, ease: 'easeOut' }}
              >
                <PostCard
                  post={post}
                  author={author}
                  currentUserId={currentUserId}
                  onLike={handleLike}
                  onComment={handleComment}
                />
              </motion.div>
            );
          })}
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
