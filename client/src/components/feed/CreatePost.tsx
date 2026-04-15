import { useState, useRef } from 'react';
import { Image, Video, Smile, Send, X, Paperclip } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Avatar } from '../ui/avatar';
import { Card } from '../ui/card';
import { Button } from '../ui/button';

interface CreatePostProps {
  onCreatePost: (content: string, image?: string) => void;
  currentUser: { name: string; avatar?: string };
}

export const CreatePost = ({ onCreatePost, currentUser }: CreatePostProps) => {
  const [content, setContent] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);
  const [image, setImage] = useState<string | undefined>();
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) throw new Error('Upload failed');

      const data = await res.json();
      setImage(data.url);
      setIsExpanded(true);
    } catch (error) {
      console.error('Error uploading file:', error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleSubmit = () => {
    if (content.trim()) {
      onCreatePost(content, image);
      setContent('');
      setImage(undefined);
      setIsExpanded(false);
    }
  };

  return (
    <Card className="p-8" gradient glow>
      <div className="flex gap-4">
        <Avatar src={currentUser.avatar} alt={currentUser.name} size="lg" gradient ring />
        <div className="flex-1">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onFocus={() => setIsExpanded(true)}
            placeholder="What's on your mind?"
            className="w-full px-5 py-4 bg-[rgb(var(--muted))] border border-[rgb(var(--border))] rounded-2xl text-[rgb(var(--foreground))] placeholder:text-[rgb(var(--muted-foreground))] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--primary)/0.5)] focus:border-[rgb(var(--primary))] resize-none transition-all duration-300 shadow-soft"
            rows={isExpanded ? 5 : 2}
            style={{
              fontSize: '15px',
              lineHeight: '1.6'
            }}
          />

          <AnimatePresence>
            {image && (
              <motion.div
                initial={{ opacity: 0, height: 0, marginTop: 0 }}
                animate={{ opacity: 1, height: 'auto', marginTop: 16 }}
                exit={{ opacity: 0, height: 0, marginTop: 0 }}
                transition={{ duration: 0.3 }}
                className="relative rounded-2xl overflow-hidden shadow-card-lg"
              >
                <img src={image} alt="Upload preview" className="w-full max-h-80 object-cover" />
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setImage(undefined)}
                  className="absolute top-4 right-4 p-2.5 bg-[rgb(var(--card))] hover:bg-[rgb(var(--card-hover))] rounded-xl shadow-card-lg transition-colors"
                >
                  <X className="w-5 h-5 text-[rgb(var(--foreground))]" />
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {isExpanded && (
              <motion.div
                initial={{ opacity: 0, height: 0, marginTop: 0 }}
                animate={{ opacity: 1, height: 'auto', marginTop: 16 }}
                exit={{ opacity: 0, height: 0, marginTop: 0 }}
                transition={{ duration: 0.3 }}
                className="flex items-center justify-between"
              >
                <div className="flex items-center gap-2">

                  <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    accept="image/*"
                    onChange={handleImageUpload}
                  />
                  <motion.button
                    whileHover={{ scale: 1.05, y: -1 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleImageClick}
                    disabled={isUploading}
                    className="p-3 rounded-2xl bg-[rgb(var(--muted))] text-[rgb(var(--muted-foreground))] hover:text-[rgb(var(--primary))] hover:bg-gradient-soft transition-all duration-300 disabled:opacity-50"
                    title="Add image"
                  >
                    <Image className="w-5 h-5" />
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05, y: -1 }}
                    whileTap={{ scale: 0.95 }}
                    className="p-3 rounded-2xl bg-[rgb(var(--muted))] text-[rgb(var(--muted-foreground))] hover:text-[rgb(var(--accent))] hover:bg-gradient-soft transition-all duration-300"
                    title="Add video"
                  >
                    <Video className="w-5 h-5" />
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05, y: -1 }}
                    whileTap={{ scale: 0.95 }}
                    className="p-3 rounded-2xl bg-[rgb(var(--muted))] text-[rgb(var(--muted-foreground))] hover:text-[rgb(var(--success))] hover:bg-gradient-soft transition-all duration-300"
                    title="Add file"
                  >
                    <Paperclip className="w-5 h-5" />
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05, y: -1 }}
                    whileTap={{ scale: 0.95 }}
                    className="p-3 rounded-2xl bg-[rgb(var(--muted))] text-[rgb(var(--muted-foreground))] hover:text-[rgb(var(--warning))] hover:bg-gradient-soft transition-all duration-300"
                    title="Add emoji"
                  >
                    <Smile className="w-5 h-5" />
                  </motion.button>
                </div>

                <div className="flex items-center gap-3">
                  <Button
                    variant="ghost"
                    onClick={() => {
                      setContent('');
                      setImage(undefined);
                      setIsExpanded(false);
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="gradient"
                    onClick={handleSubmit}
                    disabled={!content.trim()}
                    glow
                  >
                    <Send className="w-4 h-4" />
                    Post
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </Card>
  );
};
