import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { AlertCircle, CheckCircle2, AlertTriangle } from "lucide-react";
import type { MetadataValidationResult } from "@/types";

interface ValidationModalProps {
  isOpen: boolean;
  onClose: () => void;
  validationResult: MetadataValidationResult | null;
  onContinue?: () => void;
}

export function ValidationModal({
  isOpen,
  onClose,
  validationResult,
  onContinue,
}: ValidationModalProps) {
  if (!validationResult) return null;

  const hasErrors = validationResult.errors.length > 0;
  const hasWarnings = validationResult.warnings && validationResult.warnings.length > 0;

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent className="max-w-lg">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            {hasErrors ? (
              <>
                <AlertCircle className="h-5 w-5 text-destructive" />
                Validation Errors
              </>
            ) : hasWarnings ? (
              <>
                <AlertTriangle className="h-5 w-5 text-yellow-500" />
                Validation Warnings
              </>
            ) : (
              <>
                <CheckCircle2 className="h-5 w-5 text-success" />
                Validation Successful
              </>
            )}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {hasErrors
              ? "Please fix the following errors before proceeding:"
              : hasWarnings
              ? "Please review the following warnings:"
              : "All metadata fields are valid."}
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="space-y-4 py-4">
          {hasErrors && (
            <div className="space-y-2">
              <h4 className="text-sm font-semibold text-destructive">Errors:</h4>
              <ul className="list-disc list-inside space-y-1">
                {validationResult.errors.map((error, index) => (
                  <li key={index} className="text-sm text-foreground-primary">
                    <span className="font-medium">{error.field}:</span>{" "}
                    {error.message}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {hasWarnings && (
            <div className="space-y-2">
              <h4 className="text-sm font-semibold text-yellow-600">Warnings:</h4>
              <ul className="list-disc list-inside space-y-1">
                {validationResult.warnings!.map((warning, index) => (
                  <li key={index} className="text-sm text-foreground-primary">
                    <span className="font-medium">{warning.field}:</span>{" "}
                    {warning.message}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {!hasErrors && !hasWarnings && (
            <div className="flex items-center gap-2 text-success">
              <CheckCircle2 className="h-5 w-5" />
              <p className="text-sm">All required metadata fields are complete.</p>
            </div>
          )}
        </div>

        <AlertDialogFooter>
          {hasErrors ? (
            <Button onClick={onClose}>Close</Button>
          ) : (
            <>
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
              {onContinue && (
                <Button onClick={onContinue}>
                  Continue
                </Button>
              )}
            </>
          )}
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
