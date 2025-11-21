import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Save, Eye, Users, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import type { Course } from "@/types";

const publishingSchema = z.object({
  visibility: z.enum(["tenant", "public", "internal"]),
  enrollment_method: z.enum(["open", "invite_only", "approval_required"]),
  expiration_date: z.string().optional(),
  auto_enroll: z.boolean().optional(),
});

type PublishingSettingsData = z.infer<typeof publishingSchema>;

interface PublishingSettingsPanelProps {
  course: Course;
  onSave: (data: PublishingSettingsData) => void | Promise<void>;
  isLoading?: boolean;
}

export function PublishingSettingsPanel({
  course,
  onSave,
  isLoading,
}: PublishingSettingsPanelProps) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isDirty },
  } = useForm<PublishingSettingsData>({
    resolver: zodResolver(publishingSchema),
    defaultValues: {
      visibility: ((course as unknown as { visibility?: string })?.visibility as "tenant" | "public" | "internal") || "tenant",
      enrollment_method:
        ((course as unknown as { enrollment_method?: string })?.enrollment_method as "open" | "invite_only" | "approval_required") || "open",
      expiration_date:
        (course as unknown as { expiration_date?: string })?.expiration_date || undefined,
      auto_enroll: (course as unknown as { auto_enroll?: boolean })?.auto_enroll || false,
    },
  });

  const visibility = watch("visibility");
  const enrollmentMethod = watch("enrollment_method");
  const expirationDate = watch("expiration_date");
  const autoEnroll = watch("auto_enroll");

  const onSubmit = async (data: PublishingSettingsData) => {
    try {
      await onSave(data);
      toast.success("Publishing settings saved");
    } catch (error) {
      toast.error("Failed to save publishing settings");
    }
  };

  return (
    <Card className="card-base">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Eye className="h-5 w-5" />
          Publishing Settings
        </CardTitle>
        <CardDescription>
          Configure how this course is published and who can access it.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit as (data: PublishingSettingsData) => Promise<void>)} className="space-y-6">
          {/* Visibility */}
          <div className="space-y-2">
            <Label htmlFor="visibility" className="flex items-center gap-2">
              <Eye className="h-4 w-4" />
              Visibility
            </Label>
            <Select
              value={visibility}
              onValueChange={(value) =>
                setValue("visibility", value as "tenant" | "public" | "internal", {
                  shouldDirty: true,
                })
              }
            >
              <SelectTrigger id="visibility">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="tenant">Tenant Only</SelectItem>
                <SelectItem value="public">Public</SelectItem>
                <SelectItem value="internal">Internal</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              {visibility === "tenant" &&
                "Only users in your organization can see this course."}
              {visibility === "public" &&
                "This course is visible to all users on the platform."}
              {visibility === "internal" &&
                "This course is only visible to internal administrators."}
            </p>
            {errors.visibility && (
              <p className="text-sm text-destructive">{errors.visibility.message}</p>
            )}
          </div>

          {/* Enrollment Method */}
          <div className="space-y-2">
            <Label htmlFor="enrollment_method" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Enrollment Method
            </Label>
            <Select
              value={enrollmentMethod}
              onValueChange={(value) =>
                setValue(
                  "enrollment_method",
                  value as "open" | "invite_only" | "approval_required",
                  { shouldDirty: true }
                )
              }
            >
              <SelectTrigger id="enrollment_method">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="open">Open Enrollment</SelectItem>
                <SelectItem value="invite_only">Invite Only</SelectItem>
                <SelectItem value="approval_required">Approval Required</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              {enrollmentMethod === "open" &&
                "Anyone with access can enroll in this course."}
              {enrollmentMethod === "invite_only" &&
                "Only users who receive an invitation can enroll."}
              {enrollmentMethod === "approval_required" &&
                "Users must request enrollment and be approved by an administrator."}
            </p>
            {errors.enrollment_method && (
              <p className="text-sm text-destructive">{errors.enrollment_method.message}</p>
            )}
          </div>

          {/* Auto Enroll */}
          <div className="flex items-center justify-between space-x-2 p-4 rounded-lg border">
            <div className="space-y-0.5">
              <Label htmlFor="auto_enroll">Auto-Enroll Target Roles</Label>
              <p className="text-xs text-muted-foreground">
                Automatically enroll users with target roles when course is published.
              </p>
            </div>
            <Switch
              id="auto_enroll"
              checked={autoEnroll}
              onCheckedChange={(checked) =>
                setValue("auto_enroll", checked, { shouldDirty: true })
              }
            />
          </div>

          {/* Expiration Date */}
          <div className="space-y-2">
            <Label htmlFor="expiration_date" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Expiration Date (Optional)
            </Label>
            <Input
              id="expiration_date"
              type="date"
              {...register("expiration_date")}
              value={expirationDate || ""}
              min={new Date().toISOString().split("T")[0]}
            />
            <p className="text-xs text-muted-foreground">
              Set a date when this course will no longer be available for enrollment.
            </p>
            {errors.expiration_date && (
              <p className="text-sm text-destructive">{errors.expiration_date.message}</p>
            )}
          </div>

          {/* Save Button */}
          <div className="flex justify-end pt-4 border-t">
            <Button type="submit" disabled={!isDirty || isLoading} className="gap-2">
              <Save className="h-4 w-4" />
              {isLoading ? "Saving..." : "Save Settings"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
