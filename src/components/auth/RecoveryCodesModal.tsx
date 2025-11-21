import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Copy, CheckCircle2, AlertTriangle } from "lucide-react";
import { toast } from "sonner";

interface RecoveryCodesModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  recoveryCodes: string[];
}

export function RecoveryCodesModal({
  open,
  onOpenChange,
  recoveryCodes,
}: RecoveryCodesModalProps) {
  const [copied, setCopied] = useState(false);

  const handleCopyAll = () => {
    const codesText = recoveryCodes.join("\n");
    navigator.clipboard.writeText(codesText);
    setCopied(true);
    toast.success("Recovery codes copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const codesText = recoveryCodes.join("\n");
    const blob = new Blob([codesText], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "recovery-codes.txt";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success("Recovery codes downloaded");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Save Your Recovery Codes</DialogTitle>
          <DialogDescription>
            These codes can be used to access your account if you lose access to your
            2FA device. Store them in a safe place.
          </DialogDescription>
        </DialogHeader>

        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>Important:</strong> Each code can only be used once. If you lose
            these codes, you'll need to disable and re-enable 2FA to generate new ones.
          </AlertDescription>
        </Alert>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-2 p-4 bg-muted rounded-lg border border-border">
            {recoveryCodes.map((code, index) => (
              <div
                key={index}
                className="font-mono text-sm p-2 bg-background rounded border border-border text-center"
              >
                {code}
              </div>
            ))}
          </div>

          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleCopyAll}
              className="flex-1"
            >
              {copied ? (
                <>
                  <CheckCircle2 className="mr-2 h-4 w-4 text-success" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="mr-2 h-4 w-4" />
                  Copy All
                </>
              )}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={handleDownload}
              className="flex-1"
            >
              Download
            </Button>
          </div>
        </div>

        <DialogFooter>
          <Button onClick={() => onOpenChange(false)} className="w-full">
            I've Saved These Codes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
