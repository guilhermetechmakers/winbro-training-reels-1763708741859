import { NotificationSettings } from "@/components/notifications/NotificationSettings";
import { Bell } from "lucide-react";

export default function NotificationSettingsPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in-up">
      <div>
        <h1 className="text-3xl font-bold text-foreground-primary flex items-center gap-2">
          <Bell className="h-8 w-8" />
          Notification Settings
        </h1>
        <p className="text-foreground-secondary mt-1">
          Manage how and when you receive notifications
        </p>
      </div>

      <NotificationSettings />
    </div>
  );
}
