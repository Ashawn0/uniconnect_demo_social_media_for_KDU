import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Home, Users, FileText, User, Bell, Moon, Sun, X, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useTheme } from "@/components/ThemeProvider";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { formatDistanceToNow } from "date-fns";
import type { Notification } from "@shared/schema";
import { useAuth } from "@/hooks/use-auth";

export default function Navbar() {
  const [location] = useLocation();
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const { user, logout } = useAuth();

  const { data: unreadCount } = useQuery<{ count: number }>({
    queryKey: ["/api/notifications/unread-count"],
    enabled: !!user,
  });

  const { data: notifications = [] } = useQuery<Notification[]>({
    queryKey: ["/api/notifications"],
    enabled: notificationsOpen && !!user,
  });

  const markAsReadMutation = useMutation({
    mutationFn: async (notificationId: string) => {
      return await apiRequest(`/api/notifications/${notificationId}/read`, {
        method: "PATCH",
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
        method: "PATCH",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/notifications"] });
      queryClient.invalidateQueries({ queryKey: ["/api/notifications/unread-count"] });
    },
  });

  if (!user) return null;

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-kdu-navy text-white shadow-md">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3 lg:py-4">
        <Link href="/" data-testid="link-home" className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-kdu-gold text-base font-semibold text-kdu-navy shadow-sm">
            KDU
          </div>
          <div className="hidden flex-col sm:flex">
            <span className="text-sm font-semibold uppercase tracking-wide text-kdu-gold">
              Kyungdong University
            </span>
            <span className="text-lg font-bold leading-tight">UniConnect Portal</span>
            <span className="text-xs text-white/70">Academic Networking & Student Services</span>
          </div>
        </Link>

        <div className="flex flex-1 flex-wrap items-center gap-2 text-sm font-medium sm:justify-end">
          <Link href="/" data-testid="link-feed">
            <Button
              variant={location === "/" ? "secondary" : "ghost"}
              size="sm"
              className={`gap-2 ${location === "/" ? "bg-kdu-light-blue text-kdu-navy" : "text-white hover:bg-white/10"}`}
            >
              <Home className="w-4 h-4" />
              <span className="hidden md:inline">Home</span>
            </Button>
          </Link>

          <Link href="/groups" data-testid="link-groups">
            <Button
              variant={location === "/groups" ? "secondary" : "ghost"}
              size="sm"
              className={`gap-2 ${location === "/groups" ? "bg-kdu-light-blue text-kdu-navy" : "text-white hover:bg-white/10"}`}
            >
              <Users className="w-4 h-4" />
              <span className="hidden md:inline">Groups</span>
            </Button>
          </Link>

          <Link href="/resources" data-testid="link-resources">
            <Button
              variant={location === "/resources" ? "secondary" : "ghost"}
              size="sm"
              className={`gap-2 ${location === "/resources" ? "bg-kdu-light-blue text-kdu-navy" : "text-white hover:bg-white/10"}`}
            >
              <FileText className="w-4 h-4" />
              <span className="hidden md:inline">Resources</span>
            </Button>
          </Link>

          <Link href="/profile" data-testid="link-profile">
            <Button
              variant={location === "/profile" ? "secondary" : "ghost"}
              size="sm"
              className={`gap-2 ${location === "/profile" ? "bg-kdu-light-blue text-kdu-navy" : "text-white hover:bg-white/10"}`}
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
                className="relative text-white hover:bg-white/10"
                data-testid="button-notifications"
              >
                <Bell className="w-4 h-4" />
                {unreadCount && unreadCount.count > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-kdu-red text-[10px] font-semibold">
                    {unreadCount.count > 9 ? '9+' : unreadCount.count}
                  </span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-96 p-0" align="end" data-testid="popover-notifications">
              <div className="flex items-center justify-between border-b border-border bg-kdu-navy/5 px-4 py-3">
                <div>
                  <p className="text-sm font-semibold text-kdu-navy">Notifications</p>
                  <p className="text-xs text-muted-foreground">University-wide updates & activity</p>
                </div>
                {notifications.length > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => markAllAsReadMutation.mutate()}
                    disabled={markAllAsReadMutation.isPending}
                    className="text-kdu-blue hover:text-kdu-navy"
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
                        className={`p-4 transition hover:bg-kdu-gray-light/60 ${!notification.read ? 'bg-kdu-gold/15' : ''}`}
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

          <div className="hidden flex-col pr-3 text-right text-xs leading-tight sm:flex">
            <span className="text-white/70">Signed in as</span>
            <span className="font-semibold">{user.firstName || user.email}</span>
          </div>

          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className="text-white hover:bg-white/10"
            data-testid="button-theme-toggle"
          >
            {theme === "dark" ? (
              <Sun className="w-4 h-4" />
            ) : (
              <Moon className="w-4 h-4" />
            )}
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => logout()}
            className="text-white hover:bg-white/10"
            title="Logout"
          >
            <LogOut className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </header>
  );
}
