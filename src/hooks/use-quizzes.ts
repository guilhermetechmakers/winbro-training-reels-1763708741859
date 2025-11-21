import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { quizzesApi } from "@/lib/api";
import { toast } from "sonner";
import type { Quiz, QuizAnswer } from "@/types";

// Quiz hooks
export function useQuiz(moduleId: string) {
  return useQuery({
    queryKey: ["quiz", moduleId],
    queryFn: () => quizzesApi.getQuiz(moduleId),
    enabled: !!moduleId,
  });
}

export function useUpsertQuiz() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      moduleId,
      data,
    }: {
      moduleId: string;
      data: Omit<Quiz, "id" | "module_id">;
    }) => quizzesApi.upsertQuiz(moduleId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["quiz", variables.moduleId] });
      toast.success("Quiz saved successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to save quiz");
    },
  });
}

export function useDeleteQuiz() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (moduleId: string) => quizzesApi.deleteQuiz(moduleId),
    onSuccess: (_, moduleId) => {
      queryClient.invalidateQueries({ queryKey: ["quiz", moduleId] });
      toast.success("Quiz deleted successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to delete quiz");
    },
  });
}

// Quiz attempt hooks
export function useStartQuizAttempt() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      quizId,
      moduleId,
      courseId,
    }: {
      quizId: string;
      moduleId: string;
      courseId: string;
    }) => quizzesApi.startQuizAttempt(quizId, moduleId, courseId),
    onSuccess: (data) => {
      queryClient.setQueryData(["quiz-attempt", data.id], data);
      queryClient.invalidateQueries({ queryKey: ["quiz-attempts"] });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to start quiz");
    },
  });
}

export function useSubmitQuizAttempt() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      attemptId,
      answers,
    }: {
      attemptId: string;
      answers: QuizAnswer[];
    }) => quizzesApi.submitQuizAttempt(attemptId, answers),
    onSuccess: (data, variables) => {
      queryClient.setQueryData(["quiz-attempt", variables.attemptId], data);
      queryClient.invalidateQueries({ queryKey: ["quiz-attempts"] });
      if (data.passed) {
        toast.success(`Quiz passed! Score: ${data.score}%`);
      } else {
        toast.error(`Quiz failed. Score: ${data.score}%`);
      }
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to submit quiz");
    },
  });
}

export function useQuizAttempt(attemptId: string) {
  return useQuery({
    queryKey: ["quiz-attempt", attemptId],
    queryFn: () => quizzesApi.getQuizAttempt(attemptId),
    enabled: !!attemptId,
  });
}

export function useQuizAttempts(courseId: string, moduleId?: string) {
  return useQuery({
    queryKey: ["quiz-attempts", courseId, moduleId],
    queryFn: () => quizzesApi.getQuizAttempts(courseId, moduleId),
    enabled: !!courseId,
  });
}
