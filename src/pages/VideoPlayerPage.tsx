import { useParams, Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Play, Download, Share2, Heart, Plus, Clock, User, Calendar } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { Reel } from "@/types";

export default function VideoPlayerPage() {
  const { id } = useParams<{ id: string }>();
  
  const { data: reel, isLoading } = useQuery({
    queryKey: ["reel", id],
    queryFn: () => api.get<Reel>(`/reels/${id}`),
    enabled: !!id,
  });

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
      {/* Video Player */}
      <Card>
        <CardContent className="p-0">
          <div className="aspect-video bg-muted rounded-lg flex items-center justify-center relative">
            <div className="text-center">
              <Play className="h-16 w-16 text-primary mx-auto mb-4" />
              <p className="text-foreground-secondary">HLS Video Player</p>
              <p className="text-sm text-foreground-secondary mt-2">
                Adaptive streaming with quality selector and captions
              </p>
            </div>
            {/* Video controls would be here */}
          </div>
        </CardContent>
      </Card>

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
            <Button variant="outline">
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
              <Card>
                <CardHeader>
                  <CardTitle>Transcript</CardTitle>
                  <CardDescription>
                    Click on any timestamp to seek to that point in the video
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {reel.transcript ? (
                    <div className="space-y-2">
                      {reel.transcript.segments.map((segment) => (
                        <div
                          key={segment.id}
                          className="p-2 rounded hover:bg-muted cursor-pointer"
                          onClick={() => {
                            // TODO: Seek video to segment.start
                          }}
                        >
                          <span className="text-xs text-foreground-secondary">
                            {Math.floor(segment.start / 60)}:{(Math.floor(segment.start) % 60).toString().padStart(2, '0')}
                          </span>
                          <p className="mt-1">{segment.text}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-foreground-secondary">No transcript available</p>
                  )}
                </CardContent>
              </Card>
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
    </div>
  );
}
