import { Link, useLocation } from "wouter";
import { Home, Users, FileText, User, Bell, Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/components/ThemeProvider";
import { useQuery } from "@tanstack/react-query";

export default function Navbar() {
  const [location] = useLocation();
  const { theme, toggleTheme } = useTheme();

  const { data: unreadCount } = useQuery<{ count: number }>({
    queryKey: ["/api/notifications/unread-count"],
  });

  return (
    <nav className="sticky top-0 z-50 bg-kdublue backdrop-blur-md border-b border-border shadow-sm">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
        <Link href="/" data-testid="link-home">
          <div className="flex items-center gap-2 cursor-pointer hover-elevate active-elevate-2 rounded-lg px-3 py-1.5 transition-all">
            <div className="w-8 h-8 rounded-full bg-kdugold flex items-center justify-center font-bold text-kdublue text-sm">
              KDU
            </div>
            <span className="text-xl font-bold text-white hidden sm:inline">
              Kyungdong UniConnect
            </span>
          </div>
        </Link>
        
        <div className="flex items-center gap-2">
          <Link href="/" data-testid="link-feed">
            <Button 
              variant={location === "/" ? "secondary" : "ghost"}
              size="sm"
              className="gap-2 text-white"
            >
              <Home className="w-4 h-4" />
              <span className="hidden md:inline">Home</span>
            </Button>
          </Link>

          <Link href="/groups" data-testid="link-groups">
            <Button 
              variant={location === "/groups" ? "secondary" : "ghost"}
              size="sm"
              className="gap-2 text-white"
            >
              <Users className="w-4 h-4" />
              <span className="hidden md:inline">Groups</span>
            </Button>
          </Link>

          <Link href="/resources" data-testid="link-resources">
            <Button 
              variant={location === "/resources" ? "secondary" : "ghost"}
              size="sm"
              className="gap-2 text-white"
            >
              <FileText className="w-4 h-4" />
              <span className="hidden md:inline">Resources</span>
            </Button>
          </Link>
          
          <Link href="/profile" data-testid="link-profile">
            <Button 
              variant={location === "/profile" ? "secondary" : "ghost"}
              size="sm"
              className="gap-2 text-white"
            >
              <User className="w-4 h-4" />
              <span className="hidden md:inline">Profile</span>
            </Button>
          </Link>

          <div className="h-6 w-px bg-white/20" />

          <Button
            variant="ghost"
            size="icon"
            className="relative text-white"
            data-testid="button-notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadCount && unreadCount.count > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-kdugold text-kdublue text-xs font-bold flex items-center justify-center">
                {unreadCount.count > 9 ? '9+' : unreadCount.count}
              </span>
            )}
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className="text-white"
            data-testid="button-theme-toggle"
          >
            {theme === "dark" ? (
              <Sun className="w-4 h-4" />
            ) : (
              <Moon className="w-4 h-4" />
            )}
          </Button>
        </div>
      </div>
    </nav>
  );
}
