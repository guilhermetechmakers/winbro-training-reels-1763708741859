import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { subscriptionsApi, checkoutApi } from "@/lib/api";
import { toast } from "sonner";
import type { Subscription, SubscriptionPlan } from "@/types";

// Get all subscriptions
export function useSubscriptions(filters?: { user_id?: string; status?: string }) {
  return useQuery<Subscription[]>({
    queryKey: ["subscriptions", filters],
    queryFn: () => subscriptionsApi.getSubscriptions(filters),
  });
}

// Get single subscription
export function useSubscription(id: string) {
  return useQuery<Subscription>({
    queryKey: ["subscription", id],
    queryFn: () => subscriptionsApi.getSubscription(id),
    enabled: !!id,
  });
}

// Get current user's subscription
export function useCurrentSubscription() {
  return useQuery<Subscription | null>({
    queryKey: ["current-subscription"],
    queryFn: () => subscriptionsApi.getCurrentSubscription(),
  });
}

// Get subscription plans
export function useSubscriptionPlans() {
  return useQuery<SubscriptionPlan[]>({
    queryKey: ["subscription-plans"],
    queryFn: () => checkoutApi.getPlans(),
  });
}

// Update subscription mutation
export function useUpdateSubscription() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: { plan_id?: string; status?: string } }) =>
      subscriptionsApi.updateSubscription(id, data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["subscriptions"] });
      queryClient.invalidateQueries({ queryKey: ["subscription", data.id] });
      queryClient.invalidateQueries({ queryKey: ["current-subscription"] });
      toast.success("Subscription updated successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update subscription");
    },
  });
}

// Cancel subscription mutation
export function useCancelSubscription() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data?: { reason?: string; feedback?: string } }) =>
      subscriptionsApi.cancelSubscription(id, data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["subscriptions"] });
      queryClient.invalidateQueries({ queryKey: ["subscription", data.id] });
      queryClient.invalidateQueries({ queryKey: ["current-subscription"] });
      toast.success("Subscription cancelled successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to cancel subscription");
    },
  });
}

// Resume subscription mutation
export function useResumeSubscription() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => subscriptionsApi.resumeSubscription(id),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["subscriptions"] });
      queryClient.invalidateQueries({ queryKey: ["subscription", data.id] });
      queryClient.invalidateQueries({ queryKey: ["current-subscription"] });
      toast.success("Subscription resumed successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to resume subscription");
    },
  });
}

// Upgrade subscription mutation
export function useUpgradeSubscription() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, newPlanId }: { id: string; newPlanId: string }) =>
      subscriptionsApi.upgradeSubscription(id, newPlanId),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["subscriptions"] });
      queryClient.invalidateQueries({ queryKey: ["subscription", data.id] });
      queryClient.invalidateQueries({ queryKey: ["current-subscription"] });
      toast.success("Subscription upgraded successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to upgrade subscription");
    },
  });
}

// Downgrade subscription mutation
export function useDowngradeSubscription() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, newPlanId }: { id: string; newPlanId: string }) =>
      subscriptionsApi.downgradeSubscription(id, newPlanId),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["subscriptions"] });
      queryClient.invalidateQueries({ queryKey: ["subscription", data.id] });
      queryClient.invalidateQueries({ queryKey: ["current-subscription"] });
      toast.success("Subscription downgraded successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to downgrade subscription");
    },
  });
}
