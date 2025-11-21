import { useParams, Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Download, Share2, Heart, Plus, Clock, User, Calendar } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { api, videoPlayerApi } from "@/lib/api";
import { AdaptiveVideoPlayer, TranscriptViewer, DownloadConfirmationModal } from "@/components/video";
import { useVideoDownload } from "@/hooks/use-video-download";
import { useVideoAnalytics } from "@/hooks/use-video-analytics";
import type { Reel } from "@/types";

export default function VideoPlayerPage() {
  const { id } = useParams<{ id: string }>();
  const [showDownloadModal, setShowDownloadModal] = useState(false);
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

  // State for video player (will be managed by AdaptiveVideoPlayer)
  const [playerState, setPlayerState] = useState({ currentTime: 0, duration: 0, isPlaying: false });

  // Handle video completion (will be called from AdaptiveVideoPlayer)
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
    // Seek is handled by AdaptiveVideoPlayer via the seek function reference
    const seekFn = (window as any)[`videoSeek_${id}`];
    if (seekFn) {
      seekFn(time);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="aspect-video bg-muted rounded-lg"></div>
        <div className="h-8 bg-muted rounded w-3/4"></div>
      </div>
    );
  }

  if (!reel) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <p className="text-foreground-secondary">Reel not found</p>
          <Link to="/library">
            <Button className="mt-4">Back to Library</Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Video Player with Transcript Side-by-Side */}
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
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

        {/* Transcript Viewer */}
        <div className="lg:col-span-1">
          <TranscriptViewer
            transcript={reel?.transcript || null}
            currentTime={playerState.currentTime}
            onSeek={handleSeek}
            className="h-full"
          />
        </div>
      </div>

      {/* Metadata and Actions */}
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Title and Status */}
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Badge className={reel.status === "published" ? "badge-published" : "badge-archived"}>
                  {reel.status.toUpperCase()}
                </Badge>
              </div>
              <h1 className="text-3xl font-bold text-foreground-primary">{reel.title}</h1>
              <p className="text-foreground-secondary mt-2">{reel.description}</p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-2">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add to Course
            </Button>
            <Button variant="outline">
              <Heart className="mr-2 h-4 w-4" />
              Favorite
            </Button>
            <Button variant="outline">
              <Share2 className="mr-2 h-4 w-4" />
              Share
            </Button>
            <Button 
              variant="outline"
              onClick={() => setShowDownloadModal(true)}
            >
              <Download className="mr-2 h-4 w-4" />
              Download
            </Button>
          </div>

          {/* Tabs */}
          <Tabs defaultValue="details" className="w-full">
            <TabsList>
              <TabsTrigger value="details">Details</TabsTrigger>
              <TabsTrigger value="transcript">Transcript</TabsTrigger>
              <TabsTrigger value="related">Related</TabsTrigger>
            </TabsList>
            <TabsContent value="details" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Metadata</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-foreground-secondary mb-1">Duration</p>
                      <p className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        {Math.floor(reel.duration / 60)}:{(reel.duration % 60).toString().padStart(2, '0')}
                      </p>
                    </div>
                    {reel.machine_model && (
                      <div>
                        <p className="text-sm text-foreground-secondary mb-1">Machine Model</p>
                        <p>{reel.machine_model}</p>
                      </div>
                    )}
                    {reel.tooling && (
                      <div>
                        <p className="text-sm text-foreground-secondary mb-1">Tooling</p>
                        <p>{reel.tooling}</p>
                      </div>
                    )}
                    <div>
                      <p className="text-sm text-foreground-secondary mb-1">Skill Level</p>
                      <Badge>{reel.skill_level}</Badge>
                    </div>
                  </div>
                  {reel.tags.length > 0 && (
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
            <TabsContent value="transcript">
              <TranscriptViewer
                transcript={reel.transcript || null}
                currentTime={playerState.currentTime}
                onSeek={handleSeek}
              />
            </TabsContent>
            <TabsContent value="related">
              <Card>
                <CardContent className="py-12 text-center">
                  <p className="text-foreground-secondary">Related reels would appear here</p>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-foreground-secondary mb-1">Uploaded by</p>
                <p className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  User Name
                </p>
              </div>
              <div>
                <p className="text-sm text-foreground-secondary mb-1">Date</p>
                <p className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  {new Date(reel.created_at).toLocaleDateString()}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Download Confirmation Modal */}
      <DownloadConfirmationModal
        open={showDownloadModal}
        onOpenChange={setShowDownloadModal}
        onConfirm={handleDownload}
        videoTitle={reel?.title || ''}
        availableQualities={availableQualities}
        isLoading={isRequesting}
      />
    </div>
  );
}
