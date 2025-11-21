import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminApi } from "@/lib/api";
import { toast } from "sonner";
import type { ModerationAction, LibraryProvision } from "@/types";

// Query keys
export const adminKeys = {
  all: ['admin'] as const,
  dashboard: () => [...adminKeys.all, 'dashboard'] as const,
  moderation: () => [...adminKeys.all, 'moderation'] as const,
  moderationQueue: (filters?: { status?: string }) => [...adminKeys.moderation(), 'queue', filters] as const,
  moderationItem: (id: string) => [...adminKeys.moderation(), 'item', id] as const,
  libraries: (filters?: { customer_id?: string; search?: string }) => [...adminKeys.all, 'libraries', filters] as const,
  library: (id: string) => [...adminKeys.all, 'library', id] as const,
  tickets: (filters?: { status?: string; priority?: string; assigned_to?: string; issue_type?: string }) => [...adminKeys.all, 'tickets', filters] as const,
  ticket: (id: string) => [...adminKeys.all, 'ticket', id] as const,
  users: (filters?: { role?: string; search?: string; status?: string }) => [...adminKeys.all, 'users', filters] as const,
  user: (id: string) => [...adminKeys.all, 'user', id] as const,
  auditLogs: (filters?: { action_type?: string; admin_id?: string; target_type?: string; limit?: number; start_date?: string; end_date?: string }) => [...adminKeys.all, 'audit-logs', filters] as const,
};

// Dashboard stats
export function useAdminDashboardStats() {
  return useQuery({
    queryKey: adminKeys.dashboard(),
    queryFn: () => adminApi.getDashboardStats(),
    staleTime: 1000 * 60, // 1 minute
  });
}

// Moderation Queue
export function useModerationQueue(filters?: { status?: string; limit?: number }) {
  return useQuery({
    queryKey: adminKeys.moderationQueue(filters),
    queryFn: () => adminApi.getModerationQueue(filters),
  });
}

export function useModerationItem(id: string) {
  return useQuery({
    queryKey: adminKeys.moderationItem(id),
    queryFn: () => adminApi.getModerationItem(id),
    enabled: !!id,
  });
}

export function useModerateContent() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (action: ModerationAction) => adminApi.moderateContent(action),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: adminKeys.moderationQueue() });
      queryClient.invalidateQueries({ queryKey: adminKeys.moderationItem(data.id) });
      queryClient.invalidateQueries({ queryKey: adminKeys.dashboard() });
      toast.success(`Content ${data.status === 'approved' ? 'approved' : data.status === 'rejected' ? 'rejected' : 'sent for revision'}`);
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to moderate content');
    },
  });
}

export function useBatchModerate() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (actions: ModerationAction[]) => adminApi.batchModerate(actions),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.moderationQueue() });
      queryClient.invalidateQueries({ queryKey: adminKeys.dashboard() });
      toast.success('Batch moderation completed');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to batch moderate');
    },
  });
}

// Library Provisioning
export function useLibraries(filters?: { customer_id?: string; search?: string }) {
  return useQuery({
    queryKey: adminKeys.libraries(filters),
    queryFn: () => adminApi.getLibraries(filters),
  });
}

export function useLibrary(id: string) {
  return useQuery({
    queryKey: adminKeys.library(id),
    queryFn: () => adminApi.getLibrary(id),
    enabled: !!id,
  });
}

export function useCreateLibrary() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: Omit<LibraryProvision, 'id' | 'created_by' | 'created_at' | 'updated_at'>) => 
      adminApi.createLibrary(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.libraries() });
      toast.success('Library created successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to create library');
    },
  });
}

export function useUpdateLibrary() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Omit<LibraryProvision, 'id' | 'created_by' | 'created_at' | 'updated_at'>> }) =>
      adminApi.updateLibrary(id, data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: adminKeys.library(data.id) });
      queryClient.invalidateQueries({ queryKey: adminKeys.libraries() });
      toast.success('Library updated successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update library');
    },
  });
}

export function useDeleteLibrary() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => adminApi.deleteLibrary(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.libraries() });
      toast.success('Library deleted successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to delete library');
    },
  });
}

export function useAssignLibraryToGroups() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, userGroupIds }: { id: string; userGroupIds: string[] }) =>
      adminApi.assignLibraryToGroups(id, userGroupIds),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: adminKeys.library(data.id) });
      queryClient.invalidateQueries({ queryKey: adminKeys.libraries() });
      toast.success('Library assigned to groups successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to assign library');
    },
  });
}

