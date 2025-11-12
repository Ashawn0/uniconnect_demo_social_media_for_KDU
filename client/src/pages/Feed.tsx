import { useState } from "react";
import Navbar from "@/components/Navbar";
import CreatePost from "@/components/CreatePost";
import PostCard from "@/components/PostCard";
import avatar1 from '@assets/generated_images/Female_professional_avatar_3740d65f.png';
import avatar2 from '@assets/generated_images/Male_professional_avatar_4752a4fe.png';
import avatar3 from '@assets/generated_images/Creative_person_avatar_a44cf52f.png';
import postImage1 from '@assets/generated_images/Abstract_gradient_post_image_d9bbedd6.png';
import postImage2 from '@assets/generated_images/Urban_sunset_cityscape_8a10a0cd.png';
import postImage3 from '@assets/generated_images/Futuristic_3D_shapes_53ee4888.png';

//todo: remove mock functionality
const initialPosts = [
  {
    id: "1",
    author: "Sarah Chen",
    authorAvatar: avatar1,
    timestamp: "2 hours ago",
    content: "Just finished an amazing project! The journey was challenging but so rewarding. Can't wait to share more details soon! 🚀",
    image: postImage1,
    likes: 24,
    isLiked: false,
    comments: [
      {
        id: "c1",
        author: "Alex Kumar",
        authorAvatar: avatar2,
        content: "Congratulations! This looks incredible!",
        timestamp: "1 hour ago"
      }
    ]
  },
  {
    id: "2",
    author: "Michael Torres",
    authorAvatar: avatar2,
    timestamp: "5 hours ago",
    content: "Beautiful sunset today! Sometimes you just need to stop and appreciate the moment. What's everyone up to this weekend?",
    image: postImage2,
    likes: 42,
    isLiked: true,
    comments: []
  },
  {
    id: "3",
    author: "Jamie Rivers",
    authorAvatar: avatar3,
    timestamp: "1 day ago",
    content: "Exploring new creative directions with 3D design. The future of digital art is so exciting!",
    image: postImage3,
    likes: 18,
    isLiked: false,
    comments: [
      {
        id: "c2",
        author: "Sarah Chen",
        authorAvatar: avatar1,
        content: "This is stunning! Would love to learn more about your process.",
        timestamp: "20 hours ago"
      },
      {
        id: "c3",
        author: "Michael Torres",
        authorAvatar: avatar2,
        content: "Amazing work as always!",
        timestamp: "18 hours ago"
      }
    ]
  }
];

export default function Feed() {
  const [posts, setPosts] = useState(initialPosts);

  const handleCreatePost = (content: string, image?: string) => {
    const newPost = {
      id: Date.now().toString(),
      author: "You",
      authorAvatar: avatar2,
      timestamp: "Just now",
      content,
      ...(image && { image }),
      likes: 0,
      isLiked: false,
      comments: []
    };
    setPosts([newPost, ...posts]);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        <CreatePost
          userAvatar={avatar2}
          userName="You"
          onPost={handleCreatePost}
        />
        
        {posts.map(post => (
          <PostCard key={post.id} {...post} />
        ))}
      </div>
    </div>
  );
}
