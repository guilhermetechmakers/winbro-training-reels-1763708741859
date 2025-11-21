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
import { Separator } from "@/components/ui/separator";
import {
  Download,
  RefreshCw,
  CreditCard,
  FileText,
  Calendar,
  Filter,
  X,
  Plus,
  Edit,
  Trash2,
} from "lucide-react";
import { transactionsApi } from "@/lib/api";
import { toast } from "sonner";
import type {
  Transaction,
  BillingContact,
  PaymentMethod,
} from "@/types";
import RequestRefundModal from "@/components/transactions/RequestRefundModal";
import EditPaymentMethodModal from "@/components/transactions/EditPaymentMethodModal";

type SortField = "date" | "amount" | "plan";
type SortDirection = "asc" | "desc";

export default function TransactionHistoryPage() {
  const queryClient = useQueryClient();
  const [filters, setFilters] = useState<{
    startDate?: string;
    endDate?: string;
    status?: string;
  }>({});
  const [sortField, setSortField] = useState<SortField>("date");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const [selectedTransaction, setSelectedTransaction] =
    useState<Transaction | null>(null);
  const [refundModalOpen, setRefundModalOpen] = useState(false);
  const [paymentMethodModalOpen, setPaymentMethodModalOpen] = useState(false);
  const [editingPaymentMethod, setEditingPaymentMethod] =
    useState<PaymentMethod | undefined>(undefined);

  // Fetch transactions
  const {
    data: transactions,
    isLoading: transactionsLoading,
    error: transactionsError,
  } = useQuery<Transaction[]>({
    queryKey: ["transactions", filters],
    queryFn: () => transactionsApi.getTransactions(filters),
  });

  // Fetch billing contact
  const { data: billingContact } = useQuery<BillingContact>({
    queryKey: ["billing-contact"],
    queryFn: () => transactionsApi.getBillingContact(),
  });

  // Fetch payment methods
  const { data: paymentMethods } = useQuery<PaymentMethod[]>({
    queryKey: ["payment-methods"],
    queryFn: () => transactionsApi.getPaymentMethods(),
  });

  // Delete payment method mutation
  const deletePaymentMethodMutation = useMutation({
    mutationFn: (id: string) => transactionsApi.deletePaymentMethod(id),
    onSuccess: () => {
      toast.success("Payment method deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["payment-methods"] });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to delete payment method");
    },
  });

  // Handle invoice download
  const handleDownloadInvoice = async (transactionId: string) => {
    try {
      await transactionsApi.downloadInvoice(transactionId);
      toast.success("Invoice downloaded successfully");
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to download invoice"
      );
    }
  };

  // Handle refund request
  const handleRequestRefund = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setRefundModalOpen(true);
  };

  // Handle payment method edit
  const handleEditPaymentMethod = (method?: PaymentMethod) => {
    setEditingPaymentMethod(method);
    setPaymentMethodModalOpen(true);
  };

  // Sort transactions
  const sortedTransactions = transactions
    ? [...transactions].sort((a, b) => {
        let comparison = 0;
        switch (sortField) {
          case "date":
            comparison =
              new Date(a.date).getTime() - new Date(b.date).getTime();
            break;
          case "amount":
            comparison = a.amount - b.amount;
            break;
          case "plan":
            comparison = a.plan.localeCompare(b.plan);
            break;
        }
        return sortDirection === "asc" ? comparison : -comparison;
      })
    : [];

  // Get status badge variant
  const getStatusBadge = (status: Transaction["status"]) => {
    switch (status) {
      case "completed":
        return (
          <Badge className="bg-success text-white">Completed</Badge>
        );
      case "pending":
        return <Badge variant="secondary">Pending</Badge>;
      case "failed":
        return <Badge variant="destructive">Failed</Badge>;
      case "refunded":
        return <Badge className="bg-archived text-white">Refunded</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  // Clear filters
  const clearFilters = () => {
    setFilters({});
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

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground-primary">
          Transaction History
        </h1>
        <p className="text-foreground-secondary mt-1">
          View and manage your invoices and payment history
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main Content - Transactions Table */}
        <div className="lg:col-span-2 space-y-6">
          {/* Filters */}
          <Card className="card-base">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Filter className="h-5 w-5 text-foreground-secondary" />
                  <CardTitle className="text-lg">Filters</CardTitle>
                </div>
                {(filters.startDate ||
                  filters.endDate ||
                  filters.status) && (
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
                  <Label htmlFor="start-date">Start Date</Label>
                  <Input
                    id="start-date"
                    type="date"
                    value={filters.startDate || ""}
                    onChange={(e) =>
                      setFilters({ ...filters, startDate: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="end-date">End Date</Label>
                  <Input
                    id="end-date"
                    type="date"
                    value={filters.endDate || ""}
                    onChange={(e) =>
                      setFilters({ ...filters, endDate: e.target.value })
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
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="failed">Failed</SelectItem>
                      <SelectItem value="refunded">Refunded</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Transactions Table */}
          <Card className="card-base">
            <CardHeader>
              <CardTitle>Transactions</CardTitle>
              <CardDescription>
                {sortedTransactions.length} transaction
                {sortedTransactions.length !== 1 ? "s" : ""} found
              </CardDescription>
            </CardHeader>
            <CardContent>
              {transactionsLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="animate-pulse">
                      <div className="h-16 bg-muted rounded"></div>
                    </div>
                  ))}
                </div>
              ) : transactionsError ? (
                <div className="py-12 text-center">
                  <p className="text-foreground-secondary mb-4">
                    Failed to load transactions
                  </p>
                  <Button
                    variant="outline"
                    onClick={() => queryClient.invalidateQueries({ queryKey: ["transactions"] })}
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Retry
                  </Button>
                </div>
              ) : sortedTransactions.length === 0 ? (
                <div className="py-12 text-center">
                  <FileText className="h-12 w-12 text-muted mx-auto mb-4" />
                  <p className="text-foreground-secondary mb-4">
                    No transactions found
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
                          onClick={() => handleSort("date")}
                        >
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            Date
                            {sortField === "date" && (
                              <span className="text-xs">
                                {sortDirection === "asc" ? "↑" : "↓"}
                              </span>
                            )}
                          </div>
                        </TableHead>
                        <TableHead
                          className="cursor-pointer hover:text-foreground-primary"
                          onClick={() => handleSort("plan")}
                        >
                          <div className="flex items-center gap-2">
                            Plan
                            {sortField === "plan" && (
                              <span className="text-xs">
                                {sortDirection === "asc" ? "↑" : "↓"}
                              </span>
                            )}
                          </div>
                        </TableHead>
                        <TableHead
                          className="cursor-pointer hover:text-foreground-primary"
                          onClick={() => handleSort("amount")}
                        >
                          <div className="flex items-center gap-2">
                            Amount
                            {sortField === "amount" && (
                              <span className="text-xs">
                                {sortDirection === "asc" ? "↑" : "↓"}
                              </span>
                            )}
                          </div>
                        </TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {sortedTransactions.map((transaction) => (
                        <TableRow
                          key={transaction.id}
                          className="hover:bg-muted/50 transition-colors"
                        >
                          <TableCell>
                            {format(new Date(transaction.date), "MMM dd, yyyy")}
                          </TableCell>
                          <TableCell className="font-medium">
                            {transaction.plan}
                          </TableCell>
                          <TableCell>
                            ${transaction.amount.toFixed(2)}
                          </TableCell>
                          <TableCell>
                            {getStatusBadge(transaction.status)}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-2">
                              {transaction.invoice_link && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() =>
                                    handleDownloadInvoice(transaction.id)
                                  }
                                  className="h-8"
                                >
                                  <Download className="h-4 w-4" />
                                </Button>
                              )}
                              {transaction.status === "completed" &&
                                !transaction.refund_requested && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() =>
                                      handleRequestRefund(transaction)
                                    }
                                    className="h-8"
                                  >
                                    Request Refund
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
        </div>

        {/* Side Panel - Billing Info */}
        <div className="space-y-6">
          {/* Billing Contact */}
          <Card className="card-base">
            <CardHeader>
              <CardTitle className="text-lg">Billing Contact</CardTitle>
              <CardDescription>
                Your primary billing contact information
              </CardDescription>
            </CardHeader>
            <CardContent>
              {billingContact ? (
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-foreground-secondary">Name</p>
                    <p className="font-medium text-foreground-primary">
                      {billingContact.contact_name}
                    </p>
                  </div>
                  <Separator />
                  <div>
                    <p className="text-sm text-foreground-secondary">Email</p>
                    <p className="font-medium text-foreground-primary">
                      {billingContact.email}
                    </p>
                  </div>
                  {billingContact.phone && (
                    <>
                      <Separator />
                      <div>
                        <p className="text-sm text-foreground-secondary">Phone</p>
                        <p className="font-medium text-foreground-primary">
                          {billingContact.phone}
                        </p>
                      </div>
                    </>
                  )}
                </div>
              ) : (
                <div className="py-8 text-center">
                  <p className="text-foreground-secondary mb-4">
                    No billing contact set
                  </p>
                  <Button variant="outline" size="sm">
                    Add Contact
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Payment Methods */}
          <Card className="card-base">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">Payment Methods</CardTitle>
                  <CardDescription>
                    Manage your saved payment methods
                  </CardDescription>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleEditPaymentMethod()}
                  className="h-8"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {paymentMethods && paymentMethods.length > 0 ? (
                <div className="space-y-3">
                  {paymentMethods.map((method) => (
                    <div
                      key={method.id}
                      className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <CreditCard className="h-5 w-5 text-foreground-secondary" />
                        <div>
                          <p className="font-medium text-foreground-primary">
                            {method.method_type === "card"
                              ? `${method.card_brand || "Card"} •••• ${method.card_last_four || ""}`
                              : method.method_type}
                          </p>
                          {method.is_default && (
                            <Badge variant="secondary" className="text-xs mt-1">
                              Default
                            </Badge>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditPaymentMethod(method)}
                          className="h-8 w-8 p-0"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            if (
                              confirm(
                                "Are you sure you want to delete this payment method?"
                              )
                            ) {
                              deletePaymentMethodMutation.mutate(method.id);
                            }
                          }}
                          className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-8 text-center">
                  <CreditCard className="h-12 w-12 text-muted mx-auto mb-4" />
                  <p className="text-foreground-secondary mb-4">
                    No payment methods saved
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEditPaymentMethod()}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Payment Method
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Modals */}
      {selectedTransaction && (
        <RequestRefundModal
          open={refundModalOpen}
          onOpenChange={setRefundModalOpen}
          transactionId={selectedTransaction.id}
          transactionAmount={selectedTransaction.amount}
        />
      )}

      <EditPaymentMethodModal
        open={paymentMethodModalOpen}
        onOpenChange={(open) => {
          setPaymentMethodModalOpen(open);
          if (!open) {
            setEditingPaymentMethod(undefined);
          }
        }}
        paymentMethod={editingPaymentMethod}
      />
    </div>
  );
}
