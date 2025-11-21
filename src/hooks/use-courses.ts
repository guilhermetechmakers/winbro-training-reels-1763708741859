import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { coursesApi, enrollmentsApi, certificatesApi } from "@/lib/api";
import { toast } from "sonner";
import type { Course } from "@/types";

// Courses hooks
export function useCourses(filters?: { status?: string; search?: string }) {
  return useQuery({
    queryKey: ["courses", filters],
    queryFn: () => coursesApi.getCourses(filters),
  });
}

export function useCourse(id: string) {
  return useQuery({
    queryKey: ["course", id],
    queryFn: () => coursesApi.getCourse(id),
    enabled: !!id,
  });
}

export function useCreateCourse() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Omit<Course, "id" | "created_at" | "updated_at">) =>
      coursesApi.createCourse(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["courses"] });
      toast.success("Course created successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to create course");
    },
  });
}

export function useUpdateCourse() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: Partial<Omit<Course, "id" | "created_at" | "updated_at">>;
    }) => coursesApi.updateCourse(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["courses"] });
      queryClient.invalidateQueries({ queryKey: ["course", variables.id] });
      toast.success("Course updated successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update course");
    },
  });
}

export function useDeleteCourse() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => coursesApi.deleteCourse(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["courses"] });
      toast.success("Course deleted successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to delete course");
    },
  });
}

export function usePublishCourse() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => coursesApi.publishCourse(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ["courses"] });
      queryClient.invalidateQueries({ queryKey: ["course", id] });
      toast.success("Course published successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to publish course");
    },
  });
}

export function useArchiveCourse() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => coursesApi.archiveCourse(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ["courses"] });
      queryClient.invalidateQueries({ queryKey: ["course", id] });
      toast.success("Course archived successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to archive course");
    },
  });
}

export function useAddModule() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      courseId,
      data,
    }: {
      courseId: string;
      data: { reel_id: string; order: number };
    }) => coursesApi.addModule(courseId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["course", variables.courseId] });
      queryClient.invalidateQueries({ queryKey: ["courses"] });
      toast.success("Module added successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to add module");
    },
  });
}

export function useUpdateModuleOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      courseId,
      moduleOrders,
    }: {
      courseId: string;
      moduleOrders: { module_id: string; order: number }[];
    }) => coursesApi.updateModuleOrder(courseId, moduleOrders),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["course", variables.courseId] });
      queryClient.invalidateQueries({ queryKey: ["courses"] });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update module order");
    },
  });
}

export function useRemoveModule() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      courseId,
      moduleId,
    }: {
      courseId: string;
      moduleId: string;
    }) => coursesApi.removeModule(courseId, moduleId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["course", variables.courseId] });
      queryClient.invalidateQueries({ queryKey: ["courses"] });
      toast.success("Module removed successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to remove module");
    },
  });
}

// Enrollment hooks
export function useEnrollments(filters?: {
  course_id?: string;
  user_id?: string;
  status?: string;
}) {
  return useQuery({
    queryKey: ["enrollments", filters],
    queryFn: () => enrollmentsApi.getEnrollments(filters),
  });
}

export function useEnrollUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      courseId,
      userId,
    }: {
      courseId: string;
      userId?: string;
    }) => enrollmentsApi.enrollUser(courseId, userId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["enrollments"] });
      queryClient.invalidateQueries({ queryKey: ["enrollments", { course_id: variables.courseId }] });
      toast.success("Enrolled successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to enroll");
    },
  });
}

export function useUnenrollUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (enrollmentId: string) => enrollmentsApi.unenrollUser(enrollmentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["enrollments"] });
      toast.success("Unenrolled successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to unenroll");
    },
  });
}

export function useBulkEnroll() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      courseId,
      userIds,
    }: {
      courseId: string;
      userIds: string[];
    }) => enrollmentsApi.bulkEnroll(courseId, userIds),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["enrollments"] });
      queryClient.invalidateQueries({ queryKey: ["enrollments", { course_id: variables.courseId }] });
      toast.success(`Enrolled ${variables.userIds.length} users successfully`);
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to enroll users");
    },
  });
}

// Certificate hooks
export function useCertificates(filters?: {
  course_id?: string;
  user_id?: string;
}) {
  return useQuery({
    queryKey: ["certificates", filters],
    queryFn: () => certificatesApi.getCertificates(filters),
  });
}

export function useGenerateCertificate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      courseId,
      userId,
    }: {
      courseId: string;
      userId?: string;
    }) => certificatesApi.generateCertificate(courseId, userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["certificates"] });
      toast.success("Certificate generated successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to generate certificate");
    },
  });
}

export function useDownloadCertificate() {
  return useMutation({
    mutationFn: (certificateId: string) =>
      certificatesApi.downloadCertificate(certificateId),
    onError: (error: Error) => {
      toast.error(error.message || "Failed to download certificate");
    },
  });
}
