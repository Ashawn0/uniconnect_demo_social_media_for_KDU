import { Request, Response } from 'express';
import { z } from 'zod';
import { postsService } from '../services/posts.service';
import { REACTIONS } from '../constants';
import { insertPostSchema, insertCommentSchema, insertPollSchema } from '@shared/schema';

const respondWithValidationError = (error: unknown, res: Response) => {
  if (error instanceof z.ZodError) {
    res.status(400).json({ message: 'Validation error', errors: error.errors });
    return true;
  }
  return false;
};

/**
 * Controller for handling post-related HTTP requests
 * Manages posts, comments, likes, reactions, and polls
 */
export class PostsController {
  /**
   * Get posts for the authenticated user
   * @param req Express request
   * @param res Express response
   */
  async getPosts(req: Request, res: Response) {
    try {
      const userId = (req as any).userId;
      const filter = req.query.filter as 'all' | 'following' | undefined;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;

      const posts = await postsService.getPosts(userId, limit, filter);
      res.json(posts);
    } catch (error) {
      console.error('Error fetching posts:', error);
      res.status(500).json({ message: 'Failed to fetch posts' });
    }
  }

  async getUserPosts(req: Request, res: Response) {
    try {
      const currentUserId = (req as any).userId;
      const { userId } = req.params;

      const posts = await postsService.getUserPosts(userId, currentUserId);
      res.json(posts);
    } catch (error) {
      console.error('Error fetching user posts:', error);
      res.status(500).json({ message: 'Failed to fetch user posts' });
    }
  }

  async createPost(req: Request, res: Response) {
    try {
      const userId = (req as any).userId;
      const validatedData = insertPostSchema.parse(req.body);
      const post = await postsService.createPost({ ...validatedData, userId });
      res.json(post);
    } catch (error) {
      if (respondWithValidationError(error, res)) {
        return;
      }
      console.error('Error creating post:', error);
      res.status(500).json({ message: 'Failed to create post' });
    }
  }

  async createComment(req: Request, res: Response) {
    try {
      const userId = (req as any).userId;
      const validatedData = insertCommentSchema.parse(req.body);
      const comment = await postsService.createComment({ ...validatedData, userId });
      res.json(comment);
    } catch (error) {
      if (respondWithValidationError(error, res)) {
        return;
      }
      console.error('Error creating comment:', error);
      res.status(500).json({ message: 'Failed to create comment' });
    }
  }

  async toggleLike(req: Request, res: Response) {
    try {
      const userId = (req as any).userId;
      const { postId } = req.params;
      const isLiked = await postsService.toggleLike(postId, userId);
      res.json({ isLiked });
    } catch (error) {
      console.error('Error toggling like:', error);
      res.status(500).json({ message: 'Failed to toggle like' });
    }
  }

  async addReaction(req: Request, res: Response) {
    try {
      const userId = (req as any).userId;
      const { postId } = req.params;
      const { emojiType } = req.body;

      if (!emojiType || !REACTIONS.TYPES.includes(emojiType as any)) {
        return res.status(400).json({ message: 'Invalid emoji type' });
      }

      const reaction = await postsService.addReaction(postId, userId, emojiType);
      res.json(reaction);
    } catch (error) {
      console.error('Error adding reaction:', error);
      res.status(500).json({ message: 'Failed to add reaction' });
    }
  }

  async removeReaction(req: Request, res: Response) {
    try {
      const userId = (req as any).userId;
      const { postId, emojiType } = req.params;
      await postsService.removeReaction(postId, userId, emojiType);
      res.json({ success: true });
    } catch (error) {
      console.error('Error removing reaction:', error);
      res.status(500).json({ message: 'Failed to remove reaction' });
    }
  }

  async getReactionsByPost(req: Request, res: Response) {
    try {
      const { postId } = req.params;
      const reactions = await postsService.getReactionsByPost(postId);
      res.json(reactions);
    } catch (error) {
      console.error('Error fetching reactions:', error);
      res.status(500).json({ message: 'Failed to fetch reactions' });
    }
  }

  async createPoll(req: Request, res: Response) {
    try {
      const validatedData = insertPollSchema.parse(req.body);
      const poll = await postsService.createPoll(validatedData);
      res.json(poll);
    } catch (error) {
      if (respondWithValidationError(error, res)) {
        return;
      }
      console.error('Error creating poll:', error);
      res.status(500).json({ message: 'Failed to create poll' });
    }
  }

  async votePoll(req: Request, res: Response) {
    try {
      const userId = (req as any).userId;
      const { pollId } = req.params;
      const { optionIndex } = req.body;

      if (typeof optionIndex !== 'number' || optionIndex < 0) {
        return res.status(400).json({ message: 'Invalid option index' });
      }

      await postsService.votePoll(pollId, userId, optionIndex);
      res.json({ success: true });
    } catch (error) {
      console.error('Error voting on poll:', error);
      res.status(500).json({ message: 'Failed to vote on poll' });
    }
  }

  async getPollResults(req: Request, res: Response) {
    try {
      const { pollId } = req.params;
      const results = await postsService.getPollResults(pollId);
      if (!results) {
        return res.status(404).json({ message: 'Poll not found' });
      }
      res.json(results);
    } catch (error) {
      console.error('Error fetching poll results:', error);
      res.status(500).json({ message: 'Failed to fetch poll results' });
    }
  }
}

export const postsController = new PostsController();
