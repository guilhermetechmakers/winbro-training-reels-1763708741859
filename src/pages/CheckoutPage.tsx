import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  CreditCard,
  Building2,
  Tag,
  CheckCircle2,
  Loader2,
  ArrowLeft,
  AlertCircle,
  X,
} from "lucide-react";
import { checkoutApi, transactionsApi } from "@/lib/api";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import type {
  SubscriptionPlan,
  PromoCode,
  InvoicePreview,
  CheckoutData,
  PaymentMethod,
} from "@/types";
import CheckoutSuccess from "@/components/checkout/CheckoutSuccess";

// Form validation schema
const checkoutSchema = z.object({
  plan_id: z.string().min(1, "Please select a plan"),
  billing_details: z.object({
    company_name: z.string().min(1, "Company name is required"),
    billing_address: z.object({
      street: z.string().min(1, "Street address is required"),
      city: z.string().min(1, "City is required"),
      state: z.string().min(1, "State is required"),
      zip_code: z.string().min(1, "ZIP code is required"),
      country: z.string().min(1, "Country is required"),
    }),
    tax_id: z.string().optional(),
  }),
  payment_method_id: z.string().optional(),
  payment_method: z
    .object({
      card_number: z.string().min(13, "Invalid card number"),
      expiry_month: z.string().min(1, "Expiry month is required"),
      expiry_year: z.string().min(1, "Expiry year is required"),
      cvv: z.string().min(3, "CVV is required"),
      cardholder_name: z.string().min(1, "Cardholder name is required"),
    })
    .optional(),
  promo_code: z.string().optional(),
  save_payment_method: z.boolean().default(false),
  terms_accepted: z.boolean().refine((val) => val === true, {
    message: "You must accept the terms and conditions",
  }),
});

type CheckoutForm = z.infer<typeof checkoutSchema>;

type CheckoutStep = "plan" | "billing" | "payment" | "review";

