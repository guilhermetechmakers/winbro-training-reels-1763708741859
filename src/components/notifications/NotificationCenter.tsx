import { Link, useNavigate } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import { 
  Bell, 
  Check, 
  CheckCheck, 
  Trash2, 
  Archive, 
  Settings,
  BookOpen,
  FileVideo,
  AlertCircle,
  GraduationCap,
  Award
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import {
  useNotifications,
  useNotificationCount,
  useMarkNotificationAsRead,
  useMarkAllAsRead,
  useDeleteNotification,
  useArchiveNotification,
} from "@/hooks/use-notifications";
import type { Notification } from "@/types";

// Icon mapping for notification types
const getNotificationIcon = (type: Notification['type']) => {
  switch (type) {
    case 'course_invite':
      return <BookOpen className="h-4 w-4" />;
    case 'content_update':
      return <FileVideo className="h-4 w-4" />;
    case 'admin_alert':
      return <AlertCircle className="h-4 w-4" />;
    case 'course_completed':
      return <GraduationCap className="h-4 w-4" />;
    case 'quiz_result':
      return <Award className="h-4 w-4" />;
    default:
      return <Bell className="h-4 w-4" />;
  }
};

// Notification item component
function NotificationItem({ notification }: { notification: Notification }) {
  const navigate = useNavigate();
  const markAsRead = useMarkNotificationAsRead();
  const deleteNotification = useDeleteNotification();
  const archiveNotification = useArchiveNotification();

  const handleClick = () => {
    if (notification.status === 'unread') {
      markAsRead.mutate(notification.id);
    }
    
    // Navigate to action URL if available
    if (notification.action_url) {
      navigate(notification.action_url);
    } else {
      // Default navigation based on notification type
      if (notification.metadata?.course_id) {
        navigate(`/courses/${notification.metadata.course_id}`);
      } else if (notification.metadata?.reel_id) {
        navigate(`/reel/${notification.metadata.reel_id}`);
      }
    }
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    deleteNotification.mutate(notification.id);
  };

  const handleArchive = (e: React.MouseEvent) => {
    e.stopPropagation();
    archiveNotification.mutate(notification.id);
  };

  return (
    <div
      className={cn(
        "group relative flex items-start gap-3 p-3 rounded-lg transition-colors cursor-pointer",
        notification.status === 'unread' 
          ? "bg-primary/5 hover:bg-primary/10" 
          : "hover:bg-muted/50"
      )}
      onClick={handleClick}
    >
      <div className={cn(
        "mt-0.5 flex-shrink-0",
        notification.status === 'unread' ? "text-primary" : "text-muted-foreground"
      )}>
        {getNotificationIcon(notification.type)}
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <p className={cn(
            "text-sm font-medium",
            notification.status === 'unread' ? "text-foreground" : "text-muted-foreground"
          )}>
            {notification.title}
          </p>
          {notification.status === 'unread' && (
            <div className="h-2 w-2 rounded-full bg-primary flex-shrink-0 mt-1.5" />
          )}
        </div>
        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
          {notification.message}
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
        </p>
      </div>

      {/* Action buttons - shown on hover */}
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        {notification.status === 'unread' && (
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={(e) => {
              e.stopPropagation();
              markAsRead.mutate(notification.id);
            }}
            title="Mark as read"
          >
            <Check className="h-3.5 w-3.5" />
          </Button>
        )}
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7"
          onClick={handleArchive}
          title="Archive"
        >
          <Archive className="h-3.5 w-3.5" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 text-destructive hover:text-destructive"
          onClick={handleDelete}
          title="Delete"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  );
}

export function NotificationCenter() {
  const { data: count } = useNotificationCount();
  const { data: notifications, isLoading: notificationsLoading } = useNotifications({ 
    limit: 10 
  });
  const markAllAsRead = useMarkAllAsRead();

  const unreadCount = count?.unread || 0;
  const hasUnread = unreadCount > 0;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {hasUnread && (
            <span className="absolute top-1 right-1 h-2 w-2 bg-primary rounded-full animate-pulse" />
          )}
          {unreadCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[400px] p-0">
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            <DropdownMenuLabel className="p-0">Notifications</DropdownMenuLabel>
            {hasUnread && (
              <Badge variant="destructive" className="ml-2">
                {unreadCount} new
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-1">
            {hasUnread && (
              <Button
                variant="ghost"
                size="sm"
                className="h-8 text-xs"
                onClick={() => markAllAsRead.mutate()}
                disabled={markAllAsRead.isPending}
              >
                <CheckCheck className="h-3.5 w-3.5 mr-1" />
                Mark all read
              </Button>
            )}
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              asChild
            >
              <Link to="/settings/notifications">
                <Settings className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>

        <ScrollArea className="h-[400px]">
          <div className="p-2">
            {notificationsLoading ? (
              <div className="space-y-2">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-start gap-3 p-3">
                    <Skeleton className="h-4 w-4 rounded mt-0.5" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-3 w-full" />
                      <Skeleton className="h-3 w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            ) : notifications && notifications.length > 0 ? (
              <div className="space-y-1">
                {notifications.map((notification) => (
                  <NotificationItem key={notification.id} notification={notification} />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Bell className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-sm font-medium text-foreground mb-1">
                  No notifications
                </p>
                <p className="text-xs text-muted-foreground">
                  You're all caught up!
                </p>
              </div>
            )}
          </div>
        </ScrollArea>

        {notifications && notifications.length > 0 && (
          <>
            <DropdownMenuSeparator />
            <div className="p-2">
              <Button
                variant="ghost"
                className="w-full justify-center text-sm"
                asChild
              >
                <Link to="/settings/notifications">
                  View all notifications
                </Link>
              </Button>
            </div>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
