import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, Play, ChevronRight } from "lucide-react";
import { useRecommendedReels } from "@/hooks/use-dashboard";
import { LoadingState, EmptyState } from "@/components/states";
import type { Reel } from "@/types";
import { cn } from "@/lib/utils";

interface RecommendedReelsCarouselProps {
  limit?: number;
  className?: string;
}

export function RecommendedReelsCarousel({ limit = 6, className }: RecommendedReelsCarouselProps) {
  const { data: reels, isLoading } = useRecommendedReels(limit);

  if (isLoading) {
    return (
      <div className={className}>
        <LoadingState variant="thumbnail" count={3} />
      </div>
    );
  }

  if (!reels || reels.length === 0) {
    return (
      <EmptyState
        title="No recommendations yet"
        description="We'll suggest reels based on your activity and preferences."
        size="sm"
      />
    );
  }

  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-foreground-primary">Recommended for You</h3>
          <p className="text-sm text-foreground-secondary mt-1">
            AI-curated reels based on your interests
          </p>
        </div>
        <Link to="/library">
          <Button variant="ghost" size="sm" className="gap-2">
            View all
            <ChevronRight className="h-4 w-4" />
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {reels.map((reel, index) => (
          <ReelCard key={reel.id} reel={reel} index={index} />
        ))}
      </div>
    </div>
  );
}

interface ReelCardProps {
  reel: Reel;
  index: number;
}

function ReelCard({ reel, index }: ReelCardProps) {
  const duration = `${Math.floor(reel.duration / 60)}:${(reel.duration % 60).toString().padStart(2, '0')}`;

  return (
    <Link to={`/reel/${reel.id}`}>
      <Card className="card-base card-hover group animate-fade-in-up" style={{ animationDelay: `${index * 0.1}s` }}>
        {reel.thumbnail_url ? (
          <div className="relative aspect-video w-full overflow-hidden rounded-t-lg bg-muted">
            <img
              src={reel.thumbnail_url}
              alt={reel.title}
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
            <div className="absolute bottom-2 right-2 flex items-center gap-1 bg-black/70 text-white text-xs px-2 py-1 rounded">
              <Clock className="h-3 w-3" />
              {duration}
            </div>
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <div className="bg-white/90 rounded-full p-3">
                <Play className="h-6 w-6 text-primary fill-primary" />
              </div>
            </div>
          </div>
        ) : (
          <div className="relative aspect-video w-full overflow-hidden rounded-t-lg bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
            <Play className="h-12 w-12 text-primary/50" />
            <div className="absolute bottom-2 right-2 flex items-center gap-1 bg-black/70 text-white text-xs px-2 py-1 rounded">
              <Clock className="h-3 w-3" />
              {duration}
            </div>
          </div>
        )}

        <CardContent className="p-4">
          <div className="flex items-start justify-between gap-2 mb-2">
            <h4 className="font-semibold text-foreground-primary line-clamp-2 group-hover:text-primary transition-colors">
              {reel.title}
            </h4>
          </div>

          {reel.description && (
            <p className="text-sm text-foreground-secondary line-clamp-2 mb-3">
              {reel.description}
            </p>
          )}

          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant="secondary" className="text-xs">
              {reel.skill_level}
            </Badge>
            {reel.machine_model && (
              <Badge variant="outline" className="text-xs">
                {reel.machine_model}
              </Badge>
            )}
            {reel.tags.slice(0, 2).map((tag) => (
              <Badge key={tag} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
