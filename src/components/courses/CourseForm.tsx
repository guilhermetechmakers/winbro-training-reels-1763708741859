import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import type { Course } from "@/types";

const courseSchema = z.object({
  title: z.string().min(1, "Title is required").max(200, "Title too long"),
  description: z.string().min(1, "Description is required").max(2000, "Description too long"),
  target_roles: z.array(z.string()).min(1, "At least one target role is required"),
  prerequisites: z.array(z.string()).optional(),
  estimated_time: z.number().min(1, "Estimated time must be at least 1 minute"),
  status: z.enum(["draft", "published", "archived"]),
});

type CourseFormData = z.infer<typeof courseSchema>;

interface CourseFormProps {
  course?: Course;
  onSubmit: (data: CourseFormData) => void | Promise<void>;
  onCancel?: () => void;
  isLoading?: boolean;
}

const availableRoles = ["trainer", "operator", "customer_admin", "admin"];

export function CourseForm({ course, onSubmit, onCancel, isLoading }: CourseFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<CourseFormData>({
    resolver: zodResolver(courseSchema),
    defaultValues: course
      ? {
          title: course.title,
          description: course.description,
          target_roles: course.target_roles,
          prerequisites: course.prerequisites || [],
          estimated_time: course.estimated_time,
          status: course.status,
        }
      : {
          title: "",
          description: "",
          target_roles: [],
          prerequisites: [],
          estimated_time: 30,
          status: "draft",
        },
  });

  const targetRoles = watch("target_roles") || [];

  const toggleRole = (role: string) => {
    const current = targetRoles;
    if (current.includes(role)) {
      setValue("target_roles", current.filter((r) => r !== role));
    } else {
      setValue("target_roles", [...current, role]);
    }
  };


  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="title">Course Title *</Label>
        <Input
          id="title"
          {...register("title")}
          placeholder="Enter course title"
          className={errors.title ? "border-destructive" : ""}
        />
        {errors.title && (
          <p className="text-sm text-destructive">{errors.title.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description *</Label>
        <Textarea
          id="description"
          {...register("description")}
          placeholder="Enter course description"
          rows={4}
          className={errors.description ? "border-destructive" : ""}
        />
        {errors.description && (
          <p className="text-sm text-destructive">{errors.description.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label>Target Roles *</Label>
        <div className="flex flex-wrap gap-2">
          {availableRoles.map((role) => (
            <div key={role} className="flex items-center space-x-2">
              <Checkbox
                id={`role-${role}`}
                checked={targetRoles.includes(role)}
                onCheckedChange={() => toggleRole(role)}
              />
              <Label
                htmlFor={`role-${role}`}
                className="text-sm font-normal cursor-pointer capitalize"
              >
                {role.replace("_", " ")}
              </Label>
            </div>
          ))}
        </div>
        {errors.target_roles && (
          <p className="text-sm text-destructive">{errors.target_roles.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="estimated_time">Estimated Time (minutes) *</Label>
        <Input
          id="estimated_time"
          type="number"
          {...register("estimated_time", { valueAsNumber: true })}
          min={1}
          className={errors.estimated_time ? "border-destructive" : ""}
        />
        {errors.estimated_time && (
          <p className="text-sm text-destructive">{errors.estimated_time.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="status">Status</Label>
        <Select
          value={watch("status")}
          onValueChange={(value) => setValue("status", value as "draft" | "published" | "archived")}
        >
          <SelectTrigger id="status">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="published">Published</SelectItem>
            <SelectItem value="archived">Archived</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex justify-end gap-3">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
            Cancel
          </Button>
        )}
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Saving..." : course ? "Update Course" : "Create Course"}
        </Button>
      </div>
    </form>
  );
}
