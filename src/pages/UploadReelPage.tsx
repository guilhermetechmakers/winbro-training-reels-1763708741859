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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ResumableUploader } from "@/components/video/ResumableUploader";
import { ProcessingQueue } from "@/components/video/ProcessingQueue";
import { MetadataForm } from "@/components/metadata/MetadataForm";
import { useVideoUpload } from "@/hooks/use-video-upload";
import { useCreateReelMetadata } from "@/hooks/use-metadata";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { MetadataFormData } from "@/components/metadata/MetadataForm";

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
  customer_scope: z.string().optional(),
});

type UploadForm = z.infer<typeof uploadSchema>;

export default function UploadReelPage() {
  const navigate = useNavigate();
  const [file, setFile] = useState<File | null>(null);
  const [structuredMetadata, setStructuredMetadata] = useState<MetadataFormData | null>(null);
  const { uploadId, handleUploadComplete, completeUpload, isCompleting, processingJob } = useVideoUpload();
  const createMetadataMutation = useCreateReelMetadata();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
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
  const skillLevel = watch("skill_level");

  const handleFileSelect = (selectedFile: File) => {
    setFile(selectedFile);
  };

  const handleFileRemove = () => {
    setFile(null);
  };

  const onSubmit = async (data: UploadForm) => {
    if (!file) {
      toast.error("Please select a video file");
      return;
    }

    if (!uploadId) {
      toast.error("Please upload the video file first");
      return;
    }

    // Convert tags string to array (legacy tags field)
    const legacyTags = data.tags
      ? data.tags.split(",").map((tag) => tag.trim()).filter(Boolean)
      : undefined;

    // Merge structured metadata tags with legacy tags if available
    const allTags = [
      ...(structuredMetadata?.tags || []),
      ...(legacyTags || []),
    ].filter((tag, index, self) => self.indexOf(tag) === index); // Remove duplicates

    const metadata = {
      title: data.title,
      description: data.description,
      machine_model: data.machine_model,
      tooling: data.tooling,
      process_step: data.process_step,
      tags: allTags.length > 0 ? allTags : undefined,
      skill_level: data.skill_level,
      language: data.language,
      auto_transcribe: data.auto_transcribe,
      customer_scope: data.customer_scope,
    };

    completeUpload(metadata);
  };

  const handleMetadataSubmit = async (metadataData: MetadataFormData) => {
    setStructuredMetadata(metadataData);
    toast.success("Structured metadata saved");
  };

  const handleProcessingComplete = (_jobId: string, reelId?: string) => {
    if (reelId) {
      toast.success("Video processed successfully!");
      navigate(`/reel/${reelId}/edit`);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-fade-in-up">
      <div>
        <h1 className="text-3xl font-bold text-foreground-primary">Upload Reel</h1>
        <p className="text-foreground-secondary mt-1">
          Upload a new training reel with metadata and processing
        </p>
      </div>

      <Tabs defaultValue="upload" className="space-y-6">
        <TabsList>
          <TabsTrigger value="upload">Upload Video</TabsTrigger>
          <TabsTrigger value="metadata">Metadata</TabsTrigger>
          <TabsTrigger value="processing">Processing Queue</TabsTrigger>
        </TabsList>

        <TabsContent value="upload" className="space-y-6">
          <ResumableUploader
            file={file}
            onFileSelect={handleFileSelect}
            onFileRemove={handleFileRemove}
            onUploadComplete={handleUploadComplete}
            disabled={isCompleting}
            maxSizeMB={500}
            maxDurationSeconds={30}
          />

          {uploadId && (
            <Card className="border-primary/20 bg-primary/5">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3 text-sm text-foreground-primary">
                  <div className="h-2 w-2 rounded-full bg-success animate-pulse" />
                  <span>Upload completed. Please fill in metadata and submit for processing.</span>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="metadata" className="space-y-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
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
                    className="bg-white"
                  />
                  {errors.title && (
                    <p className="text-sm text-destructive">{errors.title.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description *</Label>
                  <Textarea
                    id="description"
                    {...register("description")}
                    placeholder="Brief description of what this reel covers..."
                    rows={4}
                    className="bg-white"
                  />
                  {errors.description && (
                    <p className="text-sm text-destructive">{errors.description.message}</p>
                  )}
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="machine_model">Machine Model</Label>
                    <Input
                      id="machine_model"
                      {...register("machine_model")}
                      placeholder="Model XYZ-123"
                      className="bg-white"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="tooling">Tooling</Label>
                    <Input
                      id="tooling"
                      {...register("tooling")}
                      placeholder="Tool name"
                      className="bg-white"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="process_step">Process Step</Label>
                  <Input
                    id="process_step"
                    {...register("process_step")}
                    placeholder="Setup, Maintenance, Troubleshooting"
                    className="bg-white"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tags">Additional Tags (comma-separated, optional)</Label>
                  <Input
                    id="tags"
                    {...register("tags")}
                    placeholder="setup, maintenance, safety"
                    className="bg-white"
                  />
                  <p className="text-xs text-foreground-secondary">
                    Separate multiple tags with commas. Use structured metadata below for better organization.
                  </p>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="skill_level">Skill Level</Label>
                    <Select
                      value={skillLevel}
                      onValueChange={(value) => setValue("skill_level", value as "beginner" | "intermediate" | "advanced")}
                    >
                      <SelectTrigger className="bg-white">
                        <SelectValue placeholder="Select skill level" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="beginner">Beginner</SelectItem>
                        <SelectItem value="intermediate">Intermediate</SelectItem>
                        <SelectItem value="advanced">Advanced</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="language">Language</Label>
                    <Input
                      id="language"
                      {...register("language")}
                      placeholder="en"
                      className="bg-white"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="customer_scope">Customer Scope (optional)</Label>
                  <Input
                    id="customer_scope"
                    {...register("customer_scope")}
                    placeholder="Leave empty for tenant-scoped"
                    className="bg-white"
                  />
                  <p className="text-xs text-foreground-secondary">
                    Specify customer ID for customer-specific content
                  </p>
                </div>

                <div className="flex items-center justify-between p-4 border border-border rounded-lg bg-white">
                  <div>
                    <Label htmlFor="auto_transcribe">Auto-transcribe</Label>
                    <p className="text-sm text-foreground-secondary">
                      Automatically generate transcript from audio
                    </p>
                  </div>
                  <Switch
                    id="auto_transcribe"
                    checked={autoTranscribe}
                    onCheckedChange={(checked) => setValue("auto_transcribe", checked)}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Structured Metadata Form */}
            <MetadataForm
              customerId={watch("customer_scope")}
              requireAll={false}
              title={watch("title")}
              description={watch("description")}
              onSubmit={handleMetadataSubmit}
              isLoading={createMetadataMutation.isPending}
            />

            <div className="flex justify-end gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate("/library")}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={!uploadId || isCompleting || !file}
              >
                {isCompleting
                  ? "Submitting..."
                  : processingJob
                  ? "Processing..."
                  : "Submit for Processing"}
              </Button>
            </div>
          </form>
        </TabsContent>

        <TabsContent value="processing" className="space-y-6">
          <ProcessingQueue onJobComplete={handleProcessingComplete} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
