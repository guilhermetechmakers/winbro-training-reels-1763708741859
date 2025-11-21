import type { ReactNode } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface SuccessModalProps {
  /**
   * Whether the modal is open
   */
  open: boolean;
  /**
   * Callback when modal should close
   */
  onClose: () => void;
  /**
   * Modal title
   */
  title: string;
  /**
   * Modal description
   */
  description?: string;
  /**
   * Primary action button
   */
  primaryAction?: {
    label: string;
    onClick: () => void;
    variant?: "default" | "outline" | "ghost";
  };
  /**
   * Secondary action button
   */
  secondaryAction?: {
    label: string;
    onClick: () => void;
    variant?: "default" | "outline" | "ghost";
  };
  /**
   * Custom content to display
   */
  children?: ReactNode;
  /**
   * Show checkmark icon
   */
  showIcon?: boolean;
  /**
   * Additional className
   */
  className?: string;
}

export function SuccessModal({
  open,
  onClose,
  title,
  description,
  primaryAction,
  secondaryAction,
  children,
  showIcon = true,
  className,
}: SuccessModalProps) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className={cn("sm:max-w-md", className)}>
        <DialogHeader>
          {showIcon && (
            <div className="flex justify-center mb-4 animate-scale-in">
              <div className="rounded-full bg-success/10 p-3 flex items-center justify-center">
                <CheckCircle2 className="h-8 w-8 text-success" />
              </div>
            </div>
          )}
          <DialogTitle className="text-center text-2xl font-bold text-foreground-primary">
            {title}
          </DialogTitle>
          {description && (
            <DialogDescription className="text-center text-foreground-secondary">
              {description}
            </DialogDescription>
          )}
        </DialogHeader>

        {children && (
          <div className="py-4">
            {children}
          </div>
        )}

        <DialogFooter className="flex-col sm:flex-row gap-2 sm:gap-0">
          {secondaryAction && (
            <Button
              variant={secondaryAction.variant || "outline"}
              onClick={secondaryAction.onClick}
              className="w-full sm:w-auto"
            >
              {secondaryAction.label}
            </Button>
          )}
          {primaryAction ? (
            <Button
              variant={primaryAction.variant || "default"}
              onClick={primaryAction.onClick}
              className="w-full sm:w-auto"
            >
              {primaryAction.label}
            </Button>
          ) : (
            <Button
              onClick={onClose}
              className="w-full sm:w-auto"
            >
              Close
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
