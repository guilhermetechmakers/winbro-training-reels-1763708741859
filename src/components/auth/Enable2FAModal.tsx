import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TOTPSetupForm } from "./TOTPSetupForm";
import { SMSVerificationForm } from "./SMSVerificationForm";
import { RecoveryCodesModal } from "./RecoveryCodesModal";
import { useGenerateTOTPSecret } from "@/hooks/use-2fa";
import { Shield, Smartphone, MessageSquare } from "lucide-react";
import type { TOTPSetupResponse } from "@/types";

interface Enable2FAModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function Enable2FAModal({ open, onOpenChange }: Enable2FAModalProps) {
  const [method, setMethod] = useState<"totp" | "sms">("totp");
  const [totpSetupData, setTotpSetupData] = useState<TOTPSetupResponse | null>(null);
  const [showRecoveryCodes, setShowRecoveryCodes] = useState(false);
  const [recoveryCodes, setRecoveryCodes] = useState<string[]>([]);
  const generateTOTPMutation = useGenerateTOTPSecret();

  const handleMethodChange = (newMethod: string) => {
    if (newMethod === "totp" && !totpSetupData) {
      generateTOTPMutation.mutate(undefined, {
        onSuccess: (data) => {
          setTotpSetupData(data);
          setMethod("totp");
        },
      });
    } else {
      setMethod(newMethod as "totp" | "sms");
    }
  };

  const handleTOTPVerified = (codes: string[]) => {
    setRecoveryCodes(codes);
    setShowRecoveryCodes(true);
  };

  const handleSMSVerified = (codes: string[]) => {
    setRecoveryCodes(codes);
    setShowRecoveryCodes(true);
  };


  const handleCancel = () => {
    onOpenChange(false);
    // Reset state
    setTotpSetupData(null);
    setRecoveryCodes([]);
  };

  // Generate TOTP secret when modal opens and TOTP is selected
  if (open && method === "totp" && !totpSetupData && !generateTOTPMutation.isPending) {
    generateTOTPMutation.mutate(undefined, {
      onSuccess: (data) => {
        setTotpSetupData(data);
      },
    });
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Enable Two-Factor Authentication
            </DialogTitle>
            <DialogDescription>
              Choose a method to secure your account with an additional layer of
              protection.
            </DialogDescription>
          </DialogHeader>

          <Tabs value={method} onValueChange={handleMethodChange} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="totp" className="flex items-center gap-2">
                <Smartphone className="h-4 w-4" />
                Authenticator App
              </TabsTrigger>
              <TabsTrigger value="sms" className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                SMS
              </TabsTrigger>
            </TabsList>

            <TabsContent value="totp" className="mt-4">
              {generateTOTPMutation.isPending ? (
                <div className="flex items-center justify-center py-12">
                  <div className="text-foreground-secondary">Generating QR code...</div>
                </div>
              ) : totpSetupData ? (
                <TOTPSetupForm
                  setupData={totpSetupData}
                  onVerified={handleTOTPVerified}
                  onCancel={handleCancel}
                />
              ) : (
                <div className="text-center py-12 text-foreground-secondary">
                  Failed to generate TOTP secret. Please try again.
                </div>
              )}
            </TabsContent>

            <TabsContent value="sms" className="mt-4">
              <SMSVerificationForm
                onVerified={handleSMSVerified}
                onCancel={handleCancel}
              />
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>

      {recoveryCodes.length > 0 && (
        <RecoveryCodesModal
          open={showRecoveryCodes}
          onOpenChange={(open) => {
            setShowRecoveryCodes(open);
            if (!open) {
              onOpenChange(false);
              // Reset state
              setTotpSetupData(null);
              setRecoveryCodes([]);
            }
          }}
          recoveryCodes={recoveryCodes}
        />
      )}
    </>
  );
}
