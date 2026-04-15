import { useState } from 'react';
import { MapPin, Mail, Calendar, Edit2, Award, BookOpen, Users, Settings, Share2 } from 'lucide-react';
import { motion } from 'motion/react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Avatar } from '../ui/Avatar';
import { PostCard } from '../feed/PostCard';
import { User, mockPosts, mockUsers, mockGroups } from '../../lib/mockData';

interface UserProfileProps {
  userId: string;
  currentUserId: string;
  isOwnProfile: boolean;
}

export const UserProfile = ({ userId, currentUserId, isOwnProfile }: UserProfileProps) => {
  const [activeTab, setActiveTab] = useState<'posts' | 'resources' | 'groups'>('posts');
  const user = mockUsers.find(u => u.id === userId) || mockUsers[0];
  const userPosts = mockPosts.filter(p => p.userId === userId);
  const userGroups = mockGroups.filter(g => g.members.includes(userId));

  const stats = [
    { label: 'Posts', value: userPosts.length, icon: BookOpen, color: 'primary' },
    { label: 'Groups', value: userGroups.length, icon: Users, color: 'accent' },
    { label: 'Resources', value: 12, icon: Award, color: 'success' }
  ];

  const handleLike = (postId: string) => {};
  const handleComment = (postId: string, content: string) => {};

  return (
    <div className="space-y-8">
      {/* Profile Header */}
      <Card className="p-8 lg:p-10" gradient glow>
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Avatar & Basic Info */}
          <div className="flex flex-col items-center lg:items-start gap-6">
            <Avatar src={user.avatar} alt={user.name} size="2xl" gradient ring />
            
            {isOwnProfile && (
              <div className="flex gap-3 w-full">
                <Button variant="gradient" fullWidth glow>
                  <Edit2 className="w-4 h-4" />
                  Edit Profile
                </Button>
                <Button variant="outline">
                  <Settings className="w-5 h-5" />
                </Button>
              </div>
            )}
          </div>

          {/* User Details */}
          <div className="flex-1">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
              <div>
                <h2 className="text-[rgb(var(--foreground))] mb-3">{user.name}</h2>
                <p className="text-[rgb(var(--muted-foreground))] text-lg mb-4 max-w-2xl leading-relaxed">
                  {user.bio || 'No bio yet'}
                </p>
                
                <div className="flex flex-wrap gap-3 mb-4">
                  <Badge variant="gradient" size="md">{user.role}</Badge>
                  <Badge variant="primary" size="md">{user.department}</Badge>
                  {user.year && <Badge variant="default" size="md">{user.year}</Badge>}
                </div>

                <div className="flex flex-wrap gap-6 text-sm text-[rgb(var(--muted-foreground))]">
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    <span>{user.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    <span>{user.department}</span>
                  </div>
                  {user.year && (
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      <span>{user.year}</span>
                    </div>
                  )}
                </div>
              </div>

              {!isOwnProfile && (
                <div className="flex gap-3">
                  <Button variant="gradient" glow>
                    Follow
                  </Button>
                  <Button variant="outline">
                    <Share2 className="w-5 h-5" />
                  </Button>
                </div>
              )}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 pt-6 border-t border-[rgb(var(--border))]">
              {stats.map((stat) => {
                const Icon = stat.icon;
                return (
                  <div 
                    key={stat.label} 
                    className={`p-5 bg-[rgb(var(--${stat.color})/0.1)] border border-[rgb(var(--${stat.color})/0.2)] rounded-2xl text-center`}
                  >
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <Icon className={`w-5 h-5 text-[rgb(var(--${stat.color}))]`} />
                      <span className={`text-2xl font-bold text-[rgb(var(--${stat.color}))]`}>
                        {stat.value}
                      </span>
                    </div>
                    <p className="text-sm text-[rgb(var(--muted-foreground))]">{stat.label}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </Card>

      {/* Tabs */}
      <div className="border-b border-[rgb(var(--border))]">
        <div className="flex gap-2">
          {(['posts', 'resources', 'groups'] as const).map((tab) => (
            <motion.button
              key={tab}
              whileHover={{ y: -2 }}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-4 rounded-t-2xl font-medium transition-all duration-300 relative ${
                activeTab === tab
                  ? 'text-[rgb(var(--primary))]'
                  : 'text-[rgb(var(--muted-foreground))] hover:text-[rgb(var(--foreground))]'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
              {activeTab === tab && (
                <motion.div
                  layoutId="activeProfileTab"
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
          {userPosts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              author={user}
              currentUserId={currentUserId}
              onLike={handleLike}
              onComment={handleComment}
            />
          ))}

          {userPosts.length === 0 && (
            <Card className="p-12 text-center" glass>
              <div className="w-20 h-20 bg-gradient-soft rounded-3xl flex items-center justify-center mx-auto mb-4">
                <BookOpen className="w-10 h-10 text-[rgb(var(--primary))]" />
              </div>
              <h3 className="text-[rgb(var(--foreground))] mb-2">No posts yet</h3>
              <p className="text-[rgb(var(--muted-foreground))]">
                {isOwnProfile ? 'Share your first post!' : 'No posts to show'}
              </p>
            </Card>
          )}
        </div>
      )}

      {activeTab === 'groups' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {userGroups.map((group) => (
            <Card key={group.id} hoverable className="p-6" glass>
              <div className="flex items-center gap-4 mb-4">
                <div className="w-14 h-14 bg-gradient-primary rounded-2xl flex items-center justify-center shadow-card">
                  <Users className="w-7 h-7 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-[rgb(var(--foreground))] truncate">{group.name}</h4>
                  <p className="text-sm text-[rgb(var(--muted-foreground))]">
                    {group.members.length} members
                  </p>
                </div>
              </div>
              <Badge variant="gradient">{group.category}</Badge>
            </Card>
          ))}

          {userGroups.length === 0 && (
            <Card className="col-span-full p-12 text-center" glass>
              <div className="w-20 h-20 bg-gradient-soft rounded-3xl flex items-center justify-center mx-auto mb-4">
                <Users className="w-10 h-10 text-[rgb(var(--primary))]" />
              </div>
              <h3 className="text-[rgb(var(--foreground))] mb-2">No groups yet</h3>
              <p className="text-[rgb(var(--muted-foreground))]">
                {isOwnProfile ? 'Join your first group!' : 'No groups to show'}
              </p>
            </Card>
          )}
        </div>
      )}

      {activeTab === 'resources' && (
        <Card className="p-12 text-center" glass>
          <div className="w-20 h-20 bg-gradient-soft rounded-3xl flex items-center justify-center mx-auto mb-4">
            <Award className="w-10 h-10 text-[rgb(var(--primary))]" />
          </div>
          <h3 className="text-[rgb(var(--foreground))] mb-2">Resources coming soon</h3>
          <p className="text-[rgb(var(--muted-foreground))]">
            User uploaded resources will appear here
          </p>
        </Card>
      )}
    </div>
  );
};
