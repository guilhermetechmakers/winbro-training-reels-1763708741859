import { useState } from "react";
import { useEncryptionKeys, useRotateEncryptionKey } from "@/hooks/use-security";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Lock, RotateCw, AlertTriangle, CheckCircle2, Clock } from "lucide-react";
import { format } from "date-fns";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export function EncryptionDashboard() {
  const { data: keys, isLoading, error } = useEncryptionKeys();
  const rotateKey = useRotateEncryptionKey();
  const [rotatingKeyId, setRotatingKeyId] = useState<string | null>(null);

  const handleRotateKey = async (keyId: string) => {
    setRotatingKeyId(keyId);
    try {
      await rotateKey.mutateAsync(keyId);
    } finally {
      setRotatingKeyId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <AlertTriangle className="h-12 w-12 text-destructive mx-auto mb-4" />
        <p className="text-foreground-secondary">Failed to load encryption keys</p>
      </div>
    );
  }

  const activeKeys = keys?.filter((key) => key.status === "active") || [];
  const rotatedKeys = keys?.filter((key) => key.status === "rotated") || [];

  return (
    <div className="space-y-6">
      {/* Encryption Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5" />
            Encryption Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <p className="text-sm text-foreground-secondary">Total Keys</p>
              <p className="text-2xl font-bold text-foreground-primary">{keys?.length || 0}</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-foreground-secondary">Active Keys</p>
              <p className="text-2xl font-bold text-success">{activeKeys.length}</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-foreground-secondary">Rotated Keys</p>
              <p className="text-2xl font-bold text-foreground-secondary">{rotatedKeys.length}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Encryption Keys List */}
      <Card>
        <CardHeader>
          <CardTitle>Encryption Keys</CardTitle>
        </CardHeader>
        <CardContent>
          {!keys || keys.length === 0 ? (
            <div className="text-center py-12">
              <Lock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-foreground-secondary">No encryption keys found</p>
            </div>
          ) : (
            <div className="space-y-4">
              {keys.map((key) => (
                <div
                  key={key.key_id}
                  className="flex items-start justify-between p-4 rounded-lg border border-border bg-card hover:shadow-md transition-shadow"
                >
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-3">
                      <h3 className="font-medium text-foreground-primary">{key.key_type}</h3>
                      <Badge
                        variant={
                          key.status === "active"
                            ? "default"
                            : key.status === "rotated"
                            ? "secondary"
                            : "outline"
                        }
                        className={
                          key.status === "active"
                            ? "bg-success text-white"
                            : key.status === "rotated"
                            ? "bg-muted text-foreground-secondary"
                            : ""
                        }
                      >
                        {key.status === "active" && <CheckCircle2 className="h-3 w-3 mr-1" />}
                        {key.status === "rotated" && <Clock className="h-3 w-3 mr-1" />}
                        {key.status}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="text-foreground-secondary">Key ID</p>
                        <p className="font-mono text-xs text-foreground-primary">{key.key_id}</p>
                      </div>
                      <div>
                        <p className="text-foreground-secondary">Created</p>
                        <p className="text-foreground-primary">
                          {format(new Date(key.created_at), "MMM d, yyyy")}
                        </p>
                      </div>
                      {key.rotated_at && (
                        <div>
                          <p className="text-foreground-secondary">Rotated</p>
                          <p className="text-foreground-primary">
                            {format(new Date(key.rotated_at), "MMM d, yyyy")}
                          </p>
                        </div>
                      )}
                      {key.expires_at && (
                        <div>
                          <p className="text-foreground-secondary">Expires</p>
                          <p className="text-foreground-primary">
                            {format(new Date(key.expires_at), "MMM d, yyyy")}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                  {key.status === "active" && (
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={rotatingKeyId === key.key_id}
                          className="ml-4"
                        >
                          {rotatingKeyId === key.key_id ? (
                            <>
                              <RotateCw className="h-4 w-4 mr-2 animate-spin" />
                              Rotating...
                            </>
                          ) : (
                            <>
                              <RotateCw className="h-4 w-4 mr-2" />
                              Rotate
                            </>
                          )}
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Rotate Encryption Key</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to rotate this encryption key? This action will
                            create a new key and deprecate the current one. Make sure you have
                            proper backups before proceeding.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleRotateKey(key.key_id)}
                            className="bg-primary text-primary-foreground"
                          >
                            Rotate Key
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Encryption Information */}
      <Card>
        <CardHeader>
          <CardTitle>Encryption Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 text-sm">
            <div>
              <p className="font-medium text-foreground-primary mb-2">Data at Rest</p>
              <p className="text-foreground-secondary">
                All data stored in our systems is encrypted using AES-256 encryption. Keys are
                managed securely and rotated regularly to maintain security.
              </p>
            </div>
            <div>
              <p className="font-medium text-foreground-primary mb-2">Data in Transit</p>
              <p className="text-foreground-secondary">
                All data transmitted between your device and our servers is encrypted using TLS 1.3.
                This ensures that your data remains secure during transmission.
              </p>
            </div>
            <div>
              <p className="font-medium text-foreground-primary mb-2">Key Management</p>
              <p className="text-foreground-secondary">
                Encryption keys are stored separately from encrypted data and are managed using
                industry-standard key management practices. Keys are automatically rotated on a
                regular schedule, and you can manually rotate keys when needed.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
