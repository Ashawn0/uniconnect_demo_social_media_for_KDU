import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertPostSchema, insertCommentSchema } from "@shared/schema";
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
    res.cookie('userId', userId, { maxAge: 365 * 24 * 60 * 60 * 1000, httpOnly: true }); // 1 year
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

  const httpServer = createServer(app);

  return httpServer;
}
