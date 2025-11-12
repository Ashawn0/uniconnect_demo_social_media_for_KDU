import {
  users,
  posts,
  comments,
  likes,
  reactions,
  follows,
  polls,
  pollVotes,
  groups,
  groupMembers,
  resources,
  notifications,
  type User,
  type UpsertUser,
  type Post,
  type InsertPost,
  type Comment,
  type InsertComment,
  type PostWithDetails,
  type Reaction,
  type InsertReaction,
  type Follow,
  type Poll,
  type InsertPoll,
  type PollVote,
  type InsertPollVote,
  type Group,
  type InsertGroup,
  type GroupMember,
  type Resource,
  type InsertResource,
  type Notification,
  type InsertNotification,
  type UserWithStats,
  type GroupWithMembers,
  type ResourceWithDetails,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, inArray, count, sql as sqlFunc } from "drizzle-orm";

export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  updateUserProfile(id: string, bio: string, firstName: string, lastName: string, department?: string, batch?: string): Promise<User>;
  getUserWithStats(id: string): Promise<UserWithStats | undefined>;
  
  // Post operations
  createPost(post: InsertPost & { userId: string }): Promise<Post>;
  getPosts(currentUserId: string, limit?: number, filter?: 'all' | 'following'): Promise<PostWithDetails[]>;
  getUserPosts(userId: string, currentUserId: string): Promise<PostWithDetails[]>;
  
  // Comment operations
  createComment(comment: InsertComment & { userId: string }): Promise<Comment>;
  
  // Like operations
  toggleLike(postId: string, userId: string): Promise<boolean>;
  
  // Reaction operations
  addReaction(postId: string, userId: string, emojiType: string): Promise<Reaction>;
  removeReaction(postId: string, userId: string, emojiType: string): Promise<void>;
  getReactionsByPost(postId: string): Promise<Reaction[]>;
  
  // Follow operations
  followUser(followerId: string, followingId: string): Promise<Follow>;
  unfollowUser(followerId: string, followingId: string): Promise<void>;
  isFollowing(followerId: string, followingId: string): Promise<boolean>;
  getFollowers(userId: string): Promise<User[]>;
  getFollowing(userId: string): Promise<User[]>;
  
  // Poll operations
  createPoll(poll: InsertPoll): Promise<Poll>;
  votePoll(pollId: string, userId: string, optionIndex: number): Promise<PollVote>;
  getPollResults(pollId: string): Promise<Poll & { votes: PollVote[] }>;
  
  // Group operations
  createGroup(group: InsertGroup & { createdBy: string }): Promise<Group>;
  getGroups(type?: string): Promise<GroupWithMembers[]>;
  getGroup(id: string): Promise<GroupWithMembers | undefined>;
  joinGroup(groupId: string, userId: string, role?: string): Promise<GroupMember>;
  leaveGroup(groupId: string, userId: string): Promise<void>;
  
  // Resource operations
  createResource(resource: InsertResource & { uploadedBy: string }): Promise<Resource>;
  getResources(groupId?: string): Promise<ResourceWithDetails[]>;
  deleteResource(id: string, userId: string): Promise<void>;
  
  // Notification operations
  createNotification(notification: InsertNotification): Promise<Notification>;
  getNotifications(userId: string, limit?: number): Promise<Notification[]>;
  markNotificationAsRead(id: string): Promise<void>;
  markAllNotificationsAsRead(userId: string): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  async updateUserProfile(id: string, bio: string, firstName: string, lastName: string, department?: string, batch?: string): Promise<User> {
    const updateData: any = {
      bio,
      firstName,
      lastName,
      updatedAt: new Date(),
    };
    if (department !== undefined) updateData.department = department;
    if (batch !== undefined) updateData.batch = batch;
    
    const [user] = await db
      .update(users)
      .set(updateData)
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  async getUserWithStats(id: string): Promise<UserWithStats | undefined> {
    const user = await this.getUser(id);
    if (!user) return undefined;

    const [followersCount] = await db
      .select({ count: count() })
      .from(follows)
      .where(eq(follows.followingId, id));

    const [followingCount] = await db
      .select({ count: count() })
      .from(follows)
      .where(eq(follows.followerId, id));

    const [postsCount] = await db
      .select({ count: count() })
      .from(posts)
      .where(eq(posts.userId, id));

    return {
      ...user,
      followersCount: Number(followersCount?.count || 0),
      followingCount: Number(followingCount?.count || 0),
      postsCount: Number(postsCount?.count || 0),
    };
  }

  // Post operations
  async createPost(postData: InsertPost & { userId: string }): Promise<Post> {
    const [post] = await db.insert(posts).values(postData).returning();
    return post;
  }

  async getPosts(currentUserId: string, limit: number = 50, filter: 'all' | 'following' = 'all'): Promise<PostWithDetails[]> {
    let whereCondition = undefined;
    
    if (filter === 'following') {
      const followingUsers = await db
        .select({ followingId: follows.followingId })
        .from(follows)
        .where(eq(follows.followerId, currentUserId));
      
      const followingIds = followingUsers.map(f => f.followingId);
      if (followingIds.length === 0) {
        return [];
      }
      whereCondition = inArray(posts.userId, followingIds);
    }

    const allPosts = await db.query.posts.findMany({
      where: whereCondition,
      orderBy: [desc(posts.createdAt)],
      limit,
      with: {
        author: true,
        comments: {
          orderBy: [desc(comments.createdAt)],
          with: {
            author: true,
          },
        },
        likes: true,
        reactions: true,
        poll: {
          with: {
            votes: true,
          },
        },
      },
    });

    return allPosts.map(post => {
      const reactionsCount: { [key: string]: number } = {};
      post.reactions.forEach(reaction => {
        reactionsCount[reaction.emojiType] = (reactionsCount[reaction.emojiType] || 0) + 1;
      });

      return {
        ...post,
        poll: post.poll || undefined,
        isLiked: post.likes.some(like => like.userId === currentUserId),
        likesCount: post.likes.length,
        reactionsCount,
      };
    });
  }

  async getUserPosts(userId: string, currentUserId: string): Promise<PostWithDetails[]> {
    const userPosts = await db.query.posts.findMany({
      where: eq(posts.userId, userId),
      orderBy: [desc(posts.createdAt)],
      with: {
        author: true,
        comments: {
          orderBy: [desc(comments.createdAt)],
          with: {
            author: true,
          },
        },
        likes: true,
        reactions: true,
        poll: {
          with: {
            votes: true,
          },
        },
      },
    });

    return userPosts.map(post => {
      const reactionsCount: { [key: string]: number } = {};
      post.reactions.forEach(reaction => {
        reactionsCount[reaction.emojiType] = (reactionsCount[reaction.emojiType] || 0) + 1;
      });

      return {
        ...post,
        poll: post.poll || undefined,
        isLiked: post.likes.some(like => like.userId === currentUserId),
        likesCount: post.likes.length,
        reactionsCount,
      };
    });
  }

  // Comment operations
  async createComment(commentData: InsertComment & { userId: string }): Promise<Comment> {
    const [comment] = await db.insert(comments).values(commentData).returning();
    return comment;
  }

  // Like operations
  async toggleLike(postId: string, userId: string): Promise<boolean> {
    const existingLike = await db.query.likes.findFirst({
      where: and(eq(likes.postId, postId), eq(likes.userId, userId)),
    });

    if (existingLike) {
      await db.delete(likes).where(eq(likes.id, existingLike.id));
      return false;
    } else {
      await db.insert(likes).values({ postId, userId });
      return true;
    }
  }

  // Reaction operations
  async addReaction(postId: string, userId: string, emojiType: string): Promise<Reaction> {
    // Use upsert to handle unique constraint - if already exists, just return it
    const [reaction] = await db
      .insert(reactions)
      .values({ postId, userId, emojiType })
      .onConflictDoUpdate({
        target: [reactions.postId, reactions.userId, reactions.emojiType],
        set: { createdAt: new Date() }, // Update timestamp if already exists
      })
      .returning();
    return reaction;
  }

  async removeReaction(postId: string, userId: string, emojiType: string): Promise<void> {
    await db.delete(reactions).where(
      and(
        eq(reactions.postId, postId),
        eq(reactions.userId, userId),
        eq(reactions.emojiType, emojiType)
      )
    );
  }

  async getReactionsByPost(postId: string): Promise<Reaction[]> {
    return db.select().from(reactions).where(eq(reactions.postId, postId));
  }

  // Follow operations
  async followUser(followerId: string, followingId: string): Promise<Follow> {
    // Prevent self-follows
    if (followerId === followingId) {
      throw new Error('Cannot follow yourself');
    }
    
    // Use upsert to handle unique constraint
    const [follow] = await db
      .insert(follows)
      .values({ followerId, followingId })
      .onConflictDoUpdate({
        target: [follows.followerId, follows.followingId],
        set: { createdAt: new Date() }, // Update timestamp if already exists
      })
      .returning();
    return follow;
  }

  async unfollowUser(followerId: string, followingId: string): Promise<void> {
    await db.delete(follows).where(
      and(eq(follows.followerId, followerId), eq(follows.followingId, followingId))
    );
  }

  async isFollowing(followerId: string, followingId: string): Promise<boolean> {
    const follow = await db.query.follows.findFirst({
      where: and(eq(follows.followerId, followerId), eq(follows.followingId, followingId)),
    });
    return !!follow;
  }

  async getFollowers(userId: string): Promise<User[]> {
    const followerRelations = await db.query.follows.findMany({
      where: eq(follows.followingId, userId),
      with: {
        follower: true,
      },
    });
    return followerRelations.map(f => f.follower);
  }

  async getFollowing(userId: string): Promise<User[]> {
    const followingRelations = await db.query.follows.findMany({
      where: eq(follows.followerId, userId),
      with: {
        following: true,
      },
    });
    return followingRelations.map(f => f.following);
  }

  // Poll operations
  async createPoll(pollData: InsertPoll): Promise<Poll> {
    const [poll] = await db.insert(polls).values({
      postId: pollData.postId,
      question: pollData.question,
      options: pollData.options as any,
      endsAt: pollData.endsAt,
    }).returning();
    return poll;
  }

  async votePoll(pollId: string, userId: string, optionIndex: number): Promise<PollVote> {
    // Check if user already voted
    const existingVote = await db.query.pollVotes.findFirst({
      where: and(eq(pollVotes.pollId, pollId), eq(pollVotes.userId, userId)),
    });

    if (existingVote) {
      // Update vote
      const [vote] = await db
        .update(pollVotes)
        .set({ optionIndex })
        .where(eq(pollVotes.id, existingVote.id))
        .returning();
      return vote;
    } else {
      // Create new vote
      const [vote] = await db.insert(pollVotes).values({ pollId, userId, optionIndex }).returning();
      return vote;
    }
  }

  async getPollResults(pollId: string): Promise<Poll & { votes: PollVote[] }> {
    const poll = await db.query.polls.findFirst({
      where: eq(polls.id, pollId),
      with: {
        votes: true,
      },
    });
    if (!poll) throw new Error('Poll not found');
    return poll;
  }

  // Group operations
  async createGroup(groupData: InsertGroup & { createdBy: string }): Promise<Group> {
    const [group] = await db.insert(groups).values(groupData).returning();
    // Auto-join creator as admin
    await db.insert(groupMembers).values({
      groupId: group.id,
      userId: groupData.createdBy,
      role: 'admin',
    });
    return group;
  }

  async getGroups(type?: string): Promise<GroupWithMembers[]> {
    const whereCondition = type ? eq(groups.type, type) : undefined;
    
    const allGroups = await db.query.groups.findMany({
      where: whereCondition,
      orderBy: [desc(groups.createdAt)],
      with: {
        creator: true,
        members: {
          with: {
            user: true,
          },
        },
      },
    });

    return allGroups.map(group => ({
      ...group,
      membersCount: group.members.length,
    }));
  }

  async getGroup(id: string): Promise<GroupWithMembers | undefined> {
    const group = await db.query.groups.findFirst({
      where: eq(groups.id, id),
      with: {
        creator: true,
        members: {
          with: {
            user: true,
          },
        },
      },
    });

    if (!group) return undefined;

    return {
      ...group,
      membersCount: group.members.length,
    };
  }

  async joinGroup(groupId: string, userId: string, role: string = 'member'): Promise<GroupMember> {
    // Use upsert to handle unique constraint
    const [member] = await db
      .insert(groupMembers)
      .values({ groupId, userId, role })
      .onConflictDoUpdate({
        target: [groupMembers.groupId, groupMembers.userId],
        set: { role, joinedAt: new Date() }, // Update role if already exists
      })
      .returning();
    return member;
  }

  async leaveGroup(groupId: string, userId: string): Promise<void> {
    await db.delete(groupMembers).where(
      and(eq(groupMembers.groupId, groupId), eq(groupMembers.userId, userId))
    );
  }

  // Resource operations
  async createResource(resourceData: InsertResource & { uploadedBy: string }): Promise<Resource> {
    const [resource] = await db.insert(resources).values(resourceData).returning();
    return resource;
  }

  async getResources(groupId?: string): Promise<ResourceWithDetails[]> {
    const whereCondition = groupId ? eq(resources.groupId, groupId) : undefined;
    
    const allResources = await db.query.resources.findMany({
      where: whereCondition,
      orderBy: [desc(resources.createdAt)],
      with: {
        uploader: true,
        group: true,
      },
    });

    return allResources.map(resource => ({
      ...resource,
      group: resource.group || undefined,
    }));
  }

  async deleteResource(id: string, userId: string): Promise<void> {
    // Only allow deletion if user is the uploader
    await db.delete(resources).where(
      and(eq(resources.id, id), eq(resources.uploadedBy, userId))
    );
  }

  // Notification operations
  async createNotification(notificationData: InsertNotification): Promise<Notification> {
    const [notification] = await db.insert(notifications).values(notificationData).returning();
    return notification;
  }

  async getNotifications(userId: string, limit: number = 20): Promise<Notification[]> {
    return db.query.notifications.findMany({
      where: eq(notifications.userId, userId),
      orderBy: [desc(notifications.createdAt)],
      limit,
    });
  }

  async markNotificationAsRead(id: string): Promise<void> {
    await db.update(notifications).set({ read: true }).where(eq(notifications.id, id));
  }

  async markAllNotificationsAsRead(userId: string): Promise<void> {
    await db.update(notifications).set({ read: true }).where(eq(notifications.userId, userId));
  }
}

export const storage = new DatabaseStorage();
