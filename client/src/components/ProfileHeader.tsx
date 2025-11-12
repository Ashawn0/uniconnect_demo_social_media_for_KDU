import { useState } from "react";
import { Edit2 } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

interface ProfileHeaderProps {
  avatar: string;
  name: string;
  bio: string;
  postsCount: number;
  followersCount?: number;
  followingCount?: number;
  onUpdate?: (name: string, bio: string) => void;
}

export default function ProfileHeader({ 
  avatar, 
  name: initialName, 
  bio: initialBio, 
  postsCount,
  followersCount = 0,
  followingCount = 0,
  onUpdate 
}: ProfileHeaderProps) {
  const [name, setName] = useState(initialName);
  const [bio, setBio] = useState(initialBio);
  const [isOpen, setIsOpen] = useState(false);
  const [editName, setEditName] = useState(initialName);
  const [editBio, setEditBio] = useState(initialBio);

  const handleSave = () => {
    setName(editName);
    setBio(editBio);
    onUpdate?.(editName, editBio);
    setIsOpen(false);
    console.log('Profile updated:', { name: editName, bio: editBio });
  };

  return (
    <Card className="p-6">
      <div className="flex flex-col items-center text-center space-y-4">
        <div className="relative">
          <Avatar className="w-32 h-32 ring-4 ring-offset-4 ring-offset-background" style={{
            background: 'linear-gradient(135deg, #833AB4 0%, #FD1D1D 50%, #FCAF45 100%)',
          }} data-testid="avatar-profile">
            <AvatarImage src={avatar} alt={name} className="ring-4 ring-background" />
            <AvatarFallback className="text-2xl">{name[0]}</AvatarFallback>
          </Avatar>
        </div>
        
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-foreground" data-testid="text-name">{name}</h1>
          <p className="text-muted-foreground max-w-md" data-testid="text-bio">{bio}</p>
        </div>
        
        <div className="flex gap-6 py-3">
          <div className="text-center">
            <p className="text-2xl font-bold text-foreground" data-testid="text-posts-count">{postsCount}</p>
            <p className="text-sm text-muted-foreground">Posts</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-foreground" data-testid="text-followers-count">{followersCount}</p>
            <p className="text-sm text-muted-foreground">Followers</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-foreground" data-testid="text-following-count">{followingCount}</p>
            <p className="text-sm text-muted-foreground">Following</p>
          </div>
        </div>
        
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button 
              variant="outline" 
              className="gap-2"
              data-testid="button-edit-profile"
            >
              <Edit2 className="w-4 h-4" />
              Edit Profile
            </Button>
          </DialogTrigger>
          <DialogContent data-testid="dialog-edit-profile">
            <DialogHeader>
              <DialogTitle>Edit Profile</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  data-testid="input-edit-name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  value={editBio}
                  onChange={(e) => setEditBio(e.target.value)}
                  className="resize-none"
                  rows={3}
                  data-testid="input-edit-bio"
                />
              </div>
              <Button 
                onClick={handleSave} 
                className="w-full bg-gradient-to-r from-[#833AB4] via-[#FD1D1D] to-[#FCAF45]"
                data-testid="button-save-profile"
              >
                Save Changes
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </Card>
  );
}
