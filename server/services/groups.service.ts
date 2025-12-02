import { storage } from '../storage';
import type { InsertGroup } from '@shared/schema';

export class GroupsService {
  async getGroups(type?: string) {
    return storage.getGroups(type);
  }

  async getGroup(id: string) {
    return storage.getGroup(id);
  }

  async createGroup(group: InsertGroup & { createdBy: string }) {
    return storage.createGroup(group);
  }

  async joinGroup(groupId: string, userId: string, role?: string) {
    return storage.joinGroup(groupId, userId, role);
  }

  async leaveGroup(groupId: string, userId: string) {
    return storage.leaveGroup(groupId, userId);
  }

  async getGroupMembers(groupId: string) {
    return storage.getGroupMembers(groupId);
  }

  async getUserGroups(userId: string) {
    return storage.getUserGroups(userId);
  }
}

export const groupsService = new GroupsService();
