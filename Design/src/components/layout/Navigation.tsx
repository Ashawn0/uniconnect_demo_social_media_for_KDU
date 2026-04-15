import { Home, Users, FolderOpen, User, Bell, MessageSquare, Moon, Sun, Sparkles } from 'lucide-react';
import { motion } from 'motion/react';
import { Badge } from '../ui/Badge';

interface NavigationProps {
  currentView: string;
  onNavigate: (view: string) => void;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
  unreadCount?: number;
  unreadMessages?: number;
}

export const Navigation = ({ 
  currentView, 
  onNavigate, 
  theme, 
  onToggleTheme, 
  unreadCount = 0,
  unreadMessages = 0 
}: NavigationProps) => {
  const navItems = [
    { id: 'feed', label: 'Feed', icon: Home },
    { id: 'groups', label: 'Groups', icon: Users },
    { id: 'messages', label: 'Messages', icon: MessageSquare, badge: unreadMessages },
    { id: 'resources', label: 'Resources', icon: FolderOpen },
    { id: 'notifications', label: 'Alerts', icon: Bell, badge: unreadCount },
    { id: 'profile', label: 'Profile', icon: User }
  ];

  return (
    <>
      {/* Desktop Navigation */}
      <nav className="hidden md:block fixed top-0 left-0 right-0 z-50 glass-strong border-b border-[rgb(var(--border)/0.5)]">
        <div className="max-w-7xl mx-auto px-8">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <motion.div 
              className="flex items-center gap-3 cursor-pointer"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="relative">
                <div className="w-11 h-11 bg-gradient-primary rounded-2xl flex items-center justify-center shadow-card glow-primary">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-[rgb(var(--success))] rounded-full border-2 border-[rgb(var(--card))]" />
              </div>
              <div>
                <h1 className="text-xl">UniConnect</h1>
                <p className="text-xs text-[rgb(var(--muted-foreground))]">Campus Hub</p>
              </div>
            </motion.div>

            {/* Nav Items */}
            <div className="flex items-center gap-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = currentView === item.id;
                
                return (
                  <motion.button
                    key={item.id}
                    whileHover={{ scale: 1.03, y: -1 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => onNavigate(item.id)}
                    className={`relative px-5 py-2.5 rounded-2xl transition-all duration-300 ${
                      isActive
                        ? 'bg-gradient-primary text-white shadow-card'
                        : 'text-[rgb(var(--muted-foreground))] hover:text-[rgb(var(--foreground))] hover:bg-[rgb(var(--muted))]'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className="w-5 h-5" />
                      <span className="text-sm font-medium">{item.label}</span>
                      {item.badge && item.badge > 0 && (
                        <Badge variant="danger" size="sm">
                          {item.badge}
                        </Badge>
                      )}
                    </div>
                    {isActive && (
                      <motion.div
                        layoutId="activeTab"
                        className="absolute inset-0 bg-gradient-primary rounded-2xl -z-10"
                        transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                      />
                    )}
                  </motion.button>
                );
              })}
            </div>

            {/* Theme Toggle */}
            <motion.button
              whileHover={{ scale: 1.05, rotate: 180 }}
              whileTap={{ scale: 0.95 }}
              onClick={onToggleTheme}
              className="p-3 rounded-2xl bg-[rgb(var(--muted))] text-[rgb(var(--foreground))] hover:bg-[rgb(var(--card-hover))] transition-all duration-300 shadow-soft"
              transition={{ duration: 0.3 }}
            >
              {theme === 'dark' ? (
                <Sun className="w-5 h-5" />
              ) : (
                <Moon className="w-5 h-5" />
              )}
            </motion.button>
          </div>
        </div>
      </nav>

      {/* Mobile Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 pb-safe">
        <div className="glass-strong border-t border-[rgb(var(--border)/0.5)] px-4 py-3">
          <div className="grid grid-cols-6 gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentView === item.id;
              
              return (
                <motion.button
                  key={item.id}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => onNavigate(item.id)}
                  className={`relative flex flex-col items-center gap-1.5 p-2.5 rounded-2xl transition-all duration-300 ${
                    isActive
                      ? 'text-[rgb(var(--primary))]'
                      : 'text-[rgb(var(--muted-foreground))]'
                  }`}
                >
                  <div className="relative">
                    <Icon className="w-6 h-6" />
                    {item.badge && item.badge > 0 && (
                      <div className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] bg-[rgb(var(--destructive))] rounded-full flex items-center justify-center text-white text-xs px-1">
                        {item.badge > 9 ? '9+' : item.badge}
                      </div>
                    )}
                  </div>
                  <span className="text-[10px] font-medium">{item.label}</span>
                  {isActive && (
                    <motion.div
                      layoutId="activeMobileTab"
                      className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-1 bg-gradient-primary rounded-full"
                      transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                    />
                  )}
                </motion.button>
              );
            })}
          </div>
        </div>
      </nav>
    </>
  );
};
