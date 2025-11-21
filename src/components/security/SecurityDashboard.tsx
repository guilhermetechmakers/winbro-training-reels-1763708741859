import { useSecurityDashboard } from "@/hooks/use-security";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Shield, Lock, CheckCircle2, XCircle, AlertTriangle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";

export function SecurityDashboard() {
  const { data: dashboard, isLoading, error } = useSecurityDashboard();

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <AlertTriangle className="h-12 w-12 text-destructive mx-auto mb-4" />
        <p className="text-foreground-secondary">Failed to load security dashboard</p>
      </div>
    );
  }

  if (!dashboard) return null;

  return (
    <div className="space-y-6">
      {/* Tenant Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Tenant Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-foreground-secondary">Tenant Name</p>
              <p className="font-medium text-foreground-primary">{dashboard.tenant_info.tenant_name}</p>
            </div>
            <div>
              <p className="text-sm text-foreground-secondary">Admin Contact</p>
              <p className="font-medium text-foreground-primary">{dashboard.tenant_info.admin_contact}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Encryption Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5" />
            Encryption Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <p className="text-sm text-foreground-secondary">Data at Rest</p>
              <Badge
                variant={dashboard.encryption_status.data_at_rest === "enabled" ? "default" : "secondary"}
                className={
                  dashboard.encryption_status.data_at_rest === "enabled"
                    ? "bg-success text-white"
                    : ""
                }
              >
                {dashboard.encryption_status.data_at_rest === "enabled" ? (
                  <CheckCircle2 className="h-3 w-3 mr-1" />
                ) : (
                  <XCircle className="h-3 w-3 mr-1" />
                )}
                {dashboard.encryption_status.data_at_rest}
              </Badge>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-foreground-secondary">Data in Transit</p>
              <Badge
                variant={dashboard.encryption_status.data_in_transit === "enabled" ? "default" : "secondary"}
                className={
                  dashboard.encryption_status.data_in_transit === "enabled"
                    ? "bg-success text-white"
                    : ""
                }
              >
                {dashboard.encryption_status.data_in_transit === "enabled" ? (
                  <CheckCircle2 className="h-3 w-3 mr-1" />
                ) : (
                  <XCircle className="h-3 w-3 mr-1" />
                )}
                {dashboard.encryption_status.data_in_transit}
              </Badge>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-foreground-secondary">Active Keys</p>
              <p className="font-medium text-foreground-primary">
                {dashboard.encryption_status.active_keys}
              </p>
              {dashboard.encryption_status.last_rotation && (
                <p className="text-xs text-foreground-secondary">
                  Last rotated: {format(new Date(dashboard.encryption_status.last_rotation), "MMM d, yyyy")}
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Compliance Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5" />
            Compliance Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <p className="text-sm text-foreground-secondary">GDPR Compliance</p>
              <Badge
                variant={dashboard.compliance_status.gdpr_compliant ? "default" : "secondary"}
                className={dashboard.compliance_status.gdpr_compliant ? "bg-success text-white" : ""}
              >
                {dashboard.compliance_status.gdpr_compliant ? (
                  <CheckCircle2 className="h-3 w-3 mr-1" />
                ) : (
                  <XCircle className="h-3 w-3 mr-1" />
                )}
                {dashboard.compliance_status.gdpr_compliant ? "Compliant" : "Non-Compliant"}
              </Badge>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-foreground-secondary">CCPA Compliance</p>
              <Badge
                variant={dashboard.compliance_status.ccpa_compliant ? "default" : "secondary"}
                className={dashboard.compliance_status.ccpa_compliant ? "bg-success text-white" : ""}
              >
                {dashboard.compliance_status.ccpa_compliant ? (
                  <CheckCircle2 className="h-3 w-3 mr-1" />
                ) : (
                  <XCircle className="h-3 w-3 mr-1" />
                )}
                {dashboard.compliance_status.ccpa_compliant ? "Compliant" : "Non-Compliant"}
              </Badge>
            </div>
          </div>
          {dashboard.compliance_status.last_audit && (
            <div className="mt-4">
              <p className="text-sm text-foreground-secondary">
                Last Audit: {format(new Date(dashboard.compliance_status.last_audit), "MMM d, yyyy")}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Access Controls */}
      <Card>
        <CardHeader>
          <CardTitle>Access Controls</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <p className="text-sm text-foreground-secondary">Row-Level Security (RLS)</p>
              <Badge
                variant={dashboard.access_controls.rls_enabled ? "default" : "secondary"}
                className={dashboard.access_controls.rls_enabled ? "bg-success text-white" : ""}
              >
                {dashboard.access_controls.rls_enabled ? (
                  <CheckCircle2 className="h-3 w-3 mr-1" />
                ) : (
                  <XCircle className="h-3 w-3 mr-1" />
                )}
                {dashboard.access_controls.rls_enabled ? "Enabled" : "Disabled"}
              </Badge>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-foreground-secondary">ACL Enforcement</p>
              <Badge
                variant={dashboard.access_controls.acl_enforced ? "default" : "secondary"}
                className={dashboard.access_controls.acl_enforced ? "bg-success text-white" : ""}
              >
                {dashboard.access_controls.acl_enforced ? (
                  <CheckCircle2 className="h-3 w-3 mr-1" />
                ) : (
                  <XCircle className="h-3 w-3 mr-1" />
                )}
                {dashboard.access_controls.acl_enforced ? "Enforced" : "Not Enforced"}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Alerts */}
      {dashboard.recent_alerts && dashboard.recent_alerts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recent Security Alerts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {dashboard.recent_alerts.slice(0, 5).map((alert) => (
                <div
                  key={alert.log_id}
                  className="flex items-start justify-between p-3 rounded-lg border border-border bg-card"
                >
                  <div className="flex-1">
                    <p className="font-medium text-foreground-primary">{alert.action}</p>
                    <p className="text-sm text-foreground-secondary">{alert.action_type}</p>
                    <p className="text-xs text-foreground-secondary mt-1">
                      {format(new Date(alert.timestamp), "MMM d, yyyy HH:mm")}
                    </p>
                  </div>
                  <Badge
                    variant={
                      alert.severity === "critical"
                        ? "destructive"
                        : alert.severity === "high"
                        ? "default"
                        : "secondary"
                    }
                  >
                    {alert.severity}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
