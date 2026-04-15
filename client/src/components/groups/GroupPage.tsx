import { useState } from 'react';
import { ArrowLeft, Users, Settings, Bell, Share2, Lock, Crown, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Avatar } from '../ui/avatar';
import { CreatePost } from '../feed/CreatePost';
import { PostCard } from '../feed/PostCard';
import { useGroup, useJoinGroup, useLeaveGroup } from '../../hooks/use-groups';
import { usePosts, useCreatePost, useToggleLike, useCreateComment } from '../../hooks/use-posts';
import { useAuth } from '../../hooks/use-auth';

interface GroupPageProps {
  groupId: string;
  currentUserId: string;
  onBack: () => void;
}

export const GroupPage = ({ groupId, currentUserId, onBack }: GroupPageProps) => {
  const { data: group, isLoading: isGroupLoading } = useGroup(groupId);
  const { data: allPosts, isLoading: isPostsLoading } = usePosts();
  const { user } = useAuth();

  const joinGroupMutation = useJoinGroup();
  const leaveGroupMutation = useLeaveGroup();
  const createPostMutation = useCreatePost();
  const toggleLikeMutation = useToggleLike();
  const createCommentMutation = useCreateComment();

  const [activeTab, setActiveTab] = useState<'posts' | 'members' | 'resources'>('posts');

  const posts = allPosts?.filter(p => p.groupId === groupId) || [];
  const isMember = group?.members?.some(m => m.userId === currentUserId);

  const handleCreatePost = (content: string, image?: string) => {
    createPostMutation.mutate({
      content,
      imageUrl: image,
      groupId: groupId
    });
  };

  const handleLike = (postId: string) => {
    toggleLikeMutation.mutate(postId);
  };

  const handleComment = (postId: string, content: string) => {
    createCommentMutation.mutate({ postId, content });
  };

  const handleJoinGroup = () => {
    joinGroupMutation.mutate(groupId);
  };

  const handleLeaveGroup = () => {
    leaveGroupMutation.mutate(groupId);
  };

  if (isGroupLoading || isPostsLoading || !group) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Back Button */}
      <motion.button
        whileHover={{ x: -4 }}
        onClick={onBack}
        className="flex items-center gap-3 text-[rgb(var(--muted-foreground))] hover:text-[rgb(var(--foreground))] transition-colors"
      >
        <ArrowLeft className="w-5 h-5" />
        <span className="font-medium">Back to Groups</span>
      </motion.button>

      {/* Group Header */}
      <Card className="p-8 lg:p-10" gradient glow>
        <div className="flex flex-col lg:flex-row gap-8">
          <div className="w-24 h-24 lg:w-28 lg:h-28 bg-gradient-primary rounded-3xl flex items-center justify-center flex-shrink-0 shadow-card-lg">
            <Users className="w-12 h-12 lg:w-14 lg:h-14 text-white" />
          </div>

          <div className="flex-1">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-6 mb-6">
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-3 mb-3">
                  <h2 className="text-[rgb(var(--foreground))]">{group.name}</h2>
                  <Badge variant="gradient" size="md">{group.type}</Badge>
                  {group.isPrivate && (
                    <Badge variant="default" size="md">
                      <Lock className="w-3 h-3" />
                      Private
                    </Badge>
                  )}
                </div>
                <p className="text-[rgb(var(--muted-foreground))] text-lg mb-4 leading-relaxed">
                  {group.description}
                </p>

                <div className="flex flex-wrap items-center gap-4 text-sm text-[rgb(var(--muted-foreground))]">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    <span>{group.members.length} members</span>
                  </div>
                  <span>·</span>
                  <span>{group.isPrivate ? 'Private' : 'Public'} group</span>
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                {isMember ? (
                  <>
                    <Button variant="gradient" glow>
                      <Bell className="w-4 h-4" />
                      Notifications
                    </Button>
                    <Button variant="outline" onClick={handleLeaveGroup} disabled={leaveGroupMutation.isPending}>
                      <Settings className="w-5 h-5 mr-2" />
                      Leave
                    </Button>
                    <Button variant="ghost">
                      <Share2 className="w-5 h-5" />
                    </Button>
                  </>
                ) : (
                  <Button variant="gradient" glow onClick={handleJoinGroup}>
                    Join Group
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Tabs */}
      <div className="border-b border-[rgb(var(--border))]">
        <div className="flex gap-2">
          {(['posts', 'members', 'resources'] as const).map((tab) => (
            <motion.button
              key={tab}
              whileHover={{ y: -2 }}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-4 rounded-t-2xl font-medium transition-all duration-300 relative ${activeTab === tab
                ? 'text-[rgb(var(--primary))]'
                : 'text-[rgb(var(--muted-foreground))] hover:text-[rgb(var(--foreground))]'
                }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
              {activeTab === tab && (
                <motion.div
                  layoutId="activeGroupTab"
                  className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-primary rounded-full"
                  transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                />
              )}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'posts' && (
        <div className="space-y-6">
          {isMember && user && (
            <CreatePost
              onCreatePost={handleCreatePost}
              currentUser={{
                name: `${user.firstName} ${user.lastName}`,
                avatar: user.profileImageUrl || undefined
              }}
            />
          )}

          <div className="space-y-6">
            {posts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                currentUserId={currentUserId}
                onLike={handleLike}
                onComment={handleComment}
              />
            ))}

            {posts.length === 0 && (
              <Card className="p-16 text-center" glass>
                <div className="w-20 h-20 bg-gradient-soft rounded-3xl flex items-center justify-center mx-auto mb-4">
                  <Users className="w-10 h-10 text-[rgb(var(--primary))]" />
                </div>
                <h3 className="text-[rgb(var(--foreground))] mb-2">No posts yet</h3>
                <p className="text-[rgb(var(--muted-foreground))]">
                  Be the first to post in this group!
                </p>
              </Card>
            )}
          </div>
        </div>
      )}

      {activeTab === 'members' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {group.members.map((member, index) => (
            <motion.div
              key={member.userId}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card hoverable className="p-6" glass>
                <div className="flex items-start gap-4">
                  <Avatar src={member.user.profileImageUrl || undefined} alt={member.user.firstName || 'User'} size="lg" gradient ring />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="text-[rgb(var(--foreground))] truncate">{member.user.firstName} {member.user.lastName}</h4>
                      {member.role === 'admin' && (
                        <Crown className="w-4 h-4 text-[rgb(var(--warning))] flex-shrink-0" />
                      )}
                    </div>
                    <p className="text-sm text-[rgb(var(--muted-foreground))] mb-3">
                      {member.user.department}
                    </p>
                    <div className="flex gap-2">
                      <Badge variant={member.user.role === 'faculty' ? 'gradient' : 'primary'} size="sm">
                        {member.user.role}
                      </Badge>
                      {member.user.batch && (
                        <Badge variant="default" size="sm">{member.user.batch}</Badge>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {activeTab === 'resources' && (
        <Card className="p-16 text-center" glass>
          <div className="w-20 h-20 bg-gradient-soft rounded-3xl flex items-center justify-center mx-auto mb-4">
            <Users className="w-10 h-10 text-[rgb(var(--primary))]" />
          </div>
          <h3 className="text-[rgb(var(--foreground))] mb-2">Resources coming soon</h3>
          <p className="text-[rgb(var(--muted-foreground))]">
            Group resources will be available here
          </p>
        </Card>
      )}
    </div>
  );
};
