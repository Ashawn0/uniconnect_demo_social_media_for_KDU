import { storage, type UserProfileUpdate } from '../storage';

export class UsersService {
  async getUser(id: string) {
    return storage.getUser(id);
  }

  async updateUserProfile(id: string, profile: UserProfileUpdate) {
    return storage.updateUserProfile(id, profile);
  }

  async followUser(followerId: string, followingId: string) {
    return storage.followUser(followerId, followingId);
  }

  async unfollowUser(followerId: string, followingId: string) {
    return storage.unfollowUser(followerId, followingId);
  }

  async isFollowing(followerId: string, followingId: string) {
    return storage.isFollowing(followerId, followingId);
  }

  async getFollowers(userId: string) {
    return storage.getFollowers(userId);
  }

  async getFollowing(userId: string) {
    return storage.getFollowing(userId);
  }

  async getUserWithStats(id: string) {
    return storage.getUserWithStats(id);
  }
}

export const usersService = new UsersService();
