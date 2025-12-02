import { Request, Response } from 'express';
import { groupsService } from '../services/groups.service';
import { insertGroupSchema, insertGroupMemberSchema } from '@shared/schema';

export class GroupsController {
  async getGroups(req: Request, res: Response) {
    try {
      const type = req.query.type as string | undefined;
      const groups = await groupsService.getGroups(type);
      res.json(groups);
    } catch (error) {
      console.error('Error fetching groups:', error);
      res.status(500).json({ message: 'Failed to fetch groups' });
    }
  }

  async getGroup(req: Request, res: Response) {
    try {
      const { groupId } = req.params;
      const group = await groupsService.getGroup(groupId);
      if (!group) {
        return res.status(404).json({ message: 'Group not found' });
      }
      res.json(group);
    } catch (error) {
      console.error('Error fetching group:', error);
      res.status(500).json({ message: 'Failed to fetch group' });
    }
  }

  async createGroup(req: Request, res: Response) {
    try {
      const userId = (req as any).userId;
      const validatedData = insertGroupSchema.parse(req.body);
      const group = await groupsService.createGroup({ ...validatedData, createdBy: userId });
      res.json(group);
    } catch (error) {
      console.error('Error creating group:', error);
      res.status(500).json({ message: 'Failed to create group' });
    }
  }

  async joinGroup(req: Request, res: Response) {
    try {
      const userId = (req as any).userId;
      const { groupId } = req.params;
      const member = await groupsService.joinGroup(groupId, userId);
      res.json(member);
    } catch (error) {
      console.error('Error joining group:', error);
      res.status(500).json({ message: 'Failed to join group' });
    }
  }

  async leaveGroup(req: Request, res: Response) {
    try {
      const userId = (req as any).userId;
      const { groupId } = req.params;
      await groupsService.leaveGroup(groupId, userId);
      res.json({ success: true });
    } catch (error) {
      console.error('Error leaving group:', error);
      res.status(500).json({ message: 'Failed to leave group' });
    }
  }

  async getGroupMembers(req: Request, res: Response) {
    try {
      const { groupId } = req.params;
      const members = await groupsService.getGroupMembers(groupId);
      res.json(members);
    } catch (error) {
      console.error('Error fetching group members:', error);
      res.status(500).json({ message: 'Failed to fetch group members' });
    }
  }

  async getUserGroups(req: Request, res: Response) {
    try {
      const { userId } = req.params;
      const groups = await groupsService.getUserGroups(userId);
      res.json(groups);
    } catch (error) {
      console.error('Error fetching user groups:', error);
      res.status(500).json({ message: 'Failed to fetch user groups' });
    }
  }
}

export const groupsController = new GroupsController();
