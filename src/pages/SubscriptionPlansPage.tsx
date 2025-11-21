import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, ArrowRight, Sparkles, Zap, Shield, Users } from "lucide-react";
import { checkoutApi } from "@/lib/api";
import { cn } from "@/lib/utils";
import type { SubscriptionPlan } from "@/types";

export default function SubscriptionPlansPage() {
  const navigate = useNavigate();
  const [billingInterval, setBillingInterval] = useState<"monthly" | "yearly">("monthly");

  // Fetch available plans
  const { data: plans, isLoading: plansLoading } = useQuery<SubscriptionPlan[]>({
    queryKey: ["subscription-plans"],
    queryFn: () => checkoutApi.getPlans(),
  });

  const handleSelectPlan = (planId: string) => {
    navigate(`/checkout?plan=${planId}`);
  };

  // Filter plans by billing interval and sort
  const filteredPlans = plans
    ?.filter((plan) => plan.billing_interval === billingInterval)
    .sort((a, b) => a.price - b.price) || [];

  return (
    <div className="max-w-7xl mx-auto space-y-12 animate-fade-in-up p-6">
      {/* Hero Section */}
      <div className="text-center space-y-6">
        <div className="space-y-4">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground-primary">
            Choose Your Plan
          </h1>
          <p className="text-lg text-foreground-secondary max-w-2xl mx-auto">
            Select the perfect subscription plan for your training needs. All plans include
            access to our comprehensive library of micro-learning reels.
          </p>
        </div>

        {/* Billing Interval Toggle */}
        <div className="flex items-center justify-center gap-4">
          <span
            className={cn(
              "text-sm font-medium transition-colors",
              billingInterval === "monthly"
                ? "text-foreground-primary"
                : "text-foreground-secondary"
            )}
          >
            Monthly
          </span>
          <button
            type="button"
            onClick={() =>
              setBillingInterval(
                billingInterval === "monthly" ? "yearly" : "monthly"
              )
            }
            className="relative inline-flex h-8 w-14 items-center rounded-full bg-primary transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
          >
            <span
              className={cn(
                "inline-block h-6 w-6 transform rounded-full bg-white transition-transform",
                billingInterval === "yearly" ? "translate-x-7" : "translate-x-1"
              )}
            />
          </button>
          <span
            className={cn(
              "text-sm font-medium transition-colors",
              billingInterval === "yearly"
                ? "text-foreground-primary"
                : "text-foreground-secondary"
            )}
          >
            Yearly
            <Badge className="ml-2 bg-success text-white text-xs">Save 20%</Badge>
          </span>
        </div>
      </div>

      {/* Plans Grid */}
      {plansLoading ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="h-96 bg-muted rounded-lg"></div>
            </div>
          ))}
        </div>
      ) : filteredPlans.length > 0 ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPlans.map((plan) => (
            <Card
              key={plan.id}
              className={cn(
                "card-base relative transition-all duration-300 hover:shadow-lg hover:-translate-y-1",
                plan.is_popular && "border-2 border-primary shadow-lg scale-105"
              )}
            >
              {plan.is_popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <Badge className="bg-primary text-white px-4 py-1">
                    Most Popular
                  </Badge>
                </div>
              )}
              <CardHeader className="text-center pb-4">
                <CardTitle className="text-2xl">{plan.name}</CardTitle>
                <CardDescription className="text-base mt-2">
                  {plan.description}
                </CardDescription>
                <div className="mt-6">
                  <div className="flex items-baseline justify-center gap-2">
                    <span className="text-5xl font-bold text-foreground-primary">
                      ${plan.price}
                    </span>
                    <span className="text-foreground-secondary">
                      /{plan.billing_interval === "monthly" ? "mo" : "yr"}
                    </span>
                  </div>
                  {plan.billing_interval === "yearly" && (
                    <p className="text-sm text-foreground-secondary mt-2">
                      ${(plan.price / 12).toFixed(2)} per month
                    </p>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Features List */}
                <ul className="space-y-3">
                  {plan.features.map((feature, idx) => {
                    // Try to extract icon from feature text
                    const featureLower = feature.toLowerCase();
                    let icon = <CheckCircle2 className="h-5 w-5 text-success flex-shrink-0" />;
                    
                    if (featureLower.includes("user")) {
                      icon = <Users className="h-5 w-5 text-primary flex-shrink-0" />;
                    } else if (featureLower.includes("storage") || featureLower.includes("gb")) {
                      icon = <Sparkles className="h-5 w-5 text-primary flex-shrink-0" />;
                    } else if (featureLower.includes("speed") || featureLower.includes("fast")) {
                      icon = <Zap className="h-5 w-5 text-primary flex-shrink-0" />;
                    } else if (featureLower.includes("security") || featureLower.includes("secure")) {
                      icon = <Shield className="h-5 w-5 text-primary flex-shrink-0" />;
                    }

                    return (
                      <li
                        key={idx}
                        className="flex items-start gap-3 text-sm text-foreground-secondary"
                      >
                        {icon}
                        <span>{feature}</span>
                      </li>
                    );
                  })}
                </ul>

                {/* Limits Display */}
                {(plan.max_users || plan.max_reels || plan.max_storage_gb) && (
                  <div className="pt-4 border-t border-border space-y-2">
                    {plan.max_users && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-foreground-secondary">Max Users</span>
                        <span className="font-medium text-foreground-primary">
                          {plan.max_users === -1 ? "Unlimited" : plan.max_users}
                        </span>
                      </div>
                    )}
                    {plan.max_reels && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-foreground-secondary">Max Reels</span>
                        <span className="font-medium text-foreground-primary">
                          {plan.max_reels === -1 ? "Unlimited" : plan.max_reels}
                        </span>
                      </div>
                    )}
                    {plan.max_storage_gb && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-foreground-secondary">Storage</span>
                        <span className="font-medium text-foreground-primary">
                          {plan.max_storage_gb === -1
                            ? "Unlimited"
                            : `${plan.max_storage_gb} GB`}
                        </span>
                      </div>
                    )}
                  </div>
                )}

                {/* CTA Button */}
                <Button
                  onClick={() => handleSelectPlan(plan.id)}
                  className="w-full"
                  variant={plan.is_popular ? "default" : "outline"}
                  size="lg"
                >
                  {plan.is_popular ? "Get Started" : "Select Plan"}
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="py-12 text-center">
          <p className="text-foreground-secondary">
            No plans available at this time
          </p>
        </div>
      )}

      {/* FAQ Section */}
      <Card className="card-base">
        <CardHeader>
          <CardTitle>Frequently Asked Questions</CardTitle>
          <CardDescription>
            Common questions about our subscription plans
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <h4 className="font-semibold text-foreground-primary">
              Can I change my plan later?
            </h4>
            <p className="text-sm text-foreground-secondary">
              Yes, you can upgrade or downgrade your plan at any time. Changes will be
              prorated and reflected in your next billing cycle.
            </p>
          </div>
          <div className="space-y-2">
            <h4 className="font-semibold text-foreground-primary">
              What payment methods do you accept?
            </h4>
            <p className="text-sm text-foreground-secondary">
              We accept all major credit cards, debit cards, and bank transfers. All
              payments are processed securely through Stripe.
            </p>
          </div>
          <div className="space-y-2">
            <h4 className="font-semibold text-foreground-primary">
              Is there a free trial?
            </h4>
            <p className="text-sm text-foreground-secondary">
              Yes, new customers can start with a 14-day free trial. No credit card
              required to start your trial.
            </p>
          </div>
          <div className="space-y-2">
            <h4 className="font-semibold text-foreground-primary">
              Can I cancel anytime?
            </h4>
            <p className="text-sm text-foreground-secondary">
              Absolutely. You can cancel your subscription at any time from your account
              settings. You'll continue to have access until the end of your billing
              period.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
