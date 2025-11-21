import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, Video, Settings, Tag } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Reel, SearchResult } from "@/types";

type ContentItem = Reel | SearchResult;

interface ContentCardProps {
  reel: ContentItem;
  viewMode?: "grid" | "list";
  className?: string;
}

export function ContentCard({ reel, viewMode = "grid", className }: ContentCardProps) {
  const formatDuration = (seconds: number | undefined) => {
    if (!seconds) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  // Normalize the item to have consistent fields
  const duration = reel.duration ?? 0;
  const description = reel.description || (reel as SearchResult).snippet || "";
  const status = reel.status;

  if (viewMode === "list") {
    return (
      <Link to={`/reel/${reel.id}`} className={cn("block", className)}>
        <Card className="card-base card-hover">
          <div className="flex gap-4 p-4">
            {/* Thumbnail */}
            <div className="flex-shrink-0 w-48 aspect-video bg-muted rounded-lg flex items-center justify-center overflow-hidden">
              {reel.thumbnail_url ? (
                <img
                  src={reel.thumbnail_url}
                  alt={reel.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <Video className="h-8 w-8 text-foreground-secondary" />
              )}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-4 mb-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge
                      className={
                        status === "published"
                          ? "badge-published"
                          : "badge-archived"
                      }
                    >
                      {status.toUpperCase()}
                    </Badge>
                    <span className="text-sm text-foreground-secondary flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {formatDuration(duration)}
                    </span>
                  </div>
                  <h3 className="text-lg font-semibold text-foreground-primary line-clamp-1 mb-1">
                    {reel.title}
                  </h3>
                  <p className="text-sm text-foreground-secondary line-clamp-2 mb-3">
                    {description}
                  </p>
                </div>
              </div>

              {/* Metadata */}
              <div className="flex flex-wrap items-center gap-3 text-sm text-foreground-secondary">
                {reel.machine_model && (
                  <div className="flex items-center gap-1">
                    <Settings className="h-4 w-4" />
                    <span>{reel.machine_model}</span>
                  </div>
                )}
                {reel.tooling && (
                  <div className="flex items-center gap-1">
                    <Settings className="h-4 w-4" />
                    <span>{reel.tooling}</span>
                  </div>
                )}
                {reel.tags.length > 0 && (
                  <div className="flex items-center gap-1 flex-wrap">
                    <Tag className="h-4 w-4" />
                    {reel.tags.slice(0, 3).map((tag) => (
                      <Badge
                        key={tag}
                        variant="secondary"
                        className="text-xs"
                      >
                        {tag}
                      </Badge>
                    ))}
                    {reel.tags.length > 3 && (
                      <span className="text-xs">+{reel.tags.length - 3}</span>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </Card>
      </Link>
    );
  }

  // Grid view
  return (
    <Link to={`/reel/${reel.id}`} className={cn("block", className)}>
      <Card className="card-base card-hover h-full flex flex-col">
        {/* Thumbnail */}
        <div className="aspect-video bg-muted rounded-t-lg flex items-center justify-center overflow-hidden">
          {reel.thumbnail_url ? (
            <img
              src={reel.thumbnail_url}
              alt={reel.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <Video className="h-8 w-8 text-foreground-secondary" />
          )}
        </div>

        <CardHeader className="pb-3">
          <div className="flex items-start justify-between mb-2">
            <Badge
              className={
                status === "published"
                  ? "badge-published"
                  : "badge-archived"
              }
            >
              {status.toUpperCase()}
            </Badge>
            <span className="text-xs text-foreground-secondary flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {formatDuration(duration)}
            </span>
          </div>
          <h3 className="text-base font-semibold text-foreground-primary line-clamp-2 mb-1">
            {reel.title}
          </h3>
          <p className="text-sm text-foreground-secondary line-clamp-2">
            {description}
          </p>
        </CardHeader>

        <CardContent className="pt-0 mt-auto">
          <div className="flex flex-wrap items-center gap-2 text-xs text-foreground-secondary mb-2">
            {reel.machine_model && (
              <Badge variant="outline" className="text-xs">
                {reel.machine_model}
              </Badge>
            )}
            {reel.tooling && (
              <Badge variant="outline" className="text-xs">
                {reel.tooling}
              </Badge>
            )}
          </div>
          {reel.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {reel.tags.slice(0, 3).map((tag) => (
                <Badge key={tag} variant="secondary" className="text-xs">
                  {tag}
                </Badge>
              ))}
              {reel.tags.length > 3 && (
                <span className="text-xs text-foreground-secondary">
                  +{reel.tags.length - 3}
                </span>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}
