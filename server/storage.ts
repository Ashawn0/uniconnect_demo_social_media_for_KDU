import {
  users,
  posts,
  comments,
  likes,
  type User,
  type UpsertUser,
  type Post,
  type InsertPost,
  type Comment,
  type InsertComment,
  type PostWithDetails,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and } from "drizzle-orm";

export interface IStorage {
  // User operations (required for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  updateUserProfile(id: string, bio: string, firstName: string, lastName: string): Promise<User>;
  
  // Post operations
  createPost(post: InsertPost & { userId: string }): Promise<Post>;
  getPosts(currentUserId: string, limit?: number): Promise<PostWithDetails[]>;
  getUserPosts(userId: string, currentUserId: string): Promise<PostWithDetails[]>;
  
  // Comment operations
  createComment(comment: InsertComment & { userId: string }): Promise<Comment>;
  
  // Like operations
  toggleLike(postId: string, userId: string): Promise<boolean>;
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

  async updateUserProfile(id: string, bio: string, firstName: string, lastName: string): Promise<User> {
    const [user] = await db
      .update(users)
      .set({
        bio,
        firstName,
        lastName,
        updatedAt: new Date(),
      })
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  // Post operations
  async createPost(postData: InsertPost & { userId: string }): Promise<Post> {
    const [post] = await db.insert(posts).values(postData).returning();
    return post;
  }

  async getPosts(currentUserId: string, limit: number = 50): Promise<PostWithDetails[]> {
    const allPosts = await db.query.posts.findMany({
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
      },
    });

    return allPosts.map(post => ({
      ...post,
      isLiked: post.likes.some(like => like.userId === currentUserId),
      likesCount: post.likes.length,
    }));
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
      },
    });

    return userPosts.map(post => ({
      ...post,
      isLiked: post.likes.some(like => like.userId === currentUserId),
      likesCount: post.likes.length,
    }));
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
}

export const storage = new DatabaseStorage();
