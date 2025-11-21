import { useState, useEffect } from "react";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { transactionsApi } from "@/lib/api";
import { toast } from "sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { PaymentMethod } from "@/types";

const paymentMethodSchema = z.object({
  method_type: z.enum(["card", "bank_account", "other"]),
  card_last_four: z.string().regex(/^\d{4}$/, "Must be 4 digits").optional(),
  card_brand: z.string().optional(),
  expiration_date: z.string().optional(),
  is_default: z.boolean().default(false),
});

type PaymentMethodFormData = z.infer<typeof paymentMethodSchema>;

interface EditPaymentMethodModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  paymentMethod?: PaymentMethod;
}

export default function EditPaymentMethodModal({
  open,
  onOpenChange,
  paymentMethod,
}: EditPaymentMethodModalProps) {
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isEditing = !!paymentMethod;

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<PaymentMethodFormData>({
    resolver: zodResolver(paymentMethodSchema),
    defaultValues: {
      method_type: paymentMethod?.method_type || "card",
      card_last_four: paymentMethod?.card_last_four || "",
      card_brand: paymentMethod?.card_brand || "",
      expiration_date: paymentMethod?.expiration_date || "",
      is_default: paymentMethod?.is_default || false,
    },
  });

  const methodType = watch("method_type");

  useEffect(() => {
    if (paymentMethod) {
      reset({
        method_type: paymentMethod.method_type,
        card_last_four: paymentMethod.card_last_four || "",
        card_brand: paymentMethod.card_brand || "",
        expiration_date: paymentMethod.expiration_date || "",
        is_default: paymentMethod.is_default,
      });
    } else {
      reset({
        method_type: "card",
        card_last_four: "",
        card_brand: "",
        expiration_date: "",
        is_default: false,
      });
    }
  }, [paymentMethod, reset]);

  const createMutation = useMutation({
    mutationFn: (data: PaymentMethodFormData) =>
      transactionsApi.addPaymentMethod(data),
    onSuccess: () => {
      toast.success("Payment method added successfully");
      queryClient.invalidateQueries({ queryKey: ["payment-methods"] });
      reset();
      onOpenChange(false);
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to add payment method");
    },
    onSettled: () => {
      setIsSubmitting(false);
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: PaymentMethodFormData) =>
      transactionsApi.updatePaymentMethod(paymentMethod!.id, data),
    onSuccess: () => {
      toast.success("Payment method updated successfully");
      queryClient.invalidateQueries({ queryKey: ["payment-methods"] });
      reset();
      onOpenChange(false);
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update payment method");
    },
    onSettled: () => {
      setIsSubmitting(false);
    },
  });

  const onSubmit = async (data: PaymentMethodFormData) => {
    setIsSubmitting(true);
    if (isEditing) {
      updateMutation.mutate(data);
    } else {
      createMutation.mutate(data);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Edit Payment Method" : "Add Payment Method"}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Update your payment method details"
              : "Add a new payment method to your account"}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="method_type">Payment Method Type</Label>
            <Select
              value={methodType}
              onValueChange={(value) =>
                setValue("method_type", value as "card" | "bank_account" | "other")
              }
            >
              <SelectTrigger id="method_type">
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="card">Credit/Debit Card</SelectItem>
                <SelectItem value="bank_account">Bank Account</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
            {errors.method_type && (
              <p className="text-sm text-destructive">{errors.method_type.message}</p>
            )}
          </div>

          {methodType === "card" && (
            <>
              <div className="space-y-2">
                <Label htmlFor="card_last_four">Last 4 Digits</Label>
                <Input
                  id="card_last_four"
                  placeholder="1234"
                  maxLength={4}
                  {...register("card_last_four")}
                />
                {errors.card_last_four && (
                  <p className="text-sm text-destructive">
                    {errors.card_last_four.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="card_brand">Card Brand</Label>
                <Input
                  id="card_brand"
                  placeholder="Visa, Mastercard, etc."
                  {...register("card_brand")}
                />
                {errors.card_brand && (
                  <p className="text-sm text-destructive">{errors.card_brand.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="expiration_date">Expiration Date</Label>
                <Input
                  id="expiration_date"
                  placeholder="MM/YY"
                  {...register("expiration_date")}
                />
                {errors.expiration_date && (
                  <p className="text-sm text-destructive">
                    {errors.expiration_date.message}
                  </p>
                )}
              </div>
            </>
          )}

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="is_default"
              {...register("is_default")}
              className="h-4 w-4 rounded border-input"
            />
            <Label htmlFor="is_default" className="font-normal cursor-pointer">
              Set as default payment method
            </Label>
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
              {isSubmitting
                ? isEditing
                  ? "Updating..."
                  : "Adding..."
                : isEditing
                  ? "Update"
                  : "Add"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
