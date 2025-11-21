import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { performanceApi } from "@/lib/api";
import { toast } from "sonner";
import type { 
  AlertConfiguration
} from "@/types";

// Dashboard hooks
export function usePerformanceDashboard(filters?: { 
  date_range?: { start_date: string; end_date: string } 
}) {
  return useQuery({
    queryKey: ["performance", "dashboard", filters],
    queryFn: () => performanceApi.getDashboard(filters),
  });
}

// CDN Analytics hooks
export function useCDNAnalytics(filters?: { 
  date_range?: { start_date: string; end_date: string }; 
  region?: string 
}) {
  return useQuery({
    queryKey: ["performance", "cdn", "analytics", filters],
    queryFn: () => performanceApi.getCDNAnalytics(filters),
  });
}

// Cache Management hooks
export function useCacheRecords(filters?: { 
  endpoint?: string; 
  status?: 'active' | 'expired' | 'invalidated'; 
  limit?: number 
}) {
  return useQuery({
    queryKey: ["performance", "cache", "records", filters],
    queryFn: () => performanceApi.getCacheRecords(filters),
  });
}

export function useCacheRecord(id: string) {
  return useQuery({
    queryKey: ["performance", "cache", "record", id],
    queryFn: () => performanceApi.getCacheRecord(id),
    enabled: !!id,
  });
}

export function useInvalidateCache() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { cache_keys?: string[]; endpoint?: string; pattern?: string }) =>
      performanceApi.invalidateCache(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["performance", "cache"] });
      toast.success("Cache invalidated successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to invalidate cache");
    },
  });
}

export function useRefreshCache() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { cache_keys?: string[]; endpoint?: string }) =>
      performanceApi.refreshCache(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["performance", "cache"] });
      toast.success("Cache refreshed successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to refresh cache");
    },
  });
}

export function useClearCache() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data?: { endpoint?: string; pattern?: string }) =>
      performanceApi.clearCache(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["performance", "cache"] });
      toast.success("Cache cleared successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to clear cache");
    },
  });
}

// Background Jobs hooks
export function useBackgroundJobs(filters?: { 
  job_type?: string; 
  status?: string; 
  priority?: string; 
  limit?: number 
}) {
  return useQuery({
    queryKey: ["performance", "jobs", filters],
    queryFn: () => performanceApi.getBackgroundJobs(filters),
  });
}

export function useBackgroundJob(id: string) {
  return useQuery({
    queryKey: ["performance", "job", id],
    queryFn: () => performanceApi.getBackgroundJob(id),
    enabled: !!id,
    refetchInterval: (query) => {
      // Poll every 2 seconds if job is still processing
      const job = query.state.data;
      if (job && (job.status === 'pending' || job.status === 'queued' || job.status === 'processing')) {
        return 2000;
      }
      return false;
    },
  });
}

export function useRetryJob() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => performanceApi.retryJob(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ["performance", "jobs"] });
      queryClient.invalidateQueries({ queryKey: ["performance", "job", id] });
      toast.success("Job retry initiated");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to retry job");
    },
  });
}

export function useCancelJob() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => performanceApi.cancelJob(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["performance", "jobs"] });
      toast.success("Job cancelled successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to cancel job");
    },
  });
}

export function useReprocessJob() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => performanceApi.reprocessJob(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["performance", "jobs"] });
      toast.success("Job reprocessing initiated");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to reprocess job");
    },
  });
}

// Alerts hooks
export function useAlerts(filters?: { 
  status?: string; 
  severity?: string; 
  alert_type?: string; 
  limit?: number 
}) {
  return useQuery({
    queryKey: ["performance", "alerts", filters],
    queryFn: () => performanceApi.getAlerts(filters),
  });
}

export function useAlert(id: string) {
  return useQuery({
    queryKey: ["performance", "alert", id],
    queryFn: () => performanceApi.getAlert(id),
    enabled: !!id,
  });
}

export function useAcknowledgeAlert() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => performanceApi.acknowledgeAlert(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ["performance", "alerts"] });
      queryClient.invalidateQueries({ queryKey: ["performance", "alert", id] });
      queryClient.invalidateQueries({ queryKey: ["performance", "dashboard"] });
      toast.success("Alert acknowledged");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to acknowledge alert");
    },
  });
}

export function useResolveAlert() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, resolution_note }: { id: string; resolution_note?: string }) =>
      performanceApi.resolveAlert(id, { resolution_note }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["performance", "alerts"] });
      queryClient.invalidateQueries({ queryKey: ["performance", "alert", variables.id] });
      queryClient.invalidateQueries({ queryKey: ["performance", "dashboard"] });
      toast.success("Alert resolved");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to resolve alert");
    },
  });
}

export function useDismissAlert() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => performanceApi.dismissAlert(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["performance", "alerts"] });
      queryClient.invalidateQueries({ queryKey: ["performance", "dashboard"] });
      toast.success("Alert dismissed");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to dismiss alert");
    },
  });
}

// Alert Configuration hooks
export function useAlertConfigurations() {
  return useQuery({
    queryKey: ["performance", "alerts", "configurations"],
    queryFn: () => performanceApi.getAlertConfigurations(),
  });
}

export function useAlertConfiguration(id: string) {
  return useQuery({
    queryKey: ["performance", "alerts", "configuration", id],
    queryFn: () => performanceApi.getAlertConfiguration(id),
    enabled: !!id,
  });
}

export function useCreateAlertConfiguration() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Omit<AlertConfiguration, 'id' | 'created_at' | 'updated_at'>) =>
      performanceApi.createAlertConfiguration(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["performance", "alerts", "configurations"] });
      toast.success("Alert configuration created successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to create alert configuration");
    },
  });
}

export function useUpdateAlertConfiguration() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Omit<AlertConfiguration, 'id' | 'created_at' | 'updated_at'>> }) =>
      performanceApi.updateAlertConfiguration(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["performance", "alerts", "configurations"] });
      queryClient.invalidateQueries({ queryKey: ["performance", "alerts", "configuration", variables.id] });
      toast.success("Alert configuration updated successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update alert configuration");
    },
  });
}

export function useDeleteAlertConfiguration() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => performanceApi.deleteAlertConfiguration(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["performance", "alerts", "configurations"] });
      toast.success("Alert configuration deleted successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to delete alert configuration");
    },
  });
}

export function useToggleAlertConfiguration() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, enabled }: { id: string; enabled: boolean }) =>
      performanceApi.toggleAlertConfiguration(id, enabled),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["performance", "alerts", "configurations"] });
      queryClient.invalidateQueries({ queryKey: ["performance", "alerts", "configuration", variables.id] });
      toast.success(`Alert configuration ${variables.enabled ? 'enabled' : 'disabled'}`);
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to toggle alert configuration");
    },
  });
}
