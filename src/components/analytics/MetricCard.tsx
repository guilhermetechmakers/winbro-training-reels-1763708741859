import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Metric } from "@/types";

interface MetricCardProps {
  metric: Metric;
  onClick?: () => void;
}

export function MetricCard({ metric, onClick }: MetricCardProps) {
  const trendIcon = metric.trend === 'up' ? TrendingUp : metric.trend === 'down' ? TrendingDown : Minus;
  const trendColor = metric.trend === 'up' ? 'text-success' : metric.trend === 'down' ? 'text-destructive' : 'text-muted-foreground';
  const TrendIcon = trendIcon;

  const changePercentage = metric.previous_value 
    ? ((metric.value - metric.previous_value) / metric.previous_value) * 100 
    : 0;

  return (
    <Card 
      className={cn(
        "card-base transition-all duration-200 hover:shadow-card-hover",
        onClick && "cursor-pointer hover:-translate-y-0.5"
      )}
      onClick={onClick}
    >
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium text-foreground-secondary">
          {metric.name}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-baseline justify-between">
          <div>
            <div className="text-2xl font-bold text-foreground-primary">
              {metric.value.toLocaleString()}
              {metric.unit && <span className="text-base font-normal text-foreground-secondary ml-1">{metric.unit}</span>}
            </div>
            {metric.previous_value !== undefined && (
              <div className={cn("flex items-center gap-1 mt-1 text-xs", trendColor)}>
                <TrendIcon className="h-3 w-3" />
                <span>
                  {changePercentage > 0 ? '+' : ''}{changePercentage.toFixed(1)}%
                </span>
                <span className="text-muted-foreground">vs previous period</span>
              </div>
            )}
          </div>
        </div>
        {metric.description && (
          <p className="text-xs text-foreground-secondary mt-2 line-clamp-2">
            {metric.description}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
