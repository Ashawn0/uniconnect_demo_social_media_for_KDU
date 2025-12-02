import { Request, Response } from 'express';
import { z } from 'zod';
import { usersService } from '../services/users.service';

const updateProfileSchema = z.object({
  firstName: z.string().trim().max(100).optional().transform((val) => (val?.trim() ? val.trim() : undefined)),
  lastName: z.string().trim().max(100).optional().transform((val) => (val?.trim() ? val.trim() : undefined)),
  bio: z.string().trim().max(1000).optional().transform((val) => (val?.trim() ? val.trim() : undefined)),
  department: z.string().trim().max(120).optional().transform((val) => (val?.trim() ? val.trim() : undefined)),
  batch: z.string().trim().max(50).optional().transform((val) => (val?.trim() ? val.trim() : undefined)),
});

export class UsersController {
  async getCurrentUser(req: Request, res: Response) {
    try {
      const userId = (req as any).userId;
      const user = await usersService.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      const { passwordHash, ...safeUser } = user as any;
      res.json(safeUser);
    } catch (error) {
      console.error('Error fetching user:', error);
      res.status(500).json({ message: 'Failed to fetch user' });
    }
  }

  async updateProfile(req: Request, res: Response) {
    try {
      const userId = (req as any).userId;

      const parsed = updateProfileSchema.parse(req.body);
      const updates = Object.fromEntries(
        Object.entries(parsed).filter(([, value]) => value !== undefined)
      );

      if (Object.keys(updates).length === 0) {
        return res.status(400).json({ message: 'No profile fields provided' });
      }

      const user = await usersService.updateUserProfile(userId, updates);
      const { passwordHash, ...safeUser } = user as any;
      res.json(safeUser);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: 'Validation error', errors: error.errors });
      }
      if (error instanceof Error && error.message === 'No profile fields provided') {
        return res.status(400).json({ message: error.message });
      }
      console.error('Error updating profile:', error);
      res.status(500).json({ message: 'Failed to update profile' });
    }
  }

  async followUser(req: Request, res: Response) {
    try {
      const followerId = (req as any).userId;
      const { userId: followingId } = req.params;

      const follow = await usersService.followUser(followerId, followingId);
      res.json(follow);
    } catch (error: any) {
      console.error('Error following user:', error);
      if (error.message === 'Cannot follow yourself') {
        return res.status(400).json({ message: error.message });
      }
      res.status(500).json({ message: 'Failed to follow user' });
    }
  }

  async unfollowUser(req: Request, res: Response) {
    try {
      const followerId = (req as any).userId;
      const { userId: followingId } = req.params;

      await usersService.unfollowUser(followerId, followingId);
      res.json({ success: true });
    } catch (error) {
      console.error('Error unfollowing user:', error);
      res.status(500).json({ message: 'Failed to unfollow user' });
    }
  }

  async getFollowers(req: Request, res: Response) {
    try {
      const { userId } = req.params;
      const followers = await usersService.getFollowers(userId);
      res.json(followers);
    } catch (error) {
      console.error('Error fetching followers:', error);
      res.status(500).json({ message: 'Failed to fetch followers' });
    }
  }

  async getFollowing(req: Request, res: Response) {
    try {
      const { userId } = req.params;
      const following = await usersService.getFollowing(userId);
      res.json(following);
    } catch (error) {
      console.error('Error fetching following:', error);
      res.status(500).json({ message: 'Failed to fetch following' });
    }
  }

  async getUserStats(req: Request, res: Response) {
    try {
      const { userId } = req.params;
      const stats = await usersService.getUserWithStats(userId);
      if (!stats) {
        return res.status(404).json({ message: 'User not found' });
      }
      res.json(stats);
    } catch (error) {
      console.error('Error fetching user stats:', error);
      res.status(500).json({ message: 'Failed to fetch user stats' });
    }
  }

  async checkFollowStatus(req: Request, res: Response) {
    try {
      const { userId, targetUserId } = req.params;
      const isFollowing = await usersService.isFollowing(userId, targetUserId);
      res.json({ isFollowing });
    } catch (error) {
      console.error('Error checking follow status:', error);
      res.status(500).json({ message: 'Failed to check follow status' });
    }
  }
}

export const usersController = new UsersController();
