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
  };

  return (
    <Card className="rounded-3xl border border-border bg-card p-6 shadow-md">
      <div className="flex flex-col items-center gap-6 text-center md:flex-row md:text-left">
        <Avatar className="h-32 w-32 border-4 border-kdu-navy/20" data-testid="avatar-profile">
          <AvatarImage src={avatar} alt={name} />
          <AvatarFallback className="text-2xl">{name[0]}</AvatarFallback>
        </Avatar>
        <div className="flex-1 space-y-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-kdu-blue">Student profile</p>
            <h1 className="mt-1 break-words text-3xl font-semibold text-foreground" data-testid="text-name">
              {name}
            </h1>
            <p className="mt-2 max-w-2xl break-words text-sm text-muted-foreground" data-testid="text-bio">
              {bio}
            </p>
          </div>

          <div className="grid gap-4 rounded-2xl border border-border bg-muted/30 p-4 text-sm font-semibold text-foreground sm:grid-cols-3">
            <div className="text-center">
              <p className="text-2xl font-bold" data-testid="text-posts-count">
                {postsCount}
              </p>
              <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground leading-tight break-words">
                Posts
              </p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold" data-testid="text-followers-count">
                {followersCount}
              </p>
              <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground leading-tight break-words">
                Followers
              </p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold" data-testid="text-following-count">
                {followingCount}
              </p>
              <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground leading-tight break-words">
                Following
              </p>
            </div>
          </div>

          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2 bg-kdu-navy text-white hover:bg-kdu-blue" data-testid="button-edit-profile">
                <Edit2 className="h-4 w-4" />
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
                  className="w-full bg-kdu-navy text-white hover:bg-kdu-blue"
                  data-testid="button-save-profile"
                >
                  Save Changes
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </Card>
  );
}
