import { useState } from "react";
import { useCreateComplianceRequest } from "@/hooks/use-security";
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const exportSchema = z.object({
  start_date: z.string().min(1, "Start date is required"),
  end_date: z.string().min(1, "End date is required"),
  format: z.enum(["json", "csv", "pdf"], {
    required_error: "Format is required",
  }),
});

type ExportFormData = z.infer<typeof exportSchema>;

interface DataExportModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DataExportModal({ open, onOpenChange }: DataExportModalProps) {
  const createRequest = useCreateComplianceRequest();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<ExportFormData>({
    resolver: zodResolver(exportSchema),
    defaultValues: {
      format: "json",
    },
  });

  const format = watch("format");

  const onSubmit = async (data: ExportFormData) => {
    setIsSubmitting(true);
    try {
      await createRequest.mutateAsync({
        type: "export",
        data_range: {
          start_date: data.start_date,
          end_date: data.end_date,
        },
        format: data.format,
      });
      reset();
      onOpenChange(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Request Data Export</DialogTitle>
          <DialogDescription>
            Request a complete export of your data. The export will include all data associated
            with your account. You will be notified when the export is ready for download.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="start_date">Start Date</Label>
            <Input
              id="start_date"
              type="date"
              {...register("start_date")}
              className={errors.start_date ? "border-destructive" : ""}
            />
            {errors.start_date && (
              <p className="text-sm text-destructive">{errors.start_date.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="end_date">End Date</Label>
            <Input
              id="end_date"
              type="date"
              {...register("end_date")}
              className={errors.end_date ? "border-destructive" : ""}
            />
            {errors.end_date && (
              <p className="text-sm text-destructive">{errors.end_date.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="format">Export Format</Label>
            <Select
              value={format}
              onValueChange={(value) => setValue("format", value as "json" | "csv" | "pdf")}
            >
              <SelectTrigger id="format" className={errors.format ? "border-destructive" : ""}>
                <SelectValue placeholder="Select format" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="json">JSON</SelectItem>
                <SelectItem value="csv">CSV</SelectItem>
                <SelectItem value="pdf">PDF</SelectItem>
              </SelectContent>
            </Select>
            {errors.format && (
              <p className="text-sm text-destructive">{errors.format.message}</p>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                reset();
                onOpenChange(false);
              }}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting || createRequest.isPending}>
              {isSubmitting || createRequest.isPending ? "Submitting..." : "Submit Request"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
