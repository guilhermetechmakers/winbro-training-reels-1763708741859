import { useState, useRef, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Save, 
  Undo2, 
  Play, 
  Pause, 
  Clock,
  Edit,
  Plus,
  Minus
} from "lucide-react";
import { toast } from "sonner";
import { reelsApi } from "@/lib/api";
import type { Transcript, TranscriptSegment } from "@/types";
import { cn } from "@/lib/utils";

interface TranscriptEditorProps {
  reelId: string;
  transcript: Transcript;
  videoUrl: string;
}

export function TranscriptEditor({ reelId, transcript, videoUrl }: TranscriptEditorProps) {
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [editedSegments, setEditedSegments] = useState<TranscriptSegment[]>(transcript.segments);
  const [activeSegmentId, setActiveSegmentId] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const scrollRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

  // Reset edited segments when transcript changes
  useEffect(() => {
    setEditedSegments(transcript.segments);
  }, [transcript]);

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: (data: { segments: TranscriptSegment[]; change_note?: string }) =>
      reelsApi.updateTranscript(reelId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transcript", reelId] });
      queryClient.invalidateQueries({ queryKey: ["reel", reelId] });
      setIsEditing(false);
      toast.success("Transcript updated successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update transcript");
    },
  });

  const handleSegmentClick = (segment: TranscriptSegment) => {
    if (videoRef.current) {
      videoRef.current.currentTime = segment.start;
      setCurrentTime(segment.start);
      setActiveSegmentId(segment.id);
      setIsPlaying(true);
      videoRef.current.play();
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const time = videoRef.current.currentTime;
      setCurrentTime(time);
      
      // Find active segment
      const activeSegment = editedSegments.find(
        (seg) => time >= seg.start && time <= seg.end
      );
      if (activeSegment) {
        setActiveSegmentId(activeSegment.id);
        // Scroll to active segment
        const scrollElement = scrollRefs.current[activeSegment.id];
        if (scrollElement) {
          scrollElement.scrollIntoView({ behavior: "smooth", block: "center" });
        }
      }
    }
  };

  const handleEditSegment = (segmentId: string, field: "text" | "start" | "end", value: string | number) => {
    setEditedSegments((prev) =>
      prev.map((seg) =>
        seg.id === segmentId ? { ...seg, [field]: value } : seg
      )
    );
  };

  const handleAdjustTimestamp = (segmentId: string, direction: "earlier" | "later", amount: number = 0.5) => {
    setEditedSegments((prev) =>
      prev.map((seg) => {
        if (seg.id === segmentId) {
          if (direction === "earlier") {
            return { ...seg, start: Math.max(0, seg.start - amount), end: Math.max(0, seg.end - amount) };
          } else {
            return { ...seg, start: seg.start + amount, end: seg.end + amount };
          }
        }
        return seg;
      })
    );
  };

  const handleSave = () => {
    updateMutation.mutate({
      segments: editedSegments,
      change_note: "Manual transcript edit",
    });
  };

  const handleReset = () => {
    setEditedSegments(transcript.segments);
    setIsEditing(false);
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="space-y-6">
      {/* Video Player */}
      <Card>
        <CardHeader>
          <CardTitle>Video Player</CardTitle>
          <CardDescription>
            Click on transcript segments to seek to that point in the video
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="aspect-video bg-muted rounded-lg relative overflow-hidden">
            <video
              ref={videoRef}
              src={videoUrl}
              className="w-full h-full object-contain"
              onTimeUpdate={handleTimeUpdate}
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
            />
            <div className="absolute bottom-4 left-4 right-4 flex items-center gap-2">
              <Button
                size="sm"
                variant="secondary"
                onClick={() => {
                  if (videoRef.current) {
                    if (isPlaying) {
                      videoRef.current.pause();
                    } else {
                      videoRef.current.play();
                    }
                  }
                }}
              >
                {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
              </Button>
              <div className="flex-1 bg-black/50 text-white px-3 py-1 rounded text-sm">
                {formatTime(currentTime)} / {formatTime(transcript.segments[transcript.segments.length - 1]?.end || 0)}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Transcript Editor */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Time-Aligned Transcript</CardTitle>
              <CardDescription>
                {isEditing
                  ? "Edit transcript segments. Click timestamps to seek video."
                  : "Click on any segment to seek to that point in the video"}
              </CardDescription>
            </div>
            <div className="flex gap-2">
              {isEditing ? (
                <>
                  <Button variant="outline" size="sm" onClick={handleReset}>
                    <Undo2 className="mr-2 h-4 w-4" />
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleSave}
                    disabled={updateMutation.isPending}
                  >
                    <Save className="mr-2 h-4 w-4" />
                    Save Changes
                  </Button>
                </>
              ) : (
                <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit Transcript
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[600px] pr-4">
            <div className="space-y-3">
              {editedSegments.map((segment) => {
                const isActive = activeSegmentId === segment.id;
                const isCurrentTimeInSegment =
                  currentTime >= segment.start && currentTime <= segment.end;

                return (
                  <div
                    key={segment.id}
                    ref={(el) => {
                      scrollRefs.current[segment.id] = el;
                    }}
                    className={cn(
                      "p-4 border rounded-lg transition-all duration-200",
                      isActive && isCurrentTimeInSegment
                        ? "border-primary bg-primary/10 shadow-md"
                        : "border-border hover:border-primary/50 hover:bg-muted/50",
                      isEditing && "bg-white"
                    )}
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0">
                        <button
                          type="button"
                          onClick={() => handleSegmentClick(segment)}
                          className={cn(
                            "flex items-center gap-1 px-2 py-1 rounded text-xs font-mono transition-colors",
                            isActive && isCurrentTimeInSegment
                              ? "bg-primary text-primary-foreground"
                              : "bg-muted text-foreground-secondary hover:bg-primary hover:text-primary-foreground"
                          )}
                        >
                          <Clock className="h-3 w-3" />
                          {formatTime(segment.start)} - {formatTime(segment.end)}
                        </button>
                      </div>

                      <div className="flex-1 space-y-2">
                        {isEditing ? (
                          <>
                            <Textarea
                              value={segment.text}
                              onChange={(e) =>
                                handleEditSegment(segment.id, "text", e.target.value)
                              }
                              className="min-h-[60px] resize-none"
                              placeholder="Transcript text..."
                            />
                            <div className="flex items-center gap-2">
                              <div className="flex items-center gap-1">
                                <Label className="text-xs">Start:</Label>
                                <Input
                                  type="number"
                                  step="0.1"
                                  value={segment.start.toFixed(1)}
                                  onChange={(e) =>
                                    handleEditSegment(
                                      segment.id,
                                      "start",
                                      parseFloat(e.target.value) || 0
                                    )
                                  }
                                  className="w-20 h-7 text-xs"
                                />
                              </div>
                              <div className="flex items-center gap-1">
                                <Label className="text-xs">End:</Label>
                                <Input
                                  type="number"
                                  step="0.1"
                                  value={segment.end.toFixed(1)}
                                  onChange={(e) =>
                                    handleEditSegment(
                                      segment.id,
                                      "end",
                                      parseFloat(e.target.value) || 0
                                    )
                                  }
                                  className="w-20 h-7 text-xs"
                                />
                              </div>
                              <div className="flex items-center gap-1 ml-auto">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleAdjustTimestamp(segment.id, "earlier", 0.5)}
                                  className="h-7 px-2"
                                >
                                  <Minus className="h-3 w-3" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleAdjustTimestamp(segment.id, "later", 0.5)}
                                  className="h-7 px-2"
                                >
                                  <Plus className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>
                            {segment.confidence !== undefined && (
                              <div className="flex items-center gap-2">
                                <Badge variant="outline" className="text-xs">
                                  Confidence: {(segment.confidence * 100).toFixed(0)}%
                                </Badge>
                              </div>
                            )}
                          </>
                        ) : (
                          <>
                            <p className="text-foreground-primary leading-relaxed">
                              {segment.text}
                            </p>
                            {segment.confidence !== undefined && (
                              <Badge variant="outline" className="text-xs">
                                Confidence: {(segment.confidence * 100).toFixed(0)}%
                              </Badge>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </ScrollArea>

          <Separator className="my-4" />

          <div className="flex items-center justify-between text-sm text-foreground-secondary">
            <div>
              <p>Version {transcript.version}</p>
              <p className="text-xs">
                Last updated: {new Date(transcript.updated_at).toLocaleString()}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary">{editedSegments.length} segments</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
