import { storage } from '../storage';
import type { InsertResource } from '@shared/schema';

export class ResourcesService {
  async getResources(groupId?: string) {
    return storage.getResources(groupId);
  }

  async getResourceWithDetails(id: string) {
    return storage.getResourceWithDetails(id);
  }

  async createResource(resource: InsertResource & { uploadedBy: string }) {
    return storage.createResource(resource);
  }

  async deleteResource(resourceId: string, userId: string) {
    return storage.deleteResource(resourceId, userId);
  }
}

export const resourcesService = new ResourcesService();
