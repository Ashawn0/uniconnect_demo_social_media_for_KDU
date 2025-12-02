import { Router } from 'express';
import { requireAuth } from '../middleware/auth.middleware';
import { resourcesController } from '../controllers/resources.controller';

const router = Router();

// All resource routes require authentication
router.use(requireAuth);

// Resource CRUD routes
router.get('/', resourcesController.getResources);
router.get('/:resourceId', resourcesController.getResource);
router.get('/:resourceId/download', resourcesController.downloadResource);
router.post('/', resourcesController.createResource);

export default router;
