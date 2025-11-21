import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, Lock, FileText, CheckCircle2, Building2 } from "lucide-react";
import { SecurityDashboard } from "@/components/security/SecurityDashboard";
import { EncryptionDashboard } from "@/components/security/EncryptionDashboard";
import { AuditLogs } from "@/components/security/AuditLogs";
import { ComplianceCenter } from "@/components/security/ComplianceCenter";
import { TenantManagement } from "@/components/security/TenantManagement";

export default function SecurityCompliancePage() {
  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-fade-in-up">
      <div>
        <h1 className="text-3xl font-bold text-foreground-primary">Security & Compliance</h1>
        <p className="text-foreground-secondary mt-1">
          Manage security settings, encryption, audit logs, and compliance requests
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Security & Compliance</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="dashboard" className="w-full">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="dashboard" className="flex items-center gap-2">
                <Shield className="h-4 w-4" />
                Dashboard
              </TabsTrigger>
              <TabsTrigger value="encryption" className="flex items-center gap-2">
                <Lock className="h-4 w-4" />
                Encryption
              </TabsTrigger>
              <TabsTrigger value="audit-logs" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Audit Logs
              </TabsTrigger>
              <TabsTrigger value="compliance" className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4" />
                Compliance
              </TabsTrigger>
              <TabsTrigger value="tenant" className="flex items-center gap-2">
                <Building2 className="h-4 w-4" />
                Tenant
              </TabsTrigger>
            </TabsList>
            <TabsContent value="dashboard" className="mt-6">
              <SecurityDashboard />
            </TabsContent>
            <TabsContent value="encryption" className="mt-6">
              <EncryptionDashboard />
            </TabsContent>
            <TabsContent value="audit-logs" className="mt-6">
              <AuditLogs />
            </TabsContent>
            <TabsContent value="compliance" className="mt-6">
              <ComplianceCenter />
            </TabsContent>
            <TabsContent value="tenant" className="mt-6">
              <TenantManagement />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
