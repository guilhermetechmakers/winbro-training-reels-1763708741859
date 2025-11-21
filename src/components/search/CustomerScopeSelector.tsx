import { Building2 } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { User } from "@/types";

interface CustomerScopeSelectorProps {
  customerId?: string;
  onCustomerChange: (customerId: string | undefined) => void;
  className?: string;
}

interface Customer {
  id: string;
  name: string;
}

export function CustomerScopeSelector({
  customerId,
  onCustomerChange,
  className,
}: CustomerScopeSelectorProps) {
  // Get current user to determine available customers
  const { data: user } = useQuery({
    queryKey: ["current-user"],
    queryFn: () => api.get<User>("/auth/me"),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Get user's customers (this would be from user.customer_affiliations or a separate endpoint)
  // For now, we'll use a mock or assume it's available from the user object
  const { data: customers } = useQuery({
    queryKey: ["user-customers", user?.id],
    queryFn: async () => {
      // This would be a real API call to get user's customers
      // For now, return empty array if no customer affiliations
      return [] as Customer[];
    },
    enabled: !!user,
    staleTime: 1000 * 60 * 10, // 10 minutes
  });

  // If user only has one customer or is admin, don't show selector
  if (!customers || customers.length <= 1) {
    return null;
  }

  return (
    <div className={`flex items-center gap-3 ${className || ""}`}>
      <Label className="text-sm font-medium text-foreground-secondary whitespace-nowrap flex items-center gap-2">
        <Building2 className="h-4 w-4" />
        Customer:
      </Label>
      <Select
        value={customerId || "all"}
        onValueChange={(value) =>
          onCustomerChange(value === "all" ? undefined : value)
        }
      >
        <SelectTrigger className="w-[200px]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Customers</SelectItem>
          {customers.map((customer) => (
            <SelectItem key={customer.id} value={customer.id}>
              {customer.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
