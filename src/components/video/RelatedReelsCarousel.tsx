import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, Play } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import type { Reel } from '@/types';

interface RelatedReelsCarouselProps {
  reelId: string;
  tags?: string[];
  className?: string;
}

export function RelatedReelsCarousel({
  reelId,
  tags = [],
  className,
}: RelatedReelsCarouselProps) {
  const { data: relatedReels, isLoading } = useQuery({
    queryKey: ['related-reels', reelId, tags],
    queryFn: async () => {
      try {
        // Try to use the related reels endpoint
        const searchParams = new URLSearchParams();
        if (tags.length > 0) {
          tags.slice(0, 3).forEach((tag) => searchParams.append('tags', tag));
        }
        searchParams.append('exclude_id', reelId);
        searchParams.append('limit', '6');
        
        const response = await api.get<{ reels: Reel[] }>(
          `/reels/${reelId}/related?${searchParams.toString()}`
        );
        return response.reels || [];
      } catch (error) {
        // Fallback: search for reels with similar tags
        const searchParams = new URLSearchParams();
        if (tags.length > 0) {
          tags.slice(0, 3).forEach((tag) => searchParams.append('tags', tag));
        }
        searchParams.append('limit', '6');
        
        const response = await api.get<{ results: Reel[] }>(
          `/search?${searchParams.toString()}`
        );
        // Filter out current reel
        return (response.results || []).filter((r) => r.id !== reelId).slice(0, 6);
      }
    },
    enabled: !!reelId,
  });

  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (isLoading) {
    return (
      <div className={cn('space-y-4', className)}>
        <h3 className="text-lg font-semibold">Related Reels</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardContent className="p-0">
                <Skeleton className="aspect-video w-full rounded-t-lg" />
                <div className="p-4 space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!relatedReels || relatedReels.length === 0) {
    return (
      <div className={cn('space-y-4', className)}>
        <h3 className="text-lg font-semibold">Related Reels</h3>
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-foreground-secondary">No related reels found</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className={cn('space-y-4', className)}>
      <h3 className="text-lg font-semibold">Related Reels</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {relatedReels.map((reel) => (
          <Link key={reel.id} to={`/reel/${reel.id}`}>
            <Card className="card-hover transition-all duration-200">
              <CardContent className="p-0">
                <div className="relative aspect-video bg-muted rounded-t-lg overflow-hidden">
                  {reel.thumbnail_url ? (
                    <img
                      src={reel.thumbnail_url}
                      alt={reel.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Play className="h-12 w-12 text-foreground-secondary/30" />
                    </div>
                  )}
                  <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {formatDuration(reel.duration)}
                  </div>
                  {reel.status === 'published' && (
                    <div className="absolute top-2 left-2">
                      <Badge className="badge-published text-xs">PUBLISHED</Badge>
                    </div>
                  )}
                </div>
                <div className="p-4 space-y-2">
                  <h4 className="font-medium text-sm line-clamp-2 text-foreground-primary">
                    {reel.title}
                  </h4>
                  {reel.tags && reel.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {reel.tags.slice(0, 2).map((tag) => (
                        <Badge
                          key={tag}
                          variant="secondary"
                          className="text-xs px-1.5 py-0"
                        >
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
