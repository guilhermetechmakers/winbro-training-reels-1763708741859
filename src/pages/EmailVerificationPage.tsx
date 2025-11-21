import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Mail,
  CheckCircle2,
  XCircle,
  Loader2,
  AlertCircle,
  User,
  ArrowRight,
} from "lucide-react";
import { useVerifyEmail } from "@/hooks/use-auth";
import { ResendVerificationModal } from "@/components/auth/ResendVerificationModal";
import { tokenManager } from "@/lib/api";

export default function EmailVerificationPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const [isResendModalOpen, setIsResendModalOpen] = useState(false);
  const [userEmail, setUserEmail] = useState<string>("");
  const verifyMutation = useVerifyEmail();

  // Get user email from localStorage if available
  useEffect(() => {
    const user = tokenManager.getUser();
    if (user?.email) {
      setUserEmail(user.email);
    }
  }, []);

  // Auto-verify if token is present
  useEffect(() => {
    if (token && !verifyMutation.isPending && !verifyMutation.isSuccess && !verifyMutation.isError) {
      verifyMutation.mutate(token);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const isVerified = verifyMutation.isSuccess && verifyMutation.data?.verified;
  const hasError = verifyMutation.isError || (verifyMutation.isSuccess && !verifyMutation.data?.verified);
  const isLoading = verifyMutation.isPending && !!token;

  // Success state - Email verified
  if (isVerified) {
    return (
      <div className="min-h-screen bg-background-primary flex items-center justify-center p-4">
        <Card className="w-full max-w-md animate-fade-in-up shadow-card">
          <CardHeader className="space-y-4 text-center pb-6">
            <div className="flex justify-center mb-2">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-success/10 animate-scale-in">
                <CheckCircle2 className="h-10 w-10 text-success" />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold text-foreground-primary">
              Email Verified!
            </CardTitle>
            <CardDescription className="text-base text-foreground-secondary">
              Your email has been successfully verified. You can now access your
              account and start using all features.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                onClick={() => navigate("/settings")}
                variant="outline"
                className="flex-1 group transition-transform hover:scale-[1.02] active:scale-[0.98]"
              >
                <User className="mr-2 h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
                Complete Profile
              </Button>
              <Button
                onClick={() => navigate("/dashboard")}
                className="flex-1 group transition-transform hover:scale-[1.02] active:scale-[0.98]"
              >
                Go to Dashboard
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
              </Button>
            </div>
            <div className="text-center pt-2">
              <Link
                to="/dashboard"
                className="text-sm text-primary hover:underline transition-colors"
              >
                Skip for now
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Error state - Verification failed
  if (hasError && !isLoading) {
    const errorMessage =
      verifyMutation.error?.message ||
      verifyMutation.data?.message ||
      "The verification link is invalid or has expired.";

    return (
      <div className="min-h-screen bg-background-primary flex items-center justify-center p-4">
        <Card className="w-full max-w-md animate-fade-in-up shadow-card">
          <CardHeader className="space-y-4 text-center pb-6">
            <div className="flex justify-center mb-2">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-destructive/10 animate-scale-in">
                <XCircle className="h-10 w-10 text-destructive" />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold text-foreground-primary">
              Verification Failed
            </CardTitle>
            <CardDescription className="text-base text-foreground-secondary">
              {errorMessage}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-lg bg-muted/50 p-4 space-y-2">
              <div className="flex items-start gap-2">
                <AlertCircle className="h-5 w-5 text-foreground-secondary mt-0.5 flex-shrink-0" />
                <div className="text-sm text-foreground-secondary space-y-1">
                  <p className="font-medium">What you can do:</p>
                  <ul className="list-disc list-inside space-y-1 ml-2">
                    <li>Request a new verification email</li>
                    <li>Check your spam or junk folder</li>
                    <li>Make sure you're using the latest link</li>
                  </ul>
                </div>
              </div>
            </div>

            <Button
              onClick={() => setIsResendModalOpen(true)}
              className="w-full transition-transform hover:scale-[1.02] active:scale-[0.98]"
            >
              <Mail className="mr-2 h-4 w-4" />
              Resend Verification Email
            </Button>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <Button
                onClick={() => navigate("/login")}
                variant="outline"
                className="flex-1"
              >
                Back to Login
              </Button>
              <Button
                onClick={() => navigate("/signup")}
                variant="ghost"
                className="flex-1"
              >
                Create New Account
              </Button>
            </div>
          </CardContent>
        </Card>

        <ResendVerificationModal
          open={isResendModalOpen}
          onOpenChange={setIsResendModalOpen}
          defaultEmail={userEmail}
        />
      </div>
    );
  }

  // Loading state - Verifying token
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background-primary flex items-center justify-center p-4">
        <Card className="w-full max-w-md animate-fade-in-up shadow-card">
          <CardHeader className="space-y-4 text-center pb-6">
            <div className="flex justify-center mb-2">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
                <Loader2 className="h-10 w-10 text-primary animate-spin" />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold text-foreground-primary">
              Verifying Email...
            </CardTitle>
            <CardDescription className="text-base text-foreground-secondary">
              Please wait while we verify your email address.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  // Default state - Waiting for verification
  return (
    <div className="min-h-screen bg-background-primary flex items-center justify-center p-4">
      <Card className="w-full max-w-md animate-fade-in-up shadow-card">
        <CardHeader className="space-y-4 text-center pb-6">
          <div className="flex justify-center mb-2">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
              <Mail className="h-10 w-10 text-primary" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-foreground-primary">
            Verify Your Email
          </CardTitle>
          <CardDescription className="text-base text-foreground-secondary">
            We've sent a verification link to your email address. Please check
            your inbox and click the link to verify your account.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="rounded-lg bg-muted/50 p-4 space-y-3">
            <div className="flex items-start gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 flex-shrink-0">
                <Mail className="h-4 w-4 text-primary" />
              </div>
              <div className="text-sm text-foreground-secondary space-y-2">
                <p className="font-medium text-foreground-primary">
                  Check your email
                </p>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li>Look for an email from Winbro Training Reels</li>
                  <li>Click the verification link in the email</li>
                  <li>Check your spam or junk folder if you don't see it</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <Button
              onClick={() => setIsResendModalOpen(true)}
              variant="outline"
              className="w-full transition-transform hover:scale-[1.02] active:scale-[0.98]"
            >
              <Mail className="mr-2 h-4 w-4" />
              Resend Verification Email
            </Button>

            <div className="text-center pt-2">
              <Link
                to="/login"
                className="text-sm text-primary hover:underline transition-colors"
              >
                Back to login
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>

      <ResendVerificationModal
        open={isResendModalOpen}
        onOpenChange={setIsResendModalOpen}
        defaultEmail={userEmail}
      />
    </div>
  );
}
