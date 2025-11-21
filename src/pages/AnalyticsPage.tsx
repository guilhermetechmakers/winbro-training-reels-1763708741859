import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function AnalyticsPage() {
  return (
    <div className="space-y-6 animate-fade-in-up">
      <div>
        <h1 className="text-3xl font-bold text-foreground-primary">Analytics & Reports</h1>
        <p className="text-foreground-secondary mt-1">
          Usage metrics and custom reports
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Dashboard</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-foreground-secondary text-center py-12">
            Prebuilt dashboards, custom report builder, and export options would be here
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
