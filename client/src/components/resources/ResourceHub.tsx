import { useState } from 'react';
import { Search, Upload, Download, FileText, File, Archive, Tag, Filter, Clock, TrendingUp, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Avatar } from '../ui/avatar';
import { useResources } from '../../hooks/use-resources';
import { ResourceWithDetails } from '@shared/schema';
import { UploadResourceDialog } from './UploadResourceDialog';

interface ResourceHubProps {
  currentUserId: string;
}

export const ResourceHub = ({ currentUserId }: ResourceHubProps) => {
  const { data: resources, isLoading } = useResources();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState<string>('all');

  const allTags = ['all', ...Array.from(new Set(resources?.flatMap(r => r.tags || []) || []))];

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'PDF':
        return FileText;
      case 'ZIP':
        return Archive;
      default:
        return File;
    }
  };

  const getFileColor = (type: string) => {
    switch (type) {
      case 'PDF':
        return 'destructive';
      case 'ZIP':
        return 'warning';
      case 'DOCX':
        return 'primary';
      default:
        return 'accent';
    }
  };

  const filteredResources = resources?.filter(resource => {
    const matchesSearch = resource.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (resource.description || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTag = selectedTag === 'all' || (resource.tags || []).includes(selectedTag);
    return matchesSearch && matchesTag;
  }) || [];

  const formatTimestamp = (date: Date | string) => {
    const d = new Date(date);
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days < 1) return 'Today';
    if (days < 7) return `${days}d ago`;
    if (days < 30) return `${Math.floor(days / 7)}w ago`;
    return d.toLocaleDateString();
  };

  const popularTags = allTags.slice(1, 6);

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-center justify-between">
        <div>
          <h2 className="text-[rgb(var(--foreground))] mb-3">Resource Hub</h2>
          <p className="text-[rgb(var(--muted-foreground))] text-lg">
            Share and discover study materials
          </p>
        </div>
        <UploadResourceDialog />
      </div>

      {/* Search Bar */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8">
          <Input
            type="text"
            placeholder="Search resources, notes, guides..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            icon={<Search className="w-5 h-5" />}
          />
        </div>
        <div className="lg:col-span-4">
          <Button variant="outline" fullWidth>
            <Filter className="w-5 h-5" />
            Filters
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-8 space-y-6">
          {/* Tags */}
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {allTags.map((tag) => (
              <motion.button
                key={tag}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => setSelectedTag(tag)}
                className={`px-5 py-2.5 rounded-2xl whitespace-nowrap font-medium transition-all duration-300 flex items-center gap-2 ${selectedTag === tag
                  ? 'bg-gradient-primary text-white shadow-card'
                  : 'bg-[rgb(var(--muted))] text-[rgb(var(--muted-foreground))] hover:bg-[rgb(var(--card-hover))]'
                  }`}
              >
                {tag !== 'all' && <Tag className="w-4 h-4" />}
                {tag === 'all' ? 'All Resources' : tag}
              </motion.button>
            ))}
          </div>

          {/* Resources Grid */}
          <div className="space-y-5">
            {filteredResources.map((resource, index) => {
              const uploader = resource.uploader;
              const FileIcon = getFileIcon(resource.fileType || 'FILE');
              const fileColor = getFileColor(resource.fileType || 'FILE');

              return (
                <motion.div
                  key={resource.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05, duration: 0.3 }}
                >
                  <Card hoverable className="p-6" glass glow>
                    <div className="flex gap-5">
                      <div className={`w-16 h-16 bg-[rgb(var(--${fileColor})/0.1)] border border-[rgb(var(--${fileColor})/0.2)] rounded-2xl flex items-center justify-center flex-shrink-0 shadow-soft`}>
                        <FileIcon className={`w-8 h-8 text-[rgb(var(--${fileColor}))]`} />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="text-[rgb(var(--foreground))] pr-4">{resource.title}</h4>
                          <Badge variant={fileColor as any} size="sm">
                            {resource.fileType}
                          </Badge>
                        </div>

                        <p className="text-sm text-[rgb(var(--muted-foreground))] mb-4 line-clamp-2 leading-relaxed">
                          {resource.description}
                        </p>

                        <div className="flex flex-wrap gap-2 mb-4">
                          {resource.tags?.map((tag) => (
                            <Badge key={tag} variant="default" size="sm">
                              {tag}
                            </Badge>
                          ))}
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4 text-sm text-[rgb(var(--muted-foreground))]">
                            {uploader && (
                              <div className="flex items-center gap-2">
                                <Avatar src={uploader.profileImageUrl || undefined} alt={uploader.firstName || 'User'} size="xs" gradient />
                                <span>{uploader.firstName}</span>
                              </div>
                            )}
                            <span>·</span>
                            <span>{resource.fileSize}</span>
                            <span>·</span>
                            <div className="flex items-center gap-1.5">
                              <Download className="w-4 h-4" />
                              <span>{resource.downloadCount}</span>
                            </div>
                            <span>·</span>
                            <div className="flex items-center gap-1.5">
                              <Clock className="w-4 h-4" />
                              <span>{formatTimestamp(resource.createdAt || new Date())}</span>
                            </div>
                          </div>

                          <Button
                            size="sm"
                            variant="gradient"
                            glow
                            onClick={() => window.open(`/api/resources/${resource.id}/download`, '_blank')}
                          >
                            <Download className="w-4 h-4" />
                            Download
                          </Button>
                        </div>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              );
            })}
          </div>

          {filteredResources.length === 0 && (
            <Card className="p-12 text-center" glass>
              <div className="w-20 h-20 bg-gradient-soft rounded-3xl flex items-center justify-center mx-auto mb-4">
                <FileText className="w-10 h-10 text-[rgb(var(--primary))]" />
              </div>
              <h3 className="text-[rgb(var(--foreground))] mb-2">No resources found</h3>
              <p className="text-[rgb(var(--muted-foreground))]">
                Try adjusting your search or filters
              </p>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-4 space-y-6">
          {/* Popular Tags */}
          <Card className="p-6" glass>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-gradient-soft rounded-2xl flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-[rgb(var(--primary))]" />
              </div>
              <h3 className="text-[rgb(var(--foreground))]">Popular</h3>
            </div>
            <div className="space-y-2">
              {popularTags.map((tag) => (
                <motion.button
                  key={tag}
                  whileHover={{ x: 4 }}
                  onClick={() => setSelectedTag(tag)}
                  className="w-full flex items-center justify-between px-4 py-3 rounded-2xl text-[rgb(var(--muted-foreground))] hover:text-[rgb(var(--foreground))] hover:bg-[rgb(var(--muted))] transition-all duration-300 text-left"
                >
                  <span className="flex items-center gap-2.5">
                    <Tag className="w-4 h-4" />
                    <span className="text-sm font-medium">{tag}</span>
                  </span>
                  <span className="text-xs">{Math.floor(Math.random() * 50) + 10}</span>
                </motion.button>
              ))}
            </div>
          </Card>

          {/* Quick Stats */}
          <Card className="p-6" glass>
            <h3 className="text-[rgb(var(--foreground))] mb-6">Quick Stats</h3>
            <div className="space-y-4">
              {[
                { label: 'Total Resources', value: resources?.length || 0, color: 'primary' },
                { label: 'Total Downloads', value: resources?.reduce((sum, r) => sum + (r.downloadCount || 0), 0) || 0, color: 'success' },
                { label: 'Your Uploads', value: resources?.filter(r => r.uploadedBy === currentUserId).length || 0, color: 'accent' },
              ].map((stat) => (
                <div key={stat.label} className={`p-4 bg-[rgb(var(--${stat.color})/0.1)] border border-[rgb(var(--${stat.color})/0.2)] rounded-2xl`}>
                  <p className="text-sm text-[rgb(var(--muted-foreground))] mb-1">{stat.label}</p>
                  <p className={`text-2xl font-bold text-[rgb(var(--${stat.color}))]`}>
                    {stat.value}
                  </p>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
