import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Download, ArrowRight, FileText } from "lucide-react";
import { format } from "date-fns";
import { transactionsApi } from "@/lib/api";
import { toast } from "sonner";

interface CheckoutSuccessProps {
  transactionId: string;
  subscriptionId: string;
  onContinue: () => void;
}

export default function CheckoutSuccess({
  transactionId,
  subscriptionId,
  onContinue,
}: CheckoutSuccessProps) {
  const handleDownloadInvoice = async () => {
    try {
      await transactionsApi.downloadInvoice(transactionId);
      toast.success("Invoice downloaded successfully");
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to download invoice"
      );
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-background-primary">
      <div className="max-w-2xl w-full space-y-6 animate-fade-in-up">
        {/* Success Header */}
        <Card className="card-base text-center">
          <CardContent className="pt-12 pb-8">
            <div className="flex flex-col items-center space-y-4">
              <div className="h-20 w-20 rounded-full bg-success/10 flex items-center justify-center">
                <CheckCircle2 className="h-12 w-12 text-success" />
              </div>
              <div className="space-y-2">
                <h1 className="text-3xl font-bold text-foreground-primary">
                  Payment Successful!
                </h1>
                <p className="text-foreground-secondary">
                  Your subscription has been activated successfully
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Order Details */}
        <Card className="card-base">
          <CardHeader>
            <CardTitle>Order Details</CardTitle>
            <CardDescription>
              Your transaction has been processed
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-foreground-secondary mb-1">
                  Transaction ID
                </p>
                <p className="font-mono text-sm text-foreground-primary">
                  {transactionId.slice(0, 8)}...
                </p>
              </div>
              <div>
                <p className="text-sm text-foreground-secondary mb-1">
                  Subscription ID
                </p>
                <p className="font-mono text-sm text-foreground-primary">
                  {subscriptionId.slice(0, 8)}...
                </p>
              </div>
              <div>
                <p className="text-sm text-foreground-secondary mb-1">Date</p>
                <p className="text-sm text-foreground-primary">
                  {format(new Date(), "MMM dd, yyyy 'at' h:mm a")}
                </p>
              </div>
              <div>
                <p className="text-sm text-foreground-secondary mb-1">Status</p>
                <p className="text-sm font-medium text-success">Completed</p>
              </div>
            </div>

            <div className="pt-4 border-t border-border">
              <p className="text-sm text-foreground-secondary mb-2">
                A confirmation email has been sent to your registered email
                address with all the details.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Button
            variant="outline"
            onClick={handleDownloadInvoice}
            className="flex-1"
          >
            <Download className="h-4 w-4 mr-2" />
            Download Invoice
          </Button>
          <Button onClick={onContinue} className="flex-1">
            Continue to Dashboard
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </div>

        {/* Help Section */}
        <Card className="card-base">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <FileText className="h-5 w-5 text-foreground-secondary mt-0.5" />
              <div className="space-y-1">
                <p className="text-sm font-medium text-foreground-primary">
                  Need Help?
                </p>
                <p className="text-sm text-foreground-secondary">
                  If you have any questions about your subscription, please
                  contact our support team or visit the{" "}
                  <a
                    href="/help"
                    className="text-primary hover:underline"
                  >
                    Help Center
                  </a>
                  .
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
