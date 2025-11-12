import PostCard from '../PostCard'
import type { PostWithDetails, User } from '@shared/schema';

const mockAuthor: User = {
  id: "1",
  email: "sarah@example.com",
  firstName: "Sarah",
  lastName: "Chen",
  profileImageUrl: "/placeholder.png",
  bio: "Designer and creator",
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockPost: PostWithDetails = {
  id: "1",
  userId: "1",
  content: "Just finished an amazing project! The journey was challenging but so rewarding. Can't wait to share more details soon! 🚀",
  imageUrl: "/placeholder.png",
  createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
  updatedAt: new Date(),
  author: mockAuthor,
  comments: [
    {
      id: "c1",
      postId: "1",
      userId: "2",
      content: "Congratulations! This looks incredible!",
      createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000),
      author: {
        id: "2",
        email: "alex@example.com",
        firstName: "Alex",
        lastName: "Kumar",
        profileImageUrl: "/placeholder.png",
        bio: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    }
  ],
  likes: [],
  isLiked: false,
  likesCount: 24,
};

export default function PostCardExample() {
  return (
    <div className="max-w-2xl mx-auto p-4">
      <PostCard {...mockPost} />
    </div>
  )
}
