import { MapPin, Mail, Calendar, Edit2, Award, BookOpen, Users, Settings, Share2, Upload } from 'lucide-react';
import { Avatar } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import PostCard from '@/components/PostCard';
import { mockPosts, mockUsers, mockGroups } from '@/lib/mockData';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '@/hooks/use-auth';
import { apiRequest } from '@/lib/queryClient';
import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { PostWithDetails } from '@shared/schema';

const profileSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  bio: z.string().optional(),
  department: z.string().optional(),
  profileImageUrl: z.string().optional(),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

interface UserProfileProps {
  userId: string;
  currentUserId: string;
  isOwnProfile: boolean;
  onLogout?: () => void;
}

export const UserProfile = ({ userId, currentUserId, isOwnProfile, onLogout }: UserProfileProps) => {
  const [activeTab, setActiveTab] = useState<'posts' | 'resources' | 'groups'>('posts');
  const { user: authUser, updateUser } = useAuth();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Use auth user if it's their own profile, otherwise fallback to mock for now (or fetch other user later)
  const displayUser = isOwnProfile && authUser ? authUser : (mockUsers.find(u => u.id === userId) || mockUsers[0]);

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName: (displayUser as any).firstName || (displayUser as any).name?.split(' ')[0] || '',
      lastName: (displayUser as any).lastName || (displayUser as any).name?.split(' ')[1] || '',
      bio: displayUser.bio || '',
      department: (displayUser as any).department || '',
      profileImageUrl: (displayUser as any).profileImageUrl || (displayUser as any).avatar || '',
    },
  });

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) throw new Error('Upload failed');

      const data = await res.json();
      form.setValue('profileImageUrl', data.url);
    } catch (error) {
      console.error('Error uploading file:', error);
    }
  };

  const onSubmit = (data: ProfileFormValues) => {
    updateUser(data, {
      onSuccess: () => {
        setIsDialogOpen(false);
      }
    });
  };

  const userPosts = mockPosts.filter(p => p.userId === userId);
  const userGroups = mockGroups.filter(g => g.members.includes(userId));

  const formattedPosts: PostWithDetails[] = userPosts.map((post) => {
    const author = mockUsers.find(u => u.id === post.userId) || mockUsers[0];
    // Safety check for author
    if (!author) return null;

    return {
      id: post.id,
      content: post.content,
      imageUrl: post.image,
      createdAt: post.timestamp || new Date(),
      updatedAt: post.timestamp || new Date(),
      author: {
        id: post.userId,
        email: author.email,
        // @ts-ignore - mock data vs schema mismatch
        firstName: author.firstName || author.name?.split(' ')[0] || 'User',
        // @ts-ignore - mock data vs schema mismatch
        lastName: author.lastName || author.name?.split(' ')[1] || '',
        profileImageUrl: author.avatar,
        // @ts-ignore - mock data vs schema mismatch
        role: author.role || 'student',
        // @ts-ignore - mock data vs schema mismatch
        department: author.department,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      comments: post.comments.map((comment) => {
        const commentAuthor = mockUsers.find(u => u.id === comment.userId);
        return {
          id: comment.id,
          postId: post.id,
          content: comment.content,
          createdAt: comment.timestamp || new Date(),
          author: {
            id: comment.userId,
            email: commentAuthor?.email || '',
            // @ts-ignore
            firstName: (commentAuthor as any)?.firstName || commentAuthor?.name || 'User',
            // @ts-ignore
            lastName: (commentAuthor as any)?.lastName || '',
            profileImageUrl: commentAuthor?.avatar,
            // @ts-ignore
            role: (commentAuthor as any)?.role || 'student',
            // @ts-ignore
            department: commentAuthor?.department,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        };
      }),
      reactions: [],
      likesCount: post.likes,
      isLiked: post.likedBy.includes(currentUserId),
    } as unknown as PostWithDetails;
  }).filter(Boolean) as PostWithDetails[];

  const stats = [
    { label: 'Posts', value: userPosts.length, icon: BookOpen, color: 'primary' },
    { label: 'Groups', value: userGroups.length, icon: Users, color: 'accent' },
    { label: 'Resources', value: 12, icon: Award, color: 'success' }
  ];

  const handleLike = (postId: string) => { };
  const handleComment = (postId: string, content: string) => { };

  return (
    <div className="space-y-8">
      {/* Profile Header */}
      <Card className="p-8 lg:p-10" gradient glow>
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Avatar & Basic Info */}
          <div className="flex flex-col items-center lg:items-start gap-6">
            <Avatar src={(displayUser as any).profileImageUrl || (displayUser as any).avatar} alt={(displayUser as any).name || "User"} size="2xl" gradient ring />

            {isOwnProfile && (
              <div className="flex gap-3 w-full">
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="gradient" fullWidth glow>
                      <Edit2 className="w-4 h-4" />
                      Edit Profile
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                      <DialogTitle>Edit Profile</DialogTitle>
                      <DialogDescription>
                        Make changes to your profile here. Click save when you're done.
                      </DialogDescription>
                    </DialogHeader>
                    <Form {...form}>
                      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                          control={form.control}
                          name="profileImageUrl"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Profile Image</FormLabel>
                              <div className="flex items-center gap-4">
                                <Avatar src={field.value} alt="Profile Preview" />
                                <FormControl>
                                  <div className="grid w-full max-w-sm items-center gap-1.5">
                                    <Input
                                      id="picture"
                                      type="file"
                                      accept="image/*"
                                      onChange={handleFileUpload}
                                    />
                                  </div>
                                </FormControl>
                              </div>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <div className="grid grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name="firstName"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>First Name</FormLabel>
                                <FormControl>
                                  <Input {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="lastName"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Last Name</FormLabel>
                                <FormControl>
                                  <Input {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        <FormField
                          control={form.control}
                          name="department"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Department</FormLabel>
                              <FormControl>
                                <Input {...field} placeholder="e.g. Computer Science" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="bio"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Bio</FormLabel>
                              <FormControl>
                                <Textarea {...field} placeholder="Tell us about yourself" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <Button type="submit" disabled={form.formState.isSubmitting}>
                          {form.formState.isSubmitting ? 'Saving...' : 'Save changes'}
                        </Button>
                      </form>
                    </Form>
                  </DialogContent>
                </Dialog>
                <Button variant="outline">
                  <Settings className="w-5 h-5" />
                </Button>
                {onLogout && (
                  <Button variant="destructive" onClick={onLogout}>
                    Logout
                  </Button>
                )}
              </div>
            )}
          </div>

          {/* User Details */}
          <div className="flex-1">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
              <div>
                <h2 className="text-[rgb(var(--foreground))] mb-3">
                  {(displayUser as any).firstName
                    ? `${(displayUser as any).firstName} ${(displayUser as any).lastName}`
                    : (displayUser as any).name}
                </h2>
                <p className="text-[rgb(var(--muted-foreground))] text-lg mb-4 max-w-2xl leading-relaxed">
                  {displayUser.bio || 'No bio yet'}
                </p>

                <div className="flex flex-wrap gap-3 mb-4">
                  <Badge variant="gradient" size="md">{(displayUser as any).role}</Badge>
                  <Badge variant="primary" size="md">{(displayUser as any).department}</Badge>
                  {/* @ts-ignore */}
                  {displayUser.batch && <Badge variant="default" size="md">{displayUser.batch}</Badge>}
                </div>

                <div className="flex flex-wrap gap-6 text-sm text-[rgb(var(--muted-foreground))]">
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    <span>{(displayUser as any).email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    <span>{(displayUser as any).department}</span>
                  </div>
                  {/* @ts-ignore */}
                  {displayUser.batch && (
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      {/* @ts-ignore */}
                      <span>{displayUser.batch}</span>
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
      </Card >

      {/* Tabs */}
      < div className="border-b border-[rgb(var(--border))]" >
        <div className="flex gap-2">
          {(['posts', 'resources', 'groups'] as const).map((tab) => (
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
                  layoutId="activeProfileTab"
                  className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-primary rounded-full"
                  transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                />
              )}
            </motion.button>
          ))}
        </div>
      </div >

      {/* Tab Content */}
      {
        activeTab === 'posts' && (
          <div className="space-y-6">
            {formattedPosts.map((post) => (
              <PostCard
                key={post.id}
                {...post}
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
        )
      }

      {
        activeTab === 'groups' && (
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
        )
      }

      {
        activeTab === 'resources' && (
          <Card className="p-12 text-center" glass>
            <div className="w-20 h-20 bg-gradient-soft rounded-3xl flex items-center justify-center mx-auto mb-4">
              <Award className="w-10 h-10 text-[rgb(var(--primary))]" />
            </div>
            <h3 className="text-[rgb(var(--foreground))] mb-2">Resources coming soon</h3>
            <p className="text-[rgb(var(--muted-foreground))]">
              User uploaded resources will appear here
            </p>
          </Card>
        )
      }
    </div >
  );
};
