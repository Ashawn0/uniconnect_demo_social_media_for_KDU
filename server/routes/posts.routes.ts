import { Router } from 'express';
import { requireAuth } from '../middleware/auth.middleware';
import { postsController } from '../controllers/posts.controller';

const router = Router();

// All post routes require authentication
router.use(requireAuth);

// Post CRUD routes
router.get('/', postsController.getPosts);
router.get('/user/:userId', postsController.getUserPosts);
router.post('/', postsController.createPost);

// Comment routes
router.post('/comments', postsController.createComment);

// Like routes
router.post('/:postId/like', postsController.toggleLike);

// Reaction routes
router.post('/:postId/reactions', postsController.addReaction);
router.delete('/:postId/reactions/:emojiType', postsController.removeReaction);
router.get('/:postId/reactions', postsController.getReactionsByPost);

// Poll routes
router.post('/polls', postsController.createPoll);
router.post('/polls/:pollId/vote', postsController.votePoll);
router.get('/polls/:pollId/results', postsController.getPollResults);

export default router;
