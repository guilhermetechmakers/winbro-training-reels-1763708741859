import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { 
  Save, 
  History, 
  RefreshCw, 
  FileText, 
  Settings, 
  ArrowLeft,
  CheckCircle2,
  XCircle,
  Loader2,
  AlertCircle
} from "lucide-react";
import { toast } from "sonner";
import { reelsApi } from "@/lib/api";
import type { Reel, ReprocessJob } from "@/types";
import { TranscriptEditor } from "@/components/reels/TranscriptEditor";
import { VersionHistoryModal } from "@/components/reels/VersionHistoryModal";
import { PermissionDialog } from "@/components/reels/PermissionDialog";
import { MetadataForm } from "@/components/metadata/MetadataForm";
import { useReelMetadata, useUpdateReelMetadata, useCreateReelMetadata } from "@/hooks/use-metadata";
import type { MetadataFormData } from "@/components/metadata/MetadataForm";

const metadataSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  machine_model: z.string().optional(),
  tooling: z.string().optional(),
  process_step: z.string().optional(),
  tags: z.string().optional(),
  skill_level: z.enum(["beginner", "intermediate", "advanced"]),
  language: z.string().default("en"),
});

type MetadataForm = z.infer<typeof metadataSchema>;

export default function EditReelPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("metadata");
  const [isVersionModalOpen, setIsVersionModalOpen] = useState(false);
  const [isPermissionDialogOpen, setIsPermissionDialogOpen] = useState(false);
  const [reprocessJobId, setReprocessJobId] = useState<string | null>(null);
  
  // Fetch structured metadata
  const { data: reelMetadata, isLoading: isLoadingMetadata } = useReelMetadata(id);
  const updateMetadataMutation = useUpdateReelMetadata();
  const createMetadataMutation = useCreateReelMetadata();

  // Fetch reel data
  const { data: reel, isLoading: isLoadingReel } = useQuery({
    queryKey: ["reel", id],
    queryFn: () => reelsApi.getReel(id!),
    enabled: !!id,
  });

  // Fetch transcript
  const { data: transcript, isLoading: isLoadingTranscript } = useQuery({
    queryKey: ["transcript", id],
    queryFn: () => reelsApi.getTranscript(id!),
    enabled: !!id && activeTab === "transcript",
  });

  // Fetch permissions
  const { data: permissions } = useQuery({
    queryKey: ["permissions", id],
    queryFn: () => reelsApi.getPermissions(id!),
    enabled: !!id && activeTab === "settings",
  });

  // Fetch reprocess job status if active
  const { data: reprocessJob } = useQuery({
    queryKey: ["reprocess", id, reprocessJobId],
    queryFn: () => reelsApi.getReprocessStatus(id!, reprocessJobId!),
    enabled: !!id && !!reprocessJobId,
    refetchInterval: (query) => {
      const data = query.state.data;
      if (data?.status === "processing" || data?.status === "pending") {
        return 2000; // Poll every 2 seconds
      }
      return false;
    },
  });

  // Metadata form
  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
    reset,
    watch,
    setValue,
  } = useForm<MetadataForm>({
    resolver: zodResolver(metadataSchema),
    defaultValues: {
      title: "",
      description: "",
      machine_model: "",
      tooling: "",
      process_step: "",
      tags: "",
      skill_level: "beginner",
      language: "en",
    },
  });

  // Reset form when reel data loads
  useEffect(() => {
    if (reel) {
      reset({
        title: reel.title,
        description: reel.description,
        machine_model: reel.machine_model || "",
        tooling: reel.tooling || "",
        process_step: reel.process_step || "",
        tags: reel.tags.join(", "),
        skill_level: reel.skill_level,
        language: reel.language,
      });
    }
  }, [reel, reset]);

  // Update basic metadata mutation (for title, description, etc.)
  const updateBasicMetadataMutation = useMutation({
    mutationFn: (data: Partial<Reel>) => reelsApi.updateReel(id!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reel", id] });
      toast.success("Metadata updated successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update metadata");
    },
  });

  // Reprocess mutation
  const reprocessMutation = useMutation({
    mutationFn: () => reelsApi.startReprocess(id!),
    onSuccess: (job: ReprocessJob) => {
      setReprocessJobId(job.id);
      toast.success("Reprocessing started");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to start reprocessing");
    },
  });

  // Cancel reprocess mutation
  const cancelReprocessMutation = useMutation({
    mutationFn: () => reelsApi.cancelReprocess(id!, reprocessJobId!),
    onSuccess: () => {
      setReprocessJobId(null);
      queryClient.invalidateQueries({ queryKey: ["reprocess", id] });
      toast.success("Reprocessing cancelled");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to cancel reprocessing");
    },
  });

  const onSubmitMetadata = (data: MetadataForm) => {
    const tagsArray = data.tags
      ? data.tags.split(",").map((tag) => tag.trim()).filter(Boolean)
      : [];

    updateBasicMetadataMutation.mutate({
      title: data.title,
      description: data.description,
      machine_model: data.machine_model || undefined,
      tooling: data.tooling || undefined,
      process_step: data.process_step || undefined,
      tags: tagsArray,
      skill_level: data.skill_level,
      language: data.language,
    });
  };

  const handleReprocess = () => {
    if (reprocessJob?.status === "processing" || reprocessJob?.status === "pending") {
      cancelReprocessMutation.mutate();
    } else {
      reprocessMutation.mutate();
    }
  };

  if (isLoadingReel) {
    return (
      <div className="max-w-6xl mx-auto space-y-6 animate-pulse">
        <div className="h-8 bg-muted rounded w-1/3"></div>
        <div className="h-96 bg-muted rounded"></div>
      </div>
    );
  }

  if (!reel) {
    return (
      <div className="max-w-6xl mx-auto space-y-6">
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-foreground-secondary mb-4">Reel not found</p>
            <Button onClick={() => navigate("/library")}>Back to Library</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-fade-in-up">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate(`/reel/${id}`)}
              className="hover:bg-muted"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Badge className={reel.status === "published" ? "badge-published" : "badge-archived"}>
                  {reel.status.toUpperCase()}
                </Badge>
              </div>
              <h1 className="text-3xl font-bold text-foreground-primary">{reel.title}</h1>
              <p className="text-foreground-secondary mt-1">Edit metadata, transcript, and manage versions</p>
            </div>
          </div>
        </div>
      </div>

      {/* Reprocess Status Banner */}
      {reprocessJob && (reprocessJob.status === "processing" || reprocessJob.status === "pending") && (
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Loader2 className="h-5 w-5 text-primary animate-spin" />
                <div>
                  <p className="font-medium text-foreground-primary">Reprocessing in progress</p>
                  <p className="text-sm text-foreground-secondary">
                    {reprocessJob.progress !== undefined ? `${reprocessJob.progress}%` : "Starting..."}
                  </p>
                </div>
              </div>
              {reprocessJob.progress !== undefined && (
                <div className="w-48">
                  <Progress value={reprocessJob.progress} className="h-2" />
                </div>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={handleReprocess}
                disabled={cancelReprocessMutation.isPending}
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {reprocessJob?.status === "completed" && (
        <Card className="border-success/20 bg-success/5">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="h-5 w-5 text-success" />
              <p className="font-medium text-foreground-primary">Reprocessing completed successfully</p>
            </div>
          </CardContent>
        </Card>
      )}

      {reprocessJob?.status === "failed" && (
        <Card className="border-red-500/20 bg-red-500/5">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <XCircle className="h-5 w-5 text-red-500" />
              <div>
                <p className="font-medium text-foreground-primary">Reprocessing failed</p>
                {reprocessJob.error_message && (
                  <p className="text-sm text-foreground-secondary mt-1">{reprocessJob.error_message}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="metadata" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Metadata
          </TabsTrigger>
          <TabsTrigger value="transcript" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Transcript
          </TabsTrigger>
          <TabsTrigger value="versions" className="flex items-center gap-2">
            <History className="h-4 w-4" />
            Versions
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Settings
          </TabsTrigger>
        </TabsList>

        {/* Metadata Tab */}
        <TabsContent value="metadata" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Edit Metadata</CardTitle>
              <CardDescription>
                Update the reel's metadata. Changes are tracked in version history.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(onSubmitMetadata)} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="title">Title *</Label>
                  <Input
                    id="title"
                    {...register("title")}
                    placeholder="Machine Setup: Part 1"
                    className="w-full"
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
                    className="w-full"
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
                  <Label htmlFor="tags">Additional Tags (comma-separated, optional)</Label>
                  <Input
                    id="tags"
                    {...register("tags")}
                    placeholder="setup, maintenance, safety"
                  />
                  <p className="text-xs text-foreground-secondary">
                    Use structured metadata below for better organization.
                  </p>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="skill_level">Skill Level</Label>
                    <Select
                      value={watch("skill_level")}
                      onValueChange={(value: "beginner" | "intermediate" | "advanced") => {
                        setValue("skill_level", value, { shouldDirty: true });
                      }}
                    >
                      <SelectTrigger id="skill_level">
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
                    />
                  </div>
                </div>

                <Separator />

                <div className="flex justify-end gap-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => reset()}
                    disabled={!isDirty}
                  >
                    Reset
                  </Button>
                  <Button
                    type="submit"
                    disabled={!isDirty || updateBasicMetadataMutation.isPending}
                  >
                    {updateBasicMetadataMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        Save Changes
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Structured Metadata Form */}
          {isLoadingMetadata ? (
            <Card>
              <CardContent className="py-12">
                <div className="flex items-center justify-center">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                </div>
              </CardContent>
            </Card>
          ) : (
            <MetadataForm
              initialData={
                reelMetadata
                  ? {
                      machine_model_id: reelMetadata.machine_model_id || undefined,
                      tooling_id: reelMetadata.tooling_id || undefined,
                      process_step_id: reelMetadata.process_step_id || undefined,
                      tags: reelMetadata.tags || [],
                    }
                  : undefined
              }
              customerId={reel?.customer_id}
              requireAll={false}
              title={watch("title")}
              description={watch("description")}
              transcript={transcript?.text}
              onSubmit={async (metadataData: MetadataFormData) => {
                if (id) {
                  if (reelMetadata) {
                    // Update existing metadata
                    updateMetadataMutation.mutate({
                      reelId: id,
                      data: metadataData,
                    });
                  } else {
                    // Create new metadata if it doesn't exist
                    createMetadataMutation.mutate({
                      reelId: id,
                      data: metadataData,
                    });
                  }
                }
              }}
              isLoading={updateMetadataMutation.isPending || createMetadataMutation.isPending}
            />
          )}

          {/* Reprocess Section */}
          <Card>
            <CardHeader>
              <CardTitle>Reprocess Video</CardTitle>
              <CardDescription>
                Reprocess the video to update formats, quality, or regenerate thumbnails.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-foreground-secondary">
                    This will regenerate HLS renditions and thumbnails. The process may take several minutes.
                  </p>
                </div>
                <Button
                  variant="outline"
                  onClick={handleReprocess}
                  disabled={
                    reprocessMutation.isPending ||
                    cancelReprocessMutation.isPending ||
                    (reprocessJob?.status === "processing" || reprocessJob?.status === "pending")
                  }
                >
                  {reprocessJob?.status === "processing" || reprocessJob?.status === "pending" ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4" />
                      Start Reprocess
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Transcript Tab */}
        <TabsContent value="transcript" className="space-y-6 mt-6">
          {isLoadingTranscript ? (
            <Card>
              <CardContent className="py-12">
                <div className="flex items-center justify-center">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                </div>
              </CardContent>
            </Card>
          ) : transcript ? (
            <TranscriptEditor
              reelId={id!}
              transcript={transcript}
              videoUrl={reel.hls_url || reel.video_url}
            />
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <AlertCircle className="h-12 w-12 text-foreground-secondary mx-auto mb-4" />
                <p className="text-foreground-secondary">No transcript available</p>
                <p className="text-sm text-foreground-secondary mt-2">
                  Transcripts are generated automatically during upload or can be requested manually.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Versions Tab */}
        <TabsContent value="versions" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Version History</CardTitle>
                  <CardDescription>
                    View and manage previous versions of this reel
                  </CardDescription>
                </div>
                <Button
                  variant="outline"
                  onClick={() => setIsVersionModalOpen(true)}
                >
                  <History className="mr-2 h-4 w-4" />
                  View All Versions
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 border border-border rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-foreground-primary">Current Version</p>
                      <p className="text-sm text-foreground-secondary">
                        Last updated: {new Date(reel.updated_at).toLocaleString()}
                      </p>
                    </div>
                    <Badge variant="secondary">Active</Badge>
                  </div>
                </div>
                <p className="text-sm text-foreground-secondary">
                  Click "View All Versions" to see the complete history and rollback options.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Permissions & Visibility</CardTitle>
              <CardDescription>
                Control who can view and edit this reel
              </CardDescription>
            </CardHeader>
            <CardContent>
              {permissions ? (
                <div className="space-y-4">
                  <div className="p-4 border border-border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <p className="font-medium text-foreground-primary">Visibility</p>
                        <p className="text-sm text-foreground-secondary">
                          {permissions.visibility === "public" && "Visible to all users"}
                          {permissions.visibility === "tenant" && "Visible to your organization only"}
                          {permissions.visibility === "internal" && "Internal use only"}
                        </p>
                      </div>
                      <Badge variant="secondary">{permissions.visibility}</Badge>
                    </div>
                    <div className="mt-4">
                      <p className="font-medium text-foreground-primary mb-2">Access Level</p>
                      <p className="text-sm text-foreground-secondary">
                        {permissions.access_level === "admin" && "Full administrative access"}
                        {permissions.access_level === "edit" && "Can view and edit"}
                        {permissions.access_level === "view" && "View only"}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => setIsPermissionDialogOpen(true)}
                  >
                    <Settings className="mr-2 h-4 w-4" />
                    Edit Permissions
                  </Button>
                </div>
              ) : (
                <div className="py-8 text-center">
                  <Loader2 className="h-6 w-6 animate-spin text-primary mx-auto mb-4" />
                  <p className="text-sm text-foreground-secondary">Loading permissions...</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Modals */}
      <VersionHistoryModal
        reelId={id!}
        isOpen={isVersionModalOpen}
        onClose={() => setIsVersionModalOpen(false)}
      />

      <PermissionDialog
        reelId={id!}
        isOpen={isPermissionDialogOpen}
        onClose={() => setIsPermissionDialogOpen(false)}
        currentPermissions={permissions}
      />
    </div>
  );
}
