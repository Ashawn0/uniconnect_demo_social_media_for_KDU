import Navbar from "@/components/Navbar";
import ProfileHeader from "@/components/ProfileHeader";
import PostCard from "@/components/PostCard";
import avatar from '@assets/generated_images/Male_professional_avatar_4752a4fe.png';
import postImage1 from '@assets/generated_images/Abstract_gradient_post_image_d9bbedd6.png';
import postImage2 from '@assets/generated_images/Urban_sunset_cityscape_8a10a0cd.png';

//todo: remove mock functionality
const userPosts = [
  {
    id: "1",
    author: "Michael Torres",
    authorAvatar: avatar,
    timestamp: "5 hours ago",
    content: "Beautiful sunset today! Sometimes you just need to stop and appreciate the moment.",
    image: postImage2,
    likes: 42,
    isLiked: true,
    comments: []
  },
  {
    id: "2",
    author: "Michael Torres",
    authorAvatar: avatar,
    timestamp: "2 days ago",
    content: "Great day at the beach! Nothing beats the ocean breeze and good company.",
    image: postImage1,
    likes: 31,
    isLiked: false,
    comments: [
      {
        id: "c1",
        author: "Sarah Chen",
        authorAvatar: "/placeholder.png",
        content: "Looks amazing!",
        timestamp: "2 days ago"
      }
    ]
  }
];

export default function Profile() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        <ProfileHeader
          avatar={avatar}
          name="Michael Torres"
          bio="Adventurer, photographer, and coffee enthusiast. Living life one moment at a time."
          postsCount={userPosts.length}
        />
        
        <div className="space-y-6">
          <h2 className="text-xl font-semibold text-foreground">My Posts</h2>
          {userPosts.map(post => (
            <PostCard key={post.id} {...post} />
          ))}
        </div>
      </div>
    </div>
  );
}
