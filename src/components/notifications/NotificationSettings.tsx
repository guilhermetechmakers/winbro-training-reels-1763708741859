import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Bell, Mail, Save } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useNotificationPreferences,
  useUpdateNotificationPreferences,
} from "@/hooks/use-notifications";
import type { NotificationPreferences } from "@/types";

const notificationPreferencesSchema = z.object({
  channels: z.object({
    in_app: z.boolean(),
    email: z.boolean(),
  }),
  types: z.object({
    course_invites: z.boolean(),
    content_updates: z.boolean(),
    admin_alerts: z.boolean(),
    system_notifications: z.boolean(),
    course_completed: z.boolean(),
    quiz_results: z.boolean(),
  }),
  email_frequency: z.enum(['instant', 'digest', 'daily', 'weekly']),
  digest_time: z.string().optional(),
});

type NotificationPreferencesForm = z.infer<typeof notificationPreferencesSchema>;

export function NotificationSettings() {
  const { data: preferences, isLoading } = useNotificationPreferences();
  const updatePreferences = useUpdateNotificationPreferences();

  const form = useForm<NotificationPreferencesForm>({
    resolver: zodResolver(notificationPreferencesSchema),
    defaultValues: {
      channels: {
        in_app: true,
        email: true,
      },
      types: {
        course_invites: true,
        content_updates: true,
        admin_alerts: true,
        system_notifications: true,
        course_completed: true,
        quiz_results: true,
      },
      email_frequency: 'instant',
      digest_time: '09:00',
    },
    values: preferences ? {
      channels: preferences.channels,
      types: preferences.types,
      email_frequency: preferences.email_frequency,
      digest_time: preferences.digest_time,
    } : undefined,
  });

  const onSubmit = (data: NotificationPreferencesForm) => {
    updatePreferences.mutate(data);
  };

  const emailFrequency = form.watch('email_frequency');
  const emailEnabled = form.watch('channels.email');

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      {/* Notification Channels */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notification Channels
          </CardTitle>
          <CardDescription>
            Choose how you want to receive notifications
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="in-app" className="text-base">
                In-App Notifications
              </Label>
              <p className="text-sm text-muted-foreground">
                Receive notifications in the application
              </p>
            </div>
            <Switch
              id="in-app"
              checked={form.watch('channels.in_app')}
              onCheckedChange={(checked) =>
                form.setValue('channels.in_app', checked)
              }
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="email" className="text-base flex items-center gap-2">
                <Mail className="h-4 w-4" />
                Email Notifications
              </Label>
              <p className="text-sm text-muted-foreground">
                Receive notifications via email
              </p>
            </div>
            <Switch
              id="email"
              checked={form.watch('channels.email')}
              onCheckedChange={(checked) =>
                form.setValue('channels.email', checked)
              }
            />
          </div>

          {emailEnabled && (
            <>
              <Separator />
              <div className="space-y-2">
                <Label htmlFor="email-frequency">Email Frequency</Label>
                <Select
                  value={emailFrequency}
                  onValueChange={(value: NotificationPreferences['email_frequency']) =>
                    form.setValue('email_frequency', value)
                  }
                >
                  <SelectTrigger id="email-frequency">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="instant">Instant</SelectItem>
                    <SelectItem value="digest">Digest</SelectItem>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  {emailFrequency === 'instant' && 'Receive emails immediately when notifications are sent'}
                  {emailFrequency === 'digest' && 'Receive a summary of notifications at a specific time'}
                  {emailFrequency === 'daily' && 'Receive a daily summary of all notifications'}
                  {emailFrequency === 'weekly' && 'Receive a weekly summary of all notifications'}
                </p>
              </div>

              {(emailFrequency === 'digest' || emailFrequency === 'daily') && (
                <div className="space-y-2">
                  <Label htmlFor="digest-time">Digest Time</Label>
                  <Input
                    id="digest-time"
                    type="time"
                    value={form.watch('digest_time') || '09:00'}
                    onChange={(e) => form.setValue('digest_time', e.target.value)}
                    className="w-32"
                  />
                  <p className="text-xs text-muted-foreground">
                    Time to receive digest emails (24-hour format)
                  </p>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Notification Types */}
      <Card>
        <CardHeader>
          <CardTitle>Notification Types</CardTitle>
          <CardDescription>
            Choose which types of notifications you want to receive
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="course-invites">Course Invites</Label>
              <p className="text-sm text-muted-foreground">
                Notifications when you're invited to a course
              </p>
            </div>
            <Switch
              id="course-invites"
              checked={form.watch('types.course_invites')}
              onCheckedChange={(checked) =>
                form.setValue('types.course_invites', checked)
              }
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="content-updates">Content Updates</Label>
              <p className="text-sm text-muted-foreground">
                Notifications when content you follow is updated
              </p>
            </div>
            <Switch
              id="content-updates"
              checked={form.watch('types.content_updates')}
              onCheckedChange={(checked) =>
                form.setValue('types.content_updates', checked)
              }
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="admin-alerts">Admin Alerts</Label>
              <p className="text-sm text-muted-foreground">
                Important administrative notifications
              </p>
            </div>
            <Switch
              id="admin-alerts"
              checked={form.watch('types.admin_alerts')}
              onCheckedChange={(checked) =>
                form.setValue('types.admin_alerts', checked)
              }
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="system-notifications">System Notifications</Label>
              <p className="text-sm text-muted-foreground">
                General system and platform updates
              </p>
            </div>
            <Switch
              id="system-notifications"
              checked={form.watch('types.system_notifications')}
              onCheckedChange={(checked) =>
                form.setValue('types.system_notifications', checked)
              }
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="course-completed">Course Completed</Label>
              <p className="text-sm text-muted-foreground">
                Notifications when you complete a course
              </p>
            </div>
            <Switch
              id="course-completed"
              checked={form.watch('types.course_completed')}
              onCheckedChange={(checked) =>
                form.setValue('types.course_completed', checked)
              }
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="quiz-results">Quiz Results</Label>
              <p className="text-sm text-muted-foreground">
                Notifications for quiz scores and results
              </p>
            </div>
            <Switch
              id="quiz-results"
              checked={form.watch('types.quiz_results')}
              onCheckedChange={(checked) =>
                form.setValue('types.quiz_results', checked)
              }
            />
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button
          type="submit"
          disabled={updatePreferences.isPending}
          className="min-w-32"
        >
          {updatePreferences.isPending ? (
            <>
              <span className="animate-spin mr-2">⏳</span>
              Saving...
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              Save Preferences
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
