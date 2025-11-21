import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { metadataApi } from "@/lib/api";
import type { NLPTagSuggestionsRequest } from "@/types";
import { toast } from "sonner";

// Hook for fetching machine models
export function useMachineModels(customerId?: string) {
  return useQuery({
    queryKey: ["machine-models", customerId],
    queryFn: () => metadataApi.getMachineModels(customerId),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

// Hook for fetching tooling
export function useTooling(customerId?: string) {
  return useQuery({
    queryKey: ["tooling", customerId],
    queryFn: () => metadataApi.getTooling(customerId),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

// Hook for fetching process steps
export function useProcessSteps(customerId?: string) {
  return useQuery({
    queryKey: ["process-steps", customerId],
    queryFn: () => metadataApi.getProcessSteps(customerId),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

// Hook for fetching reel metadata
export function useReelMetadata(reelId: string | undefined) {
  return useQuery({
    queryKey: ["reel-metadata", reelId],
    queryFn: () => metadataApi.getReelMetadata(reelId!),
    enabled: !!reelId,
    retry: (failureCount, error) => {
      // Don't retry on 404 (metadata doesn't exist yet)
      if (error instanceof Error && error.message.includes("404")) {
        return false;
      }
      return failureCount < 2;
    },
  });
}

// Hook for NLP tag suggestions
export function useTagSuggestions() {
  return useMutation({
    mutationFn: (data: NLPTagSuggestionsRequest) =>
      metadataApi.getTagSuggestions(data),
    onError: (error: Error) => {
      toast.error(error.message || "Failed to get tag suggestions");
    },
  });
}

// Hook for metadata validation
export function useMetadataValidation() {
  return useMutation({
    mutationFn: (data: {
      machine_model_id?: string;
      tooling_id?: string;
      process_step_id?: string;
      tags?: string[];
      require_all?: boolean;
    }) => metadataApi.validateMetadata(data),
    onError: (error: Error) => {
      toast.error(error.message || "Failed to validate metadata");
    },
  });
}

// Hook for updating reel metadata
export function useUpdateReelMetadata() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      reelId,
      data,
    }: {
      reelId: string;
      data: {
        machine_model_id?: string;
        tooling_id?: string;
        process_step_id?: string;
        tags?: string[];
      };
    }) => metadataApi.updateReelMetadata(reelId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["reel-metadata", variables.reelId] });
      queryClient.invalidateQueries({ queryKey: ["reel", variables.reelId] });
      toast.success("Metadata updated successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update metadata");
    },
  });
}

// Hook for creating reel metadata
export function useCreateReelMetadata() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      reelId,
      data,
    }: {
      reelId: string;
      data: {
        machine_model_id?: string;
        tooling_id?: string;
        process_step_id?: string;
        tags?: string[];
      };
    }) => metadataApi.createReelMetadata(reelId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["reel-metadata", variables.reelId] });
      queryClient.invalidateQueries({ queryKey: ["reel", variables.reelId] });
      toast.success("Metadata created successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to create metadata");
    },
  });
}
