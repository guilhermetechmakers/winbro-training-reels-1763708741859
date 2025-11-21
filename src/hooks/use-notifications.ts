import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { notificationsApi } from "@/lib/api";
import type { NotificationPreferences } from "@/types";

// Query keys
export const notificationKeys = {
  all: ['notifications'] as const,
  lists: () => [...notificationKeys.all, 'list'] as const,
  list: (filters?: { status?: string; type?: string }) => [...notificationKeys.lists(), filters] as const,
  detail: (id: string) => [...notificationKeys.all, 'detail', id] as const,
  count: () => [...notificationKeys.all, 'count'] as const,
  preferences: () => [...notificationKeys.all, 'preferences'] as const,
  emailLogs: (filters?: { status?: string; email_type?: string }) => [...notificationKeys.all, 'email-logs', filters] as const,
};

// Get notifications
export function useNotifications(filters?: { status?: 'read' | 'unread'; type?: string; limit?: number }) {
  return useQuery({
    queryKey: notificationKeys.list(filters),
    queryFn: () => notificationsApi.getNotifications(filters),
    staleTime: 1000 * 30, // 30 seconds
    refetchInterval: 1000 * 60, // Refetch every minute
  });
}

// Get notification count
export function useNotificationCount() {
  return useQuery({
    queryKey: notificationKeys.count(),
    queryFn: () => notificationsApi.getNotificationCount(),
    staleTime: 1000 * 30, // 30 seconds
    refetchInterval: 1000 * 60, // Refetch every minute
  });
}

// Get single notification
export function useNotification(id: string) {
  return useQuery({
    queryKey: notificationKeys.detail(id),
    queryFn: () => notificationsApi.getNotification(id),
    enabled: !!id,
  });
}

// Mark notification as read
export function useMarkNotificationAsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => notificationsApi.markAsRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.all });
      toast.success("Notification marked as read");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to mark notification as read");
    },
  });
}

// Mark all notifications as read
export function useMarkAllAsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => notificationsApi.markAllAsRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.all });
      toast.success("All notifications marked as read");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to mark notifications as read");
    },
  });
}

// Delete notification
export function useDeleteNotification() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => notificationsApi.deleteNotification(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.all });
      toast.success("Notification deleted");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to delete notification");
    },
  });
}

// Archive notification
export function useArchiveNotification() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => notificationsApi.archiveNotification(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.all });
      toast.success("Notification archived");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to archive notification");
    },
  });
}

// Get notification preferences
export function useNotificationPreferences() {
  return useQuery({
    queryKey: notificationKeys.preferences(),
    queryFn: () => notificationsApi.getPreferences(),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

// Update notification preferences
export function useUpdateNotificationPreferences() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Partial<NotificationPreferences>) => notificationsApi.updatePreferences(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.preferences() });
      toast.success("Notification preferences updated");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update preferences");
    },
  });
}

// Get email logs
export function useEmailLogs(filters?: { status?: string; email_type?: string; limit?: number }) {
  return useQuery({
    queryKey: notificationKeys.emailLogs(filters),
    queryFn: () => notificationsApi.getEmailLogs(filters),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}
