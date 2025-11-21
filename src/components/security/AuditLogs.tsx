import { useState } from "react";
import { useAuditLogs, useExportAuditLogs } from "@/hooks/use-security";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { FileText, Download, AlertTriangle, Search } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

export function AuditLogs() {
  const [filters, setFilters] = useState<{
    action_type?: string;
    severity?: string;
    start_date?: string;
    end_date?: string;
    limit?: number;
  }>({ limit: 50 });
  const [searchQuery, setSearchQuery] = useState("");

  const { data: logs, isLoading, error } = useAuditLogs(filters);
  const exportLogs = useExportAuditLogs();

  const handleExport = async (format: "csv" | "json" = "csv") => {
    await exportLogs.mutateAsync({ ...filters, format });
  };

  const filteredLogs = logs?.filter((log) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      log.action.toLowerCase().includes(query) ||
      log.action_type.toLowerCase().includes(query) ||
      log.user_id.toLowerCase().includes(query) ||
      (log.resource_type && log.resource_type.toLowerCase().includes(query))
    );
  });

  const severityColors = {
    critical: "bg-destructive text-destructive-foreground",
    high: "bg-orange-500 text-white",
    medium: "bg-yellow-500 text-white",
    low: "bg-muted text-muted-foreground",
  };

  return (
    <div className="space-y-6">
      {/* Filters and Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Audit Logs
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search logs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Filters */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Select
                value={filters.action_type || "all"}
                onValueChange={(value) =>
                  setFilters({ ...filters, action_type: value === "all" ? undefined : value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Action Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Actions</SelectItem>
                  <SelectItem value="access">Access</SelectItem>
                  <SelectItem value="modification">Modification</SelectItem>
                  <SelectItem value="deletion">Deletion</SelectItem>
                  <SelectItem value="authentication">Authentication</SelectItem>
                  <SelectItem value="authorization">Authorization</SelectItem>
                  <SelectItem value="encryption">Encryption</SelectItem>
                  <SelectItem value="compliance">Compliance</SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={filters.severity || "all"}
                onValueChange={(value) =>
                  setFilters({ ...filters, severity: value === "all" ? undefined : value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Severity" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Severities</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>

              <Input
                type="date"
                placeholder="Start Date"
                value={filters.start_date || ""}
                onChange={(e) => setFilters({ ...filters, start_date: e.target.value || undefined })}
              />

              <Input
                type="date"
                placeholder="End Date"
                value={filters.end_date || ""}
                onChange={(e) => setFilters({ ...filters, end_date: e.target.value || undefined })}
              />
            </div>

            {/* Export Buttons */}
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleExport("csv")}
                disabled={exportLogs.isPending}
              >
                <Download className="h-4 w-4 mr-2" />
                Export CSV
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleExport("json")}
                disabled={exportLogs.isPending}
              >
                <Download className="h-4 w-4 mr-2" />
                Export JSON
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Logs List */}
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-6 space-y-4">
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-20 w-full" />
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <AlertTriangle className="h-12 w-12 text-destructive mx-auto mb-4" />
              <p className="text-foreground-secondary">Failed to load audit logs</p>
            </div>
          ) : !filteredLogs || filteredLogs.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-foreground-secondary">No audit logs found</p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {filteredLogs.map((log) => (
                <div
                  key={log.log_id}
                  className="p-4 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-3">
                        <h3 className="font-medium text-foreground-primary">{log.action}</h3>
                        <Badge
                          variant="outline"
                          className={cn(
                            "text-xs",
                            severityColors[log.severity] || "bg-muted text-muted-foreground"
                          )}
                        >
                          {log.severity}
                        </Badge>
                        <Badge variant="secondary" className="text-xs">
                          {log.action_type}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <p className="text-foreground-secondary">User ID</p>
                          <p className="font-mono text-xs text-foreground-primary">{log.user_id}</p>
                        </div>
                        {log.resource_type && (
                          <div>
                            <p className="text-foreground-secondary">Resource</p>
                            <p className="text-foreground-primary">{log.resource_type}</p>
                          </div>
                        )}
                        {log.ip_address && (
                          <div>
                            <p className="text-foreground-secondary">IP Address</p>
                            <p className="font-mono text-xs text-foreground-primary">{log.ip_address}</p>
                          </div>
                        )}
                        <div>
                          <p className="text-foreground-secondary">Timestamp</p>
                          <p className="text-foreground-primary">
                            {format(new Date(log.timestamp), "MMM d, yyyy HH:mm:ss")}
                          </p>
                        </div>
                      </div>
                      {log.details && Object.keys(log.details).length > 0 && (
                        <details className="mt-2">
                          <summary className="text-sm text-foreground-secondary cursor-pointer">
                            View Details
                          </summary>
                          <pre className="mt-2 p-2 bg-muted rounded text-xs overflow-x-auto">
                            {JSON.stringify(log.details, null, 2)}
                          </pre>
                        </details>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
