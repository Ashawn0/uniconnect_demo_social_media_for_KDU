import CreatePost from '../CreatePost'
import avatar from '@assets/generated_images/Male_professional_avatar_4752a4fe.png'

export default function CreatePostExample() {
  return (
    <div className="max-w-2xl mx-auto p-4">
      <CreatePost
        userAvatar={avatar}
        userName="John Doe"
        onPost={(content, image) => console.log('Post created:', { content, image })}
      />
    </div>
  )
}
