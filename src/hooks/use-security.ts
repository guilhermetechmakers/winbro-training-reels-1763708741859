import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { securityApi } from "@/lib/api";
import { toast } from "sonner";

// Security Dashboard
export function useSecurityDashboard() {
  return useQuery({
    queryKey: ["security", "dashboard"],
    queryFn: () => securityApi.getSecurityDashboard(),
  });
}

// Tenant Management
export function useTenant() {
  return useQuery({
    queryKey: ["security", "tenant"],
    queryFn: () => securityApi.getTenant(),
  });
}

export function useUpdateTenant() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { tenant_name?: string; admin_contact?: string }) =>
      securityApi.updateTenant(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["security", "tenant"] });
      queryClient.invalidateQueries({ queryKey: ["security", "dashboard"] });
      toast.success("Tenant information updated successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update tenant information");
    },
  });
}

// Encryption Keys
export function useEncryptionKeys() {
  return useQuery({
    queryKey: ["security", "encryption", "keys"],
    queryFn: () => securityApi.getEncryptionKeys(),
  });
}

export function useEncryptionKey(keyId: string) {
  return useQuery({
    queryKey: ["security", "encryption", "keys", keyId],
    queryFn: () => securityApi.getEncryptionKey(keyId),
    enabled: !!keyId,
  });
}

export function useRotateEncryptionKey() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (keyId: string) => securityApi.rotateEncryptionKey(keyId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["security", "encryption", "keys"] });
      queryClient.invalidateQueries({ queryKey: ["security", "dashboard"] });
      toast.success("Encryption key rotated successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to rotate encryption key");
    },
  });
}

// Audit Logs
export function useAuditLogs(filters?: {
  action_type?: string;
  severity?: string;
  start_date?: string;
  end_date?: string;
  limit?: number;
}) {
  return useQuery({
    queryKey: ["security", "audit-logs", filters],
    queryFn: () => securityApi.getAuditLogs(filters),
  });
}

export function useAuditLog(logId: string) {
  return useQuery({
    queryKey: ["security", "audit-logs", logId],
    queryFn: () => securityApi.getAuditLog(logId),
    enabled: !!logId,
  });
}

export function useExportAuditLogs() {
  return useMutation({
    mutationFn: (filters?: {
      action_type?: string;
      severity?: string;
      start_date?: string;
      end_date?: string;
      format?: "csv" | "json";
    }) => securityApi.exportAuditLogs(filters),
    onSuccess: () => {
      toast.success("Audit logs exported successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to export audit logs");
    },
  });
}

// Compliance Requests
export function useComplianceRequests(filters?: {
  type?: "export" | "delete";
  status?: string;
}) {
  return useQuery({
    queryKey: ["security", "compliance", "requests", filters],
    queryFn: () => securityApi.getComplianceRequests(filters),
  });
}

export function useComplianceRequest(requestId: string) {
  return useQuery({
    queryKey: ["security", "compliance", "requests", requestId],
    queryFn: () => securityApi.getComplianceRequest(requestId),
    enabled: !!requestId,
  });
}

export function useCreateComplianceRequest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: {
      type: "export" | "delete";
      data_range?: { start_date: string; end_date: string };
      format?: "json" | "csv" | "pdf";
    }) => securityApi.createComplianceRequest(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["security", "compliance", "requests"] });
      toast.success("Compliance request created successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to create compliance request");
    },
  });
}

export function useDownloadComplianceExport() {
  return useMutation({
    mutationFn: (requestId: string) => securityApi.downloadComplianceExport(requestId),
    onSuccess: () => {
      toast.success("Export downloaded successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to download export");
    },
  });
}

// SIEM Integrations
export function useSIEMIntegrations() {
  return useQuery({
    queryKey: ["security", "siem", "integrations"],
    queryFn: () => securityApi.getSIEMIntegrations(),
  });
}

export function useSIEMIntegration(integrationId: string) {
  return useQuery({
    queryKey: ["security", "siem", "integrations", integrationId],
    queryFn: () => securityApi.getSIEMIntegration(integrationId),
    enabled: !!integrationId,
  });
}

export function useCreateSIEMIntegration() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: {
      siem_type: "splunk" | "datadog" | "sentry" | "custom";
      endpoint_url: string;
      api_key?: string;
    }) => securityApi.createSIEMIntegration(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["security", "siem", "integrations"] });
      toast.success("SIEM integration created successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to create SIEM integration");
    },
  });
}

export function useUpdateSIEMIntegration() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      integrationId,
      data,
    }: {
      integrationId: string;
      data: {
        endpoint_url?: string;
        api_key?: string;
        is_active?: boolean;
      };
    }) => securityApi.updateSIEMIntegration(integrationId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["security", "siem", "integrations"] });
      toast.success("SIEM integration updated successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update SIEM integration");
    },
  });
}

export function useDeleteSIEMIntegration() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (integrationId: string) => securityApi.deleteSIEMIntegration(integrationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["security", "siem", "integrations"] });
      toast.success("SIEM integration deleted successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to delete SIEM integration");
    },
  });
}

export function useTestSIEMConnection() {
  return useMutation({
    mutationFn: (integrationId: string) => securityApi.testSIEMConnection(integrationId),
    onSuccess: (data) => {
      if (data.connected) {
        toast.success("SIEM connection test successful");
      } else {
        toast.error(data.message || "SIEM connection test failed");
      }
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to test SIEM connection");
    },
  });
}

// Penetration Test Reports
export function usePenetrationTestReports() {
  return useQuery({
    queryKey: ["security", "penetration-tests"],
    queryFn: () => securityApi.getPenetrationTestReports(),
  });
}

export function usePenetrationTestReport(reportId: string) {
  return useQuery({
    queryKey: ["security", "penetration-tests", reportId],
    queryFn: () => securityApi.getPenetrationTestReport(reportId),
    enabled: !!reportId,
  });
}

export function useDownloadPenetrationTestReport() {
  return useMutation({
    mutationFn: (reportId: string) => securityApi.downloadPenetrationTestReport(reportId),
    onSuccess: () => {
      toast.success("Report downloaded successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to download report");
    },
  });
}
