import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { 
  History, 
  RotateCcw, 
  User, 
  Clock,
  Loader2
} from "lucide-react";
import { toast } from "sonner";
import { reelsApi } from "@/lib/api";
import { cn } from "@/lib/utils";

interface VersionHistoryModalProps {
  reelId: string;
  isOpen: boolean;
  onClose: () => void;
}

export function VersionHistoryModal({ reelId, isOpen, onClose }: VersionHistoryModalProps) {
  const queryClient = useQueryClient();
  const [rollbackVersionId, setRollbackVersionId] = useState<string | null>(null);

  const { data: versions, isLoading } = useQuery({
    queryKey: ["reel-versions", reelId],
    queryFn: () => reelsApi.getReelVersions(reelId),
    enabled: isOpen && !!reelId,
  });

  const rollbackMutation = useMutation({
    mutationFn: (versionId: string) => reelsApi.rollbackToVersion(reelId, versionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reel", reelId] });
      queryClient.invalidateQueries({ queryKey: ["reel-versions", reelId] });
      setRollbackVersionId(null);
      toast.success("Rolled back to selected version");
      onClose();
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to rollback version");
      setRollbackVersionId(null);
    },
  });

  const handleRollback = (versionId: string) => {
    setRollbackVersionId(versionId);
  };

  const confirmRollback = () => {
    if (rollbackVersionId) {
      rollbackMutation.mutate(rollbackVersionId);
    }
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-3xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <History className="h-5 w-5" />
              Version History
            </DialogTitle>
            <DialogDescription>
              View all versions of this reel and rollback to a previous version if needed
            </DialogDescription>
          </DialogHeader>

          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : versions && versions.length > 0 ? (
            <ScrollArea className="h-[500px] pr-4">
              <div className="space-y-4">
                {versions
                  .sort((a, b) => b.version_number - a.version_number)
                  .map((version, index) => {
                    const isCurrent = index === 0;
                    const changes = version.changes
                      ? (typeof version.changes === "string"
                          ? JSON.parse(version.changes)
                          : version.changes)
                      : {};

                    return (
                      <div
                        key={version.id}
                        className={cn(
                          "p-4 border rounded-lg transition-all",
                          isCurrent
                            ? "border-primary bg-primary/5 shadow-sm"
                            : "border-border hover:border-primary/50"
                        )}
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div className="flex items-center gap-2">
                              <Badge
                                variant={isCurrent ? "default" : "secondary"}
                                className={cn(
                                  isCurrent && "bg-primary text-primary-foreground"
                                )}
                              >
                                v{version.version_number}
                              </Badge>
                              {isCurrent && (
                                <Badge variant="outline" className="text-xs">
                                  Current
                                </Badge>
                              )}
                            </div>
                            <div>
                              <p className="font-medium text-foreground-primary">
                                Version {version.version_number}
                              </p>
                              <div className="flex items-center gap-2 text-sm text-foreground-secondary mt-1">
                                <Clock className="h-3 w-3" />
                                {new Date(version.created_at).toLocaleString()}
                              </div>
                            </div>
                          </div>
                          {!isCurrent && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleRollback(version.id)}
                              disabled={rollbackMutation.isPending}
                            >
                              <RotateCcw className="mr-2 h-4 w-4" />
                              Rollback
                            </Button>
                          )}
                        </div>

                        <Separator className="my-3" />

                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-sm">
                            <User className="h-4 w-4 text-foreground-secondary" />
                            <span className="text-foreground-secondary">
                              Created by: {version.created_by}
                            </span>
                          </div>

                          {version.changes && (
                            <div className="mt-3">
                              <p className="text-sm font-medium text-foreground-primary mb-2">
                                Changes:
                              </p>
                              <div className="bg-muted/50 rounded p-3 text-sm">
                                {typeof changes === "object" && changes !== null ? (
                                  <ul className="list-disc list-inside space-y-1 text-foreground-secondary">
                                    {Object.entries(changes).map(([key, value]) => (
                                      <li key={key}>
                                        <span className="font-medium">{key}:</span>{" "}
                                        {String(value)}
                                      </li>
                                    ))}
                                  </ul>
                                ) : (
                                  <p className="text-foreground-secondary">
                                    {version.changes}
                                  </p>
                                )}
                              </div>
                            </div>
                          )}

                          {version.metadata_snapshot && (
                            <div className="mt-3">
                              <p className="text-sm font-medium text-foreground-primary mb-2">
                                Metadata Snapshot:
                              </p>
                              <div className="bg-muted/50 rounded p-3 text-sm space-y-1">
                                {version.metadata_snapshot.title && (
                                  <p>
                                    <span className="font-medium">Title:</span>{" "}
                                    {version.metadata_snapshot.title}
                                  </p>
                                )}
                                {version.metadata_snapshot.description && (
                                  <p className="text-foreground-secondary line-clamp-2">
                                    <span className="font-medium">Description:</span>{" "}
                                    {version.metadata_snapshot.description}
                                  </p>
                                )}
                                {version.metadata_snapshot.machine_model && (
                                  <p>
                                    <span className="font-medium">Machine:</span>{" "}
                                    {version.metadata_snapshot.machine_model}
                                  </p>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
              </div>
            </ScrollArea>
          ) : (
            <div className="py-12 text-center">
              <History className="h-12 w-12 text-foreground-secondary mx-auto mb-4" />
              <p className="text-foreground-secondary">No version history available</p>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={!!rollbackVersionId}
        onOpenChange={(open) => !open && setRollbackVersionId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Rollback</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to rollback to this version? This action will restore
              the metadata and settings from this version. The current version will be
              preserved in history.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmRollback}
              disabled={rollbackMutation.isPending}
            >
              {rollbackMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Rolling back...
                </>
              ) : (
                <>
                  <RotateCcw className="mr-2 h-4 w-4" />
                  Confirm Rollback
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