export default function CheckoutPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchParams] = useSearchParams();
  const [currentStep, setCurrentStep] = useState<CheckoutStep>("plan");
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(
    null
  );
  const [promoCode, setPromoCode] = useState("");
  const [validatedPromo, setValidatedPromo] = useState<PromoCode | null>(null);
  const [promoError, setPromoError] = useState("");
  const [invoicePreview, setInvoicePreview] = useState<InvoicePreview | null>(
    null
  );
  const [checkoutSuccess, setCheckoutSuccess] = useState(false);
  const [checkoutResponse, setCheckoutResponse] =
    useState<{ transaction_id: string; subscription_id: string } | null>(
      null
    );

  // Fetch available plans
  const { data: plans, isLoading: plansLoading } = useQuery<
    SubscriptionPlan[]
  >({
    queryKey: ["subscription-plans"],
    queryFn: () => checkoutApi.getPlans(),
  });

  // Fetch saved payment methods
  const { data: savedPaymentMethods } = useQuery<PaymentMethod[]>({
    queryKey: ["payment-methods"],
    queryFn: () => transactionsApi.getPaymentMethods(),
  });

  // Form setup
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
    trigger,
  } = useForm<CheckoutForm>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      save_payment_method: false,
      terms_accepted: false,
    },
  });

  const selectedPlanId = watch("plan_id");
  const useSavedPayment = watch("payment_method_id");
  const termsAccepted = watch("terms_accepted");

  // Initialize plan from URL params
  useEffect(() => {
    const planId = searchParams.get("plan");
    if (planId && plans) {
      const plan = plans.find((p) => p.id === planId);
      if (plan) {
        setSelectedPlan(plan);
        setValue("plan_id", plan.id);
        setCurrentStep("billing");
      }
    }
  }, [searchParams, plans, setValue]);

  // Update invoice preview when plan or promo changes
  useEffect(() => {
    if (selectedPlanId) {
      generateInvoicePreview();
    }
  }, [selectedPlanId, validatedPromo]);

  // Generate invoice preview
  const generateInvoicePreview = async () => {
    if (!selectedPlanId) return;
    try {
      const preview = await checkoutApi.generateInvoicePreview(
        selectedPlanId,
        validatedPromo?.code
      );
      setInvoicePreview(preview);
    } catch (error) {
      console.error("Failed to generate invoice preview:", error);
    }
  };

  // Validate promo code
  const handleValidatePromo = async () => {
    if (!promoCode.trim() || !selectedPlanId) {
      setPromoError("Please enter a promo code");
      return;
    }

    setPromoError("");
    try {
      const promo = await checkoutApi.validatePromoCode(
        promoCode.trim(),
        selectedPlanId
      );
      if (promo.is_active) {
        setValidatedPromo(promo);
        setValue("promo_code", promo.code);
        toast.success("Promo code applied successfully!");
        await generateInvoicePreview();
      } else {
        setPromoError("This promo code is not active");
      }
    } catch (error) {
      setPromoError(
        error instanceof Error ? error.message : "Invalid promo code"
      );
      setValidatedPromo(null);
      setValue("promo_code", "");
    }
  };

  // Remove promo code
  const handleRemovePromo = () => {
    setPromoCode("");
    setValidatedPromo(null);
    setValue("promo_code", "");
    generateInvoicePreview();
  };

  // Process checkout
  const checkoutMutation = useMutation({
    mutationFn: (data: CheckoutData) => checkoutApi.processCheckout(data),
    onSuccess: (response) => {
      setCheckoutResponse({
        transaction_id: response.transaction_id,
        subscription_id: response.subscription_id,
      });
      setCheckoutSuccess(true);
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      queryClient.invalidateQueries({ queryKey: ["payment-methods"] });
      toast.success("Payment processed successfully!");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Payment processing failed. Please try again.");
    },
  });

  // Handle form submission
  const onSubmit = async (data: CheckoutForm) => {
    if (currentStep !== "review") {
      // Validate current step before proceeding
      const isValid = await trigger();
      if (!isValid) return;

      // Move to next step
      const steps: CheckoutStep[] = ["plan", "billing", "payment", "review"];
      const currentIndex = steps.indexOf(currentStep);
      if (currentIndex < steps.length - 1) {
        setCurrentStep(steps[currentIndex + 1]);
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
      return;
    }

    // Final submission
    if (!useSavedPayment && !data.payment_method) {
      toast.error("Please provide payment information");
      return;
    }

    const checkoutData: CheckoutData = {
      plan_id: data.plan_id,
      billing_details: data.billing_details,
      payment_method_id: useSavedPayment || undefined,
      payment_method: useSavedPayment ? undefined : data.payment_method,
      promo_code: validatedPromo?.code,
      save_payment_method: data.save_payment_method,
      terms_accepted: data.terms_accepted,
    };

    checkoutMutation.mutate(checkoutData);
  };

  // Step progress calculation
  const getStepProgress = () => {
    const steps: CheckoutStep[] = ["plan", "billing", "payment", "review"];
    const currentIndex = steps.indexOf(currentStep);
    return ((currentIndex + 1) / steps.length) * 100;
  };

  // If checkout successful, show success screen
  if (checkoutSuccess && checkoutResponse) {
    return (
      <CheckoutSuccess
        transactionId={checkoutResponse.transaction_id}
        subscriptionId={checkoutResponse.subscription_id}
        onContinue={() => navigate("/dashboard")}
      />
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-fade-in-up p-6">
      {/* Header with progress */}
      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(-1)}
            className="h-8"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-foreground-primary">
              Checkout
            </h1>
            <p className="text-foreground-secondary mt-1">
              Complete your subscription purchase
            </p>
          </div>
        </div>

        {/* Progress indicator */}
        <Card className="card-base">
          <CardContent className="pt-6">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-foreground-secondary">Progress</span>
                <span className="font-medium text-foreground-primary">
                  {Math.round(getStepProgress())}%
                </span>
              </div>
              <Progress value={getStepProgress()} className="h-2" />
            </div>
            <div className="flex items-center justify-between mt-4 text-xs text-foreground-secondary">
              <span
                className={cn(
                  currentStep === "plan" && "font-semibold text-foreground-primary"
                )}
              >
                1. Plan
              </span>
              <span
                className={cn(
                  currentStep === "billing" &&
                    "font-semibold text-foreground-primary"
                )}
              >
                2. Billing
              </span>
              <span
                className={cn(
                  currentStep === "payment" &&
                    "font-semibold text-foreground-primary"
                )}
              >
                3. Payment
              </span>
              <span
                className={cn(
                  currentStep === "review" &&
                    "font-semibold text-foreground-primary"
                )}
              >
                4. Review
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Step 1: Plan Selection */}
            {(currentStep === "plan" || !selectedPlanId) && (
              <Card className="card-base">
                <CardHeader>
                  <CardTitle>Select Your Plan</CardTitle>
                  <CardDescription>
                    Choose the subscription plan that best fits your needs
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {plansLoading ? (
                    <div className="space-y-4">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="animate-pulse">
                          <div className="h-32 bg-muted rounded-lg"></div>
                        </div>
                      ))}
                    </div>
                  ) : plans && plans.length > 0 ? (
                    <div className="grid md:grid-cols-2 gap-4">
                      {plans.map((plan) => (
                        <div
                          key={plan.id}
                          className={cn(
                            "relative p-6 rounded-lg border-2 transition-all cursor-pointer",
                            selectedPlanId === plan.id
                              ? "border-primary bg-primary/5"
                              : "border-border hover:border-primary/50 hover:shadow-md"
                          )}
                          onClick={() => {
                            setSelectedPlan(plan);
                            setValue("plan_id", plan.id);
                            trigger("plan_id");
                          }}
                        >
                          {plan.is_popular && (
                            <Badge className="absolute top-4 right-4 bg-primary text-white">
                              Popular
                            </Badge>
                          )}
                          <div className="space-y-3">
                            <div>
                              <h3 className="text-xl font-bold text-foreground-primary">
                                {plan.name}
                              </h3>
                              <p className="text-sm text-foreground-secondary">
                                {plan.description}
                              </p>
                            </div>
                            <div>
                              <span className="text-3xl font-bold text-foreground-primary">
                                ${plan.price}
                              </span>
                              <span className="text-foreground-secondary ml-2">
                                /{plan.billing_interval === "monthly" ? "mo" : "yr"}
                              </span>
                            </div>
                            <ul className="space-y-2">
                              {plan.features.map((feature, idx) => (
                                <li
                                  key={idx}
                                  className="flex items-start gap-2 text-sm text-foreground-secondary"
                                >
                                  <CheckCircle2 className="h-4 w-4 text-success mt-0.5 flex-shrink-0" />
                                  <span>{feature}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                          {selectedPlanId === plan.id && (
                            <div className="mt-4 flex items-center gap-2 text-primary">
                              <CheckCircle2 className="h-5 w-5" />
                              <span className="font-medium">Selected</span>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="py-12 text-center">
                      <p className="text-foreground-secondary">
                        No plans available
                      </p>
                    </div>
                  )}
                  {errors.plan_id && (
                    <p className="text-sm text-red-500">
                      {errors.plan_id.message}
                    </p>
                  )}
                  <input
                    type="hidden"
                    {...register("plan_id")}
                  />
                </CardContent>
              </Card>
            )}

            {/* Step 2: Billing Details */}
            {currentStep === "billing" && selectedPlanId && (
              <Card className="card-base">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Building2 className="h-5 w-5 text-foreground-secondary" />
                    <CardTitle>Billing Details</CardTitle>
                  </div>
                  <CardDescription>
                    Enter your company billing information
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="company_name">Company Name *</Label>
                    <Input
                      id="company_name"
                      placeholder="Acme Corporation"
                      {...register("billing_details.company_name")}
                    />
                    {errors.billing_details?.company_name && (
                      <p className="text-sm text-red-500">
                        {errors.billing_details.company_name.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-4">
                    <Label>Billing Address *</Label>
                    <div className="space-y-2">
                      <Input
                        placeholder="Street Address"
                        {...register("billing_details.billing_address.street")}
                      />
                      {errors.billing_details?.billing_address?.street && (
                        <p className="text-sm text-red-500">
                          {errors.billing_details.billing_address.street.message}
                        </p>
                      )}
                    </div>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Input
                          placeholder="City"
                          {...register("billing_details.billing_address.city")}
                        />
                        {errors.billing_details?.billing_address?.city && (
                          <p className="text-sm text-red-500">
                            {errors.billing_details.billing_address.city.message}
                          </p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Input
                          placeholder="State"
                          {...register("billing_details.billing_address.state")}
                        />
                        {errors.billing_details?.billing_address?.state && (
                          <p className="text-sm text-red-500">
                            {errors.billing_details.billing_address.state.message}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Input
                          placeholder="ZIP Code"
                          {...register("billing_details.billing_address.zip_code")}
                        />
                        {errors.billing_details?.billing_address?.zip_code && (
                          <p className="text-sm text-red-500">
                            {errors.billing_details.billing_address.zip_code.message}
                          </p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Input
                          placeholder="Country"
                          {...register("billing_details.billing_address.country")}
                        />
                        {errors.billing_details?.billing_address?.country && (
                          <p className="text-sm text-red-500">
                            {errors.billing_details.billing_address.country.message}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="tax_id">Tax ID (Optional)</Label>
                    <Input
                      id="tax_id"
                      placeholder="EIN or Tax ID"
                      {...register("billing_details.tax_id")}
                    />
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Step 3: Payment */}
            {currentStep === "payment" && selectedPlanId && (
              <Card className="card-base">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <CreditCard className="h-5 w-5 text-foreground-secondary" />
                    <CardTitle>Payment Information</CardTitle>
                  </div>
                  <CardDescription>
                    Enter your payment details or use a saved method
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Saved Payment Methods */}
                  {savedPaymentMethods && savedPaymentMethods.length > 0 && (
                    <div className="space-y-3">
                      <Label>Saved Payment Methods</Label>
                      {savedPaymentMethods.map((method) => (
                        <div
                          key={method.id}
                          className={cn(
                            "flex items-center justify-between p-4 rounded-lg border-2 transition-all cursor-pointer",
                            useSavedPayment === method.id
                              ? "border-primary bg-primary/5"
                              : "border-border hover:border-primary/50"
                          )}
                          onClick={() => {
                            setValue("payment_method_id", method.id);
                            setValue("payment_method", undefined);
                          }}
                        >
                          <div className="flex items-center gap-3">
                            <CreditCard className="h-5 w-5 text-foreground-secondary" />
                            <div>
                              <p className="font-medium text-foreground-primary">
                                {method.card_brand || "Card"} ••••{" "}
                                {method.card_last_four || ""}
                              </p>
                              {method.is_default && (
                                <Badge variant="secondary" className="text-xs mt-1">
                                  Default
                                </Badge>
                              )}
                            </div>
                          </div>
                          {useSavedPayment === method.id && (
                            <CheckCircle2 className="h-5 w-5 text-primary" />
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {savedPaymentMethods && savedPaymentMethods.length > 0 && (
                    <Separator />
                  )}

                  {/* New Payment Method */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <Label>Or Enter New Card</Label>
                      {useSavedPayment && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setValue("payment_method_id", "");
                            setValue("payment_method", {
                              card_number: "",
                              expiry_month: "",
                              expiry_year: "",
                              cvv: "",
                              cardholder_name: "",
                            });
                          }}
                          className="h-8"
                        >
                          Use New Card
                        </Button>
                      )}
                    </div>

                    {!useSavedPayment && (
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="cardholder_name">Cardholder Name *</Label>
                          <Input
                            id="cardholder_name"
                            placeholder="John Doe"
                            {...register("payment_method.cardholder_name")}
                          />
                          {errors.payment_method?.cardholder_name && (
                            <p className="text-sm text-red-500">
                              {errors.payment_method.cardholder_name.message}
                            </p>
                          )}
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="card_number">Card Number *</Label>
                          <Input
                            id="card_number"
                            placeholder="1234 5678 9012 3456"
                            maxLength={19}
                            {...register("payment_method.card_number", {
                              onChange: (e) => {
                                // Format card number with spaces
                                const value = e.target.value.replace(/\s/g, "");
                                const formatted = value
                                  .match(/.{1,4}/g)
                                  ?.join(" ") || value;
                                e.target.value = formatted;
                              },
                            })}
                          />
                          {errors.payment_method?.card_number && (
                            <p className="text-sm text-red-500">
                              {errors.payment_method.card_number.message}
                            </p>
                          )}
                        </div>

                        <div className="grid md:grid-cols-3 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="expiry_month">Month *</Label>
                            <Select
                              onValueChange={(value) =>
                                setValue("payment_method.expiry_month", value)
                              }
                            >
                              <SelectTrigger id="expiry_month">
                                <SelectValue placeholder="MM" />
                              </SelectTrigger>
                              <SelectContent>
                                {Array.from({ length: 12 }, (_, i) => i + 1).map(
                                  (month) => (
                                    <SelectItem
                                      key={month}
                                      value={month.toString().padStart(2, "0")}
                                    >
                                      {month.toString().padStart(2, "0")}
                                    </SelectItem>
                                  )
                                )}
                              </SelectContent>
                            </Select>
                            {errors.payment_method?.expiry_month && (
                              <p className="text-sm text-red-500">
                                {errors.payment_method.expiry_month.message}
                              </p>
                            )}
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="expiry_year">Year *</Label>
                            <Select
                              onValueChange={(value) =>
                                setValue("payment_method.expiry_year", value)
                              }
                            >
                              <SelectTrigger id="expiry_year">
                                <SelectValue placeholder="YYYY" />
                              </SelectTrigger>
                              <SelectContent>
                                {Array.from(
                                  { length: 20 },
                                  (_, i) => new Date().getFullYear() + i
                                ).map((year) => (
                                  <SelectItem key={year} value={year.toString()}>
                                    {year}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            {errors.payment_method?.expiry_year && (
                              <p className="text-sm text-red-500">
                                {errors.payment_method.expiry_year.message}
                              </p>
                            )}
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="cvv">CVV *</Label>
                            <Input
                              id="cvv"
                              type="password"
                              placeholder="123"
                              maxLength={4}
                              {...register("payment_method.cvv")}
                            />
                            {errors.payment_method?.cvv && (
                              <p className="text-sm text-red-500">
                                {errors.payment_method.cvv.message}
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="save_payment"
                            checked={watch("save_payment_method")}
                            onCheckedChange={(checked) =>
                              setValue("save_payment_method", checked === true)
                            }
                          />
                          <Label
                            htmlFor="save_payment"
                            className="text-sm font-normal cursor-pointer"
                          >
                            Save this payment method for future use
                          </Label>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Step 4: Review */}
            {currentStep === "review" && selectedPlanId && (
              <Card className="card-base">
                <CardHeader>
                  <CardTitle>Review Your Order</CardTitle>
                  <CardDescription>
                    Please review your information before completing the purchase
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Plan Summary */}
                  {selectedPlan && (
                    <div className="space-y-2">
                      <h3 className="font-semibold text-foreground-primary">
                        Selected Plan
                      </h3>
                      <div className="p-4 rounded-lg bg-muted/50">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-foreground-primary">
                              {selectedPlan.name}
                            </p>
                            <p className="text-sm text-foreground-secondary">
                              {selectedPlan.description}
                            </p>
                          </div>
                          <p className="text-lg font-bold text-foreground-primary">
                            ${selectedPlan.price}/
                            {selectedPlan.billing_interval === "monthly"
                              ? "mo"
                              : "yr"}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  <Separator />

                  {/* Billing Details Summary */}
                  <div className="space-y-2">
                    <h3 className="font-semibold text-foreground-primary">
                      Billing Details
                    </h3>
                    <div className="p-4 rounded-lg bg-muted/50 space-y-2 text-sm">
                      <p className="font-medium text-foreground-primary">
                        {watch("billing_details.company_name")}
                      </p>
                      <p className="text-foreground-secondary">
                        {watch("billing_details.billing_address.street")}
                      </p>
                      <p className="text-foreground-secondary">
                        {watch("billing_details.billing_address.city")},{" "}
                        {watch("billing_details.billing_address.state")}{" "}
                        {watch("billing_details.billing_address.zip_code")}
                      </p>
                      <p className="text-foreground-secondary">
                        {watch("billing_details.billing_address.country")}
                      </p>
                    </div>
                  </div>

                  <Separator />

                  {/* Payment Method Summary */}
                  <div className="space-y-2">
                    <h3 className="font-semibold text-foreground-primary">
                      Payment Method
                    </h3>
                    <div className="p-4 rounded-lg bg-muted/50">
                      {useSavedPayment ? (
                        <p className="text-sm text-foreground-secondary">
                          Using saved payment method
                        </p>
                      ) : (
                        <p className="text-sm text-foreground-secondary">
                          Card ending in{" "}
                          {watch("payment_method.card_number")
                            ?.replace(/\s/g, "")
                            .slice(-4) || "****"}
                        </p>
                      )}
                    </div>
                  </div>

                  <Separator />

                  {/* Terms Acceptance */}
                  <div className="space-y-2">
                    <div className="flex items-start space-x-2">
                      <Checkbox
                        id="terms"
                        checked={termsAccepted}
                        onCheckedChange={(checked) =>
                          setValue("terms_accepted", checked === true)
                        }
                        className="mt-1"
                      />
                      <Label
                        htmlFor="terms"
                        className="text-sm font-normal cursor-pointer"
                      >
                        I agree to the{" "}
                        <a
                          href="/terms"
                          target="_blank"
                          className="text-primary hover:underline"
                        >
                          Terms of Service
                        </a>{" "}
                        and{" "}
                        <a
                          href="/privacy"
                          target="_blank"
                          className="text-primary hover:underline"
                        >
                          Privacy Policy
                        </a>
                      </Label>
                    </div>
                    {errors.terms_accepted && (
                      <p className="text-sm text-red-500">
                        {errors.terms_accepted.message}
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Navigation Buttons */}
            <div className="flex items-center justify-between">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  const steps: CheckoutStep[] = [
                    "plan",
                    "billing",
                    "payment",
                    "review",
                  ];
                  const currentIndex = steps.indexOf(currentStep);
                  if (currentIndex > 0) {
                    setCurrentStep(steps[currentIndex - 1]);
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  } else {
                    navigate(-1);
                  }
                }}
                disabled={currentStep === "plan"}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Previous
              </Button>
              <Button
                type="submit"
                disabled={checkoutMutation.isPending}
                className="min-w-[120px]"
              >
                {checkoutMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : currentStep === "review" ? (
                  "Complete Purchase"
                ) : (
                  "Continue"
                )}
              </Button>
            </div>
          </div>

          {/* Sidebar - Summary & Promo */}
          <div className="space-y-6">
            {/* Order Summary */}
            <Card className="card-base sticky top-6">
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {selectedPlan && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-foreground-secondary">
                        Plan
                      </span>
                      <span className="text-sm font-medium text-foreground-primary">
                        {selectedPlan.name}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-foreground-secondary">
                        Billing Period
                      </span>
                      <span className="text-sm font-medium text-foreground-primary">
                        {selectedPlan.billing_interval === "monthly"
                          ? "Monthly"
                          : "Yearly"}
                      </span>
                    </div>
                  </div>
                )}

                {invoicePreview && (
                  <>
                    <Separator />
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-foreground-secondary">
                          Subtotal
                        </span>
                        <span className="text-sm font-medium text-foreground-primary">
                          ${invoicePreview.subtotal.toFixed(2)}
                        </span>
                      </div>
                      {invoicePreview.discount > 0 && (
                        <div className="flex items-center justify-between text-success">
                          <span className="text-sm">Discount</span>
                          <span className="text-sm font-medium">
                            -${invoicePreview.discount.toFixed(2)}
                          </span>
                        </div>
                      )}
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-foreground-secondary">
                          Tax
                        </span>
                        <span className="text-sm font-medium text-foreground-primary">
                          ${invoicePreview.tax.toFixed(2)}
                        </span>
                      </div>
                      <Separator />
                      <div className="flex items-center justify-between">
                        <span className="text-base font-semibold text-foreground-primary">
                          Total
                        </span>
                        <span className="text-lg font-bold text-foreground-primary">
                          ${invoicePreview.total.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </>
                )}

                {!invoicePreview && selectedPlan && (
                  <>
                    <Separator />
                    <div className="flex items-center justify-between">
                      <span className="text-base font-semibold text-foreground-primary">
                        Total
                      </span>
                      <span className="text-lg font-bold text-foreground-primary">
                        ${selectedPlan.price.toFixed(2)}/
                        {selectedPlan.billing_interval === "monthly"
                          ? "mo"
                          : "yr"}
                      </span>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Promo Code */}
            {selectedPlanId && (
              <Card className="card-base">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Tag className="h-5 w-5 text-foreground-secondary" />
                    <CardTitle className="text-lg">Promo Code</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {validatedPromo ? (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between p-3 rounded-lg bg-success/10 border border-success/20">
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="h-4 w-4 text-success" />
                          <span className="text-sm font-medium text-foreground-primary">
                            {validatedPromo.code}
                          </span>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={handleRemovePromo}
                          className="h-6 w-6 p-0"
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                      <p className="text-xs text-foreground-secondary">
                        {validatedPromo.discount_type === "percentage"
                          ? `${validatedPromo.discount_value}% off`
                          : `$${validatedPromo.discount_value} off"`}
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="flex gap-2">
                        <Input
                          placeholder="Enter promo code"
                          value={promoCode}
                          onChange={(e) => setPromoCode(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              handleValidatePromo();
                            }
                          }}
                        />
                        <Button
                          type="button"
                          onClick={handleValidatePromo}
                          disabled={!promoCode.trim()}
                          className="shrink-0"
                        >
                          Apply
                        </Button>
                      </div>
                      {promoError && (
                        <div className="flex items-center gap-2 text-sm text-red-500">
                          <AlertCircle className="h-4 w-4" />
                          <span>{promoError}</span>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </form>
    </div>
  );
}
