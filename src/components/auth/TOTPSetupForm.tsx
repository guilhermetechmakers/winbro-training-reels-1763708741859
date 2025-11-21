import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Copy, CheckCircle2, AlertCircle } from "lucide-react";
import { useVerifyTOTPSetup } from "@/hooks/use-2fa";
import type { TOTPSetupResponse } from "@/types";
import { toast } from "sonner";

const verifyCodeSchema = z.object({
  code: z.string().length(6, "Code must be 6 digits"),
});

type VerifyCodeForm = z.infer<typeof verifyCodeSchema>;

interface TOTPSetupFormProps {
  setupData: TOTPSetupResponse;
  onVerified: (recoveryCodes: string[]) => void;
  onCancel: () => void;
}

export function TOTPSetupForm({ setupData, onVerified, onCancel }: TOTPSetupFormProps) {
  const [copied, setCopied] = useState(false);
  const verifyMutation = useVerifyTOTPSetup();

  const {
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<VerifyCodeForm>({
    resolver: zodResolver(verifyCodeSchema),
    defaultValues: { code: "" },
  });

  const code = watch("code");

  const handleCopyKey = () => {
    navigator.clipboard.writeText(setupData.manual_entry_key);
    setCopied(true);
    toast.success("Manual entry key copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  };

  const onSubmit = async (data: VerifyCodeForm) => {
    verifyMutation.mutate(data.code, {
      onSuccess: (result) => {
        if (result.verified) {
          onVerified(result.recovery_codes);
        }
      },
    });
  };

  return (
    <div className="space-y-6 animate-fade-in-up">
      <Card>
        <CardHeader>
          <CardTitle>Set up Authenticator App</CardTitle>
          <CardDescription>
            Scan the QR code with your authenticator app, then enter the code to verify.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* QR Code */}
          <div className="flex justify-center">
            <div className="bg-white p-4 rounded-lg border border-border shadow-sm">
              <img
                src={setupData.qr_code_url}
                alt="TOTP QR Code"
                className="w-48 h-48"
              />
            </div>
          </div>

          {/* Manual Entry Key */}
          <div className="space-y-2">
            <Label>Can't scan? Enter this code manually:</Label>
            <div className="flex items-center gap-2">
              <Input
                value={setupData.manual_entry_key}
                readOnly
                className="font-mono text-sm"
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={handleCopyKey}
                className="shrink-0"
              >
                {copied ? (
                  <CheckCircle2 className="h-4 w-4 text-success" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>

          {/* Instructions */}
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <ol className="list-decimal list-inside space-y-1 text-sm">
                <li>Open your authenticator app (Google Authenticator, Authy, etc.)</li>
                <li>Scan the QR code or enter the manual key</li>
                <li>Enter the 6-digit code from your app below</li>
              </ol>
            </AlertDescription>
          </Alert>

          {/* Verification Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label>Enter verification code</Label>
              <div className="flex justify-center">
                <InputOTP
                  maxLength={6}
                  value={code}
                  onChange={(value) => setValue("code", value)}
                >
                  <InputOTPGroup>
                    <InputOTPSlot index={0} />
                    <InputOTPSlot index={1} />
                    <InputOTPSlot index={2} />
                    <InputOTPSlot index={3} />
                    <InputOTPSlot index={4} />
                    <InputOTPSlot index={5} />
                  </InputOTPGroup>
                </InputOTP>
              </div>
              {errors.code && (
                <p className="text-sm text-red-500">{errors.code.message}</p>
              )}
              {verifyMutation.isError && (
                <p className="text-sm text-red-500">
                  {verifyMutation.error instanceof Error
                    ? verifyMutation.error.message
                    : "Invalid code. Please try again."}
                </p>
              )}
            </div>

            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={!code || code.length !== 6 || verifyMutation.isPending}
                className="flex-1"
              >
                {verifyMutation.isPending ? "Verifying..." : "Verify & Enable"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
