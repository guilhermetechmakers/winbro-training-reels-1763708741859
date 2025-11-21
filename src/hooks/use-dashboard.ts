import { useQuery } from "@tanstack/react-query";
import { dashboardApi } from "@/lib/api";

// Dashboard query keys
export const dashboardKeys = {
  all: ['dashboard'] as const,
  recommendations: (limit?: number) => [...dashboardKeys.all, 'recommendations', limit] as const,
  activity: (limit?: number) => [...dashboardKeys.all, 'activity', limit] as const,
  libraries: () => [...dashboardKeys.all, 'libraries'] as const,
  courseProgress: () => [...dashboardKeys.all, 'course-progress'] as const,
};

// Get recommended reels
export function useRecommendedReels(limit?: number) {
  return useQuery({
    queryKey: dashboardKeys.recommendations(limit),
    queryFn: () => dashboardApi.getRecommendedReels(limit),
    staleTime: 1000 * 60 * 10, // 10 minutes
  });
}

// Get recent activity
export function useRecentActivity(limit?: number) {
  return useQuery({
    queryKey: dashboardKeys.activity(limit),
    queryFn: () => dashboardApi.getRecentActivity(limit),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

// Get user libraries
export function useUserLibraries() {
  return useQuery({
    queryKey: dashboardKeys.libraries(),
    queryFn: () => dashboardApi.getUserLibraries(),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

// Get course progress
export function useCourseProgress() {
  return useQuery({
    queryKey: dashboardKeys.courseProgress(),
    queryFn: () => dashboardApi.getCourseProgress(),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}
