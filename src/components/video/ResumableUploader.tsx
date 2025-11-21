import { useState, useRef, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Upload, FileVideo, X, AlertCircle, CheckCircle2, Pause, Play } from "lucide-react";
import { toast } from "sonner";
import { videoUploadApi } from "@/lib/api";
import type { UploadInitResponse, VideoUpload } from "@/types";
import { cn } from "@/lib/utils";

interface ResumableUploaderProps {
  file: File | null;
  onFileSelect: (file: File) => void;
  onFileRemove: () => void;
  onUploadComplete: (uploadId: string) => void;
  disabled?: boolean;
  maxSizeMB?: number;
  maxDurationSeconds?: number;
}

const CHUNK_SIZE = 5 * 1024 * 1024; // 5MB chunks

export function ResumableUploader({
  file,
  onFileSelect,
  onFileRemove,
  onUploadComplete,
  disabled = false,
  maxSizeMB = 500,
  maxDurationSeconds = 30,
}: ResumableUploaderProps) {
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState<VideoUpload["upload_status"]>("pending");
  const [uploadId, setUploadId] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadedBytes, setUploadedBytes] = useState(0);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const currentChunkRef = useRef<number>(0);
  const isPausedRef = useRef<boolean>(false);

  const validateFile = useCallback((selectedFile: File): string | null => {
    // Check file type
    if (!selectedFile.type.startsWith("video/")) {
      return "Please select a video file";
    }

    // Check file size
    const fileSizeMB = selectedFile.size / (1024 * 1024);
    if (fileSizeMB > maxSizeMB) {
      return `File size exceeds maximum of ${maxSizeMB}MB`;
    }

    // Note: Duration validation would require reading the video file
    // This is typically done server-side, but we can add a client-side check if needed
    return null;
  }, [maxSizeMB]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    const validationError = validateFile(selectedFile);
    if (validationError) {
      toast.error(validationError);
      return;
    }

    onFileSelect(selectedFile);
    setError(null);
    setUploadProgress(0);
    setUploadStatus("pending");
    setUploadedBytes(0);
  }, [validateFile, onFileSelect]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (disabled || isUploading) return;

    const droppedFile = e.dataTransfer.files[0];
    if (!droppedFile) return;

    const validationError = validateFile(droppedFile);
    if (validationError) {
      toast.error(validationError);
      return;
    }

    onFileSelect(droppedFile);
    setError(null);
    setUploadProgress(0);
    setUploadStatus("pending");
    setUploadedBytes(0);
  }, [disabled, isUploading, validateFile, onFileSelect]);

  const splitIntoChunks = useCallback((file: File): Blob[] => {
    const chunks: Blob[] = [];
    let start = 0;
    while (start < file.size) {
      const end = Math.min(start + CHUNK_SIZE, file.size);
      chunks.push(file.slice(start, end));
      start = end;
    }
    return chunks;
  }, []);

  const uploadChunk = useCallback(async (
    uploadId: string,
    chunk: Blob,
    chunkNumber: number,
    totalChunks: number,
    uploadedBytes: number
  ) => {
    try {
      const response = await videoUploadApi.uploadChunk(
        uploadId,
        chunk,
        chunkNumber,
        totalChunks,
        uploadedBytes
      );

      const newUploadedBytes = response.uploaded_bytes;
      const newProgress = Math.round((newUploadedBytes / file!.size) * 100);

      setUploadedBytes(newUploadedBytes);
      setUploadProgress(newProgress);

      if (response.is_complete) {
        setUploadStatus("uploaded");
        setIsUploading(false);
        onUploadComplete(uploadId);
        toast.success("Upload completed successfully!");
        return true;
      }

      return false;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Upload failed";
      setError(errorMessage);
      setUploadStatus("failed");
      setIsUploading(false);
      toast.error(errorMessage);
      throw error;
    }
  }, [file, onUploadComplete]);

  const startUpload = useCallback(async () => {
    if (!file || isUploading) return;

    setIsUploading(true);
    setIsPaused(false);
    setError(null);
    setUploadStatus("uploading");

    try {
      // Initialize upload
      const initResponse: UploadInitResponse = await videoUploadApi.initUpload(file, {});
      const newUploadId = initResponse.upload_id;
      setUploadId(newUploadId);

      // Split file into chunks
      const chunks = splitIntoChunks(file);
      chunksRef.current = chunks;
      currentChunkRef.current = 0;

      // Create abort controller for cancellation
      abortControllerRef.current = new AbortController();

      // Upload chunks sequentially
      let uploadedBytes = 0;
      for (let i = 0; i < chunks.length; i++) {
        // Check if paused
        if (isPausedRef.current) {
          await new Promise((resolve) => {
            const checkPause = setInterval(() => {
              if (!isPausedRef.current) {
                clearInterval(checkPause);
                resolve(undefined);
              }
            }, 100);
          });
        }

        // Check if aborted
        if (abortControllerRef.current?.signal.aborted) {
          setUploadStatus("pending");
          setIsUploading(false);
          return;
        }

        const isComplete = await uploadChunk(
          newUploadId,
          chunks[i],
          i + 1,
          chunks.length,
          uploadedBytes
        );

        if (isComplete) {
          return;
        }

        uploadedBytes += chunks[i].size;
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Upload failed";
      setError(errorMessage);
      setUploadStatus("failed");
      setIsUploading(false);
      isPausedRef.current = false;
      toast.error(errorMessage);
    }
  }, [file, isUploading, splitIntoChunks, uploadChunk]);

  const pauseUpload = useCallback(() => {
    isPausedRef.current = true;
    setIsPaused(true);
  }, []);

  const resumeUpload = useCallback(async () => {
    if (!uploadId || !file) return;

    isPausedRef.current = false;
    setIsPaused(false);
    setUploadStatus("uploading");
    setIsUploading(true);
    setError(null);

    try {
      // Get current upload status
      const status = await videoUploadApi.getUploadStatus(uploadId);
      setUploadedBytes(status.uploaded_bytes);
      setUploadProgress(status.upload_progress);

      // Resume from where we left off
      const chunks = splitIntoChunks(file);
      chunksRef.current = chunks;
      const startChunk = Math.floor(status.uploaded_bytes / CHUNK_SIZE);

      abortControllerRef.current = new AbortController();

      let uploadedBytes = status.uploaded_bytes;
      for (let i = startChunk; i < chunks.length; i++) {
        if (abortControllerRef.current?.signal.aborted || isPausedRef.current) {
          setUploadStatus("pending");
          setIsUploading(false);
          return;
        }

        const isComplete = await uploadChunk(
          uploadId,
          chunks[i],
          i + 1,
          chunks.length,
          uploadedBytes
        );

        if (isComplete) {
          return;
        }

        uploadedBytes += chunks[i].size;
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Resume failed";
      setError(errorMessage);
      setUploadStatus("failed");
      setIsUploading(false);
      isPausedRef.current = false;
      toast.error(errorMessage);
    }
  }, [uploadId, file, splitIntoChunks, uploadChunk]);

  const cancelUpload = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    isPausedRef.current = false;
    setIsUploading(false);
    setIsPaused(false);
    setUploadStatus("pending");
    setUploadProgress(0);
    setUploadedBytes(0);
    setUploadId(null);
    setError(null);
  }, []);

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + " " + sizes[i];
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Video File Upload</CardTitle>
        <CardDescription>
          Upload a video file (max {maxSizeMB}MB, recommended {maxDurationSeconds}s duration)
        </CardDescription>
      </CardHeader>
      <CardContent>
        {!file ? (
          <div
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            className={cn(
              "border-2 border-dashed rounded-lg p-12 text-center transition-colors",
              disabled
                ? "border-muted bg-muted/20 cursor-not-allowed"
                : "border-border hover:border-primary cursor-pointer"
            )}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="video/*"
              onChange={handleFileSelect}
              className="hidden"
              id="file-upload"
              disabled={disabled}
            />
            <label
              htmlFor="file-upload"
              className={cn(
                "cursor-pointer flex flex-col items-center",
                disabled && "cursor-not-allowed opacity-50"
              )}
            >
              <Upload className="h-12 w-12 text-foreground-secondary mb-4" />
              <p className="text-foreground-primary font-medium mb-2">
                Click to upload or drag and drop
              </p>
              <p className="text-sm text-foreground-secondary">
                MP4, MOV, AVI up to {maxSizeMB}MB
              </p>
            </label>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center gap-4 p-4 border border-border rounded-lg bg-card">
              <FileVideo className="h-10 w-10 text-primary flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="font-medium text-foreground-primary truncate">{file.name}</p>
                <p className="text-sm text-foreground-secondary">
                  {formatFileSize(file.size)}
                </p>
                {uploadStatus !== "pending" && (
                  <div className="mt-2 space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-foreground-secondary">
                        {formatFileSize(uploadedBytes)} / {formatFileSize(file.size)}
                      </span>
                      <span className="text-foreground-secondary">{uploadProgress}%</span>
                    </div>
                    <Progress value={uploadProgress} className="h-2" />
                  </div>
                )}
                {error && (
                  <div className="mt-2 flex items-center gap-2 text-sm text-destructive">
                    <AlertCircle className="h-4 w-4" />
                    <span>{error}</span>
                  </div>
                )}
                {uploadStatus === "uploaded" && (
                  <div className="mt-2 flex items-center gap-2 text-sm text-success">
                    <CheckCircle2 className="h-4 w-4" />
                    <span>Upload completed</span>
                  </div>
                )}
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                {isUploading && !isPaused && (
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={pauseUpload}
                    disabled={disabled}
                  >
                    <Pause className="h-4 w-4" />
                  </Button>
                )}
                {isPaused && uploadId && (
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={resumeUpload}
                    disabled={disabled}
                  >
                    <Play className="h-4 w-4" />
                  </Button>
                )}
                {!isUploading && uploadStatus === "pending" && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={startUpload}
                    disabled={disabled}
                  >
                    Start Upload
                  </Button>
                )}
                {!isUploading && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      cancelUpload();
                      onFileRemove();
                    }}
                    disabled={disabled}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
