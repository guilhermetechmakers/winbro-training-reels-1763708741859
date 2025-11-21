import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ChartWidget } from "./ChartWidget";
import { useMetricDetail } from "@/hooks/use-analytics";
import { format } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";

interface DetailViewModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  metricId: string | null;
  dateRange?: { start_date: string; end_date: string };
}

export function DetailViewModal({
  open,
  onOpenChange,
  metricId,
  dateRange,
}: DetailViewModalProps) {
  const { data: metricDetail, isLoading } = useMetricDetail(
    metricId || '',
    dateRange ? { date_range: dateRange } : undefined
  );

  if (!metricId) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isLoading ? (
              <Skeleton className="h-6 w-48" />
            ) : (
              metricDetail?.metric.name
            )}
          </DialogTitle>
          <DialogDescription>
            {isLoading ? (
              <Skeleton className="h-4 w-64 mt-2" />
            ) : (
              metricDetail?.metric.description
            )}
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-64 w-full" />
            <Skeleton className="h-32 w-full" />
          </div>
        ) : metricDetail ? (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-muted/50 rounded-lg">
                <div className="text-sm text-foreground-secondary">Current Value</div>
                <div className="text-2xl font-bold text-foreground-primary mt-1">
                  {metricDetail.metric.value.toLocaleString()}
                  {metricDetail.metric.unit && (
                    <span className="text-base font-normal text-foreground-secondary ml-1">
                      {metricDetail.metric.unit}
                    </span>
                  )}
                </div>
              </div>

              {metricDetail.comparison && (
                <>
                  <div className="p-4 bg-muted/50 rounded-lg">
                    <div className="text-sm text-foreground-secondary">Change</div>
                    <div className={`text-2xl font-bold mt-1 ${
                      metricDetail.comparison.change_percentage > 0 
                        ? 'text-success' 
                        : metricDetail.comparison.change_percentage < 0 
                        ? 'text-destructive' 
                        : 'text-foreground-primary'
                    }`}>
                      {metricDetail.comparison.change_percentage > 0 ? '+' : ''}
                      {metricDetail.comparison.change_percentage.toFixed(1)}%
                    </div>
                    <div className="text-xs text-foreground-secondary mt-1">
                      vs {metricDetail.comparison.period}
                    </div>
                  </div>

                  <div className="p-4 bg-muted/50 rounded-lg">
                    <div className="text-sm text-foreground-secondary">Change Value</div>
                    <div className={`text-2xl font-bold mt-1 ${
                      metricDetail.comparison.change_value > 0 
                        ? 'text-success' 
                        : metricDetail.comparison.change_value < 0 
                        ? 'text-destructive' 
                        : 'text-foreground-primary'
                    }`}>
                      {metricDetail.comparison.change_value > 0 ? '+' : ''}
                      {metricDetail.comparison.change_value.toLocaleString()}
                    </div>
                  </div>
                </>
              )}
            </div>

            {metricDetail.data_points && metricDetail.data_points.length > 0 && (
              <ChartWidget
                title="Trend Over Time"
                data={metricDetail.data_points.map(dp => ({
                  ...dp,
                  date: format(new Date(dp.date), 'MMM d, yyyy'),
                }))}
                chartType="line"
                height={300}
              />
            )}

            {metricDetail.breakdown && Object.keys(metricDetail.breakdown).length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-4">Breakdown</h3>
                <div className="space-y-2">
                  {Object.entries(metricDetail.breakdown).map(([key, value]) => (
                    <div key={key} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <span className="text-foreground-primary">{key}</span>
                      <span className="font-semibold text-foreground-primary">
                        {typeof value === 'number' ? value.toLocaleString() : value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
