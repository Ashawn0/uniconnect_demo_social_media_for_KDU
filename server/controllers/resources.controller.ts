import { Request, Response } from 'express';
import { z } from 'zod';
import path from 'path';
import fs from 'fs';
import { resourcesService } from '../services/resources.service';
import { insertResourceSchema } from '@shared/schema';

export class ResourcesController {
  async getResources(req: Request, res: Response) {
    try {
      const { groupId } = req.query;
      const resources = await resourcesService.getResources(
        groupId as string | undefined
      );
      res.json(resources);
    } catch (error) {
      console.error('Error fetching resources:', error);
      res.status(500).json({ message: 'Failed to fetch resources' });
    }
  }

  async getResource(req: Request, res: Response) {
    try {
      const { resourceId } = req.params;
      const resource = await resourcesService.getResourceWithDetails(resourceId);
      if (!resource) {
        return res.status(404).json({ message: 'Resource not found' });
      }
      res.json(resource);
    } catch (error) {
      console.error('Error fetching resource:', error);
      res.status(500).json({ message: 'Failed to fetch resource' });
    }
  }

  async downloadResource(req: Request, res: Response) {
    try {
      const { resourceId } = req.params;
      const resource = await resourcesService.getResourceWithDetails(resourceId);
      if (!resource) {
        return res.status(404).json({ message: 'Resource not found' });
      }

      if (resource.fileUrl.startsWith('/uploads/')) {
        const relativePath = resource.fileUrl.replace(/^[\\/]/, '');
        const absolutePath = path.join(process.cwd(), relativePath);
        if (!fs.existsSync(absolutePath)) {
          return res.status(404).json({ message: 'File not found' });
        }
        return res.download(absolutePath, path.basename(absolutePath));
      }

      return res.redirect(resource.fileUrl);
    } catch (error) {
      console.error('Error preparing resource download:', error);
      res.status(500).json({ message: 'Failed to prepare download' });
    }
  }

  async createResource(req: Request, res: Response) {
    try {
      const userId = (req as any).userId;
      const validatedData = insertResourceSchema.parse(req.body);
      const resource = await resourcesService.createResource({ ...validatedData, uploadedBy: userId });
      res.json(resource);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: 'Validation error', errors: error.errors });
      }
      console.error('Error creating resource:', error);
      res.status(500).json({ message: 'Failed to create resource' });
    }
  }
}

export const resourcesController = new ResourcesController();
