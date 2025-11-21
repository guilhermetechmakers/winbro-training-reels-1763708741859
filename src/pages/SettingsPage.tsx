import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SecuritySettings } from "@/components/auth/SecuritySettings";
import { Shield } from "lucide-react";

export default function SettingsPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in-up">
      <div>
        <h1 className="text-3xl font-bold text-foreground-primary">Settings</h1>
        <p className="text-foreground-secondary mt-1">
          Manage your organization and preferences
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Settings</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="security">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="security" className="flex items-center gap-2">
                <Shield className="h-4 w-4" />
                Security
              </TabsTrigger>
              <TabsTrigger value="organization">Organization</TabsTrigger>
              <TabsTrigger value="billing">Billing</TabsTrigger>
              <TabsTrigger value="integrations">Integrations</TabsTrigger>
              <TabsTrigger value="notifications">Notifications</TabsTrigger>
            </TabsList>
            <TabsContent value="security" className="mt-6">
              <SecuritySettings />
            </TabsContent>
            <TabsContent value="organization" className="mt-6">
              <p className="text-foreground-secondary">Organization details form would be here</p>
            </TabsContent>
            <TabsContent value="billing" className="mt-6">
              <p className="text-foreground-secondary">Subscription and billing section would be here</p>
            </TabsContent>
            <TabsContent value="integrations" className="mt-6">
              <p className="text-foreground-secondary">SSO, LMS export, API tokens would be here</p>
            </TabsContent>
            <TabsContent value="notifications" className="mt-6">
              <p className="text-foreground-secondary">Notification preferences would be here</p>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
