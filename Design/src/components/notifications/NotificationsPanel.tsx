import { useState } from 'react';
import { Heart, MessageCircle, UserPlus, Users, FileText, Check, Trash2, CheckCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Avatar } from '../ui/Avatar';
import { Badge } from '../ui/Badge';
import { Notification, mockNotifications, mockUsers } from '../../lib/mockData';

interface NotificationsPanelProps {
  currentUserId: string;
}

export const NotificationsPanel = ({ currentUserId }: NotificationsPanelProps) => {
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'like':
        return Heart;
      case 'comment':
        return MessageCircle;
      case 'follow':
        return UserPlus;
      case 'group':
        return Users;
      case 'resource':
        return FileText;
      default:
        return Heart;
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'like':
        return 'destructive';
      case 'comment':
        return 'primary';
      case 'group':
        return 'accent';
      case 'follow':
        return 'success';
      default:
        return 'primary';
    }
  };

  const markAsRead = (id: string) => {
    setNotifications(notifications.map(n =>
      n.id === id ? { ...n, read: true } : n
    ));
  };

  const markAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
  };

  const deleteNotification = (id: string) => {
    setNotifications(notifications.filter(n => n.id !== id));
  };

  const formatTimestamp = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  const filteredNotifications = filter === 'unread'
    ? notifications.filter(n => !n.read)
    : notifications;

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-center justify-between">
        <div>
          <h2 className="text-[rgb(var(--foreground))] mb-3">Notifications</h2>
          <p className="text-[rgb(var(--muted-foreground))] text-lg">
            {unreadCount > 0 
              ? `${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}` 
              : 'All caught up! 🎉'}
          </p>
        </div>
        {unreadCount > 0 && (
          <Button variant="outline" onClick={markAllAsRead}>
            <CheckCheck className="w-5 h-5" />
            Mark all as read
          </Button>
        )}
      </div>

      {/* Filters */}
      <div className="flex gap-3">
        {(['all', 'unread'] as const).map((f) => (
          <motion.button
            key={f}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => setFilter(f)}
            className={`px-6 py-3 rounded-2xl font-medium transition-all duration-300 ${
              filter === f
                ? 'bg-gradient-primary text-white shadow-card'
                : 'bg-[rgb(var(--muted))] text-[rgb(var(--muted-foreground))] hover:bg-[rgb(var(--card-hover))]'
            }`}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
            {f === 'unread' && unreadCount > 0 && (
              <Badge variant="danger" className="ml-2">
                {unreadCount}
              </Badge>
            )}
          </motion.button>
        ))}
      </div>

      {/* Notifications List */}
      <div className="space-y-4">
        <AnimatePresence mode="popLayout">
          {filteredNotifications.map((notification, index) => {
            const Icon = getNotificationIcon(notification.type);
            const color = getNotificationColor(notification.type);
            const user = mockUsers.find(u => u.id === notification.userId);
            
            return (
              <motion.div
                key={notification.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -100 }}
                transition={{ delay: index * 0.05, duration: 0.3 }}
                layout
              >
                <Card
                  hoverable
                  className={`p-6 cursor-pointer transition-all ${
                    !notification.read ? 'border-l-4 border-l-[rgb(var(--primary))] bg-gradient-soft' : ''
                  }`}
                  onClick={() => !notification.read && markAsRead(notification.id)}
                  glass={!notification.read}
                >
                  <div className="flex gap-4">
                    <div className="relative flex-shrink-0">
                      {user && (
                        <Avatar src={user.avatar} alt={user.name} size="lg" gradient />
                      )}
                      <div className={`absolute -bottom-1 -right-1 w-8 h-8 rounded-full flex items-center justify-center bg-[rgb(var(--${color}))] shadow-card`}>
                        <Icon className="w-4 h-4 text-white" />
                      </div>
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="text-[rgb(var(--foreground))] mb-2 leading-relaxed">
                        {notification.message}
                      </p>
                      <div className="flex items-center gap-3">
                        <p className="text-sm text-[rgb(var(--muted-foreground))]">
                          {formatTimestamp(notification.timestamp)}
                        </p>
                        {!notification.read && (
                          <Badge variant="primary" size="sm">New</Badge>
                        )}
                      </div>
                    </div>

                    <div className="flex items-start gap-2">
                      {!notification.read && (
                        <div className="w-3 h-3 bg-[rgb(var(--primary))] rounded-full mt-2 shadow-soft" />
                      )}
                      <motion.button
                        whileHover={{ scale: 1.1, rotate: 90 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteNotification(notification.id);
                        }}
                        className="p-2.5 hover:bg-[rgb(var(--muted))] rounded-xl transition-colors"
                      >
                        <Trash2 className="w-4 h-4 text-[rgb(var(--muted-foreground))] hover:text-[rgb(var(--destructive))]" />
                      </motion.button>
                    </div>
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {filteredNotifications.length === 0 && (
          <Card className="p-16 text-center" glass>
            <div className="w-24 h-24 bg-gradient-soft rounded-3xl flex items-center justify-center mx-auto mb-6">
              <Check className="w-12 h-12 text-[rgb(var(--success))]" />
            </div>
            <h3 className="text-[rgb(var(--foreground))] mb-3">
              {filter === 'unread' ? 'No unread notifications' : 'No notifications'}
            </h3>
            <p className="text-[rgb(var(--muted-foreground))] text-lg">
              {filter === 'unread' ? 'You\'re all caught up! 🎉' : 'Check back later for updates'}
            </p>
          </Card>
        )}
      </div>
    </div>
  );
};
