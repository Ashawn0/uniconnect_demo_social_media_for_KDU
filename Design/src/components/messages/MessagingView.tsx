import { useState } from 'react';
import { Search, Send, Phone, Video, MoreVertical, Paperclip, Smile, Circle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Card } from '../ui/Card';
import { Avatar } from '../ui/Avatar';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { mockUsers } from '../../lib/mockData';

interface Message {
  id: string;
  senderId: string;
  content: string;
  timestamp: Date;
  read: boolean;
}

interface Conversation {
  id: string;
  userId: string;
  lastMessage: string;
  timestamp: Date;
  unread: number;
  online: boolean;
}

export const MessagingView = ({ currentUserId }: { currentUserId: string }) => {
  const [selectedConversation, setSelectedConversation] = useState<string | null>('2');
  const [messageText, setMessageText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const mockConversations: Conversation[] = [
    { id: '2', userId: '2', lastMessage: 'See you at office hours tomorrow!', timestamp: new Date('2025-12-05T10:30:00'), unread: 2, online: true },
    { id: '3', userId: '3', lastMessage: 'Thanks for the study group info', timestamp: new Date('2025-12-04T15:00:00'), unread: 0, online: true },
    { id: '4', userId: '4', lastMessage: 'The robotics demo was amazing!', timestamp: new Date('2025-12-03T12:00:00'), unread: 0, online: false },
    { id: '5', userId: '5', lastMessage: 'Great presentation today', timestamp: new Date('2025-12-02T09:00:00'), unread: 1, online: false },
  ];

  const mockMessages: Message[] = [
    { id: '1', senderId: '2', content: 'Hi! Do you have the notes from yesterday\'s lecture?', timestamp: new Date('2025-12-05T09:00:00'), read: true },
    { id: '2', senderId: currentUserId, content: 'Yes! I can send them over. Give me a minute.', timestamp: new Date('2025-12-05T09:02:00'), read: true },
    { id: '3', senderId: '2', content: 'Perfect, thank you so much!', timestamp: new Date('2025-12-05T09:03:00'), read: true },
    { id: '4', senderId: currentUserId, content: 'No problem! Also, are you coming to office hours tomorrow?', timestamp: new Date('2025-12-05T09:05:00'), read: true },
    { id: '5', senderId: '2', content: 'See you at office hours tomorrow!', timestamp: new Date('2025-12-05T10:30:00'), read: false },
  ];

  const selectedUser = mockUsers.find(u => u.id === selectedConversation);
  
  const handleSendMessage = () => {
    if (messageText.trim()) {
      setMessageText('');
    }
  };

  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    
    if (hours < 1) return 'Just now';
    if (hours < 24) return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
    if (hours < 48) return 'Yesterday';
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-160px)]">
      {/* Conversations List */}
      <Card className="lg:col-span-1 p-6 flex flex-col h-full" glass>
        <div className="mb-6">
          <h3 className="text-[rgb(var(--foreground))] mb-4">Messages</h3>
          <Input
            type="text"
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            icon={<Search className="w-5 h-5" />}
          />
        </div>

        <div className="flex-1 overflow-y-auto space-y-2 -mx-2 px-2">
          {mockConversations.map((conv) => {
            const user = mockUsers.find(u => u.id === conv.userId);
            if (!user) return null;
            
            const isSelected = selectedConversation === conv.id;
            
            return (
              <motion.div
                key={conv.id}
                whileHover={{ x: 4 }}
                onClick={() => setSelectedConversation(conv.id)}
                className={`p-4 rounded-2xl cursor-pointer transition-all duration-300 ${
                  isSelected
                    ? 'bg-gradient-soft border border-[rgb(var(--primary)/0.2)] shadow-card'
                    : 'hover:bg-[rgb(var(--muted))]'
                }`}
              >
                <div className="flex gap-3">
                  <div className="relative">
                    <Avatar src={user.avatar} alt={user.name} size="md" gradient />
                    {conv.online && (
                      <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-[rgb(var(--success))] border-2 border-[rgb(var(--card))] rounded-full" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-1">
                      <h5 className="text-[rgb(var(--foreground))] truncate">{user.name}</h5>
                      <span className="text-xs text-[rgb(var(--muted-foreground))] whitespace-nowrap ml-2">
                        {formatTime(conv.timestamp)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-[rgb(var(--muted-foreground))] truncate">
                        {conv.lastMessage}
                      </p>
                      {conv.unread > 0 && (
                        <Badge variant="primary" size="sm" className="ml-2">
                          {conv.unread}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </Card>

      {/* Chat Window */}
      {selectedUser ? (
        <Card className="lg:col-span-2 flex flex-col h-full overflow-hidden" glass>
          {/* Chat Header */}
          <div className="p-6 border-b border-[rgb(var(--border))] flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="relative">
                <Avatar src={selectedUser.avatar} alt={selectedUser.name} size="lg" gradient ring />
                <div className="absolute bottom-0 right-0 w-4 h-4 bg-[rgb(var(--success))] border-2 border-[rgb(var(--card))] rounded-full" />
              </div>
              <div>
                <h4 className="text-[rgb(var(--foreground))]">{selectedUser.name}</h4>
                <p className="text-sm text-[rgb(var(--muted-foreground))]">
                  {selectedUser.department} · Active now
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="p-3 rounded-2xl bg-[rgb(var(--muted))] hover:bg-gradient-soft text-[rgb(var(--muted-foreground))] hover:text-[rgb(var(--primary))] transition-all"
              >
                <Phone className="w-5 h-5" />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="p-3 rounded-2xl bg-[rgb(var(--muted))] hover:bg-gradient-soft text-[rgb(var(--muted-foreground))] hover:text-[rgb(var(--primary))] transition-all"
              >
                <Video className="w-5 h-5" />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="p-3 rounded-2xl bg-[rgb(var(--muted))] hover:bg-gradient-soft text-[rgb(var(--muted-foreground))] hover:text-[rgb(var(--primary))] transition-all"
              >
                <MoreVertical className="w-5 h-5" />
              </motion.button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {mockMessages.map((message, index) => {
              const isOwn = message.senderId === currentUserId;
              const sender = mockUsers.find(u => u.id === message.senderId);
              
              return (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={`flex gap-3 ${isOwn ? 'flex-row-reverse' : ''}`}
                >
                  {!isOwn && (
                    <Avatar src={sender?.avatar} alt={sender?.name || ''} size="sm" gradient />
                  )}
                  <div className={`flex flex-col ${isOwn ? 'items-end' : 'items-start'} max-w-[70%]`}>
                    <div
                      className={`px-5 py-3.5 rounded-2xl ${
                        isOwn
                          ? 'bg-gradient-primary text-white shadow-card'
                          : 'bg-[rgb(var(--muted))] text-[rgb(var(--foreground))]'
                      }`}
                    >
                      <p className="text-sm leading-relaxed">{message.content}</p>
                    </div>
                    <span className="text-xs text-[rgb(var(--muted-foreground))] mt-1.5 px-1">
                      {formatTime(message.timestamp)}
                    </span>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Message Input */}
          <div className="p-6 border-t border-[rgb(var(--border))]">
            <div className="flex items-end gap-3">
              <div className="flex gap-2">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="p-3 rounded-2xl bg-[rgb(var(--muted))] hover:bg-gradient-soft text-[rgb(var(--muted-foreground))] hover:text-[rgb(var(--primary))] transition-all"
                >
                  <Paperclip className="w-5 h-5" />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="p-3 rounded-2xl bg-[rgb(var(--muted))] hover:bg-gradient-soft text-[rgb(var(--muted-foreground))] hover:text-[rgb(var(--primary))] transition-all"
                >
                  <Smile className="w-5 h-5" />
                </motion.button>
              </div>
              <input
                type="text"
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Type a message..."
                className="flex-1 px-5 py-3.5 bg-[rgb(var(--muted))] border border-[rgb(var(--border))] rounded-2xl text-[rgb(var(--foreground))] placeholder:text-[rgb(var(--muted-foreground))] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--primary)/0.5)] focus:border-[rgb(var(--primary))] transition-all duration-300"
              />
              <Button variant="gradient" onClick={handleSendMessage} glow>
                <Send className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </Card>
      ) : (
        <Card className="lg:col-span-2 flex items-center justify-center h-full" glass>
          <div className="text-center">
            <div className="w-20 h-20 bg-gradient-soft rounded-3xl flex items-center justify-center mx-auto mb-4">
              <MessageSquare className="w-10 h-10 text-[rgb(var(--primary))]" />
            </div>
            <h3 className="text-[rgb(var(--foreground))] mb-2">Select a conversation</h3>
            <p className="text-[rgb(var(--muted-foreground))]">
              Choose a conversation from the list to start messaging
            </p>
          </div>
        </Card>
      )}
    </div>
  );
};
