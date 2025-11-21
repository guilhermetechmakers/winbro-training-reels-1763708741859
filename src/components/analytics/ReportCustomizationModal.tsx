import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useMetrics } from "@/hooks/use-analytics";
import type { ScheduleConfig } from "@/types";

const reportSchema = z.object({
  name: z.string().min(1, "Report name is required"),
  description: z.string().optional(),
  report_type: z.enum(['content_usage', 'course_outcomes', 'roi', 'custom']),
  metrics: z.array(z.string()).min(1, "Select at least one metric"),
  filters: z.object({
    date_range: z.object({
      start_date: z.string(),
      end_date: z.string(),
    }).optional(),
    course_ids: z.array(z.string()).optional(),
    reel_ids: z.array(z.string()).optional(),
    customer_id: z.string().optional(),
  }).optional(),
  is_scheduled: z.boolean().optional(),
  schedule_config: z.object({
    frequency: z.enum(['daily', 'weekly', 'monthly']),
    day_of_week: z.number().optional(),
    day_of_month: z.number().optional(),
    time: z.string().optional(),
    recipients: z.array(z.string()),
  }).optional(),
});

type ReportFormData = z.infer<typeof reportSchema>;

interface ReportCustomizationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: ReportFormData) => void;
  initialData?: Partial<ReportFormData>;
}

export function ReportCustomizationModal({
  open,
  onOpenChange,
  onSubmit,
  initialData,
}: ReportCustomizationModalProps) {
  const { data: metrics } = useMetrics();
  const { register, handleSubmit, formState: { errors }, watch, setValue } = useForm<ReportFormData>({
    resolver: zodResolver(reportSchema),
    defaultValues: initialData || {
      report_type: 'custom',
      metrics: [],
      is_scheduled: false,
    },
  });

  const selectedMetrics = watch('metrics') || [];
  const isScheduled = watch('is_scheduled');

  const onFormSubmit = (data: ReportFormData) => {
    // Ensure schedule_config is only included if is_scheduled is true
    const submitData = {
      ...data,
      schedule_config: data.is_scheduled ? data.schedule_config : undefined,
    };
    onSubmit(submitData);
    onOpenChange(false);
  };

  const toggleMetric = (metricId: string) => {
    const current = selectedMetrics;
    if (current.includes(metricId)) {
      setValue('metrics', current.filter(id => id !== metricId));
    } else {
      setValue('metrics', [...current, metricId]);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Customize Report</DialogTitle>
          <DialogDescription>
            Select metrics and apply filters to create a custom report
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name">Report Name</Label>
            <Input
              id="name"
              {...register('name')}
              placeholder="My Custom Report"
            />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description (Optional)</Label>
            <Input
              id="description"
              {...register('description')}
              placeholder="Brief description of this report"
            />
          </div>

          <div className="space-y-2">
            <Label>Report Type</Label>
            <Select
              value={watch('report_type')}
              onValueChange={(value) => setValue('report_type', value as 'content_usage' | 'course_outcomes' | 'roi' | 'custom')}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="content_usage">Content Usage</SelectItem>
                <SelectItem value="course_outcomes">Course Outcomes</SelectItem>
                <SelectItem value="roi">ROI</SelectItem>
                <SelectItem value="custom">Custom</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Select Metrics</Label>
            <div className="border border-border rounded-lg p-4 max-h-48 overflow-y-auto space-y-2">
              {metrics?.map((metric) => (
                <div key={metric.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={`metric-${metric.id}`}
                    checked={selectedMetrics.includes(metric.id)}
                    onCheckedChange={() => toggleMetric(metric.id)}
                  />
                  <Label
                    htmlFor={`metric-${metric.id}`}
                    className="text-sm font-normal cursor-pointer"
                  >
                    {metric.name}
                  </Label>
                </div>
              ))}
            </div>
            {errors.metrics && (
              <p className="text-sm text-destructive">{errors.metrics.message}</p>
            )}
          </div>

          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="is_scheduled"
                checked={isScheduled}
                onCheckedChange={(checked) => setValue('is_scheduled', checked as boolean)}
              />
              <Label htmlFor="is_scheduled" className="cursor-pointer">
                Schedule this report
              </Label>
            </div>

            {isScheduled && (
              <div className="ml-6 space-y-4 border-l-2 border-border pl-4">
                <div className="space-y-2">
                  <Label>Frequency</Label>
                  <Select
                    value={watch('schedule_config')?.frequency || 'daily'}
                    onValueChange={(value) => 
                      setValue('schedule_config', {
                        ...watch('schedule_config'),
                        frequency: value as 'daily' | 'weekly' | 'monthly',
                      } as ScheduleConfig)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Recipients (Email addresses, comma-separated)</Label>
                  <Input
                    placeholder="email1@example.com, email2@example.com"
                    onChange={(e) => {
                      const emails = e.target.value.split(',').map(email => email.trim()).filter(Boolean);
                      setValue('schedule_config', {
                        ...watch('schedule_config'),
                        recipients: emails,
                      } as ScheduleConfig);
                    }}
                  />
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">Save Report</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
