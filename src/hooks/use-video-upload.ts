import { useState, useCallback } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { videoUploadApi } from "@/lib/api";
import { toast } from "sonner";
import type { VideoMetadata, VideoProcessingJob } from "@/types";

export function useVideoUpload() {
  const queryClient = useQueryClient();
  const [uploadId, setUploadId] = useState<string | null>(null);

  const completeUploadMutation = useMutation({
    mutationFn: ({ uploadId, metadata }: { uploadId: string; metadata: VideoMetadata }) =>
      videoUploadApi.completeUpload(uploadId, metadata),
    onSuccess: (job: VideoProcessingJob) => {
      queryClient.invalidateQueries({ queryKey: ["processing-queue"] });
      toast.success("Upload completed! Video is now being processed.");
      return job;
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to complete upload");
    },
  });

  const handleUploadComplete = useCallback((newUploadId: string) => {
    setUploadId(newUploadId);
  }, []);

  const completeUpload = useCallback(
    (metadata: VideoMetadata) => {
      if (!uploadId) {
        toast.error("No active upload to complete");
        return;
      }
      completeUploadMutation.mutate({ uploadId, metadata });
    },
    [uploadId, completeUploadMutation]
  );

  return {
    uploadId,
    handleUploadComplete,
    completeUpload,
    isCompleting: completeUploadMutation.isPending,
    processingJob: completeUploadMutation.data,
  };
}
