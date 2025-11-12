import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Home, Users, FileText, User, Bell, Moon, Sun, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useTheme } from "@/components/ThemeProvider";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { formatDistanceToNow } from "date-fns";
import type { Notification } from "@shared/schema";

export default function Navbar() {
  const [location] = useLocation();
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();

  const { data: unreadCount } = useQuery<{ count: number }>({
    queryKey: ["/api/notifications/unread-count"],
  });

  const { data: notifications = [] } = useQuery<Notification[]>({
    queryKey: ["/api/notifications"],
    enabled: notificationsOpen,
  });

  const markAsReadMutation = useMutation({
    mutationFn: async (notificationId: string) => {
      return await apiRequest(`/api/notifications/${notificationId}/read`, {
        method: "POST",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/notifications"] });
      queryClient.invalidateQueries({ queryKey: ["/api/notifications/unread-count"] });
    },
  });

  const markAllAsReadMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest("/api/notifications/read-all", {
        method: "POST",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/notifications"] });
      queryClient.invalidateQueries({ queryKey: ["/api/notifications/unread-count"] });
    },
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

          <Popover open={notificationsOpen} onOpenChange={setNotificationsOpen}>
            <PopoverTrigger asChild>
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
            </PopoverTrigger>
            <PopoverContent className="w-96 p-0" align="end" data-testid="popover-notifications">
              <div className="flex items-center justify-between p-4 border-b border-border">
                <h3 className="font-semibold text-foreground">Notifications</h3>
                {notifications.length > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => markAllAsReadMutation.mutate()}
                    disabled={markAllAsReadMutation.isPending}
                    data-testid="button-mark-all-read"
                  >
                    Mark all read
                  </Button>
                )}
              </div>
              <ScrollArea className="h-[400px]">
                {notifications.length === 0 ? (
                  <div className="py-12 text-center">
                    <Bell className="w-12 h-12 mx-auto text-muted-foreground/50 mb-3" />
                    <p className="text-sm text-muted-foreground">No notifications yet</p>
                  </div>
                ) : (
                  <div className="divide-y divide-border">
                    {notifications.map((notification) => (
                      <div
                        key={notification.id}
                        className={`p-4 hover-elevate ${!notification.read ? 'bg-muted/30' : ''}`}
                        data-testid={`notification-${notification.id}`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1">
                            <p className="text-sm text-foreground mb-1">
                              {notification.content}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {notification.createdAt
                                ? formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })
                                : 'Just now'}
                            </p>
                          </div>
                          {!notification.read && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="shrink-0 h-6 w-6"
                              onClick={() => markAsReadMutation.mutate(notification.id)}
                              disabled={markAsReadMutation.isPending}
                              data-testid={`button-mark-read-${notification.id}`}
                            >
                              <X className="w-3 h-3" />
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </PopoverContent>
          </Popover>

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
