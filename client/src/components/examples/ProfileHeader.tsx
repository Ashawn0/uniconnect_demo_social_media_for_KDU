import ProfileHeader from '../ProfileHeader'
import avatar from '@assets/generated_images/Creative_person_avatar_a44cf52f.png'

export default function ProfileHeaderExample() {
  return (
    <div className="max-w-2xl mx-auto p-4">
      <ProfileHeader
        avatar={avatar}
        name="Jamie Rivers"
        bio="Creative designer and photographer. Love capturing moments and sharing stories through visual art."
        postsCount={12}
        onUpdate={(name, bio) => console.log('Profile updated:', { name, bio })}
      />
    </div>
  )
}
