import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Shield, AlertCircle, Key } from "lucide-react";
import { useVerify2FACode } from "@/hooks/use-2fa";
import { toast } from "sonner";

const codeSchema = z.object({
  code: z.string().length(6, "Code must be 6 digits"),
});

const recoveryCodeSchema = z.object({
  recovery_code: z.string().min(8, "Recovery code must be at least 8 characters"),
});

type CodeForm = z.infer<typeof codeSchema>;
type RecoveryCodeForm = z.infer<typeof recoveryCodeSchema>;

interface TwoFactorAuthPromptProps {
  method: "totp" | "sms";
  phoneNumber?: string;
  onVerified: (code?: string, recoveryCode?: string) => void;
  onUseRecoveryCode: () => void;
}

export function TwoFactorAuthPrompt({
  method,
  phoneNumber,
  onVerified,
}: TwoFactorAuthPromptProps) {
  const [useRecoveryCode, setUseRecoveryCode] = useState(false);
  const verifyMutation = useVerify2FACode();

  const codeForm = useForm<CodeForm>({
    resolver: zodResolver(codeSchema),
    defaultValues: { code: "" },
  });

  const recoveryForm = useForm<RecoveryCodeForm>({
    resolver: zodResolver(recoveryCodeSchema),
    defaultValues: { recovery_code: "" },
  });

  const code = codeForm.watch("code");
  const recoveryCode = recoveryForm.watch("recovery_code");

  const onCodeSubmit = async (data: CodeForm) => {
    verifyMutation.mutate(
      { code: data.code, method },
      {
        onSuccess: (result) => {
          if (result.verified) {
            onVerified(data.code);
          } else {
            toast.error(result.message || "Invalid code");
          }
        },
      }
    );
  };

  const onRecoverySubmit = async (data: RecoveryCodeForm) => {
    verifyMutation.mutate(
      { code: data.recovery_code },
      {
        onSuccess: (result) => {
          if (result.verified) {
            onVerified(undefined, data.recovery_code);
          } else {
            toast.error(result.message || "Invalid recovery code");
          }
        },
      }
    );
  };

  if (useRecoveryCode) {
    return (
      <Card className="w-full max-w-md animate-fade-in-up">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="h-5 w-5" />
            Enter Recovery Code
          </CardTitle>
          <CardDescription>
            Use one of your recovery codes to sign in.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={recoveryForm.handleSubmit(onRecoverySubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="recovery_code">Recovery Code</Label>
              <Input
                id="recovery_code"
                type="text"
                placeholder="Enter recovery code"
                className="font-mono"
                {...recoveryForm.register("recovery_code")}
              />
              {recoveryForm.formState.errors.recovery_code && (
                <p className="text-sm text-red-500">
                  {recoveryForm.formState.errors.recovery_code.message}
                </p>
              )}
            </div>

            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setUseRecoveryCode(false)}
                className="flex-1"
              >
                Back
              </Button>
              <Button
                type="submit"
                disabled={!recoveryCode || verifyMutation.isPending}
                className="flex-1"
              >
                {verifyMutation.isPending ? "Verifying..." : "Verify"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md animate-fade-in-up">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Two-Factor Authentication
        </CardTitle>
        <CardDescription>
          {method === "totp"
            ? "Enter the 6-digit code from your authenticator app"
            : `Enter the 6-digit code sent to ${phoneNumber || "your phone"}`}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={codeForm.handleSubmit(onCodeSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label>Verification Code</Label>
            <div className="flex justify-center">
              <InputOTP
                maxLength={6}
                value={code}
                onChange={(value) => codeForm.setValue("code", value)}
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
            {codeForm.formState.errors.code && (
              <p className="text-sm text-red-500">
                {codeForm.formState.errors.code.message}
              </p>
            )}
            {verifyMutation.isError && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  {verifyMutation.error instanceof Error
                    ? verifyMutation.error.message
                    : "Invalid code. Please try again."}
                </AlertDescription>
              </Alert>
            )}
          </div>

          <div className="text-center">
            <Button
              type="button"
              variant="link"
              onClick={() => setUseRecoveryCode(true)}
              className="text-sm"
            >
              Use a recovery code instead
            </Button>
          </div>

          <Button
            type="submit"
            disabled={!code || code.length !== 6 || verifyMutation.isPending}
            className="w-full"
          >
            {verifyMutation.isPending ? "Verifying..." : "Verify"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
