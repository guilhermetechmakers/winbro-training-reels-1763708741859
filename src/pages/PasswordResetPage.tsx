import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Mail, Lock, CheckCircle2, AlertCircle, ArrowLeft, HelpCircle, Shield, Eye, EyeOff } from "lucide-react";
import { useRequestPasswordReset, useResetPassword } from "@/hooks/use-auth";
import { PasswordStrengthMeter } from "@/components/auth/PasswordStrengthMeter";
import { cn } from "@/lib/utils";

const requestResetSchema = z.object({
  email: z.string().email("Invalid email address"),
});

const resetPasswordSchema = z.object({
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type RequestResetForm = z.infer<typeof requestResetSchema>;
type ResetPasswordForm = z.infer<typeof resetPasswordSchema>;

export default function PasswordResetPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const [isRequested, setIsRequested] = useState(false);
  const [rateLimitError, setRateLimitError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const requestResetMutation = useRequestPasswordReset();
  const resetPasswordMutation = useResetPassword();

  // Clear rate limit error after 5 seconds
  useEffect(() => {
    if (rateLimitError) {
      const timer = setTimeout(() => setRateLimitError(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [rateLimitError]);

  // Handle reset password form (when token is present)
  if (token) {
    const {
      register,
      handleSubmit,
      watch,
      formState: { errors },
    } = useForm<ResetPasswordForm>({
      resolver: zodResolver(resetPasswordSchema),
    });

    const password = watch("password", "");

    const onSubmit = async (data: ResetPasswordForm) => {
      try {
        await resetPasswordMutation.mutateAsync({
          token,
          password: data.password,
          confirm_password: data.confirmPassword,
        });
        setIsRequested(true);
      } catch (error: any) {
        // Handle specific error cases
        if (error.message?.includes("expired") || error.message?.includes("invalid")) {
          setRateLimitError("This password reset link has expired or is invalid. Please request a new one.");
        } else if (error.message?.includes("rate limit") || error.message?.includes("too many")) {
          setRateLimitError("Too many reset attempts. Please wait a few minutes before trying again.");
        }
      }
    };

    // Success state
    if (isRequested || resetPasswordMutation.isSuccess) {
      return (
        <div className="min-h-screen bg-background-primary flex flex-col">
          {/* Header */}
          <header className="w-full border-b border-border bg-card">
            <div className="container mx-auto px-4 py-4">
              <Link 
                to="/" 
                className="inline-flex items-center gap-2 text-foreground-secondary hover:text-foreground-primary transition-colors duration-200"
              >
                <ArrowLeft className="h-4 w-4" />
                <span className="text-sm font-medium">Back to home</span>
              </Link>
            </div>
          </header>

          {/* Main content */}
          <main className="flex-1 flex items-center justify-center p-4">
            <Card className="w-full max-w-md animate-fade-in-up shadow-card">
              <CardHeader className="space-y-1 text-center">
                <div className="flex justify-center mb-4">
                  <div className="relative">
                    <div className="absolute inset-0 bg-success/20 rounded-full blur-xl animate-pulse" />
                    <CheckCircle2 className="h-16 w-16 text-success relative z-10" />
                  </div>
                </div>
                <CardTitle className="text-2xl font-bold text-foreground-primary">
                  Password Reset Successful!
                </CardTitle>
                <CardDescription className="text-foreground-secondary">
                  Your password has been successfully reset. You can now sign in with your new password.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Link to="/login">
                  <Button 
                    className="w-full bg-primary hover:bg-primary/90 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
                  >
                    Sign in
                  </Button>
                </Link>
                <div className="text-center">
                  <Link 
                    to="/help" 
                    className="text-sm text-primary hover:underline inline-flex items-center gap-1"
                  >
                    <HelpCircle className="h-4 w-4" />
                    Need help?
                  </Link>
                </div>
              </CardContent>
            </Card>
          </main>

          {/* Footer */}
          <footer className="w-full border-t border-border bg-card py-6">
            <div className="container mx-auto px-4">
              <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-foreground-secondary">
                <div className="flex gap-4">
                  <Link to="/privacy" className="hover:text-foreground-primary transition-colors">
                    Privacy Policy
                  </Link>
                  <Link to="/terms" className="hover:text-foreground-primary transition-colors">
                    Terms of Service
                  </Link>
                </div>
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  <span>Secure password reset</span>
                </div>
              </div>
            </div>
          </footer>
        </div>
      );
    }

    // Reset password form
    return (
      <div className="min-h-screen bg-background-primary flex flex-col">
        {/* Header */}
        <header className="w-full border-b border-border bg-card">
          <div className="container mx-auto px-4 py-4">
            <Link 
              to="/login" 
              className="inline-flex items-center gap-2 text-foreground-secondary hover:text-foreground-primary transition-colors duration-200"
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="text-sm font-medium">Back to login</span>
            </Link>
          </div>
        </header>

        {/* Main content */}
        <main className="flex-1 flex items-center justify-center p-4 py-8">
          <Card className="w-full max-w-md animate-fade-in-up shadow-card">
            <CardHeader className="space-y-1">
              <CardTitle className="text-2xl font-bold text-center text-foreground-primary">
                Reset your password
              </CardTitle>
              <CardDescription className="text-center text-foreground-secondary">
                Enter your new password below. Make sure it's strong and secure.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {rateLimitError && (
                <Alert variant="destructive" className="mb-4 animate-fade-in-down">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{rateLimitError}</AlertDescription>
                </Alert>
              )}

              {resetPasswordMutation.isError && !rateLimitError && (
                <Alert variant="destructive" className="mb-4 animate-fade-in-down">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    {resetPasswordMutation.error instanceof Error
                      ? resetPasswordMutation.error.message
                      : "Failed to reset password. Please try again."}
                  </AlertDescription>
                </Alert>
              )}

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-foreground-primary">
                    New Password
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-foreground-secondary pointer-events-none" />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your new password"
                      className={cn(
                        "pl-10 pr-10 border-input focus:border-primary focus:ring-primary transition-all duration-200",
                        errors.password && "border-destructive focus:border-destructive focus:ring-destructive"
                      )}
                      {...register("password")}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-foreground-secondary hover:text-foreground-primary transition-colors"
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="text-sm text-destructive animate-fade-in-down">
                      {errors.password.message}
                    </p>
                  )}
                </div>

                {/* Password strength meter */}
                {password && (
                  <div className="animate-fade-in-up">
                    <PasswordStrengthMeter password={password} />
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-foreground-primary">
                    Confirm Password
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-foreground-secondary pointer-events-none" />
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Confirm your new password"
                      className={cn(
                        "pl-10 pr-10 border-input focus:border-primary focus:ring-primary transition-all duration-200",
                        errors.confirmPassword && "border-destructive focus:border-destructive focus:ring-destructive"
                      )}
                      {...register("confirmPassword")}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-foreground-secondary hover:text-foreground-primary transition-colors"
                      aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                  {errors.confirmPassword && (
                    <p className="text-sm text-destructive animate-fade-in-down">
                      {errors.confirmPassword.message}
                    </p>
                  )}
                </div>

                <Button 
                  type="submit" 
                  className="w-full bg-primary hover:bg-primary/90 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]" 
                  disabled={resetPasswordMutation.isPending}
                >
                  {resetPasswordMutation.isPending ? (
                    <span className="flex items-center gap-2">
                      <span className="animate-spin">⏳</span>
                      Resetting password...
                    </span>
                  ) : (
                    "Reset password"
                  )}
                </Button>
              </form>

              <div className="mt-4 text-center">
                <Link 
                  to="/login" 
                  className="text-sm text-primary hover:underline inline-flex items-center gap-1 transition-colors"
                >
                  <ArrowLeft className="h-3 w-3" />
                  Back to login
                </Link>
              </div>
            </CardContent>
          </Card>
        </main>

        {/* Footer */}
        <footer className="w-full border-t border-border bg-card py-6">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-foreground-secondary">
              <div className="flex gap-4">
                <Link to="/privacy" className="hover:text-foreground-primary transition-colors">
                  Privacy Policy
                </Link>
                <Link to="/terms" className="hover:text-foreground-primary transition-colors">
                  Terms of Service
                </Link>
              </div>
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4" />
                <span>Secure password reset</span>
              </div>
            </div>
          </div>
        </footer>
      </div>
    );
  }

  // Request reset form (no token)
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RequestResetForm>({
    resolver: zodResolver(requestResetSchema),
  });

  const onSubmit = async (data: RequestResetForm) => {
    try {
      await requestResetMutation.mutateAsync({ email: data.email });
      setIsRequested(true);
      setRateLimitError(null);
    } catch (error: any) {
      // Handle rate limiting
      if (error.message?.includes("rate limit") || error.message?.includes("too many")) {
        setRateLimitError("Too many reset requests. Please wait a few minutes before trying again.");
      } else if (error.message?.includes("not found") || error.message?.includes("doesn't exist")) {
        // Don't reveal if email exists for security, but show generic error
        setRateLimitError("If an account exists with this email, a reset link has been sent.");
      }
    }
  };

  // Success state for request
  if (isRequested) {
    return (
      <div className="min-h-screen bg-background-primary flex flex-col">
        {/* Header */}
        <header className="w-full border-b border-border bg-card">
          <div className="container mx-auto px-4 py-4">
            <Link 
              to="/login" 
              className="inline-flex items-center gap-2 text-foreground-secondary hover:text-foreground-primary transition-colors duration-200"
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="text-sm font-medium">Back to login</span>
            </Link>
          </div>
        </header>

        {/* Main content */}
        <main className="flex-1 flex items-center justify-center p-4">
          <Card className="w-full max-w-md animate-fade-in-up shadow-card">
            <CardHeader className="space-y-1 text-center">
              <div className="flex justify-center mb-4">
                <div className="relative">
                  <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl animate-pulse" />
                  <Mail className="h-16 w-16 text-primary relative z-10" />
                </div>
              </div>
              <CardTitle className="text-2xl font-bold text-foreground-primary">
                Check your email
              </CardTitle>
              <CardDescription className="text-foreground-secondary">
                We've sent a password reset link to your email address. Please check your inbox and follow the instructions.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert className="bg-blue-50 border-blue-200">
                <AlertCircle className="h-4 w-4 text-blue-600" />
                <AlertDescription className="text-blue-800">
                  <strong>Didn't receive the email?</strong> Check your spam folder or wait a few minutes. The link will expire in 1 hour.
                </AlertDescription>
              </Alert>
              
              <Link to="/login">
                <Button 
                  variant="outline" 
                  className="w-full border-input hover:bg-muted/50 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
                >
                  Back to login
                </Button>
              </Link>

              <div className="text-center">
                <Link 
                  to="/help" 
                  className="text-sm text-primary hover:underline inline-flex items-center gap-1"
                >
                  <HelpCircle className="h-4 w-4" />
                  Need help?
                </Link>
              </div>
            </CardContent>
          </Card>
        </main>

        {/* Footer */}
        <footer className="w-full border-t border-border bg-card py-6">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-foreground-secondary">
              <div className="flex gap-4">
                <Link to="/privacy" className="hover:text-foreground-primary transition-colors">
                  Privacy Policy
                </Link>
                <Link to="/terms" className="hover:text-foreground-primary transition-colors">
                  Terms of Service
                </Link>
              </div>
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4" />
                <span>Secure password reset</span>
              </div>
            </div>
          </div>
        </footer>
      </div>
    );
  }

  // Request reset form
  return (
    <div className="min-h-screen bg-background-primary flex flex-col">
      {/* Header */}
      <header className="w-full border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4">
          <Link 
            to="/login" 
            className="inline-flex items-center gap-2 text-foreground-secondary hover:text-foreground-primary transition-colors duration-200"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="text-sm font-medium">Back to login</span>
          </Link>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 flex items-center justify-center p-4 py-8">
        <Card className="w-full max-w-md animate-fade-in-up shadow-card">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center text-foreground-primary">
              Reset password
            </CardTitle>
            <CardDescription className="text-center text-foreground-secondary">
              Enter your email address and we'll send you a link to reset your password.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {rateLimitError && (
              <Alert variant="destructive" className="mb-4 animate-fade-in-down">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{rateLimitError}</AlertDescription>
              </Alert>
            )}

            {requestResetMutation.isError && !rateLimitError && (
              <Alert variant="destructive" className="mb-4 animate-fade-in-down">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  {requestResetMutation.error instanceof Error
                    ? requestResetMutation.error.message
                    : "Failed to send reset email. Please try again."}
                </AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-foreground-primary">
                  Email
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-foreground-secondary pointer-events-none" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    className={cn(
                      "pl-10 border-input focus:border-primary focus:ring-primary transition-all duration-200",
                      errors.email && "border-destructive focus:border-destructive focus:ring-destructive"
                    )}
                    {...register("email")}
                  />
                </div>
                {errors.email && (
                  <p className="text-sm text-destructive animate-fade-in-down">
                    {errors.email.message}
                  </p>
                )}
              </div>

              <Button 
                type="submit" 
                className="w-full bg-primary hover:bg-primary/90 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]" 
                disabled={requestResetMutation.isPending}
              >
                {requestResetMutation.isPending ? (
                  <span className="flex items-center gap-2">
                    <span className="animate-spin">⏳</span>
                    Sending reset link...
                  </span>
                ) : (
                  "Send reset link"
                )}
              </Button>
            </form>

            <div className="mt-4 text-center space-y-2">
              <Link 
                to="/login" 
                className="text-sm text-primary hover:underline inline-flex items-center gap-1 transition-colors"
              >
                <ArrowLeft className="h-3 w-3" />
                Back to login
              </Link>
              <div className="text-xs text-foreground-secondary">
                <Link to="/help" className="hover:text-primary transition-colors">
                  Need help? Contact support
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-border bg-card py-6">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-foreground-secondary">
            <div className="flex gap-4">
              <Link to="/privacy" className="hover:text-foreground-primary transition-colors">
                Privacy Policy
              </Link>
              <Link to="/terms" className="hover:text-foreground-primary transition-colors">
                Terms of Service
              </Link>
            </div>
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              <span>Secure password reset</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
