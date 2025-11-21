import { useParams, Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Download, Share2, Heart, Plus, Clock, User, Calendar, Edit } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { api, videoPlayerApi } from "@/lib/api";
import {
  AdaptiveVideoPlayer,
  TranscriptViewer,
  DownloadConfirmationModal,
  AddToCourseDialog,
  ShareModal,
  RelatedReelsCarousel,
  CommentsSection,
} from "@/components/video";
import { useVideoDownload } from "@/hooks/use-video-download";
import { useVideoAnalytics } from "@/hooks/use-video-analytics";
import { useIsFavorited, useToggleFavorite } from "@/hooks/use-favorite";
import { tokenManager } from "@/lib/api";
import type { Reel } from "@/types";
import { cn } from "@/lib/utils";

export default function VideoPlayerPage() {
  const { id } = useParams<{ id: string }>();
  const [showDownloadModal, setShowDownloadModal] = useState(false);
  const [showAddToCourseDialog, setShowAddToCourseDialog] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [hlsUrl, setHlsUrl] = useState<string | undefined>();
  const [availableQualities, setAvailableQualities] = useState<any[]>([]);
  
  const { data: reel, isLoading } = useQuery({
    queryKey: ["reel", id],
    queryFn: () => api.get<Reel>(`/reels/${id}`),
    enabled: !!id,
  });

  // Get streaming URL
  const { data: streamingData } = useQuery({
    queryKey: ["video-stream", id],
    queryFn: () => videoPlayerApi.getStreamingUrl(id!),
    enabled: !!id && !!reel,
  });

  useEffect(() => {
    if (streamingData) {
      setHlsUrl(streamingData.hls_url);
      setAvailableQualities(streamingData.qualities);
    } else if (reel?.hls_url) {
      setHlsUrl(reel.hls_url);
    }
  }, [streamingData, reel]);

  // Video download hook
  const { requestDownload, isRequesting } = useVideoDownload();
  
  // Video analytics hook
  const { logComplete } = useVideoAnalytics(id || '');

  // Favorite hooks
  const isFavorited = useIsFavorited(id || '');
  const toggleFavorite = useToggleFavorite();

  // State for video player
  const [playerState, setPlayerState] = useState({ currentTime: 0, duration: 0, isPlaying: false });

  // Handle video completion
  const handleVideoStateChange = (state: { currentTime: number; duration: number; isPlaying: boolean }) => {
    setPlayerState(state);
    if (state.duration > 0 && state.currentTime >= state.duration - 0.5 && state.isPlaying) {
      logComplete(state.duration);
    }
  };

  const handleDownload = (quality?: string) => {
    if (id) {
      requestDownload(id, quality);
      setShowDownloadModal(false);
    }
  };

  const handleSeek = (time: number) => {
    const seekFn = (window as any)[`videoSeek_${id}`];
    if (seekFn) {
      seekFn(time);
    }
  };

  const handleFavorite = () => {
    if (id) {
      toggleFavorite.mutate(id);
    }
  };

  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const user = tokenManager.getUser();
  const canEdit = user && (user.role === 'admin' || user.role === 'trainer' || user.id === reel?.uploader_id);

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="aspect-video bg-muted rounded-lg"></div>
        <div className="h-8 bg-muted rounded w-3/4"></div>
        <div className="h-4 bg-muted rounded w-1/2"></div>
      </div>
    );
  }

  if (!reel) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <p className="text-foreground-secondary mb-4">Reel not found</p>
          <Link to="/library">
            <Button>Back to Library</Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Video Player Section */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main Video Player */}
        <div className="lg:col-span-2">
          <Card className="overflow-hidden">
            <CardContent className="p-0">
              {hlsUrl ? (
                <AdaptiveVideoPlayer
                  videoId={id || ''}
                  hlsUrl={hlsUrl}
                  title={reel?.title}
                  onStateChange={handleVideoStateChange}
                  onSeek={handleSeek}
                />
              ) : (
                <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-foreground-secondary">Loading video player...</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Transcript Viewer Sidebar */}
        <div className="lg:col-span-1">
          <TranscriptViewer
            transcript={reel?.transcript || null}
            currentTime={playerState.currentTime}
            onSeek={handleSeek}
            className="h-full"
          />
        </div>
      </div>

      {/* Title, Status, and Actions */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <Badge className={reel.status === "published" ? "badge-published" : "badge-archived"}>
              {reel.status.toUpperCase()}
            </Badge>
            {canEdit && (
              <Link to={`/reel/${id}/edit`}>
                <Button variant="ghost" size="sm" className="h-6 gap-1">
                  <Edit className="h-3 w-3" />
                  Edit
                </Button>
              </Link>
            )}
          </div>
          <h1 className="text-3xl font-bold text-foreground-primary mb-2">{reel.title}</h1>
          {reel.description && (
            <p className="text-foreground-secondary">{reel.description}</p>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-2">
        <Button
          onClick={() => setShowAddToCourseDialog(true)}
          className="gap-2 hover:scale-[1.02] transition-transform"
        >
          <Plus className="h-4 w-4" />
          Add to Course
        </Button>
        <Button
          variant="outline"
          onClick={handleFavorite}
          disabled={toggleFavorite.isPending}
          className={cn(
            "gap-2 hover:scale-[1.02] transition-transform",
            isFavorited && "bg-primary/10 border-primary text-primary"
          )}
        >
          <Heart className={cn("h-4 w-4", isFavorited && "fill-current")} />
          {isFavorited ? "Favorited" : "Favorite"}
        </Button>
        <Button
          variant="outline"
          onClick={() => setShowShareModal(true)}
          className="gap-2 hover:scale-[1.02] transition-transform"
        >
          <Share2 className="h-4 w-4" />
          Share
        </Button>
        <Button
          variant="outline"
          onClick={() => setShowDownloadModal(true)}
          className="gap-2 hover:scale-[1.02] transition-transform"
        >
          <Download className="h-4 w-4" />
          Download
        </Button>
      </div>

      {/* Main Content Area */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left Column - Details and Related */}
        <div className="lg:col-span-2 space-y-6">
          <Tabs defaultValue="details" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="details">Details</TabsTrigger>
              <TabsTrigger value="transcript">Transcript</TabsTrigger>
              <TabsTrigger value="related">Related</TabsTrigger>
            </TabsList>

            <TabsContent value="details" className="space-y-4 mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Metadata</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-foreground-secondary mb-1">Duration</p>
                      <p className="flex items-center gap-2 font-medium">
                        <Clock className="h-4 w-4" />
                        {formatDuration(reel.duration)}
                      </p>
                    </div>
                    {reel.machine_model && (
                      <div>
                        <p className="text-sm text-foreground-secondary mb-1">Machine Model</p>
                        <p className="font-medium">{reel.machine_model}</p>
                      </div>
                    )}
                    {reel.tooling && (
                      <div>
                        <p className="text-sm text-foreground-secondary mb-1">Tooling</p>
                        <p className="font-medium">{reel.tooling}</p>
                      </div>
                    )}
                    {reel.process_step && (
                      <div>
                        <p className="text-sm text-foreground-secondary mb-1">Process Step</p>
                        <p className="font-medium">{reel.process_step}</p>
                      </div>
                    )}
                    <div>
                      <p className="text-sm text-foreground-secondary mb-1">Skill Level</p>
                      <Badge variant="secondary">{reel.skill_level}</Badge>
                    </div>
                    <div>
                      <p className="text-sm text-foreground-secondary mb-1">Language</p>
                      <p className="font-medium">{reel.language || 'English'}</p>
                    </div>
                  </div>
                  {reel.tags && reel.tags.length > 0 && (
                    <div>
                      <p className="text-sm text-foreground-secondary mb-2">Tags</p>
                      <div className="flex flex-wrap gap-2">
                        {reel.tags.map((tag) => (
                          <Badge key={tag} variant="secondary">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="transcript" className="mt-6">
              <TranscriptViewer
                transcript={reel.transcript || null}
                currentTime={playerState.currentTime}
                onSeek={handleSeek}
              />
            </TabsContent>

            <TabsContent value="related" className="mt-6">
              <RelatedReelsCarousel
                reelId={id || ''}
                tags={reel.tags || []}
              />
            </TabsContent>
          </Tabs>
        </div>

        {/* Right Column - Info and Comments */}
        <div className="space-y-6">
          {/* Information Card */}
          <Card>
            <CardHeader>
              <CardTitle>Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-foreground-secondary mb-1">Uploaded by</p>
                <p className="flex items-center gap-2 font-medium">
                  <User className="h-4 w-4" />
                  {user?.full_name || 'User'}
                </p>
              </div>
              <div>
                <p className="text-sm text-foreground-secondary mb-1">Date</p>
                <p className="flex items-center gap-2 font-medium">
                  <Calendar className="h-4 w-4" />
                  {new Date(reel.created_at).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>
              </div>
              {reel.updated_at !== reel.created_at && (
                <div>
                  <p className="text-sm text-foreground-secondary mb-1">Last Updated</p>
                  <p className="font-medium">
                    {new Date(reel.updated_at).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Comments Section */}
          <CommentsSection
            reelId={id || ''}
            currentTime={playerState.currentTime}
            onSeekToTimestamp={handleSeek}
          />
        </div>
      </div>

      {/* Modals and Dialogs */}
      <DownloadConfirmationModal
        open={showDownloadModal}
        onOpenChange={setShowDownloadModal}
        onConfirm={handleDownload}
        videoTitle={reel?.title || ''}
        availableQualities={availableQualities}
        isLoading={isRequesting}
      />

      <AddToCourseDialog
        open={showAddToCourseDialog}
        onOpenChange={setShowAddToCourseDialog}
        reelId={id || ''}
        reelTitle={reel?.title || ''}
      />

      <ShareModal
        open={showShareModal}
        onOpenChange={setShowShareModal}
        reelId={id || ''}
        reelTitle={reel?.title || ''}
      />
    </div>
  );
}
