import { storage } from '../storage';
import type { InsertPost, InsertComment, InsertPoll, InsertReaction } from '@shared/schema';

/**
 * Service layer for post-related business logic
 * Handles data validation and coordinates with storage layer
 */
export class PostsService {
  async getPosts(currentUserId: string, limit?: number, filter?: 'all' | 'following') {
    return storage.getPosts(currentUserId, limit, filter);
  }

  async getUserPosts(userId: string, currentUserId: string) {
    return storage.getUserPosts(userId, currentUserId);
  }

  async createPost(post: InsertPost & { userId: string }) {
    return storage.createPost(post);
  }

  async createComment(comment: InsertComment & { userId: string }) {
    return storage.createComment(comment);
  }

  async toggleLike(postId: string, userId: string) {
    return storage.toggleLike(postId, userId);
  }

  async addReaction(postId: string, userId: string, emojiType: string) {
    return storage.addReaction(postId, userId, emojiType);
  }

  async removeReaction(postId: string, userId: string, emojiType: string) {
    return storage.removeReaction(postId, userId, emojiType);
  }

  async getReactionsByPost(postId: string) {
    return storage.getReactionsByPost(postId);
  }

  async createPoll(poll: InsertPoll) {
    return storage.createPoll(poll);
  }

  async votePoll(pollId: string, userId: string, optionIndex: number) {
    return storage.votePoll(pollId, userId, optionIndex);
  }

  async getPollResults(pollId: string) {
    return storage.getPollResults(pollId);
  }
}

export const postsService = new PostsService();
