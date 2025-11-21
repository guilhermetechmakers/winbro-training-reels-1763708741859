import { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Loader2, Shield, Eye, Lock } from "lucide-react";
import { toast } from "sonner";
import { reelsApi } from "@/lib/api";
import type { ReelPermission } from "@/types";

interface PermissionDialogProps {
  reelId: string;
  isOpen: boolean;
  onClose: () => void;
  currentPermissions?: ReelPermission;
}

export function PermissionDialog({
  reelId,
  isOpen,
  onClose,
  currentPermissions,
}: PermissionDialogProps) {
  const queryClient = useQueryClient();
  const [visibility, setVisibility] = useState<"tenant" | "public" | "internal">(
    currentPermissions?.visibility || "tenant"
  );
  const [accessLevel, setAccessLevel] = useState<"view" | "edit" | "admin">(
    currentPermissions?.access_level || "view"
  );

  // Update when currentPermissions change
  useEffect(() => {
    if (currentPermissions) {
      setVisibility(currentPermissions.visibility);
      setAccessLevel(currentPermissions.access_level);
    }
  }, [currentPermissions]);

  const updateMutation = useMutation({
    mutationFn: (data: {
      visibility: "tenant" | "public" | "internal";
      access_level?: "view" | "edit" | "admin";
    }) => reelsApi.updatePermissions(reelId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["permissions", reelId] });
      queryClient.invalidateQueries({ queryKey: ["reel", reelId] });
      toast.success("Permissions updated successfully");
      onClose();
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update permissions");
    },
  });

  const handleSave = () => {
    updateMutation.mutate({
      visibility,
      access_level: accessLevel,
    });
  };

  const handleCancel = () => {
    // Reset to original values
    if (currentPermissions) {
      setVisibility(currentPermissions.visibility);
      setAccessLevel(currentPermissions.access_level);
    }
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleCancel}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Permissions & Visibility
          </DialogTitle>
          <DialogDescription>
            Control who can view and edit this reel
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Visibility Setting */}
          <div className="space-y-3">
            <Label className="text-base font-medium flex items-center gap-2">
              <Eye className="h-4 w-4" />
              Visibility
            </Label>
            <p className="text-sm text-foreground-secondary">
              Determine who can see this reel in the library
            </p>
            <Select value={visibility} onValueChange={(value: "tenant" | "public" | "internal") => setVisibility(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="tenant">
                  <div className="flex flex-col">
                    <span className="font-medium">Tenant Only</span>
                    <span className="text-xs text-foreground-secondary">
                      Visible to your organization only
                    </span>
                  </div>
                </SelectItem>
                <SelectItem value="public">
                  <div className="flex flex-col">
                    <span className="font-medium">Public</span>
                    <span className="text-xs text-foreground-secondary">
                      Visible to all users
                    </span>
                  </div>
                </SelectItem>
                <SelectItem value="internal">
                  <div className="flex flex-col">
                    <span className="font-medium">Internal</span>
                    <span className="text-xs text-foreground-secondary">
                      Internal use only (Winbro admins)
                    </span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Separator />

          {/* Access Level Setting */}
          <div className="space-y-3">
            <Label className="text-base font-medium flex items-center gap-2">
              <Lock className="h-4 w-4" />
              Access Level
            </Label>
            <p className="text-sm text-foreground-secondary">
              Set the default access level for users who can view this reel
            </p>
            <Select
              value={accessLevel}
              onValueChange={(value: "view" | "edit" | "admin") => setAccessLevel(value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="view">
                  <div className="flex flex-col">
                    <span className="font-medium">View Only</span>
                    <span className="text-xs text-foreground-secondary">
                      Users can watch but not edit
                    </span>
                  </div>
                </SelectItem>
                <SelectItem value="edit">
                  <div className="flex flex-col">
                    <span className="font-medium">Edit</span>
                    <span className="text-xs text-foreground-secondary">
                      Users can view and edit metadata
                    </span>
                  </div>
                </SelectItem>
                <SelectItem value="admin">
                  <div className="flex flex-col">
                    <span className="font-medium">Admin</span>
                    <span className="text-xs text-foreground-secondary">
                      Full administrative access
                    </span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Info Box */}
          <div className="bg-muted/50 rounded-lg p-4 space-y-2">
            <p className="text-sm font-medium text-foreground-primary">
              Current Settings:
            </p>
            <div className="text-sm text-foreground-secondary space-y-1">
              <p>
                • Visibility: <span className="font-medium capitalize">{visibility}</span>
              </p>
              <p>
                • Access Level: <span className="font-medium capitalize">{accessLevel}</span>
              </p>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleCancel} disabled={updateMutation.isPending}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={updateMutation.isPending}>
            {updateMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              "Save Changes"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
