import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { transactionsApi } from "@/lib/api";
import { toast } from "sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";

const refundSchema = z.object({
  reason: z.string().optional(),
  comments: z.string().min(10, "Please provide at least 10 characters of detail").optional(),
});

type RefundFormData = z.infer<typeof refundSchema>;

interface RequestRefundModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  transactionId: string;
  transactionAmount: number;
}

export default function RequestRefundModal({
  open,
  onOpenChange,
  transactionId,
  transactionAmount,
}: RequestRefundModalProps) {
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<RefundFormData>({
    resolver: zodResolver(refundSchema),
  });

  const refundMutation = useMutation({
    mutationFn: (data: RefundFormData) =>
      transactionsApi.requestRefund(transactionId, data),
    onSuccess: () => {
      toast.success("Refund request submitted successfully");
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      reset();
      onOpenChange(false);
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to submit refund request");
    },
    onSettled: () => {
      setIsSubmitting(false);
    },
  });

  const onSubmit = async (data: RefundFormData) => {
    setIsSubmitting(true);
    refundMutation.mutate(data);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Request Refund</DialogTitle>
          <DialogDescription>
            Submit a refund request for this transaction. Amount: ${transactionAmount.toFixed(2)}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="reason">Reason (Optional)</Label>
            <Textarea
              id="reason"
              placeholder="Brief reason for the refund request..."
              {...register("reason")}
              className="min-h-[80px]"
            />
            {errors.reason && (
              <p className="text-sm text-destructive">{errors.reason.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="comments">Additional Comments</Label>
            <Textarea
              id="comments"
              placeholder="Please provide details about why you're requesting a refund..."
              {...register("comments")}
              className="min-h-[100px]"
            />
            {errors.comments && (
              <p className="text-sm text-destructive">{errors.comments.message}</p>
            )}
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                reset();
                onOpenChange(false);
              }}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Submitting..." : "Submit Request"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
