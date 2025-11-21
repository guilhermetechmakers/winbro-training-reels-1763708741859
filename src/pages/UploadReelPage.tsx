import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Progress } from "@/components/ui/progress";
import { Upload, FileVideo, X } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

const uploadSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  machine_model: z.string().optional(),
  tooling: z.string().optional(),
  process_step: z.string().optional(),
  tags: z.string().optional(),
  skill_level: z.enum(["beginner", "intermediate", "advanced"]),
  language: z.string().default("en"),
  auto_transcribe: z.boolean().default(true),
});

type UploadForm = z.infer<typeof uploadSchema>;

export default function UploadReelPage() {
  const navigate = useNavigate();
  const [file, setFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<UploadForm>({
    resolver: zodResolver(uploadSchema),
    defaultValues: {
      auto_transcribe: true,
      language: "en",
      skill_level: "beginner",
    },
  });

  const autoTranscribe = watch("auto_transcribe");

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      // Validate file type and duration
      if (!selectedFile.type.startsWith("video/")) {
        toast.error("Please select a video file");
        return;
      }
      setFile(selectedFile);
    }
  };

  const onSubmit = async (_data: UploadForm) => {
    if (!file) {
      toast.error("Please select a video file");
      return;
    }

    setIsUploading(true);
    try {
      // TODO: Implement resumable upload with tus protocol
      // Simulate upload progress
      const interval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval);
            return 100;
          }
          return prev + 10;
        });
      }, 500);

      await new Promise((resolve) => setTimeout(resolve, 5000));
      clearInterval(interval);
      setUploadProgress(100);

      // TODO: Submit metadata to API
      toast.success("Reel uploaded successfully! It will be processed shortly.");
      navigate("/library");
    } catch (error) {
      toast.error("Upload failed. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in-up">
      <div>
        <h1 className="text-3xl font-bold text-foreground-primary">Upload Reel</h1>
        <p className="text-foreground-secondary mt-1">
          Upload a new training reel with metadata
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* File Upload */}
        <Card>
          <CardHeader>
            <CardTitle>Video File</CardTitle>
            <CardDescription>
              Upload a video file (max 30 seconds recommended)
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!file ? (
              <div className="border-2 border-dashed border-border rounded-lg p-12 text-center">
                <input
                  type="file"
                  accept="video/*"
                  onChange={handleFileSelect}
                  className="hidden"
                  id="file-upload"
                />
                <label htmlFor="file-upload" className="cursor-pointer">
                  <Upload className="h-12 w-12 text-foreground-secondary mx-auto mb-4" />
                  <p className="text-foreground-primary font-medium mb-2">
                    Click to upload or drag and drop
                  </p>
                  <p className="text-sm text-foreground-secondary">
                    MP4, MOV, AVI up to 500MB
                  </p>
                </label>
              </div>
            ) : (
              <div className="flex items-center gap-4 p-4 border border-border rounded-lg">
                <FileVideo className="h-10 w-10 text-primary" />
                <div className="flex-1">
                  <p className="font-medium">{file.name}</p>
                  <p className="text-sm text-foreground-secondary">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                  {isUploading && (
                    <div className="mt-2">
                      <Progress value={uploadProgress} className="h-2" />
                      <p className="text-xs text-foreground-secondary mt-1">
                        {uploadProgress}% uploaded
                      </p>
                    </div>
                  )}
                </div>
                {!isUploading && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => setFile(null)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Metadata Form */}
        <Card>
          <CardHeader>
            <CardTitle>Metadata</CardTitle>
            <CardDescription>
              Provide information about your training reel
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                {...register("title")}
                placeholder="Machine Setup: Part 1"
              />
              {errors.title && (
                <p className="text-sm text-red-500">{errors.title.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                {...register("description")}
                placeholder="Brief description of what this reel covers..."
                rows={4}
              />
              {errors.description && (
                <p className="text-sm text-red-500">{errors.description.message}</p>
              )}
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="machine_model">Machine Model</Label>
                <Input
                  id="machine_model"
                  {...register("machine_model")}
                  placeholder="Model XYZ-123"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="tooling">Tooling</Label>
                <Input
                  id="tooling"
                  {...register("tooling")}
                  placeholder="Tool name"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="process_step">Process Step</Label>
              <Input
                id="process_step"
                {...register("process_step")}
                placeholder="Setup, Maintenance, Troubleshooting"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="tags">Tags (comma-separated)</Label>
              <Input
                id="tags"
                {...register("tags")}
                placeholder="setup, maintenance, safety"
              />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="skill_level">Skill Level</Label>
                <select
                  id="skill_level"
                  className="w-full px-3 py-2 border border-input rounded-lg bg-white"
                  {...register("skill_level")}
                >
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="language">Language</Label>
                <Input
                  id="language"
                  {...register("language")}
                  placeholder="en"
                />
              </div>
            </div>

            <div className="flex items-center justify-between p-4 border border-border rounded-lg">
              <div>
                <Label htmlFor="auto_transcribe">Auto-transcribe</Label>
                <p className="text-sm text-foreground-secondary">
                  Automatically generate transcript from audio
                </p>
              </div>
              <Switch
                id="auto_transcribe"
                checked={autoTranscribe}
                onCheckedChange={(_checked) => {
                  // Handle switch change
                }}
                {...register("auto_transcribe")}
              />
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" onClick={() => navigate("/library")}>
            Cancel
          </Button>
          <Button type="submit" disabled={isUploading || !file}>
            {isUploading ? "Uploading..." : "Submit for Moderation"}
          </Button>
        </div>
      </form>
    </div>
  );
}
