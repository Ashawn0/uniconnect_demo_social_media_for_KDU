import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertPostSchema, 
  insertCommentSchema, 
  insertPollSchema,
  insertGroupSchema,
  insertResourceSchema,
} from "@shared/schema";
import multer from "multer";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { randomUUID } from "crypto";
import cookieParser from "cookie-parser";

// Set up multer for image uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  },
});

// Middleware to get or create anonymous user
async function getOrCreateUser(req: any, res: any, next: any) {
  try {
    let userId = req.cookies?.userId;
    
    if (!userId) {
      // Create new anonymous user
      userId = randomUUID();
      const user = await storage.upsertUser({
        id: userId,
        email: `user-${userId.slice(0, 8)}@uniconnect.app`,
        firstName: `User${userId.slice(0, 4)}`,
        lastName: null,
        profileImageUrl: null,
      });
      res.cookie('userId', userId, { 
        maxAge: 365 * 24 * 60 * 60 * 1000, // 1 year
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax'
      });
      req.userId = userId;
    } else {
      // Verify user exists, create if not
      const user = await storage.getUser(userId);
      if (!user) {
        const newUser = await storage.upsertUser({
          id: userId,
          email: `user-${userId.slice(0, 8)}@uniconnect.app`,
          firstName: `User${userId.slice(0, 4)}`,
          lastName: null,
          profileImageUrl: null,
        });
      }
      req.userId = userId;
    }
    
    next();
  } catch (error) {
    console.error("Error in getOrCreateUser middleware:", error);
    res.status(500).json({ message: "Failed to authenticate user" });
  }
}

