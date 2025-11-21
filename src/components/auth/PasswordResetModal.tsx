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
import { Mail } from "lucide-react";
import { useRequestPasswordReset } from "@/hooks/use-auth";

const passwordResetSchema = z.object({
  email: z.string().email("Invalid email address"),
});

type PasswordResetForm = z.infer<typeof passwordResetSchema>;

interface PasswordResetModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function PasswordResetModal({
  isOpen,
  onClose,
}: PasswordResetModalProps) {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const requestPasswordReset = useRequestPasswordReset();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<PasswordResetForm>({
    resolver: zodResolver(passwordResetSchema),
  });

  const onSubmit = async (data: PasswordResetForm) => {
    requestPasswordReset.mutate(data, {
      onSuccess: () => {
        setIsSubmitted(true);
        reset();
      },
      // Error is handled by the mutation hook (toast notification)
    });
  };

  const handleClose = () => {
    setIsSubmitted(false);
    reset();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md animate-scale-in">
        <DialogHeader>
          <DialogTitle className="text-foreground-primary">
            Reset Password
          </DialogTitle>
          <DialogDescription className="text-foreground-secondary">
            {isSubmitted
              ? "We've sent a password reset link to your email address. Please check your inbox and follow the instructions."
              : "Enter your email address and we'll send you a link to reset your password."}
          </DialogDescription>
        </DialogHeader>
        {!isSubmitted ? (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="reset-email" className="text-foreground-primary">
                Email
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-foreground-secondary" />
                <Input
                  id="reset-email"
                  type="email"
                  placeholder="you@example.com"
                  className="pl-10 border-input focus:border-primary focus:ring-primary transition-colors duration-200"
                  {...register("email")}
                />
              </div>
              {errors.email && (
                <p className="text-sm text-destructive">{errors.email.message}</p>
              )}
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                className="border-input hover:bg-muted/50 transition-all duration-200"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
                disabled={requestPasswordReset.isPending}
              >
                {requestPasswordReset.isPending
                  ? "Sending..."
                  : "Send Reset Link"}
              </Button>
            </DialogFooter>
          </form>
        ) : (
          <DialogFooter>
            <Button
              type="button"
              onClick={handleClose}
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
            >
              Close
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}
