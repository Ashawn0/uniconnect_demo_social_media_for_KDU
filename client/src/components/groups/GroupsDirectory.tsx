import { useState } from 'react';
import { Users, Search, Plus, Lock, TrendingUp, Star, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { useGroups, useJoinGroup } from '../../hooks/use-groups';
import { GroupWithMembers } from '@shared/schema';
import { CreateGroupDialog } from './CreateGroupDialog';

interface GroupsDirectoryProps {
  currentUserId: string;
  onSelectGroup: (groupId: string) => void;
}

export const GroupsDirectory = ({ currentUserId, onSelectGroup }: GroupsDirectoryProps) => {
  const { data: groups, isLoading } = useGroups();
  const joinGroupMutation = useJoinGroup();
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<string>('all');

  const categories = ['all', 'Department', 'Club', 'Research', 'Cohort'];

  const handleJoinGroup = (groupId: string) => {
    joinGroupMutation.mutate(groupId);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const filteredGroups = groups?.filter(group => {
    const matchesSearch = group.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (group.description || '').toLowerCase().includes(searchQuery.toLowerCase());
    // Note: 'category' field might not exist in schema, using 'type' instead or assuming mapped
    // Schema has 'type'. Let's assume category maps to type for now or update schema.
    // Actually schema has 'type'.
    const matchesFilter = filter === 'all' || group.type === filter;
    return matchesSearch && matchesFilter;
  }) || [];

  const myGroups = groups?.filter(g => g.members.some(m => m.userId === currentUserId)) || [];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-center justify-between">
        <div>
          <h2 className="text-[rgb(var(--foreground))] mb-3">Campus Groups</h2>
          <p className="text-[rgb(var(--muted-foreground))] text-lg">
            Join communities and connect with peers
          </p>
        </div>
        <CreateGroupDialog />
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <Input
            type="text"
            placeholder="Search groups..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            icon={<Search className="w-5 h-5" />}
          />
        </div>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {categories.map((category) => (
          <motion.button
            key={category}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => setFilter(category)}
            className={`px-5 py-2.5 rounded-2xl whitespace-nowrap font-medium transition-all duration-300 ${filter === category
              ? 'bg-gradient-primary text-white shadow-card'
              : 'bg-[rgb(var(--muted))] text-[rgb(var(--muted-foreground))] hover:bg-[rgb(var(--card-hover))]'
              }`}
          >
            {category.charAt(0).toUpperCase() + category.slice(1)}
          </motion.button>
        ))}
      </div>

      {/* My Groups */}
      {myGroups.length > 0 && (
        <div>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-gradient-soft rounded-2xl flex items-center justify-center">
              <Star className="w-5 h-5 text-[rgb(var(--primary))]" />
            </div>
            <h3 className="text-[rgb(var(--foreground))]">My Groups</h3>
            <Badge variant="primary">{myGroups.length}</Badge>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {myGroups.slice(0, 3).map((group) => {
              const isMember = true; // Since it's in myGroups

              return (
                <motion.div
                  key={group.id}
                  whileHover={{ y: -4 }}
                  transition={{ duration: 0.2 }}
                >
                  <Card hoverable className="p-6 h-full flex flex-col" gradient glow>
                    <div
                      onClick={() => onSelectGroup(group.id)}
                      className="flex-1 cursor-pointer"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="w-14 h-14 bg-gradient-primary rounded-2xl flex items-center justify-center shadow-card">
                          <Users className="w-7 h-7 text-white" />
                        </div>
                        {group.isPrivate && (
                          <div className="p-2 bg-[rgb(var(--muted))] rounded-xl">
                            <Lock className="w-4 h-4 text-[rgb(var(--muted-foreground))]" />
                          </div>
                        )}
                      </div>

                      <Badge variant="gradient" className="mb-3">{group.type}</Badge>

                      <h4 className="text-[rgb(var(--foreground))] mb-2">{group.name}</h4>
                      <p className="text-sm text-[rgb(var(--muted-foreground))] mb-4 line-clamp-2 leading-relaxed">
                        {group.description}
                      </p>

                      <div className="flex items-center gap-2 text-sm text-[rgb(var(--muted-foreground))]">
                        <Users className="w-4 h-4" />
                        <span>{group.members.length} members</span>
                      </div>
                    </div>

                    <Button
                      variant={isMember ? 'outline' : 'primary'}
                      fullWidth
                      className="mt-4"
                      onClick={(e) => {
                        e.stopPropagation();
                        // Leave group logic not implemented in hook yet, or use join to toggle?
                        // Usually leave is separate. For now just join.
                        handleJoinGroup(group.id);
                      }}
                    >
                      {isMember ? 'Joined' : 'Join Group'}
                    </Button>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}

      {/* All Groups */}
      <div>
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-gradient-soft rounded-2xl flex items-center justify-center">
            <TrendingUp className="w-5 h-5 text-[rgb(var(--primary))]" />
          </div>
          <h3 className="text-[rgb(var(--foreground))]">Discover Groups</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredGroups.map((group, index) => {
            const isMember = group.members.some(m => m.userId === currentUserId);

            return (
              <motion.div
                key={group.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05, duration: 0.3 }}
                whileHover={{ y: -4 }}
              >
                <Card hoverable className="p-6 h-full flex flex-col" glass>
                  <div
                    onClick={() => onSelectGroup(group.id)}
                    className="flex-1 cursor-pointer"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="w-14 h-14 bg-gradient-primary rounded-2xl flex items-center justify-center shadow-card">
                        <Users className="w-7 h-7 text-white" />
                      </div>
                      {group.isPrivate && (
                        <div className="p-2 bg-[rgb(var(--muted))] rounded-xl">
                          <Lock className="w-4 h-4 text-[rgb(var(--muted-foreground))]" />
                        </div>
                      )}
                    </div>

                    <Badge variant="primary" className="mb-3">{group.type}</Badge>

                    <h4 className="text-[rgb(var(--foreground))] mb-2">{group.name}</h4>
                    <p className="text-sm text-[rgb(var(--muted-foreground))] mb-4 line-clamp-2 leading-relaxed">
                      {group.description}
                    </p>

                    <div className="flex items-center gap-2 text-sm text-[rgb(var(--muted-foreground))]">
                      <Users className="w-4 h-4" />
                      <span>{group.members.length} members</span>
                    </div>
                  </div>

                  <Button
                    variant={isMember ? 'outline' : 'primary'}
                    fullWidth
                    className="mt-4"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleJoinGroup(group.id);
                    }}
                  >
                    {isMember ? 'Joined' : 'Join Group'}
                  </Button>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {filteredGroups.length === 0 && (
          <Card className="p-12 text-center" glass>
            <div className="w-20 h-20 bg-gradient-soft rounded-3xl flex items-center justify-center mx-auto mb-4">
              <Users className="w-10 h-10 text-[rgb(var(--primary))]" />
            </div>
            <h3 className="text-[rgb(var(--foreground))] mb-2">No groups found</h3>
            <p className="text-[rgb(var(--muted-foreground))]">
              Try adjusting your search or filters
            </p>
          </Card>
        )}
      </div>
    </div>
  );
};
