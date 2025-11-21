import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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
          <Tabs defaultValue="organization">
            <TabsList>
              <TabsTrigger value="organization">Organization</TabsTrigger>
              <TabsTrigger value="billing">Billing</TabsTrigger>
              <TabsTrigger value="integrations">Integrations</TabsTrigger>
              <TabsTrigger value="notifications">Notifications</TabsTrigger>
            </TabsList>
            <TabsContent value="organization">
              <p className="text-foreground-secondary">Organization details form would be here</p>
            </TabsContent>
            <TabsContent value="billing">
              <p className="text-foreground-secondary">Subscription and billing section would be here</p>
            </TabsContent>
            <TabsContent value="integrations">
              <p className="text-foreground-secondary">SSO, LMS export, API tokens would be here</p>
            </TabsContent>
            <TabsContent value="notifications">
              <p className="text-foreground-secondary">Notification preferences would be here</p>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
