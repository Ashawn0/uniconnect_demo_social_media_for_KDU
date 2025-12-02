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
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePost = () => {
    if (content.trim() || imagePreview) {
      onPost?.(content, imagePreview || undefined);
      setContent("");
      setImagePreview(null);
    }
  };

  return (
    <Card className="rounded-2xl border border-border bg-card/80 p-5 shadow-sm">
      <div className="flex flex-col gap-4 sm:flex-row">
        <Avatar className="h-12 w-12 border border-border sm:shrink-0" data-testid="avatar-user">
          <AvatarImage src={userAvatar} alt={userName} />
          <AvatarFallback>{userName[0]}</AvatarFallback>
        </Avatar>
        <div className="flex-1 space-y-4">
          <div>
            <p className="text-xs uppercase tracking-widest text-muted-foreground">Share with campus</p>
            <Textarea
              placeholder="Announce departmental news, study sessions, or initiatives…"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="mt-2 min-h-[90px] resize-none bg-muted/20 text-sm"
              data-testid="input-post-content"
            />
          </div>

          {imagePreview && (
            <div className="relative overflow-hidden rounded-xl border border-border bg-muted">
              <img
                src={imagePreview}
                alt="Preview"
                className="h-auto max-h-96 w-full object-cover"
                data-testid="img-preview"
              />
              <Button
                variant="destructive"
                size="icon"
                className="absolute right-3 top-3"
                onClick={() => setImagePreview(null)}
                data-testid="button-remove-image"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          )}

          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-dashed border-border pt-3">
            <label htmlFor="image-upload" className="flex items-center gap-2 text-sm font-medium text-kdu-blue">
              <Button
                variant="ghost"
                size="sm"
                className="gap-2 text-kdu-blue hover:bg-kdu-gray-light"
                type="button"
                onClick={() => document.getElementById("image-upload")?.click()}
                data-testid="button-add-image"
              >
                <Image className="w-5 h-5" />
                Add media
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
              className="bg-kdu-navy text-white hover:bg-kdu-blue disabled:bg-muted disabled:text-muted-foreground/70"
              data-testid="button-post"
            >
              Publish update
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}
