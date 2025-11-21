import { useState } from "react";
import { useCreateComplianceRequest } from "@/hooks/use-security";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertTriangle } from "lucide-react";

interface DataDeleteModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DataDeleteModal({ open, onOpenChange }: DataDeleteModalProps) {
  const createRequest = useCreateComplianceRequest();
  const [confirmationText, setConfirmationText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const requiresConfirmation = confirmationText.toLowerCase() !== "delete";

  const handleDelete = async () => {
    if (requiresConfirmation) return;

    setIsSubmitting(true);
    try {
      await createRequest.mutateAsync({
        type: "delete",
      });
      setConfirmationText("");
      onOpenChange(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="sm:max-w-[500px]">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            Request Data Deletion
          </AlertDialogTitle>
          <AlertDialogDescription className="space-y-4">
            <p>
              This action will permanently delete all data associated with your account. This
              includes:
            </p>
            <ul className="list-disc list-inside space-y-1 text-sm">
              <li>User profile and account information</li>
              <li>All uploaded content and videos</li>
              <li>Course progress and completion records</li>
              <li>Analytics and usage data</li>
              <li>All other data associated with your account</li>
            </ul>
            <p className="font-medium text-destructive">
              This action cannot be undone. Please ensure you have exported any data you wish to
              keep before proceeding.
            </p>
            <div className="space-y-2 pt-4">
              <Label htmlFor="confirmation">
                Type <strong>DELETE</strong> to confirm:
              </Label>
              <Input
                id="confirmation"
                value={confirmationText}
                onChange={(e) => setConfirmationText(e.target.value)}
                placeholder="DELETE"
                className="font-mono"
              />
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel
            onClick={() => {
              setConfirmationText("");
              onOpenChange(false);
            }}
            disabled={isSubmitting}
          >
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={requiresConfirmation || isSubmitting || createRequest.isPending}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isSubmitting || createRequest.isPending ? "Submitting..." : "Delete All Data"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
