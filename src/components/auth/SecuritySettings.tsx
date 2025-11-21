import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
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
import { Shield, Smartphone, MessageSquare, Key, AlertTriangle, CheckCircle2 } from "lucide-react";
import { use2FAStatus, useDisable2FA, useRegenerateRecoveryCodes, useRecoveryCodes } from "@/hooks/use-2fa";
import { Enable2FAModal } from "./Enable2FAModal";
import { RecoveryCodesModal } from "./RecoveryCodesModal";
import { Skeleton } from "@/components/ui/skeleton";

export function SecuritySettings() {
  const [enable2FAModalOpen, setEnable2FAModalOpen] = useState(false);
  const [recoveryCodesModalOpen, setRecoveryCodesModalOpen] = useState(false);
  const { data: twoFactorStatus, isLoading } = use2FAStatus();
  const disable2FAMutation = useDisable2FA();
  const regenerateCodesMutation = useRegenerateRecoveryCodes();
  const { data: recoveryCodes, refetch: fetchRecoveryCodes } = useRecoveryCodes();

  const handleViewRecoveryCodes = async () => {
    await fetchRecoveryCodes();
    setRecoveryCodesModalOpen(true);
  };

  const handleRegenerateRecoveryCodes = () => {
    regenerateCodesMutation.mutate(undefined, {
      onSuccess: () => {
        setRecoveryCodesModalOpen(true);
      },
    });
  };

  const isEnforced = twoFactorStatus?.is_enforced ?? false;

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 2FA Status Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Two-Factor Authentication
              </CardTitle>
              <CardDescription>
                Add an extra layer of security to your account
              </CardDescription>
            </div>
            {twoFactorStatus?.is_enabled && (
              <Badge className="bg-success text-white">
                <CheckCircle2 className="mr-1 h-3 w-3" />
                Enabled
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {twoFactorStatus?.is_enabled ? (
            <>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {twoFactorStatus.method === "totp" ? (
                      <Smartphone className="h-4 w-4 text-foreground-secondary" />
                    ) : (
                      <MessageSquare className="h-4 w-4 text-foreground-secondary" />
                    )}
                    <span className="text-sm font-medium">
                      Method: {twoFactorStatus.method === "totp" ? "Authenticator App" : "SMS"}
                    </span>
                  </div>
                </div>
                {twoFactorStatus.phone_number && (
                  <p className="text-sm text-foreground-secondary ml-6">
                    {twoFactorStatus.phone_number}
                  </p>
                )}
                {isEnforced && (
                  <Alert>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription className="text-sm">
                      Two-factor authentication is required for your account and cannot be disabled.
                    </AlertDescription>
                  </Alert>
                )}
              </div>

              <div className="flex flex-wrap gap-3 pt-4 border-t border-border">
                <Button
                  variant="outline"
                  onClick={handleViewRecoveryCodes}
                  className="flex items-center gap-2"
                >
                  <Key className="h-4 w-4" />
                  View Recovery Codes
                </Button>
                <Button
                  variant="outline"
                  onClick={handleRegenerateRecoveryCodes}
                  disabled={regenerateCodesMutation.isPending}
                  className="flex items-center gap-2"
                >
                  <Key className="h-4 w-4" />
                  {regenerateCodesMutation.isPending ? "Regenerating..." : "Regenerate Codes"}
                </Button>
                {!isEnforced && (
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive" className="flex items-center gap-2">
                        <Shield className="h-4 w-4" />
                        Disable 2FA
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Disable Two-Factor Authentication?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This will remove the extra security layer from your account. You can
                          re-enable it at any time.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => disable2FAMutation.mutate()}
                          className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
                        >
                          Disable 2FA
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                )}
              </div>
            </>
          ) : (
            <>
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  {isEnforced
                    ? "Two-factor authentication is required for your account. Please enable it now."
                    : "Two-factor authentication is not enabled. Enable it to secure your account."}
                </AlertDescription>
              </Alert>
              <Button
                onClick={() => setEnable2FAModalOpen(true)}
                className="w-full sm:w-auto"
              >
                <Shield className="mr-2 h-4 w-4" />
                Enable Two-Factor Authentication
              </Button>
            </>
          )}
        </CardContent>
      </Card>

      {/* Recent Auth Attempts */}
      {twoFactorStatus?.is_enabled && (
        <Card>
          <CardHeader>
            <CardTitle>Security Information</CardTitle>
            <CardDescription>
              View your recent authentication attempts and security activity
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-foreground-secondary">Recovery Codes Available:</span>
                <span className="font-medium">
                  {twoFactorStatus.recovery_codes_count} codes
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-foreground-secondary">Enabled:</span>
                <span className="font-medium">
                  {new Date(twoFactorStatus.created_at).toLocaleDateString()}
                </span>
              </div>
              {isEnforced && (
                <div className="flex justify-between">
                  <span className="text-foreground-secondary">Status:</span>
                  <Badge variant="outline" className="border-orange-500 text-orange-500">
                    Required
                  </Badge>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Modals */}
      <Enable2FAModal
        open={enable2FAModalOpen}
        onOpenChange={setEnable2FAModalOpen}
      />

      {recoveryCodes?.codes && recoveryCodes.codes.length > 0 && (
        <RecoveryCodesModal
          open={recoveryCodesModalOpen}
          onOpenChange={setRecoveryCodesModalOpen}
          recoveryCodes={recoveryCodes.codes}
        />
      )}
    </div>
  );
}
