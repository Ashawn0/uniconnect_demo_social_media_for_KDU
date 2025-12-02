import { Router } from 'express';
import { requireAuth } from '../middleware/auth.middleware';
import { groupsController } from '../controllers/groups.controller';

const router = Router();

// All group routes require authentication
router.use(requireAuth);

// Group CRUD routes
router.get('/', groupsController.getGroups);
router.get('/:groupId', groupsController.getGroup);
router.post('/', groupsController.createGroup);

// Group membership routes
router.post('/:groupId/join', groupsController.joinGroup);
router.delete('/:groupId/leave', groupsController.leaveGroup);
router.get('/:groupId/members', groupsController.getGroupMembers);

// User groups route
router.get('/user/:userId', groupsController.getUserGroups);

export default router;
