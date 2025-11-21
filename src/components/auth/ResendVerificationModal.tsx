import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mail, Loader2 } from "lucide-react";
import { useResendVerification } from "@/hooks/use-auth";

const resendSchema = z.object({
  email: z.string().email("Invalid email address"),
});

type ResendForm = z.infer<typeof resendSchema>;

interface ResendVerificationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultEmail?: string;
}

export function ResendVerificationModal({
  open,
  onOpenChange,
  defaultEmail = "",
}: ResendVerificationModalProps) {
  const [emailSent, setEmailSent] = useState(false);
  const resendMutation = useResendVerification();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ResendForm>({
    resolver: zodResolver(resendSchema),
    defaultValues: {
      email: defaultEmail,
    },
  });

  const onSubmit = async (data: ResendForm) => {
    try {
      await resendMutation.mutateAsync(data.email);
      setEmailSent(true);
      reset();
    } catch (error) {
      // Error is handled by the mutation hook
    }
  };

  const handleClose = () => {
    if (!resendMutation.isPending) {
      setEmailSent(false);
      reset();
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5 text-primary" />
            Resend Verification Email
          </DialogTitle>
          <DialogDescription>
            {emailSent
              ? "A new verification email has been sent. Please check your inbox and spam folder."
              : "Enter your email address and we'll send you a new verification link."}
          </DialogDescription>
        </DialogHeader>

        {emailSent ? (
          <div className="py-6">
            <div className="flex flex-col items-center justify-center space-y-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-success/10">
                <Mail className="h-8 w-8 text-success" />
              </div>
              <div className="text-center space-y-2">
                <p className="text-sm font-medium text-foreground-primary">
                  Email sent successfully!
                </p>
                <p className="text-sm text-foreground-secondary">
                  Please check your inbox and click the verification link. The
                  email may take a few minutes to arrive.
                </p>
              </div>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                {...register("email")}
                disabled={resendMutation.isPending}
                className={errors.email ? "border-destructive" : ""}
              />
              {errors.email && (
                <p className="text-sm text-destructive">
                  {errors.email.message}
                </p>
              )}
            </div>

            <DialogFooter className="flex-col sm:flex-row gap-2 sm:gap-0">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={resendMutation.isPending}
                className="w-full sm:w-auto"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={resendMutation.isPending}
                className="w-full sm:w-auto transition-transform hover:scale-[1.02] active:scale-[0.98]"
              >
                {resendMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  "Send Verification Email"
                )}
              </Button>
            </DialogFooter>
          </form>
        )}

        {emailSent && (
          <DialogFooter>
            <Button onClick={handleClose} className="w-full sm:w-auto">
              Close
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}
