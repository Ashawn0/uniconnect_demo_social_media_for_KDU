import { useState, useEffect, useRef } from 'react';
import { Send, Search, MoreVertical, Phone, Video, Info, User, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Avatar } from '../ui/avatar';
import { Badge } from '../ui/badge';
import { ScrollArea } from '../ui/scroll-area';
import { useConversations, useMessages, useWebSocket } from '../../hooks/use-messages';
import { useAuth } from '../../hooks/use-auth';

interface MessagingPanelProps {
    currentUserId: string;
}

export const MessagingPanel = ({ currentUserId }: MessagingPanelProps) => {
    const [selectedUser, setSelectedUser] = useState<any | null>(null);
    const [messageInput, setMessageInput] = useState('');
    const scrollRef = useRef<HTMLDivElement>(null);

    const { data: conversations, isLoading: isConversationsLoading } = useConversations();
    const { data: messages, isLoading: isMessagesLoading } = useMessages(selectedUser?.id || '');
    const { sendMessage } = useWebSocket();
    const { user } = useAuth(); // Logged in user

    // Auto-scroll to bottom
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, selectedUser]);

    const handleSendMessage = (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!messageInput.trim() || !selectedUser) return;

        sendMessage(selectedUser.id, messageInput);

        // Optimistic update for UI feel (wait for sever to confirm usually, but this is fine for now)
        // The WS hook handles the update on 'message_sent' or 'new_message' usually, 
        // but we need to verify if backend sends it back to us.
        // Backend implementation: sends 'message_sent' to sender and 'new_message' to receiver.
        // Our hook listens for 'new_message'. It should also listen for 'message_sent' for self?
        // Start simple.

        setMessageInput('');
    };

    const filteredConversations = conversations || [];

    return (
        <Card className="h-[calc(100vh-120px)] flex overflow-hidden border-[rgb(var(--border))]" glass>
            {/* Sidebar - Conversations List */}
            <div className={`w-full md:w-80 lg:w-96 border-r border-[rgb(var(--border))] flex flex-col bg-[rgb(var(--card)/0.5)] ${selectedUser ? 'hidden md:flex' : 'flex'}`}>
                <div className="p-4 border-b border-[rgb(var(--border))]">
                    <h3 className="font-semibold text-lg mb-4">Messages</h3>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[rgb(var(--muted-foreground))]" />
                        <Input
                            placeholder="Search chats..."
                            className="pl-9 bg-[rgb(var(--muted)/0.5)] border-none"
                        />
                    </div>
                </div>

                <ScrollArea className="flex-1">
                    <div className="p-2 space-y-2">
                        {isConversationsLoading ? (
                            <div className="flex justify-center p-4"><Loader2 className="animate-spin" /></div>
                        ) : filteredConversations.length === 0 ? (
                            <div className="text-center p-4 text-[rgb(var(--muted-foreground))]">No conversations yet</div>
                        ) : (
                            filteredConversations.map((conv: any) => (
                                <motion.button
                                    key={conv.user.id}
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => setSelectedUser(conv.user)}
                                    className={`w-full p-3 rounded-xl flex items-center gap-3 transition-colors ${selectedUser?.id === conv.user.id
                                            ? 'bg-[rgb(var(--primary)/0.1)]'
                                            : 'hover:bg-[rgb(var(--muted)/0.5)]'
                                        }`}
                                >
                                    <div className="relative">
                                        <Avatar src={conv.user.profileImageUrl || undefined} alt={conv.user.firstName} size="md" gradient />
                                        {/* {conv.user.online && (
                        <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-[rgb(var(--success))] rounded-full border-2 border-[rgb(var(--card))]" />
                    )} */}
                                    </div>
                                    <div className="flex-1 text-left min-w-0">
                                        <div className="flex justify-between items-baseline">
                                            <span className="font-medium truncate">{conv.user.firstName} {conv.user.lastName}</span>
                                            <span className="text-xs text-[rgb(var(--muted-foreground))]">
                                                {new Date(conv.lastMessage.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        </div>
                                        <p className="text-sm text-[rgb(var(--muted-foreground))] truncate">
                                            {conv.lastMessage.senderId === currentUserId ? 'You: ' : ''}{conv.lastMessage.content}
                                        </p>
                                    </div>
                                    {conv.unreadCount > 0 && (
                                        <Badge variant="primary" size="sm" className="rounded-full w-5 h-5 flex items-center justify-center p-0">
                                            {conv.unreadCount}
                                        </Badge>
                                    )}
                                </motion.button>
                            ))
                        )}
                    </div>
                </ScrollArea>
            </div>

            {/* Main Chat Area */}
            <div className={`flex-1 flex flex-col bg-[rgb(var(--card)/0.3)] ${!selectedUser ? 'hidden md:flex' : 'flex'}`}>
                {selectedUser ? (
                    <>
                        {/* Chat Header */}
                        <div className="p-4 border-b border-[rgb(var(--border))] flex items-center justify-between bg-[rgb(var(--card)/0.8)] backdrop-blur-md">
                            <div className="flex items-center gap-3">
                                <Button variant="ghost" size="sm" className="md:hidden" onClick={() => setSelectedUser(null)}>
                                    Back
                                </Button>
                                <div className="relative">
                                    <Avatar src={selectedUser.profileImageUrl || undefined} alt={selectedUser.firstName} size="md" gradient />
                                    {/* {selectedUser.online && (
                    <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-[rgb(var(--success))] rounded-full border-2 border-[rgb(var(--card))]" />
                  )} */}
                                </div>
                                <div>
                                    <h4 className="font-medium">{selectedUser.firstName} {selectedUser.lastName}</h4>
                                    <p className="text-xs text-[rgb(var(--muted-foreground))]">{selectedUser.department}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-1">
                                <Button variant="ghost" size="icon">
                                    <Phone className="w-5 h-5 text-[rgb(var(--muted-foreground))]" />
                                </Button>
                                <Button variant="ghost" size="icon">
                                    <Video className="w-5 h-5 text-[rgb(var(--muted-foreground))]" />
                                </Button>
                                <Button variant="ghost" size="icon">
                                    <Info className="w-5 h-5 text-[rgb(var(--muted-foreground))]" />
                                </Button>
                            </div>
                        </div>

                        {/* Messages Area */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-4" ref={scrollRef}>
                            {!messages ? (
                                <div className="flex justify-center pt-10"><Loader2 className="animate-spin" /></div>
                            ) : (
                                messages.map((msg, index) => {
                                    const isMe = msg.senderId === currentUserId;
                                    const showAvatar = !isMe && (index === 0 || messages[index - 1].senderId !== msg.senderId);

                                    return (
                                        <motion.div
                                            key={msg.id || index}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className={`flex gap-3 ${isMe ? 'justify-end' : 'justify-start'}`}
                                        >
                                            {!isMe && (
                                                <div className="w-8 flex-shrink-0">
                                                    {showAvatar && <Avatar src={selectedUser.profileImageUrl || undefined} size="sm" gradient />}
                                                </div>
                                            )}
                                            <div className={`max-w-[70%] rounded-2xl p-3 px-4 ${isMe
                                                    ? 'bg-gradient-primary text-white rounded-tr-sm'
                                                    : 'bg-[rgb(var(--muted))] text-[rgb(var(--foreground))] rounded-tl-sm'
                                                }`}>
                                                <p className="leading-relaxed">{msg.content}</p>
                                                <span className={`text-[10px] block text-right mt-1 opacity-70`}>
                                                    {new Date(msg.createdAt || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                            </div>
                                        </motion.div>
                                    );
                                })
                            )}
                        </div>

                        {/* Input Area */}
                        <div className="p-4 border-t border-[rgb(var(--border))] bg-[rgb(var(--card)/0.8)] backdrop-blur-md">
                            <form onSubmit={handleSendMessage} className="flex gap-3">
                                <Input
                                    value={messageInput}
                                    onChange={(e) => setMessageInput(e.target.value)}
                                    placeholder="Type a message..."
                                    className="flex-1 bg-[rgb(var(--muted)/0.5)] border-none"
                                />
                                <Button type="submit" variant="gradient" glow disabled={!messageInput.trim()}>
                                    <Send className="w-5 h-5" />
                                </Button>
                            </form>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-[rgb(var(--muted-foreground))]">
                        <div className="w-20 h-20 bg-[rgb(var(--muted)/0.5)] rounded-full flex items-center justify-center mb-4">
                            <User className="w-10 h-10" />
                        </div>
                        <h3 className="font-medium text-lg mb-2">Select a conversation</h3>
                        <p>Choose a user from the sidebar to start chatting</p>
                    </div>
                )}
            </div>
        </Card>
    );
};
