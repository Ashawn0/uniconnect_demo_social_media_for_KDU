import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from './hooks/use-auth';
import { LoginPage } from './components/auth/LoginPage';
import { RegisterPage } from './components/auth/RegisterPage';
import { Navigation } from './components/layout/Navigation';
import { CampusFeed } from './components/feed/CampusFeed';
import { GroupsDirectory } from './components/groups/GroupsDirectory';
import { GroupPage } from './components/groups/GroupPage';
import { ResourceHub } from './components/resources/ResourceHub';
import { UserProfile } from './components/profile/UserProfile';
import { NotificationsPanel } from './components/notifications/NotificationsPanel';
import { MessagingView } from './components/messages/MessagingView';
import { MessagingPanel } from './components/messaging/MessagingPanel'; // NEW IMPORT
import { mockGroups, mockNotifications } from './lib/mockData';
import { Loader2 } from 'lucide-react';

type View = 'feed' | 'groups' | 'messages' | 'resources' | 'profile' | 'notifications';
type AuthView = 'login' | 'register' | null;

export default function App() {
  const { user, isLoading, login, register, logout } = useAuth();
  const [authView, setAuthView] = useState<AuthView>('login');
  const [currentView, setCurrentView] = useState<View>('feed');
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const handleNavigate = (view: string) => {
    setCurrentView(view as View);
    setSelectedGroupId(null);
  };

  const handleSelectGroup = (groupId: string) => {
    setSelectedGroupId(groupId);
  };

  const handleBackFromGroup = () => {
    setSelectedGroupId(null);
  };

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  const unreadNotifications = mockNotifications.filter(n => !n.read).length; // TODO: Replace with real data
  const unreadMessages = 3; // TODO: Replace with real data

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return (
      <>
        {authView === 'login' && (
          <LoginPage
            onSwitchToRegister={() => setAuthView('register')}
          />
        )}
        {authView === 'register' && (
          <RegisterPage
            onSwitchToLogin={() => setAuthView('login')}
          />
        )}
      </>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Decorative Background Gradient */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-gradient-primary opacity-5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-1/4 w-[500px] h-[500px] bg-[rgb(var(--accent))] opacity-5 rounded-full blur-3xl" />
      </div>

      <Navigation
        currentView={currentView}
        onNavigate={handleNavigate}
        theme={theme}
        onToggleTheme={toggleTheme}
        unreadCount={unreadNotifications}
        unreadMessages={unreadMessages}
      />

      <main className="relative z-10 max-w-[1400px] mx-auto px-6 sm:px-8 py-8 mt-20 md:mt-24 mb-24 md:mb-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={`${currentView}-${selectedGroupId}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
          >
            {currentView === 'feed' && (
              <CampusFeed currentUserId={user.id} />
            )}

            {currentView === 'groups' && !selectedGroupId && (
              <GroupsDirectory
                currentUserId={user.id}
                onSelectGroup={handleSelectGroup}
              />
            )}

            {currentView === 'groups' && selectedGroupId && (
              <GroupPage
                groupId={selectedGroupId}
                currentUserId={user.id}
                onBack={handleBackFromGroup}
              />
            )}

            {currentView === 'messages' && (
              <MessagingPanel currentUserId={user.id} />
            )}

            {currentView === 'resources' && (
              <ResourceHub currentUserId={user.id} />
            )}

            {currentView === 'profile' && (
              <UserProfile
                userId={user.id}
                currentUserId={user.id}
                isOwnProfile={true}
                onLogout={() => logout()}
              />
            )}

            {currentView === 'notifications' && (
              <NotificationsPanel currentUserId={user.id} />
            )}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}
