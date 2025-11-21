import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface LoadingStateProps {
  /**
   * Type of loading state to display
   * - "list": Vertical list of items
   * - "grid": Grid of cards
   * - "thumbnail": Grid of thumbnail cards (with image placeholders)
   * - "table": Table rows
   * - "card": Single card
   */
  variant?: "list" | "grid" | "thumbnail" | "table" | "card";
  /**
   * Number of skeleton items to show
   */
  count?: number;
  /**
   * Additional className for the container
   */
  className?: string;
  /**
   * Custom grid columns (for grid/thumbnail variants)
   */
  columns?: number;
}

export function LoadingState({
  variant = "list",
  count = 3,
  className,
  columns,
}: LoadingStateProps) {
  const gridCols = columns
    ? `grid-cols-${columns}`
    : variant === "thumbnail"
    ? "md:grid-cols-3 lg:grid-cols-4"
    : "md:grid-cols-3";

  if (variant === "card") {
    return (
      <Card className={cn("card-base", className)}>
        <CardHeader>
          <Skeleton className="h-6 w-3/4" />
          <Skeleton className="h-4 w-1/2 mt-2" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-4 w-full mb-2" />
          <Skeleton className="h-4 w-5/6" />
        </CardContent>
      </Card>
    );
  }

  if (variant === "list") {
    return (
      <div className={cn("space-y-4", className)}>
        {Array.from({ length: count }).map((_, i) => (
          <Card key={i} className="card-base">
            <CardContent className="p-4">
              <div className="flex items-start gap-4">
                <Skeleton className="h-16 w-16 rounded-lg flex-shrink-0" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-2/3" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (variant === "table") {
    return (
      <div className={cn("space-y-2", className)}>
        {/* Table header */}
        <div className="grid grid-cols-4 gap-4 p-4 border-b border-border">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-4 w-full" />
          ))}
        </div>
        {/* Table rows */}
        {Array.from({ length: count }).map((_, i) => (
          <div
            key={i}
            className="grid grid-cols-4 gap-4 p-4 border-b border-border last:border-0"
          >
            {Array.from({ length: 4 }).map((_, j) => (
              <Skeleton key={j} className="h-4 w-full" />
            ))}
          </div>
        ))}
      </div>
    );
  }

  if (variant === "thumbnail") {
    return (
      <div className={cn("grid gap-4", gridCols, className)}>
        {Array.from({ length: count }).map((_, i) => (
          <Card key={i} className="card-base">
            <Skeleton className="aspect-video w-full rounded-t-lg" />
            <CardHeader>
              <div className="flex items-start justify-between mb-2">
                <Skeleton className="h-5 w-20 rounded" />
              </div>
              <Skeleton className="h-5 w-3/4 mb-2" />
              <Skeleton className="h-4 w-full" />
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-4 w-20 rounded" />
              </div>
              <div className="flex gap-1 mt-2">
                <Skeleton className="h-5 w-16 rounded" />
                <Skeleton className="h-5 w-16 rounded" />
                <Skeleton className="h-5 w-16 rounded" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  // Grid variant (default)
  return (
    <div className={cn("grid gap-4", gridCols, className)}>
      {Array.from({ length: count }).map((_, i) => (
        <Card key={i} className="card-base">
          <CardHeader>
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-4 w-1/2 mt-2" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-5/6" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
