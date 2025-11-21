import { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Sparkles, X, Loader2, AlertCircle } from "lucide-react";
import {
  useMachineModels,
  useTooling,
  useProcessSteps,
  useMetadataValidation,
} from "@/hooks/use-metadata";
import { TagSuggestionDialog } from "./TagSuggestionDialog";
import { ValidationModal } from "./ValidationModal";
import { cn } from "@/lib/utils";
import type { MetadataValidationResult } from "@/types";

const metadataFormSchema = z.object({
  machine_model_id: z.string().optional(),
  tooling_id: z.string().optional(),
  process_step_id: z.string().optional(),
  tags: z.array(z.string()).default([]),
});

export type MetadataFormData = z.infer<typeof metadataFormSchema>;

interface MetadataFormProps {
  initialData?: {
    machine_model_id?: string;
    tooling_id?: string;
    process_step_id?: string;
    tags?: string[];
  };
  customerId?: string;
  requireAll?: boolean;
  title?: string;
  description?: string;
  transcript?: string;
  onSubmit: (data: MetadataFormData) => void | Promise<void>;
  onValidationChange?: (isValid: boolean) => void;
  isLoading?: boolean;
  className?: string;
}

export function MetadataForm({
  initialData,
  customerId,
  requireAll = false,
  title,
  description,
  transcript,
  onSubmit,
  onValidationChange,
  isLoading = false,
  className,
}: MetadataFormProps) {
  const [isTagDialogOpen, setIsTagDialogOpen] = useState(false);
  const [validationResult, setValidationResult] = useState<MetadataValidationResult | null>(null);
  const [isValidationModalOpen, setIsValidationModalOpen] = useState(false);

  const {
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors, isDirty },
    reset,
  } = useForm<MetadataFormData>({
    resolver: zodResolver(metadataFormSchema),
    defaultValues: {
      machine_model_id: initialData?.machine_model_id || "",
      tooling_id: initialData?.tooling_id || "",
      process_step_id: initialData?.process_step_id || "",
      tags: initialData?.tags || [],
    },
  });

  // Reset form when initialData changes
  useEffect(() => {
    if (initialData) {
      reset({
        machine_model_id: initialData.machine_model_id || "",
        tooling_id: initialData.tooling_id || "",
        process_step_id: initialData.process_step_id || "",
        tags: initialData.tags || [],
      });
    }
  }, [initialData, reset]);

  // Fetch taxonomy data
  const { data: machineModels, isLoading: isLoadingMachineModels } = useMachineModels(customerId);
  const { data: tooling, isLoading: isLoadingTooling } = useTooling(customerId);
  const { data: processSteps, isLoading: isLoadingProcessSteps } = useProcessSteps(customerId);

  const validationMutation = useMetadataValidation();
  const watchedValues = watch();

  // Validate metadata when form changes
  useEffect(() => {
    const validateMetadata = async () => {
      if (isDirty) {
        try {
          const result = await validationMutation.mutateAsync({
            machine_model_id: watchedValues.machine_model_id,
            tooling_id: watchedValues.tooling_id,
            process_step_id: watchedValues.process_step_id,
            tags: watchedValues.tags,
            require_all: requireAll,
          });
          setValidationResult(result);
          onValidationChange?.(result.valid);
        } catch (error) {
          // Validation failed, but don't show error to user
          console.error("Validation error:", error);
        }
      }
    };

    const timeoutId = setTimeout(validateMetadata, 500); // Debounce
    return () => clearTimeout(timeoutId);
  }, [watchedValues, isDirty, requireAll]);

  const handleFormSubmit = async (data: MetadataFormData) => {
    // Validate before submitting
    try {
      const validation = await validationMutation.mutateAsync({
        ...data,
        require_all: requireAll,
      });

      if (!validation.valid) {
        setValidationResult(validation);
        setIsValidationModalOpen(true);
        return;
      }

      await onSubmit(data);
    } catch (error) {
      console.error("Form submission error:", error);
    }
  };

  const handleTagSelect = (tags: string[]) => {
    setValue("tags", tags, { shouldDirty: true });
  };

  const handleRemoveTag = (tagToRemove: string) => {
    const currentTags = watchedValues.tags || [];
    setValue(
      "tags",
      currentTags.filter((tag) => tag !== tagToRemove),
      { shouldDirty: true }
    );
  };

  const currentTags = watchedValues.tags || [];

  return (
    <div className={cn("space-y-6", className)}>
      <Card>
        <CardHeader>
          <CardTitle>Structured Metadata</CardTitle>
          <CardDescription>
            {requireAll
              ? "All fields are required for proper categorization."
              : "Add metadata to improve searchability and organization."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
            {/* Machine Model */}
            <div className="space-y-2">
              <Label htmlFor="machine_model_id">
                Machine Model {requireAll && <span className="text-destructive">*</span>}
              </Label>
              <Controller
                name="machine_model_id"
                control={control}
                render={({ field }) => (
                  <Select
                    value={field.value || ""}
                    onValueChange={(value) => {
                      field.onChange(value);
                      setValue("machine_model_id", value, { shouldDirty: true });
                    }}
                  >
                    <SelectTrigger
                      id="machine_model_id"
                      className={cn(
                        "bg-white",
                        errors.machine_model_id && "border-destructive"
                      )}
                    >
                      <SelectValue placeholder="Select a machine model" />
                    </SelectTrigger>
                    <SelectContent>
                      {isLoadingMachineModels ? (
                        <div className="flex items-center justify-center p-4">
                          <Loader2 className="h-4 w-4 animate-spin" />
                        </div>
                      ) : machineModels && machineModels.length > 0 ? (
                        machineModels.map((model) => (
                          <SelectItem key={model.id} value={model.id}>
                            {model.name}
                            {model.description && (
                              <span className="text-xs text-foreground-secondary ml-2">
                                - {model.description}
                              </span>
                            )}
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem value="no-models" disabled>
                          No machine models available
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.machine_model_id && (
                <p className="text-sm text-destructive">
                  {errors.machine_model_id.message}
                </p>
              )}
            </div>

            {/* Tooling */}
            <div className="space-y-2">
              <Label htmlFor="tooling_id">
                Tooling {requireAll && <span className="text-destructive">*</span>}
              </Label>
              <Controller
                name="tooling_id"
                control={control}
                render={({ field }) => (
                  <Select
                    value={field.value || ""}
                    onValueChange={(value) => {
                      field.onChange(value);
                      setValue("tooling_id", value, { shouldDirty: true });
                    }}
                  >
                    <SelectTrigger
                      id="tooling_id"
                      className={cn(
                        "bg-white",
                        errors.tooling_id && "border-destructive"
                      )}
                    >
                      <SelectValue placeholder="Select tooling" />
                    </SelectTrigger>
                    <SelectContent>
                      {isLoadingTooling ? (
                        <div className="flex items-center justify-center p-4">
                          <Loader2 className="h-4 w-4 animate-spin" />
                        </div>
                      ) : tooling && tooling.length > 0 ? (
                        tooling.map((item) => (
                          <SelectItem key={item.id} value={item.id}>
                            {item.name}
                            {item.description && (
                              <span className="text-xs text-foreground-secondary ml-2">
                                - {item.description}
                              </span>
                            )}
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem value="no-tooling" disabled>
                          No tooling available
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.tooling_id && (
                <p className="text-sm text-destructive">
                  {errors.tooling_id.message}
                </p>
              )}
            </div>

            {/* Process Step */}
            <div className="space-y-2">
              <Label htmlFor="process_step_id">
                Process Step {requireAll && <span className="text-destructive">*</span>}
              </Label>
              <Controller
                name="process_step_id"
                control={control}
                render={({ field }) => (
                  <Select
                    value={field.value || ""}
                    onValueChange={(value) => {
                      field.onChange(value);
                      setValue("process_step_id", value, { shouldDirty: true });
                    }}
                  >
                    <SelectTrigger
                      id="process_step_id"
                      className={cn(
                        "bg-white",
                        errors.process_step_id && "border-destructive"
                      )}
                    >
                      <SelectValue placeholder="Select a process step" />
                    </SelectTrigger>
                    <SelectContent>
                      {isLoadingProcessSteps ? (
                        <div className="flex items-center justify-center p-4">
                          <Loader2 className="h-4 w-4 animate-spin" />
                        </div>
                      ) : processSteps && processSteps.length > 0 ? (
                        processSteps.map((step) => (
                          <SelectItem key={step.id} value={step.id}>
                            {step.name}
                            {step.description && (
                              <span className="text-xs text-foreground-secondary ml-2">
                                - {step.description}
                              </span>
                            )}
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem value="no-steps" disabled>
                          No process steps available
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.process_step_id && (
                <p className="text-sm text-destructive">
                  {errors.process_step_id.message}
                </p>
              )}
            </div>

            <Separator />

            {/* Tags */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="tags">
                  Tags {requireAll && <span className="text-destructive">*</span>}
                </Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsTagDialogOpen(true)}
                  className="gap-2"
                >
                  <Sparkles className="h-4 w-4" />
                  Get AI Suggestions
                </Button>
              </div>

              {currentTags.length > 0 ? (
                <div className="flex flex-wrap gap-2 p-3 border border-border rounded-lg bg-white min-h-[44px]">
                  {currentTags.map((tag) => (
                    <Badge
                      key={tag}
                      variant="secondary"
                      className="gap-1 pr-1"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(tag)}
                        className="ml-1 hover:bg-destructive/20 rounded-full p-0.5 transition-colors"
                        aria-label={`Remove ${tag}`}
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              ) : (
                <div className="p-3 border border-border rounded-lg bg-white min-h-[44px] flex items-center">
                  <p className="text-sm text-foreground-secondary">
                    No tags added. Click "Get AI Suggestions" to add tags automatically.
                  </p>
                </div>
              )}

              {validationResult && !validationResult.valid && (
                <div className="flex items-start gap-2 text-sm text-destructive">
                  <AlertCircle className="h-4 w-4 mt-0.5" />
                  <p>
                    {validationResult.errors.find((e) => e.field === "tags")?.message ||
                      "Tags are required"}
                  </p>
                </div>
              )}
            </div>

            {/* Validation Status */}
            {validationResult && (
              <div
                className={cn(
                  "p-3 rounded-lg border",
                  validationResult.valid
                    ? "bg-success/5 border-success/20"
                    : "bg-destructive/5 border-destructive/20"
                )}
              >
                <div className="flex items-center gap-2">
                  {validationResult.valid ? (
                    <>
                      <AlertCircle className="h-4 w-4 text-success" />
                      <p className="text-sm text-success">
                        All required metadata fields are complete.
                      </p>
                    </>
                  ) : (
                    <>
                      <AlertCircle className="h-4 w-4 text-destructive" />
                      <p className="text-sm text-destructive">
                        {validationResult.errors.length} error(s) found. Please fix before
                        submitting.
                      </p>
                    </>
                  )}
                </div>
              </div>
            )}

            <div className="flex justify-end gap-3 pt-4">
              <Button
                type="submit"
                disabled={isLoading || !validationResult?.valid}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save Metadata"
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Tag Suggestion Dialog */}
      <TagSuggestionDialog
        isOpen={isTagDialogOpen}
        onClose={() => setIsTagDialogOpen(false)}
        onSelectTags={handleTagSelect}
        title={title}
        description={description}
        transcript={transcript}
        existingTags={currentTags}
      />

      {/* Validation Modal */}
      <ValidationModal
        isOpen={isValidationModalOpen}
        onClose={() => setIsValidationModalOpen(false)}
        validationResult={validationResult}
      />
    </div>
  );
}
