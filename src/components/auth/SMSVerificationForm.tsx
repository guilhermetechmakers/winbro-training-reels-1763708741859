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
import { Phone, AlertCircle } from "lucide-react";
import { useSendSMSOTP, useVerifySMSOTP } from "@/hooks/use-2fa";
import { toast } from "sonner";

const phoneSchema = z.object({
  phone_number: z.string().regex(/^\+?[1-9]\d{1,14}$/, "Invalid phone number format"),
});

const verifyCodeSchema = z.object({
  code: z.string().length(6, "Code must be 6 digits"),
});

type PhoneForm = z.infer<typeof phoneSchema>;
type VerifyCodeForm = z.infer<typeof verifyCodeSchema>;

interface SMSVerificationFormProps {
  onVerified: (recoveryCodes: string[]) => void;
  onCancel: () => void;
}

export function SMSVerificationForm({ onVerified, onCancel }: SMSVerificationFormProps) {
  const [step, setStep] = useState<"phone" | "verify">("phone");
  const [phoneNumber, setPhoneNumber] = useState("");
  const sendOTPMutation = useSendSMSOTP();
  const verifyMutation = useVerifySMSOTP();

  const phoneForm = useForm<PhoneForm>({
    resolver: zodResolver(phoneSchema),
  });

  const codeForm = useForm<VerifyCodeForm>({
    resolver: zodResolver(verifyCodeSchema),
    defaultValues: { code: "" },
  });

  const code = codeForm.watch("code");

  const onPhoneSubmit = async (data: PhoneForm) => {
    sendOTPMutation.mutate(data, {
      onSuccess: () => {
        setPhoneNumber(data.phone_number);
        setStep("verify");
      },
    });
  };

  const onCodeSubmit = async (data: VerifyCodeForm) => {
    verifyMutation.mutate(
      { phone_number: phoneNumber, code: data.code },
      {
        onSuccess: (result) => {
          if (result.verified) {
            onVerified(result.recovery_codes);
          }
        },
      }
    );
  };

  const handleResend = () => {
    sendOTPMutation.mutate(
      { phone_number: phoneNumber },
      {
        onSuccess: () => {
          toast.success("New code sent to your phone");
        },
      }
    );
  };

  if (step === "phone") {
    return (
      <Card className="animate-fade-in-up">
        <CardHeader>
          <CardTitle>Set up SMS Authentication</CardTitle>
          <CardDescription>
            Enter your phone number to receive verification codes via SMS.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={phoneForm.handleSubmit(onPhoneSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="phone_number">Phone Number</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-foreground-secondary" />
                <Input
                  id="phone_number"
                  type="tel"
                  placeholder="+1234567890"
                  className="pl-10"
                  {...phoneForm.register("phone_number")}
                />
              </div>
              {phoneForm.formState.errors.phone_number && (
                <p className="text-sm text-red-500">
                  {phoneForm.formState.errors.phone_number.message}
                </p>
              )}
              <p className="text-xs text-foreground-secondary">
                Include country code (e.g., +1 for US)
              </p>
            </div>

            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="text-sm">
                Standard messaging rates may apply. Codes expire after 5 minutes.
              </AlertDescription>
            </Alert>

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
                disabled={sendOTPMutation.isPending}
                className="flex-1"
              >
                {sendOTPMutation.isPending ? "Sending..." : "Send Code"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="animate-fade-in-up">
      <CardHeader>
        <CardTitle>Verify Phone Number</CardTitle>
        <CardDescription>
          Enter the 6-digit code sent to {phoneNumber}
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
              <p className="text-sm text-red-500">
                {verifyMutation.error instanceof Error
                  ? verifyMutation.error.message
                  : "Invalid code. Please try again."}
              </p>
            )}
          </div>

          <div className="text-center">
            <Button
              type="button"
              variant="link"
              onClick={handleResend}
              disabled={sendOTPMutation.isPending}
              className="text-sm"
            >
              Didn't receive a code? Resend
            </Button>
          </div>

          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => setStep("phone")}
              className="flex-1"
            >
              Back
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
  );
}
