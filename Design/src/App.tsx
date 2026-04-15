import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
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
import { mockGroups, mockNotifications } from './lib/mockData';

type View = 'feed' | 'groups' | 'messages' | 'resources' | 'profile' | 'notifications';
type AuthView = 'login' | 'register' | null;

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authView, setAuthView] = useState<AuthView>('login');
  const [currentView, setCurrentView] = useState<View>('feed');
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [currentUserId] = useState('1');

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const handleLogin = (email: string, password: string) => {
    setIsAuthenticated(true);
    setAuthView(null);
  };

  const handleRegister = (data: any) => {
    setIsAuthenticated(true);
    setAuthView(null);
  };

  const handleNavigate = (view: View) => {
    setCurrentView(view);
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

  const unreadNotifications = mockNotifications.filter(n => !n.read).length;
  const unreadMessages = 3;

  if (!isAuthenticated) {
    return (
      <>
        {authView === 'login' && (
          <LoginPage
            onLogin={handleLogin}
            onSwitchToRegister={() => setAuthView('register')}
          />
        )}
        {authView === 'register' && (
          <RegisterPage
            onRegister={handleRegister}
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
              <CampusFeed currentUserId={currentUserId} />
            )}

            {currentView === 'groups' && !selectedGroupId && (
              <GroupsDirectory
                currentUserId={currentUserId}
                onSelectGroup={handleSelectGroup}
              />
            )}

            {currentView === 'groups' && selectedGroupId && (
              <GroupPage
                group={mockGroups.find(g => g.id === selectedGroupId)!}
                currentUserId={currentUserId}
                onBack={handleBackFromGroup}
              />
            )}

            {currentView === 'messages' && (
              <MessagingView currentUserId={currentUserId} />
            )}

            {currentView === 'resources' && (
              <ResourceHub currentUserId={currentUserId} />
            )}

            {currentView === 'profile' && (
              <UserProfile
                userId={currentUserId}
                currentUserId={currentUserId}
                isOwnProfile={true}
              />
            )}

            {currentView === 'notifications' && (
              <NotificationsPanel currentUserId={currentUserId} />
            )}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}