// Support Tickets
export function useSupportTickets(filters?: { status?: string; priority?: string; assigned_to?: string; issue_type?: string }) {
  return useQuery({
    queryKey: adminKeys.tickets(filters),
    queryFn: () => adminApi.getSupportTickets(filters),
  });
}

export function useSupportTicket(id: string) {
  return useQuery({
    queryKey: adminKeys.ticket(id),
    queryFn: () => adminApi.getSupportTicket(id),
    enabled: !!id,
  });
}

export function useAssignTicket() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, adminId }: { id: string; adminId: string }) =>
      adminApi.assignTicket(id, adminId),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: adminKeys.ticket(data.id) });
      queryClient.invalidateQueries({ queryKey: adminKeys.tickets() });
      toast.success('Ticket assigned successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to assign ticket');
    },
  });
}

export function useUpdateTicketStatus() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, status, resolution }: { id: string; status: string; resolution?: string }) =>
      adminApi.updateTicketStatus(id, status, resolution),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: adminKeys.ticket(data.id) });
      queryClient.invalidateQueries({ queryKey: adminKeys.tickets() });
      toast.success('Ticket status updated');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update ticket status');
    },
  });
}

export function useResolveTicket() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, resolution }: { id: string; resolution: string }) =>
      adminApi.resolveTicket(id, resolution),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: adminKeys.ticket(data.id) });
      queryClient.invalidateQueries({ queryKey: adminKeys.tickets() });
      toast.success('Ticket resolved');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to resolve ticket');
    },
  });
}

// User Management (Admin)
export function useUsersAdmin(filters?: { role?: string; search?: string; status?: string }) {
  return useQuery({
    queryKey: adminKeys.users(filters),
    queryFn: () => adminApi.getUsersAdmin(filters),
  });
}

export function useUserAdmin(id: string) {
  return useQuery({
    queryKey: adminKeys.user(id),
    queryFn: () => adminApi.getUserAdmin(id),
    enabled: !!id,
  });
}

export function useUpdateUserAdmin() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: { role?: string; status?: string; full_name?: string } }) =>
      adminApi.updateUserAdmin(id, data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: adminKeys.user(data.id) });
      queryClient.invalidateQueries({ queryKey: adminKeys.users() });
      toast.success('User updated successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update user');
    },
  });
}

export function useDeactivateUser() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason?: string }) =>
      adminApi.deactivateUser(id, reason),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: adminKeys.user(data.id) });
      queryClient.invalidateQueries({ queryKey: adminKeys.users() });
      toast.success('User deactivated');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to deactivate user');
    },
  });
}

export function useActivateUser() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => adminApi.activateUser(id),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: adminKeys.user(data.id) });
      queryClient.invalidateQueries({ queryKey: adminKeys.users() });
      toast.success('User activated');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to activate user');
    },
  });
}

export function useResetUserPassword() {
  return useMutation({
    mutationFn: (id: string) => adminApi.resetUserPassword(id),
    onSuccess: (data) => {
      if (data.temp_password) {
        toast.success(`Password reset. Temporary password: ${data.temp_password}`);
      } else {
        toast.success('Password reset email sent');
      }
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to reset password');
    },
  });
}

export function useInviteUser() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: { email: string; full_name: string; role: string; company?: string }) =>
      adminApi.inviteUser(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.users() });
      toast.success('User invitation sent');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to invite user');
    },
  });
}

export function useBulkImportUsers() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (file: File) => adminApi.bulkImportUsers(file),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: adminKeys.users() });
      toast.success(`Imported ${data.imported} users. ${data.failed > 0 ? `${data.failed} failed.` : ''}`);
      if (data.errors && data.errors.length > 0) {
        console.error('Import errors:', data.errors);
      }
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to import users');
    },
  });
}

// Audit Logs
export function useAuditLogs(filters?: { action_type?: string; admin_id?: string; target_type?: string; limit?: number; start_date?: string; end_date?: string }) {
  return useQuery({
    queryKey: adminKeys.auditLogs(filters),
    queryFn: () => adminApi.getAuditLogs(filters),
  });
}

export function useExportAuditLogs() {
  return useMutation({
    mutationFn: (filters?: { action_type?: string; admin_id?: string; target_type?: string; start_date?: string; end_date?: string; format?: 'csv' | 'pdf' }) =>
      adminApi.exportAuditLogs(filters),
    onSuccess: () => {
      toast.success('Audit logs exported successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to export audit logs');
    },
  });
}
