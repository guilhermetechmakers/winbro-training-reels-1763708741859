import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  AlertCircle,
  RefreshCw,
  Home,
  HelpCircle,
  ArrowRight,
  CheckCircle2,
  Copy,
  ExternalLink,
} from "lucide-react";
import { errorReportApi } from "@/lib/api";
import { cn } from "@/lib/utils";

// Generate a unique Request ID
function generateRequestId(): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 9);
  return `ERR-${timestamp}-${random}`.toUpperCase();
}

// Form validation schema
const supportFormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  description: z.string().min(10, "Please provide more details about the error (at least 10 characters)"),
});

type SupportFormData = z.infer<typeof supportFormSchema>;

export default function ErrorPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [requestId] = useState<string>(() => generateRequestId());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [copied, setCopied] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<SupportFormData>({
    resolver: zodResolver(supportFormSchema),
  });

  // Log error details on mount
  useEffect(() => {
    // In a real app, you would send this to your error logging service
    console.error("500 Server Error", {
      requestId,
      path: location.pathname,
      timestamp: new Date().toISOString(),
    });
  }, [requestId, location.pathname]);

  const handleRetry = () => {
    // Try to go back, or reload the page
    if (window.history.length > 1) {
      window.history.back();
    } else {
      window.location.reload();
    }
  };

  const handleCopyRequestId = async () => {
    try {
      await navigator.clipboard.writeText(requestId);
      setCopied(true);
      toast.success("Request ID copied to clipboard");
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast.error("Failed to copy Request ID");
    }
  };

  const onSubmit = async (data: SupportFormData) => {
    setIsSubmitting(true);
    try {
      await errorReportApi.submitErrorReport({
        request_id: requestId,
        user_email: data.email,
        user_name: data.name,
        error_description: data.description,
        user_agent: navigator.userAgent,
        url: window.location.href,
      });

      setIsSubmitted(true);
      reset();
      toast.success("Error report submitted successfully. Our team will review it shortly.");
    } catch (error) {
      console.error("Failed to submit error report:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to submit error report. Please try again or contact support directly."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background-primary flex items-center justify-center p-4 md:p-8">
      <div className="w-full max-w-4xl space-y-6">
        {/* Main Error Card */}
        <Card className="w-full animate-fade-in-up shadow-card">
          <CardHeader className="text-center pb-4">
            <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-red-50 mb-6 animate-scale-in">
              <AlertCircle className="h-12 w-12 text-red-500" />
            </div>
            <div className="text-7xl md:text-8xl font-bold text-red-500 mb-4 tracking-tight">
              500
            </div>
            <CardTitle className="text-3xl md:text-4xl font-bold text-foreground-primary mb-3">
              Server Error
            </CardTitle>
            <CardDescription className="text-base md:text-lg max-w-2xl mx-auto">
              We're sorry, but something went wrong on our end. Our team has been notified and is working to fix the issue.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Request ID Section */}
            <div className="bg-muted/30 rounded-lg p-4 border border-border">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex-1">
                  <Label className="text-sm font-medium text-foreground-secondary mb-1 block">
                    Request ID (for troubleshooting)
                  </Label>
                  <div className="flex items-center gap-2">
                    <code className="text-sm font-mono text-foreground-primary bg-card px-3 py-1.5 rounded border border-border">
                      {requestId}
                    </code>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={handleCopyRequestId}
                      className="h-8 w-8 p-0 hover:bg-muted"
                      aria-label="Copy Request ID"
                    >
                      {copied ? (
                        <CheckCircle2 className="h-4 w-4 text-success" />
                      ) : (
                        <Copy className="h-4 w-4 text-foreground-secondary" />
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* Retry Button */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button
                onClick={handleRetry}
                className="w-full sm:w-auto min-w-[160px] flex items-center justify-center gap-2 bg-primary text-primary-foreground hover:bg-primary/90 hover:scale-[1.02] transition-all duration-200"
              >
                <RefreshCw className="h-4 w-4" />
                Retry
              </Button>
              <Button
                onClick={() => navigate("/")}
                variant="outline"
                className="w-full sm:w-auto min-w-[160px] flex items-center justify-center gap-2 hover:bg-muted/50 hover:scale-[1.02] transition-all duration-200"
              >
                <Home className="h-4 w-4" />
                Go Home
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Contact Support Form Card */}
        {!isSubmitted ? (
          <Card className="animate-fade-in-up shadow-card" style={{ animationDelay: '0.2s' }}>
            <CardHeader>
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                  <HelpCircle className="h-6 w-6 text-primary" />
                </div>
                <div className="flex-1">
                  <CardTitle className="text-xl font-semibold text-foreground-primary mb-1">
                    Report This Error
                  </CardTitle>
                  <CardDescription>
                    Help us improve by providing details about what happened. Our support team will review your report and get back to you if needed.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">
                    Your Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="name"
                    type="text"
                    placeholder="Enter your name"
                    {...register("name")}
                    className={cn(
                      "w-full",
                      errors.name && "border-red-500 focus-visible:ring-red-500"
                    )}
                    aria-invalid={errors.name ? "true" : "false"}
                    aria-describedby={errors.name ? "name-error" : undefined}
                  />
                  {errors.name && (
                    <p id="name-error" className="text-sm text-red-500" role="alert">
                      {errors.name.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">
                    Email Address <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="your.email@example.com"
                    {...register("email")}
                    className={cn(
                      "w-full",
                      errors.email && "border-red-500 focus-visible:ring-red-500"
                    )}
                    aria-invalid={errors.email ? "true" : "false"}
                    aria-describedby={errors.email ? "email-error" : undefined}
                  />
                  {errors.email && (
                    <p id="email-error" className="text-sm text-red-500" role="alert">
                      {errors.email.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">
                    Error Description <span className="text-red-500">*</span>
                  </Label>
                  <Textarea
                    id="description"
                    placeholder="Please describe what you were doing when this error occurred. Include any steps that led to the issue..."
                    rows={5}
                    {...register("description")}
                    className={cn(
                      "w-full resize-none",
                      errors.description && "border-red-500 focus-visible:ring-red-500"
                    )}
                    aria-invalid={errors.description ? "true" : "false"}
                    aria-describedby={errors.description ? "description-error" : undefined}
                  />
                  {errors.description && (
                    <p id="description-error" className="text-sm text-red-500" role="alert">
                      {errors.description.message}
                    </p>
                  )}
                  <p className="text-xs text-foreground-secondary">
                    Request ID: <code className="font-mono">{requestId}</code> (automatically included)
                  </p>
                </div>

                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full sm:w-auto sm:ml-auto sm:flex sm:items-center sm:justify-center sm:gap-2 bg-primary text-primary-foreground hover:bg-primary/90 hover:scale-[1.02] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                >
                  {isSubmitting ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      Submit Report
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        ) : (
          <Card className="animate-fade-in-up shadow-card border-success/20 bg-success/5" style={{ animationDelay: '0.2s' }}>
            <CardContent className="pt-6">
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-success/20 animate-scale-in">
                  <CheckCircle2 className="h-8 w-8 text-success" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-foreground-primary mb-1">
                    Report Submitted Successfully
                  </h3>
                  <p className="text-sm text-foreground-secondary max-w-md">
                    Thank you for reporting this error. Our team has been notified and will review your report. 
                    We'll contact you at the email address you provided if we need additional information.
                  </p>
                </div>
                <div className="pt-2">
                  <Button
                    onClick={() => {
                      setIsSubmitted(false);
                      handleRetry();
                    }}
                    variant="outline"
                    className="flex items-center justify-center gap-2 hover:bg-muted/50 hover:scale-[1.02] transition-all duration-200"
                  >
                    <RefreshCw className="h-4 w-4" />
                    Try Again
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Help Links */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
          <Button
            onClick={() => navigate("/help")}
            variant="outline"
            className="w-full p-4 rounded-lg bg-card border border-border hover:shadow-card-hover hover:-translate-y-0.5 transition-all duration-200 flex items-center justify-center gap-2 group"
          >
            <HelpCircle className="h-5 w-5 text-foreground-secondary group-hover:text-primary transition-colors" />
            <span className="text-sm font-medium text-foreground-primary group-hover:text-primary transition-colors">
              Help Center
            </span>
            <ExternalLink className="h-4 w-4 text-foreground-secondary group-hover:text-primary transition-colors" />
          </Button>
          <Button
            onClick={() => navigate("/dashboard")}
            variant="outline"
            className="w-full p-4 rounded-lg bg-card border border-border hover:shadow-card-hover hover:-translate-y-0.5 transition-all duration-200 flex items-center justify-center gap-2 group"
          >
            <Home className="h-5 w-5 text-foreground-secondary group-hover:text-primary transition-colors" />
            <span className="text-sm font-medium text-foreground-primary group-hover:text-primary transition-colors">
              Dashboard
            </span>
          </Button>
          <Button
            onClick={() => navigate("/")}
            variant="outline"
            className="w-full p-4 rounded-lg bg-card border border-border hover:shadow-card-hover hover:-translate-y-0.5 transition-all duration-200 flex items-center justify-center gap-2 group"
          >
            <Home className="h-5 w-5 text-foreground-secondary group-hover:text-primary transition-colors" />
            <span className="text-sm font-medium text-foreground-primary group-hover:text-primary transition-colors">
              Home Page
            </span>
          </Button>
        </div>

        {/* Footer with Request ID */}
        <div className="text-center pt-4 border-t border-border animate-fade-in-up" style={{ animationDelay: '0.6s' }}>
          <p className="text-xs text-foreground-secondary">
            If you need immediate assistance, please contact support with your Request ID:{" "}
            <code className="font-mono text-foreground-primary bg-muted/30 px-2 py-0.5 rounded">
              {requestId}
            </code>
          </p>
        </div>
      </div>
    </div>
  );
}
