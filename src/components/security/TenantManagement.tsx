import { useTenant, useUpdateTenant } from "@/hooks/use-security";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Building2, AlertTriangle, Save } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const tenantSchema = z.object({
  tenant_name: z.string().min(1, "Tenant name is required"),
  admin_contact: z.string().email("Invalid email address"),
});

type TenantFormData = z.infer<typeof tenantSchema>;

export function TenantManagement() {
  const { data: tenant, isLoading, error } = useTenant();
  const updateTenant = useUpdateTenant();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<TenantFormData>({
    resolver: zodResolver(tenantSchema),
    defaultValues: {
      tenant_name: tenant?.tenant_name || "",
      admin_contact: tenant?.admin_contact || "",
    },
  });

  // Reset form when tenant data loads
  if (tenant && !isSubmitting) {
    reset({
      tenant_name: tenant.tenant_name,
      admin_contact: tenant.admin_contact,
    });
  }

  const onSubmit = async (data: TenantFormData) => {
    await updateTenant.mutateAsync(data);
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <AlertTriangle className="h-12 w-12 text-destructive mx-auto mb-4" />
        <p className="text-foreground-secondary">Failed to load tenant information</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Tenant Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Tenant Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="tenant_name">Tenant Name</Label>
              <Input
                id="tenant_name"
                {...register("tenant_name")}
                placeholder="Enter tenant name"
                className={errors.tenant_name ? "border-destructive" : ""}
              />
              {errors.tenant_name && (
                <p className="text-sm text-destructive">{errors.tenant_name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="admin_contact">Admin Contact Email</Label>
              <Input
                id="admin_contact"
                type="email"
                {...register("admin_contact")}
                placeholder="admin@example.com"
                className={errors.admin_contact ? "border-destructive" : ""}
              />
              {errors.admin_contact && (
                <p className="text-sm text-destructive">{errors.admin_contact.message}</p>
              )}
            </div>

            <Button type="submit" disabled={isSubmitting || updateTenant.isPending}>
              {isSubmitting || updateTenant.isPending ? (
                <>
                  <Save className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Access Control Information */}
      <Card>
        <CardHeader>
          <CardTitle>Access Control</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 text-sm">
            <div>
              <p className="font-medium text-foreground-primary mb-2">Tenant Isolation</p>
              <p className="text-foreground-secondary">
                Your tenant is isolated from other tenants using row-level security (RLS) and
                access control lists (ACLs). All data access is automatically scoped to your
                tenant, ensuring complete data privacy and security.
              </p>
            </div>
            <div>
              <p className="font-medium text-foreground-primary mb-2">Access Control Lists (ACLs)</p>
              <p className="text-foreground-secondary">
                ACLs are dynamically applied based on user roles and permissions. Each user action
                is validated against their assigned permissions before being allowed. All access
                attempts are logged for audit purposes.
              </p>
            </div>
            <div>
              <p className="font-medium text-foreground-primary mb-2">Audit Logging</p>
              <p className="text-foreground-secondary">
                All actions performed within your tenant are logged with timestamps, user
                information, and action details. These logs are available in the Audit Logs section
                and can be exported for compliance purposes.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
