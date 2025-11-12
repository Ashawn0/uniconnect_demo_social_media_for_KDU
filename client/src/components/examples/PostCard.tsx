import PostCard from '../PostCard'
import avatar1 from '@assets/generated_images/Female_professional_avatar_3740d65f.png'
import postImage from '@assets/generated_images/Abstract_gradient_post_image_d9bbedd6.png'

export default function PostCardExample() {
  return (
    <div className="max-w-2xl mx-auto p-4">
      <PostCard
        id="1"
        author="Sarah Chen"
        authorAvatar={avatar1}
        timestamp="2 hours ago"
        content="Just finished an amazing project! The journey was challenging but so rewarding. Can't wait to share more details soon! 🚀"
        image={postImage}
        likes={24}
        isLiked={false}
        comments={[
          {
            id: "1",
            author: "Alex Kumar",
            authorAvatar: "/placeholder.png",
            content: "Congratulations! This looks incredible!",
            timestamp: "1 hour ago"
          }
        ]}
      />
    </div>
  )
}
