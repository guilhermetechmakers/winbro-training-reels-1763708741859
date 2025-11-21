import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  RefreshCw,
  Search,
  Filter,
  X,
  Edit,
  Trash2,
  AlertCircle,
  CheckCircle2,
  Calendar,
  DollarSign,
} from "lucide-react";
import { subscriptionsApi, checkoutApi } from "@/lib/api";
import { toast } from "sonner";
import type { Subscription, SubscriptionPlan } from "@/types";

type SortField = "user_id" | "plan_id" | "status" | "start_date" | "end_date";
type SortDirection = "asc" | "desc";

export default function AdminSubscriptionManagement() {
  const queryClient = useQueryClient();
  const [filters, setFilters] = useState<{
    user_id?: string;
    status?: string;
    search?: string;
  }>({});
  const [sortField, setSortField] = useState<SortField>("start_date");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const [selectedSubscription, setSelectedSubscription] =
    useState<Subscription | null>(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [cancelModalOpen, setCancelModalOpen] = useState(false);

  // Fetch subscriptions
  const {
    data: subscriptions,
    isLoading: subscriptionsLoading,
    error: subscriptionsError,
  } = useQuery<Subscription[]>({
    queryKey: ["subscriptions", filters],
    queryFn: () => subscriptionsApi.getSubscriptions(filters),
  });

  // Fetch plans for editing
  const { data: plans } = useQuery<SubscriptionPlan[]>({
    queryKey: ["subscription-plans"],
    queryFn: () => checkoutApi.getPlans(),
  });

  // Update subscription mutation
  const updateMutation = useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: { plan_id?: string; status?: string };
    }) => subscriptionsApi.updateSubscription(id, data),
    onSuccess: () => {
      toast.success("Subscription updated successfully");
      queryClient.invalidateQueries({ queryKey: ["subscriptions"] });
      setEditModalOpen(false);
      setSelectedSubscription(null);
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update subscription");
    },
  });

  // Cancel subscription mutation
  const cancelMutation = useMutation({
    mutationFn: (id: string) =>
      subscriptionsApi.cancelSubscription(id, {
        reason: "Cancelled by admin",
      }),
    onSuccess: () => {
      toast.success("Subscription cancelled successfully");
      queryClient.invalidateQueries({ queryKey: ["subscriptions"] });
      setCancelModalOpen(false);
      setSelectedSubscription(null);
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to cancel subscription");
    },
  });

  // Handle edit
  const handleEdit = (subscription: Subscription) => {
    setSelectedSubscription(subscription);
    setEditModalOpen(true);
  };

  // Handle cancel
  const handleCancel = (subscription: Subscription) => {
    setSelectedSubscription(subscription);
    setCancelModalOpen(true);
  };

  // Sort subscriptions
  const sortedSubscriptions = subscriptions
    ? [...subscriptions].sort((a, b) => {
        let comparison = 0;
        switch (sortField) {
          case "user_id":
            comparison = a.user_id.localeCompare(b.user_id);
            break;
          case "plan_id":
            comparison = a.plan_id.localeCompare(b.plan_id);
            break;
          case "status":
            comparison = a.status.localeCompare(b.status);
            break;
          case "start_date":
            comparison =
              new Date(a.start_date).getTime() -
              new Date(b.start_date).getTime();
            break;
          case "end_date":
            comparison =
              (a.end_date ? new Date(a.end_date).getTime() : 0) -
              (b.end_date ? new Date(b.end_date).getTime() : 0);
            break;
        }
        return sortDirection === "asc" ? comparison : -comparison;
      })
    : [];

  // Filter by search
  const filteredSubscriptions = sortedSubscriptions.filter((sub) => {
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      return (
        sub.user_id.toLowerCase().includes(searchLower) ||
        sub.plan_id.toLowerCase().includes(searchLower) ||
        sub.status.toLowerCase().includes(searchLower) ||
        sub.plan?.name.toLowerCase().includes(searchLower)
      );
    }
    return true;
  });

  // Get status badge
  const getStatusBadge = (status: Subscription["status"]) => {
    switch (status) {
      case "active":
        return <Badge className="bg-success text-white">Active</Badge>;
      case "cancelled":
        return <Badge variant="secondary">Cancelled</Badge>;
      case "expired":
        return <Badge variant="destructive">Expired</Badge>;
      case "pending":
        return <Badge className="bg-archived text-white">Pending</Badge>;
      case "past_due":
        return <Badge variant="destructive">Past Due</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  // Handle sort
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("desc");
    }
  };

  // Clear filters
  const clearFilters = () => {
    setFilters({});
  };

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground-primary">
          Subscription Management
        </h1>
        <p className="text-foreground-secondary mt-1">
          Manage all user subscriptions, view metrics, and handle cancellations
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid md:grid-cols-4 gap-4">
        <Card className="card-base">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-foreground-secondary">Total Subscriptions</p>
                <p className="text-2xl font-bold text-foreground-primary">
                  {subscriptions?.length || 0}
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-primary opacity-50" />
            </div>
          </CardContent>
        </Card>
        <Card className="card-base">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-foreground-secondary">Active</p>
                <p className="text-2xl font-bold text-success">
                  {subscriptions?.filter((s) => s.status === "active").length || 0}
                </p>
              </div>
              <CheckCircle2 className="h-8 w-8 text-success opacity-50" />
            </div>
          </CardContent>
        </Card>
        <Card className="card-base">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-foreground-secondary">Cancelled</p>
                <p className="text-2xl font-bold text-foreground-secondary">
                  {subscriptions?.filter((s) => s.status === "cancelled").length || 0}
                </p>
              </div>
              <X className="h-8 w-8 text-foreground-secondary opacity-50" />
            </div>
          </CardContent>
        </Card>
        <Card className="card-base">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-foreground-secondary">Past Due</p>
                <p className="text-2xl font-bold text-destructive">
                  {subscriptions?.filter((s) => s.status === "past_due").length || 0}
                </p>
              </div>
              <AlertCircle className="h-8 w-8 text-destructive opacity-50" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="card-base">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Filter className="h-5 w-5 text-foreground-secondary" />
              <CardTitle className="text-lg">Filters</CardTitle>
            </div>
            {(filters.user_id || filters.status || filters.search) && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className="h-8"
              >
                <X className="h-4 w-4 mr-1" />
                Clear
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="search">Search</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-foreground-secondary" />
                <Input
                  id="search"
                  placeholder="Search subscriptions..."
                  value={filters.search || ""}
                  onChange={(e) =>
                    setFilters({ ...filters, search: e.target.value })
                  }
                  className="pl-9"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="user_id">User ID</Label>
              <Input
                id="user_id"
                placeholder="Filter by user ID"
                value={filters.user_id || ""}
                onChange={(e) =>
                  setFilters({ ...filters, user_id: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={filters.status || "all"}
                onValueChange={(value) =>
                  setFilters({
                    ...filters,
                    status: value === "all" ? undefined : value,
                  })
                }
              >
                <SelectTrigger id="status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                  <SelectItem value="expired">Expired</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="past_due">Past Due</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Subscriptions Table */}
      <Card className="card-base">
        <CardHeader>
          <CardTitle>Subscriptions</CardTitle>
          <CardDescription>
            {filteredSubscriptions.length} subscription
            {filteredSubscriptions.length !== 1 ? "s" : ""} found
          </CardDescription>
        </CardHeader>
        <CardContent>
          {subscriptionsLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="animate-pulse">
                  <div className="h-16 bg-muted rounded"></div>
                </div>
              ))}
            </div>
          ) : subscriptionsError ? (
            <div className="py-12 text-center">
              <p className="text-foreground-secondary mb-4">
                Failed to load subscriptions
              </p>
              <Button
                variant="outline"
                onClick={() =>
                  queryClient.invalidateQueries({ queryKey: ["subscriptions"] })
                }
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Retry
              </Button>
            </div>
          ) : filteredSubscriptions.length === 0 ? (
            <div className="py-12 text-center">
              <p className="text-foreground-secondary mb-4">
                No subscriptions found
              </p>
              {Object.keys(filters).length > 0 && (
                <Button variant="outline" onClick={clearFilters}>
                  Clear Filters
                </Button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead
                      className="cursor-pointer hover:text-foreground-primary"
                      onClick={() => handleSort("user_id")}
                    >
                      User ID
                      {sortField === "user_id" && (
                        <span className="text-xs ml-1">
                          {sortDirection === "asc" ? "↑" : "↓"}
                        </span>
                      )}
                    </TableHead>
                    <TableHead
                      className="cursor-pointer hover:text-foreground-primary"
                      onClick={() => handleSort("plan_id")}
                    >
                      Plan
                      {sortField === "plan_id" && (
                        <span className="text-xs ml-1">
                          {sortDirection === "asc" ? "↑" : "↓"}
                        </span>
                      )}
                    </TableHead>
                    <TableHead
                      className="cursor-pointer hover:text-foreground-primary"
                      onClick={() => handleSort("status")}
                    >
                      Status
                      {sortField === "status" && (
                        <span className="text-xs ml-1">
                          {sortDirection === "asc" ? "↑" : "↓"}
                        </span>
                      )}
                    </TableHead>
                    <TableHead
                      className="cursor-pointer hover:text-foreground-primary"
                      onClick={() => handleSort("start_date")}
                    >
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        Start Date
                        {sortField === "start_date" && (
                          <span className="text-xs">
                            {sortDirection === "asc" ? "↑" : "↓"}
                          </span>
                        )}
                      </div>
                    </TableHead>
                    <TableHead>End Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSubscriptions.map((subscription) => (
                    <TableRow
                      key={subscription.id}
                      className="hover:bg-muted/50 transition-colors"
                    >
                      <TableCell className="font-mono text-sm">
                        {subscription.user_id.slice(0, 8)}...
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium text-foreground-primary">
                            {subscription.plan?.name || subscription.plan_id}
                          </p>
                          {subscription.plan && (
                            <p className="text-xs text-foreground-secondary">
                              ${subscription.plan.price}/
                              {subscription.plan.billing_interval === "monthly"
                                ? "mo"
                                : "yr"}
                            </p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(subscription.status)}</TableCell>
                      <TableCell>
                        {format(new Date(subscription.start_date), "MMM dd, yyyy")}
                      </TableCell>
                      <TableCell>
                        {subscription.end_date
                          ? format(new Date(subscription.end_date), "MMM dd, yyyy")
                          : "—"}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(subscription)}
                            className="h-8"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          {subscription.status === "active" && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleCancel(subscription)}
                              className="h-8 text-destructive hover:text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Modal */}
      {selectedSubscription && (
        <Dialog open={editModalOpen} onOpenChange={setEditModalOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Edit Subscription</DialogTitle>
              <DialogDescription>
                Update subscription plan or status
              </DialogDescription>
            </DialogHeader>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                updateMutation.mutate({
                  id: selectedSubscription.id,
                  data: {
                    plan_id: formData.get("plan_id") as string,
                    status: formData.get("status") as string,
                  },
                });
              }}
              className="space-y-4"
            >
              <div className="space-y-2">
                <Label htmlFor="plan_id">Plan</Label>
                <Select
                  name="plan_id"
                  defaultValue={selectedSubscription.plan_id}
                >
                  <SelectTrigger id="plan_id">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {plans?.map((plan) => (
                      <SelectItem key={plan.id} value={plan.id}>
                        {plan.name} - ${plan.price}/
                        {plan.billing_interval === "monthly" ? "mo" : "yr"}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  name="status"
                  defaultValue={selectedSubscription.status}
                >
                  <SelectTrigger id="status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                    <SelectItem value="expired">Expired</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="past_due">Past Due</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setEditModalOpen(false);
                    setSelectedSubscription(null);
                  }}
                  disabled={updateMutation.isPending}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={updateMutation.isPending}>
                  {updateMutation.isPending ? "Updating..." : "Update"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      )}

      {/* Cancel Confirmation Modal */}
      {selectedSubscription && (
        <Dialog open={cancelModalOpen} onOpenChange={setCancelModalOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Cancel Subscription</DialogTitle>
              <DialogDescription>
                Are you sure you want to cancel this subscription? This action
                cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="p-4 rounded-lg bg-muted/50 space-y-2">
                <p className="text-sm text-foreground-secondary">User ID</p>
                <p className="font-mono text-sm text-foreground-primary">
                  {selectedSubscription.user_id}
                </p>
                <p className="text-sm text-foreground-secondary">Plan</p>
                <p className="font-medium text-foreground-primary">
                  {selectedSubscription.plan?.name || selectedSubscription.plan_id}
                </p>
              </div>
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setCancelModalOpen(false);
                    setSelectedSubscription(null);
                  }}
                  disabled={cancelMutation.isPending}
                >
                  Keep Subscription
                </Button>
                <Button
                  type="button"
                  variant="destructive"
                  onClick={() => cancelMutation.mutate(selectedSubscription.id)}
                  disabled={cancelMutation.isPending}
                >
                  {cancelMutation.isPending ? "Cancelling..." : "Cancel Subscription"}
                </Button>
              </DialogFooter>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
