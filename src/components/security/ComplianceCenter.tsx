import { useState } from "react";
import { useComplianceRequests, useDownloadComplianceExport } from "@/hooks/use-security";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { CheckCircle2, Download, FileText, AlertTriangle, Plus, Clock } from "lucide-react";
import { format } from "date-fns";
import { DataExportModal } from "./DataExportModal";
import { DataDeleteModal } from "./DataDeleteModal";

export function ComplianceCenter() {
  const [showExportModal, setShowExportModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [filterType, setFilterType] = useState<"export" | "delete" | "all">("all");

  const { data: requests, isLoading, error } = useComplianceRequests(
    filterType === "all" ? undefined : { type: filterType }
  );
  const downloadExport = useDownloadComplianceExport();

  const handleDownload = async (requestId: string) => {
    await downloadExport.mutateAsync(requestId);
  };

  const statusColors = {
    pending: "bg-yellow-500 text-white",
    in_progress: "bg-blue-500 text-white",
    completed: "bg-success text-white",
    rejected: "bg-destructive text-destructive-foreground",
    failed: "bg-destructive text-destructive-foreground",
  };

  return (
    <div className="space-y-6">
      {/* Compliance Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5" />
            Compliance Requests
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <Button
              onClick={() => setShowExportModal(true)}
              className="flex-1"
            >
              <Plus className="h-4 w-4 mr-2" />
              Request Data Export
            </Button>
            <Button
              onClick={() => setShowDeleteModal(true)}
              variant="destructive"
              className="flex-1"
            >
              <Plus className="h-4 w-4 mr-2" />
              Request Data Deletion
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Compliance Information */}
      <Card>
        <CardHeader>
          <CardTitle>Compliance Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 text-sm">
            <div>
              <p className="font-medium text-foreground-primary mb-2">GDPR Compliance</p>
              <p className="text-foreground-secondary">
                Under GDPR, you have the right to access, correct, and delete your personal data.
                You can request a data export or deletion through the compliance portal. Requests
                are typically processed within 30 days.
              </p>
            </div>
            <div>
              <p className="font-medium text-foreground-primary mb-2">CCPA Compliance</p>
              <p className="text-foreground-secondary">
                Under CCPA, California residents have the right to know what personal information
                is collected, request deletion of personal information, and opt-out of the sale of
                personal information.
              </p>
            </div>
            <div>
              <p className="font-medium text-foreground-primary mb-2">Data Export</p>
              <p className="text-foreground-secondary">
                Request a complete export of your data in JSON, CSV, or PDF format. The export
                will include all data associated with your account, including user data, content,
                and activity logs.
              </p>
            </div>
            <div>
              <p className="font-medium text-foreground-primary mb-2">Data Deletion</p>
              <p className="text-foreground-secondary">
                Request permanent deletion of your data. This action is irreversible and will delete
                all data associated with your account. Please ensure you have exported any data you
                wish to keep before submitting a deletion request.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Filter Tabs */}
      <div className="flex gap-2">
        <Button
          variant={filterType === "all" ? "default" : "outline"}
          size="sm"
          onClick={() => setFilterType("all")}
        >
          All Requests
        </Button>
        <Button
          variant={filterType === "export" ? "default" : "outline"}
          size="sm"
          onClick={() => setFilterType("export")}
        >
          Exports
        </Button>
        <Button
          variant={filterType === "delete" ? "default" : "outline"}
          size="sm"
          onClick={() => setFilterType("delete")}
        >
          Deletions
        </Button>
      </div>

      {/* Requests List */}
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-6 space-y-4">
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-24 w-full" />
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <AlertTriangle className="h-12 w-12 text-destructive mx-auto mb-4" />
              <p className="text-foreground-secondary">Failed to load compliance requests</p>
            </div>
          ) : !requests || requests.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-foreground-secondary">No compliance requests found</p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {requests.map((request) => (
                <div
                  key={request.request_id}
                  className="p-4 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-3">
                        <h3 className="font-medium text-foreground-primary">
                          {request.type === "export" ? "Data Export" : "Data Deletion"}
                        </h3>
                        <Badge
                          variant="outline"
                          className={
                            statusColors[request.status] || "bg-muted text-muted-foreground"
                          }
                        >
                          {request.status === "pending" && <Clock className="h-3 w-3 mr-1" />}
                          {request.status === "completed" && (
                            <CheckCircle2 className="h-3 w-3 mr-1" />
                          )}
                          {request.status === "rejected" && (
                            <AlertTriangle className="h-3 w-3 mr-1" />
                          )}
                          {request.status}
                        </Badge>
                        {request.format && (
                          <Badge variant="secondary" className="text-xs">
                            {request.format.toUpperCase()}
                          </Badge>
                        )}
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <p className="text-foreground-secondary">Requested</p>
                          <p className="text-foreground-primary">
                            {format(new Date(request.requested_at), "MMM d, yyyy")}
                          </p>
                        </div>
                        {request.processed_at && (
                          <div>
                            <p className="text-foreground-secondary">Processed</p>
                            <p className="text-foreground-primary">
                              {format(new Date(request.processed_at), "MMM d, yyyy")}
                            </p>
                          </div>
                        )}
                        {request.data_range && (
                          <>
                            <div>
                              <p className="text-foreground-secondary">Start Date</p>
                              <p className="text-foreground-primary">
                                {format(new Date(request.data_range.start_date), "MMM d, yyyy")}
                              </p>
                            </div>
                            <div>
                              <p className="text-foreground-secondary">End Date</p>
                              <p className="text-foreground-primary">
                                {format(new Date(request.data_range.end_date), "MMM d, yyyy")}
                              </p>
                            </div>
                          </>
                        )}
                      </div>
                      {request.rejection_reason && (
                        <div className="mt-2 p-2 bg-destructive/10 border border-destructive/20 rounded text-sm text-destructive">
                          <p className="font-medium">Rejection Reason:</p>
                          <p>{request.rejection_reason}</p>
                        </div>
                      )}
                    </div>
                    {request.status === "completed" &&
                      request.type === "export" &&
                      request.file_url && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDownload(request.request_id)}
                          disabled={downloadExport.isPending}
                        >
                          <Download className="h-4 w-4 mr-2" />
                          Download
                        </Button>
                      )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modals */}
      <DataExportModal
        open={showExportModal}
        onOpenChange={setShowExportModal}
      />
      <DataDeleteModal
        open={showDeleteModal}
        onOpenChange={setShowDeleteModal}
      />
    </div>
  );
}
