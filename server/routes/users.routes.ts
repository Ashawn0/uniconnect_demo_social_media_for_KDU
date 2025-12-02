import { Router } from 'express';
import { requireAuth } from '../middleware/auth.middleware';
import { usersController } from '../controllers/users.controller';

const router = Router();

// All user routes require authentication
router.use(requireAuth);

// Current user routes
router.get('/me', usersController.getCurrentUser);
router.patch('/profile', usersController.updateProfile);

// User interaction routes
router.post('/:userId/follow', usersController.followUser);
router.delete('/:userId/follow', usersController.unfollowUser);
router.get('/:userId/followers', usersController.getFollowers);
router.get('/:userId/following', usersController.getFollowing);
router.get('/:userId/stats', usersController.getUserStats);
router.get('/:userId/is-following/:targetUserId', usersController.checkFollowStatus);

export default router;
