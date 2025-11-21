import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { analyticsApi } from "@/lib/api";
import { toast } from "sonner";
import type { 
  Report, 
  ReportFilters 
} from "@/types";

// Dashboard hooks
export function useAnalyticsDashboard(filters?: { 
  date_range?: { start_date: string; end_date: string }; 
  customer_id?: string 
}) {
  return useQuery({
    queryKey: ["analytics", "dashboard", filters],
    queryFn: () => analyticsApi.getDashboard(filters),
  });
}

// Metrics hooks
export function useMetrics(filters?: { 
  category?: string; 
  date_range?: { start_date: string; end_date: string } 
}) {
  return useQuery({
    queryKey: ["analytics", "metrics", filters],
    queryFn: () => analyticsApi.getMetrics(filters),
  });
}

export function useMetricDetail(
  metricId: string, 
  filters?: { date_range?: { start_date: string; end_date: string } }
) {
  return useQuery({
    queryKey: ["analytics", "metric", metricId, filters],
    queryFn: () => analyticsApi.getMetricDetail(metricId, filters),
    enabled: !!metricId,
  });
}

// Events hooks
export function useAnalyticsEvents(filters?: { 
  event_type?: string; 
  date_range?: { start_date: string; end_date: string }; 
  limit?: number 
}) {
  return useQuery({
    queryKey: ["analytics", "events", filters],
    queryFn: () => analyticsApi.getEvents(filters),
  });
}

// Reports hooks
export function useReports() {
  return useQuery({
    queryKey: ["analytics", "reports"],
    queryFn: () => analyticsApi.getReports(),
  });
}

export function useReport(id: string) {
  return useQuery({
    queryKey: ["analytics", "report", id],
    queryFn: () => analyticsApi.getReport(id),
    enabled: !!id,
  });
}

export function useCreateReport() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Omit<Report, 'id' | 'user_id' | 'created_at' | 'updated_at' | 'last_accessed_at'>) =>
      analyticsApi.createReport(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["analytics", "reports"] });
      toast.success("Report created successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to create report");
    },
  });
}

export function useUpdateReport() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Omit<Report, 'id' | 'user_id' | 'created_at' | 'updated_at'>> }) =>
      analyticsApi.updateReport(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["analytics", "reports"] });
      queryClient.invalidateQueries({ queryKey: ["analytics", "report", variables.id] });
      toast.success("Report updated successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update report");
    },
  });
}

export function useDeleteReport() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => analyticsApi.deleteReport(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["analytics", "reports"] });
      toast.success("Report deleted successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to delete report");
    },
  });
}

// Exports hooks
export function useExports() {
  return useQuery({
    queryKey: ["analytics", "exports"],
    queryFn: () => analyticsApi.getExports(),
  });
}

export function useExport(id: string) {
  return useQuery({
    queryKey: ["analytics", "export", id],
    queryFn: () => analyticsApi.getExport(id),
    enabled: !!id,
  });
}

export function useRequestExport() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { report_id?: string; format: 'csv' | 'pdf'; filters?: ReportFilters }) =>
      analyticsApi.requestExport(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["analytics", "exports"] });
      toast.success("Export requested successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to request export");
    },
  });
}

export function useDownloadExport() {
  return useMutation({
    mutationFn: (exportId: string) => analyticsApi.downloadExport(exportId),
    onSuccess: () => {
      toast.success("Export downloaded successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to download export");
    },
  });
}