export async function registerRoutes(app: Express): Promise<Server> {
  app.use(cookieParser());

  // User routes - get current user
  app.get('/api/auth/user', getOrCreateUser, async (req: any, res) => {
    try {
      const userId = req.userId;
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // User profile routes
  app.patch('/api/user/profile', getOrCreateUser, async (req: any, res) => {
    try {
      const userId = req.userId;
      const { bio, firstName, lastName } = req.body;
      const user = await storage.updateUserProfile(userId, bio || "", firstName || "", lastName || "");
      res.json(user);
    } catch (error) {
      console.error("Error updating profile:", error);
      res.status(500).json({ message: "Failed to update profile" });
    }
  });

  // Image upload route
  app.post('/api/upload', getOrCreateUser, upload.single('image'), async (req: any, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No image file provided" });
      }

      const imageDir = join(process.cwd(), 'uploads');
      await mkdir(imageDir, { recursive: true });

      const filename = `${randomUUID()}.${req.file.mimetype.split('/')[1]}`;
      const filepath = join(imageDir, filename);

      await writeFile(filepath, req.file.buffer);

      res.json({ url: `/uploads/${filename}` });
    } catch (error) {
      console.error("Error uploading image:", error);
      res.status(500).json({ message: "Failed to upload image" });
    }
  });

  // Serve uploaded images
  const express = await import('express');
  app.use('/uploads', express.static(join(process.cwd(), 'uploads')));

  // Post routes
  app.get('/api/posts', getOrCreateUser, async (req: any, res) => {
    try {
      const userId = req.userId;
      const posts = await storage.getPosts(userId);
      res.json(posts);
    } catch (error) {
      console.error("Error fetching posts:", error);
      res.status(500).json({ message: "Failed to fetch posts" });
    }
  });

  app.get('/api/posts/user/:userId', getOrCreateUser, async (req: any, res) => {
    try {
      const currentUserId = req.userId;
      const { userId } = req.params;
      const posts = await storage.getUserPosts(userId, currentUserId);
      res.json(posts);
    } catch (error) {
      console.error("Error fetching user posts:", error);
      res.status(500).json({ message: "Failed to fetch user posts" });
    }
  });

  app.post('/api/posts', getOrCreateUser, async (req: any, res) => {
    try {
      const userId = req.userId;
      const validatedData = insertPostSchema.parse(req.body);
      const post = await storage.createPost({ ...validatedData, userId });
      res.json(post);
    } catch (error) {
      console.error("Error creating post:", error);
      res.status(500).json({ message: "Failed to create post" });
    }
  });

  // Comment routes
  app.post('/api/comments', getOrCreateUser, async (req: any, res) => {
    try {
      const userId = req.userId;
      const validatedData = insertCommentSchema.parse(req.body);
      const comment = await storage.createComment({ ...validatedData, userId });
      res.json(comment);
    } catch (error) {
      console.error("Error creating comment:", error);
      res.status(500).json({ message: "Failed to create comment" });
    }
  });

  // Like routes
  app.post('/api/posts/:postId/like', getOrCreateUser, async (req: any, res) => {
    try {
      const userId = req.userId;
      const { postId } = req.params;
      const isLiked = await storage.toggleLike(postId, userId);
      res.json({ isLiked });
    } catch (error) {
      console.error("Error toggling like:", error);
      res.status(500).json({ message: "Failed to toggle like" });
    }
  });

  // Reaction routes
  app.post('/api/posts/:postId/reactions', getOrCreateUser, async (req: any, res) => {
    try {
      const userId = req.userId;
      const { postId } = req.params;
      const { emojiType } = req.body;
      
      if (!emojiType || !['like', 'love', 'fire', 'lightbulb', 'thinking'].includes(emojiType)) {
        return res.status(400).json({ message: "Invalid emoji type" });
      }
      
      const reaction = await storage.addReaction(postId, userId, emojiType);
      res.json(reaction);
    } catch (error) {
      console.error("Error adding reaction:", error);
      res.status(500).json({ message: "Failed to add reaction" });
    }
  });

  app.delete('/api/posts/:postId/reactions/:emojiType', getOrCreateUser, async (req: any, res) => {
    try {
      const userId = req.userId;
      const { postId, emojiType } = req.params;
      await storage.removeReaction(postId, userId, emojiType);
      res.json({ success: true });
    } catch (error) {
      console.error("Error removing reaction:", error);
      res.status(500).json({ message: "Failed to remove reaction" });
    }
  });

  app.get('/api/posts/:postId/reactions', getOrCreateUser, async (req: any, res) => {
    try {
      const { postId } = req.params;
      const reactions = await storage.getReactionsByPost(postId);
      res.json(reactions);
    } catch (error) {
      console.error("Error fetching reactions:", error);
      res.status(500).json({ message: "Failed to fetch reactions" });
    }
  });

  // Follow routes
  app.post('/api/users/:userId/follow', getOrCreateUser, async (req: any, res) => {
    try {
      const followerId = req.userId;
      const { userId: followingId } = req.params;
      
      const follow = await storage.followUser(followerId, followingId);
      res.json(follow);
    } catch (error: any) {
      console.error("Error following user:", error);
      if (error.message === 'Cannot follow yourself') {
        return res.status(400).json({ message: error.message });
      }
      res.status(500).json({ message: "Failed to follow user" });
    }
  });

  app.delete('/api/users/:userId/follow', getOrCreateUser, async (req: any, res) => {
    try {
      const followerId = req.userId;
      const { userId: followingId } = req.params;
      
      await storage.unfollowUser(followerId, followingId);
      res.json({ success: true });
    } catch (error) {
      console.error("Error unfollowing user:", error);
      res.status(500).json({ message: "Failed to unfollow user" });
    }
  });

  app.get('/api/users/:userId/followers', getOrCreateUser, async (req: any, res) => {
    try {
      const { userId } = req.params;
      const followers = await storage.getFollowers(userId);
      res.json(followers);
    } catch (error) {
      console.error("Error fetching followers:", error);
      res.status(500).json({ message: "Failed to fetch followers" });
    }
  });

  app.get('/api/users/:userId/following', getOrCreateUser, async (req: any, res) => {
    try {
      const { userId } = req.params;
      const following = await storage.getFollowing(userId);
      res.json(following);
    } catch (error) {
      console.error("Error fetching following:", error);
      res.status(500).json({ message: "Failed to fetch following" });
    }
  });

  app.get('/api/users/:userId/stats', getOrCreateUser, async (req: any, res) => {
    try {
      const { userId } = req.params;
      const stats = await storage.getUserWithStats(userId);
      if (!stats) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json(stats);
    } catch (error) {
      console.error("Error fetching user stats:", error);
      res.status(500).json({ message: "Failed to fetch user stats" });
    }
  });

  app.get('/api/users/:userId/is-following/:targetUserId', getOrCreateUser, async (req: any, res) => {
    try {
      const { userId, targetUserId } = req.params;
      const isFollowing = await storage.isFollowing(userId, targetUserId);
      res.json({ isFollowing });
    } catch (error) {
      console.error("Error checking follow status:", error);
      res.status(500).json({ message: "Failed to check follow status" });
    }
  });

  // Poll routes
  app.post('/api/polls', getOrCreateUser, async (req: any, res) => {
    try {
      const validatedData = insertPollSchema.parse(req.body);
      const poll = await storage.createPoll(validatedData);
      res.json(poll);
    } catch (error) {
      console.error("Error creating poll:", error);
      res.status(500).json({ message: "Failed to create poll" });
    }
  });

  app.post('/api/polls/:pollId/vote', getOrCreateUser, async (req: any, res) => {
    try {
      const userId = req.userId;
      const { pollId } = req.params;
      const { optionIndex } = req.body;
      
      if (typeof optionIndex !== 'number' || optionIndex < 0) {
        return res.status(400).json({ message: "Invalid option index" });
      }
      
      await storage.votePoll(pollId, userId, optionIndex);
      res.json({ success: true });
    } catch (error) {
      console.error("Error voting on poll:", error);
      res.status(500).json({ message: "Failed to vote on poll" });
    }
  });

  app.get('/api/polls/:pollId/results', getOrCreateUser, async (req: any, res) => {
    try {
      const { pollId } = req.params;
      const results = await storage.getPollResults(pollId);
      if (!results) {
        return res.status(404).json({ message: "Poll not found" });
      }
      res.json(results);
    } catch (error) {
      console.error("Error fetching poll results:", error);
      res.status(500).json({ message: "Failed to fetch poll results" });
    }
  });

  // Group routes
  app.get('/api/groups', getOrCreateUser, async (req: any, res) => {
    try {
      const groups = await storage.getGroups();
      res.json(groups);
    } catch (error) {
      console.error("Error fetching groups:", error);
      res.status(500).json({ message: "Failed to fetch groups" });
    }
  });

  app.get('/api/groups/:groupId', getOrCreateUser, async (req: any, res) => {
    try {
      const { groupId } = req.params;
      const group = await storage.getGroup(groupId);
      if (!group) {
        return res.status(404).json({ message: "Group not found" });
      }
      res.json(group);
    } catch (error) {
      console.error("Error fetching group:", error);
      res.status(500).json({ message: "Failed to fetch group" });
    }
  });

  app.post('/api/groups', getOrCreateUser, async (req: any, res) => {
    try {
      const userId = req.userId;
      const validatedData = insertGroupSchema.parse(req.body);
      const group = await storage.createGroup({ ...validatedData, createdBy: userId });
      res.json(group);
    } catch (error) {
      console.error("Error creating group:", error);
      res.status(500).json({ message: "Failed to create group" });
    }
  });

  app.post('/api/groups/:groupId/join', getOrCreateUser, async (req: any, res) => {
    try {
      const userId = req.userId;
      const { groupId } = req.params;
      const member = await storage.joinGroup(groupId, userId);
      res.json(member);
    } catch (error) {
      console.error("Error joining group:", error);
      res.status(500).json({ message: "Failed to join group" });
    }
  });

  app.delete('/api/groups/:groupId/leave', getOrCreateUser, async (req: any, res) => {
    try {
      const userId = req.userId;
      const { groupId } = req.params;
      await storage.leaveGroup(groupId, userId);
      res.json({ success: true });
    } catch (error) {
      console.error("Error leaving group:", error);
      res.status(500).json({ message: "Failed to leave group" });
    }
  });

  app.get('/api/groups/:groupId/members', getOrCreateUser, async (req: any, res) => {
    try {
      const { groupId } = req.params;
      const members = await storage.getGroupMembers(groupId);
      res.json(members);
    } catch (error) {
      console.error("Error fetching group members:", error);
      res.status(500).json({ message: "Failed to fetch group members" });
    }
  });

  app.get('/api/users/:userId/groups', getOrCreateUser, async (req: any, res) => {
    try {
      const { userId } = req.params;
      const groups = await storage.getUserGroups(userId);
      res.json(groups);
    } catch (error) {
      console.error("Error fetching user groups:", error);
      res.status(500).json({ message: "Failed to fetch user groups" });
    }
  });

  // Resource routes
  app.get('/api/resources', getOrCreateUser, async (req: any, res) => {
    try {
      const { category, groupId } = req.query;
      const resources = await storage.getResources(
        category as string | undefined,
        groupId as string | undefined
      );
      res.json(resources);
    } catch (error) {
      console.error("Error fetching resources:", error);
      res.status(500).json({ message: "Failed to fetch resources" });
    }
  });

  app.get('/api/resources/:resourceId', getOrCreateUser, async (req: any, res) => {
    try {
      const { resourceId } = req.params;
      const resource = await storage.getResourceWithDetails(resourceId);
      if (!resource) {
        return res.status(404).json({ message: "Resource not found" });
      }
      res.json(resource);
    } catch (error) {
      console.error("Error fetching resource:", error);
      res.status(500).json({ message: "Failed to fetch resource" });
    }
  });

  app.post('/api/resources', getOrCreateUser, async (req: any, res) => {
    try {
      const userId = req.userId;
      const validatedData = insertResourceSchema.parse(req.body);
      const resource = await storage.createResource({ ...validatedData, uploadedBy: userId });
      res.json(resource);
    } catch (error) {
      console.error("Error creating resource:", error);
      res.status(500).json({ message: "Failed to create resource" });
    }
  });

  // Notification routes
  app.get('/api/notifications', getOrCreateUser, async (req: any, res) => {
    try {
      const userId = req.userId;
      const notifications = await storage.getNotifications(userId);
      res.json(notifications);
    } catch (error) {
      console.error("Error fetching notifications:", error);
      res.status(500).json({ message: "Failed to fetch notifications" });
    }
  });

  app.patch('/api/notifications/:notificationId/read', getOrCreateUser, async (req: any, res) => {
    try {
      const userId = req.userId;
      const { notificationId } = req.params;
      
      // Mark as read with ownership check at storage layer
      const success = await storage.markNotificationAsRead(notificationId, userId);
      
      if (!success) {
        return res.status(404).json({ message: "Notification not found" });
      }
      
      res.json({ success: true });
    } catch (error) {
      console.error("Error marking notification as read:", error);
      res.status(500).json({ message: "Failed to mark notification as read" });
    }
  });

  app.patch('/api/notifications/read-all', getOrCreateUser, async (req: any, res) => {
    try {
      const userId = req.userId;
      await storage.markAllNotificationsAsRead(userId);
      res.json({ success: true });
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
      res.status(500).json({ message: "Failed to mark all notifications as read" });
    }
  });

  app.get('/api/notifications/unread-count', getOrCreateUser, async (req: any, res) => {
    try {
      const userId = req.userId;
      const count = await storage.getUnreadNotificationsCount(userId);
      res.json({ count });
    } catch (error) {
      console.error("Error fetching unread count:", error);
      res.status(500).json({ message: "Failed to fetch unread count" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
