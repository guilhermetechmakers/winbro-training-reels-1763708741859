import { useQuery } from "@tanstack/react-query";
import { useEffect, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Video, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Loader2,
  Shield,
  Film,
  FileText,
  Image as ImageIcon,
  X
} from "lucide-react";
import { videoUploadApi } from "@/lib/api";
import { toast } from "sonner";
import type { VideoProcessingJob } from "@/types";
import { cn } from "@/lib/utils";
import { useMutation, useQueryClient } from "@tanstack/react-query";

interface ProcessingQueueProps {
  onJobComplete?: (jobId: string, reelId?: string) => void;
}

const STATUS_COLORS = {
  pending: "bg-muted text-foreground-secondary",
  scanning: "bg-blue-100 text-blue-700",
  transcoding: "bg-purple-100 text-purple-700",
  transcribing: "bg-yellow-100 text-yellow-700",
  generating_thumbnails: "bg-green-100 text-green-700",
  completed: "bg-success text-white",
  failed: "bg-destructive text-white",
} as const;

const STATUS_ICONS = {
  pending: Clock,
  scanning: Shield,
  transcoding: Film,
  transcribing: FileText,
  generating_thumbnails: ImageIcon,
  completed: CheckCircle2,
  failed: XCircle,
} as const;

export function ProcessingQueue({ onJobComplete }: ProcessingQueueProps) {
  const queryClient = useQueryClient();
  const completedJobsRef = useRef<Set<string>>(new Set());

  const { data: jobs = [], isLoading } = useQuery({
    queryKey: ["processing-queue"],
    queryFn: () => videoUploadApi.getProcessingQueue(),
    refetchInterval: (query) => {
      const data = query.state.data as VideoProcessingJob[] | undefined;
      // If any job is still processing, poll every 3 seconds
      const hasActiveJobs = data?.some(
        (job) => !["completed", "failed"].includes(job.status)
      );
      return hasActiveJobs ? 3000 : false;
    },
  });

  // Call onJobComplete when jobs finish
  useEffect(() => {
    if (!jobs || !onJobComplete) return;

    jobs.forEach((job) => {
      if (
        job.status === "completed" &&
        !completedJobsRef.current.has(job.job_id)
      ) {
        completedJobsRef.current.add(job.job_id);
        onJobComplete(job.job_id, job.reel_id);
      }
    });
  }, [jobs, onJobComplete]);

  const cancelMutation = useMutation({
    mutationFn: (jobId: string) => videoUploadApi.cancelProcessing(jobId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["processing-queue"] });
      toast.success("Processing job cancelled");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to cancel processing");
    },
  });

  const getStatusLabel = (status: VideoProcessingJob["status"]): string => {
    const labels: Record<VideoProcessingJob["status"], string> = {
      pending: "Pending",
      scanning: "Scanning for viruses",
      transcoding: "Transcoding video",
      transcribing: "Generating transcript",
      generating_thumbnails: "Generating thumbnails",
      completed: "Completed",
      failed: "Failed",
    };
    return labels[status];
  };

  const getStepDetails = (job: VideoProcessingJob): string[] => {
    const steps: string[] = [];
    
    if (job.virus_scan_status) {
      const scanStatus = job.virus_scan_status === "clean" 
        ? "✓ Virus scan passed"
        : job.virus_scan_status === "infected"
        ? "✗ Virus detected"
        : "⏳ Scanning...";
      steps.push(scanStatus);
    }
    
    if (job.transcoding_status) {
      const transcodeStatus = job.transcoding_status === "completed"
        ? "✓ Video transcoded"
        : job.transcoding_status === "failed"
        ? "✗ Transcoding failed"
        : "⏳ Transcoding...";
      steps.push(transcodeStatus);
    }
    
    if (job.transcription_status) {
      const transcriptStatus = job.transcription_status === "completed"
        ? "✓ Transcript generated"
        : job.transcription_status === "failed"
        ? "✗ Transcription failed"
        : "⏳ Transcribing...";
      steps.push(transcriptStatus);
    }
    
    if (job.thumbnail_status) {
      const thumbnailStatus = job.thumbnail_status === "completed"
        ? "✓ Thumbnails generated"
        : job.thumbnail_status === "failed"
        ? "✗ Thumbnail generation failed"
        : "⏳ Generating thumbnails...";
      steps.push(thumbnailStatus);
    }
    
    return steps;
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Processing Queue</CardTitle>
          <CardDescription>Loading processing jobs...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-foreground-secondary" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (jobs.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Processing Queue</CardTitle>
          <CardDescription>No videos currently being processed</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-foreground-secondary">
            <Video className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>All videos have been processed</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Processing Queue</CardTitle>
        <CardDescription>
          {jobs.filter((j) => !["completed", "failed"].includes(j.status)).length} video(s) being processed
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px] pr-4">
          <div className="space-y-4">
            {jobs.map((job) => {
              const StatusIcon = STATUS_ICONS[job.status];
              const statusColor = STATUS_COLORS[job.status];
              const steps = getStepDetails(job);
              const isActive = !["completed", "failed"].includes(job.status);

              return (
                <div
                  key={job.job_id}
                  className={cn(
                    "p-4 border rounded-lg transition-all",
                    isActive
                      ? "border-primary/20 bg-primary/5"
                      : "border-border bg-card"
                  )}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <StatusIcon
                          className={cn(
                            "h-5 w-5",
                            isActive && "animate-pulse",
                            job.status === "completed" && "text-success",
                            job.status === "failed" && "text-destructive"
                          )}
                        />
                        <Badge className={cn("text-xs", statusColor)}>
                          {getStatusLabel(job.status)}
                        </Badge>
                        {job.current_step && (
                          <span className="text-sm text-foreground-secondary">
                            {job.current_step}
                          </span>
                        )}
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-xs text-foreground-secondary">
                          <span>Job ID: {job.job_id.slice(0, 8)}...</span>
                          <span>{Math.round(job.progress)}%</span>
                        </div>
                        <Progress value={job.progress} className="h-2" />

                        {steps.length > 0 && (
                          <div className="mt-3 space-y-1">
                            {steps.map((step, idx) => (
                              <div
                                key={idx}
                                className="text-xs text-foreground-secondary flex items-center gap-2"
                              >
                                <span>{step}</span>
                              </div>
                            ))}
                          </div>
                        )}

                        {job.error_message && (
                          <div className="mt-2 p-2 bg-destructive/10 border border-destructive/20 rounded text-sm text-destructive">
                            {job.error_message}
                          </div>
                        )}

                        <div className="text-xs text-foreground-secondary mt-2">
                          Started: {new Date(job.created_at).toLocaleString()}
                        </div>
                      </div>
                    </div>

                    {isActive && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => cancelMutation.mutate(job.job_id)}
                        disabled={cancelMutation.isPending}
                        className="flex-shrink-0"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
