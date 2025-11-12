import { useState } from "react";
import { Image, X } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";

interface CreatePostProps {
  userAvatar: string;
  userName: string;
  onPost?: (content: string, image?: string) => void;
}

export default function CreatePost({ userAvatar, userName, onPost }: CreatePostProps) {
  const [content, setContent] = useState("");
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
        console.log('Image uploaded');
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePost = () => {
    if (content.trim() || imagePreview) {
      onPost?.(content, imagePreview || undefined);
      setContent("");
      setImagePreview(null);
      console.log('Post created:', { content, hasImage: !!imagePreview });
    }
  };

  return (
    <Card className="p-4">
      <div className="flex gap-3">
        <Avatar className="w-12 h-12 ring-2 ring-primary/20" data-testid="avatar-user">
          <AvatarImage src={userAvatar} alt={userName} />
          <AvatarFallback>{userName[0]}</AvatarFallback>
        </Avatar>
        
        <div className="flex-1 space-y-3">
          <Textarea
            placeholder="What's on your mind?"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="resize-none min-h-[80px] border-0 focus-visible:ring-0 bg-muted/30"
            data-testid="input-post-content"
          />
          
          {imagePreview && (
            <div className="relative rounded-lg overflow-hidden">
              <img 
                src={imagePreview} 
                alt="Preview" 
                className="w-full h-auto max-h-96 object-cover"
                data-testid="img-preview"
              />
              <Button
                variant="destructive"
                size="icon"
                className="absolute top-2 right-2"
                onClick={() => setImagePreview(null)}
                data-testid="button-remove-image"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          )}
          
          <div className="flex items-center justify-between pt-2 border-t border-border">
            <label htmlFor="image-upload">
              <Button 
                variant="ghost" 
                size="sm" 
                className="gap-2"
                type="button"
                onClick={() => document.getElementById('image-upload')?.click()}
                data-testid="button-add-image"
              >
                <Image className="w-5 h-5" />
                Photo
              </Button>
              <input
                id="image-upload"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageUpload}
              />
            </label>
            
            <Button 
              onClick={handlePost}
              disabled={!content.trim() && !imagePreview}
              className="bg-gradient-to-r from-[#833AB4] via-[#FD1D1D] to-[#FCAF45] hover:opacity-90 transition-opacity"
              data-testid="button-post"
            >
              Post
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}
