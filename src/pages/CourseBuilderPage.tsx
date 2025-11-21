import { useState, useEffect } from "react";
import { Plus, Edit, Trash2, Eye, BookOpen, Save, Archive, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { CourseForm } from "@/components/courses/CourseForm";
import { ModuleListEditor } from "@/components/courses/ModuleListEditor";
import { QuizEditor } from "@/components/courses/QuizEditor";
import { EnrollmentManagement } from "@/components/courses/EnrollmentManagement";
import { CoursePreview } from "@/components/courses/CoursePreview";
import { PublishingSettingsPanel } from "@/components/courses/PublishingSettingsPanel";
import {
  useCourses,
  useCreateCourse,
  useUpdateCourse,
  useDeleteCourse,
  usePublishCourse,
  useArchiveCourse,
  useAddModule,
  useRemoveModule,
  useUpdateModuleOrder,
  useEnrollUser,
  useUnenrollUser,
  useBulkEnroll,
} from "@/hooks/use-courses";
import { useQuiz, useUpsertQuiz, useDeleteQuiz } from "@/hooks/use-quizzes";
import { LoadingState, EmptyState } from "@/components/states";
import { format } from "date-fns";
import { toast } from "sonner";
import type { Course, CourseModule } from "@/types";

export default function CourseBuilderPage() {
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isPublishDialogOpen, setIsPublishDialogOpen] = useState(false);
  const [isArchiveDialogOpen, setIsArchiveDialogOpen] = useState(false);
  const [courseToDelete, setCourseToDelete] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  const { data: courses, isLoading } = useCourses();
  const createCourse = useCreateCourse();
  const updateCourse = useUpdateCourse();
  const deleteCourse = useDeleteCourse();
  const publishCourse = usePublishCourse();
  const archiveCourse = useArchiveCourse();
  const addModule = useAddModule();
  const removeModule = useRemoveModule();
  const updateModuleOrder = useUpdateModuleOrder();
  const enrollUser = useEnrollUser();
  const unenrollUser = useUnenrollUser();
  const bulkEnroll = useBulkEnroll();

  // Show last saved indicator
  useEffect(() => {
    if (lastSaved) {
      const timer = setTimeout(() => {
        setLastSaved(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [lastSaved]);

  const handleCreateCourse = async (data: {
    title: string;
    description: string;
    target_roles: string[];
    prerequisites?: string[];
    estimated_time: number;
    status: "draft" | "published" | "archived";
  }) => {
    try {
      const newCourse = await createCourse.mutateAsync({
        ...data,
        modules: [],
      });
      setIsCreateDialogOpen(false);
      setSelectedCourse(newCourse);
      setActiveTab("modules");
      toast.success("Course created successfully");
    } catch (error) {
      // Error handled by hook
    }
  };

  const handleUpdateCourse = async (data: Parameters<typeof updateCourse.mutateAsync>[0]["data"]) => {
    if (!selectedCourse) return;
    try {
      const updated = await updateCourse.mutateAsync({
        id: selectedCourse.id,
        data,
      });
      setSelectedCourse(updated);
      setIsEditDialogOpen(false);
      setLastSaved(new Date());
      toast.success("Course updated successfully");
    } catch (error) {
      // Error handled by hook
    }
  };

  const handleSaveDraft = async () => {
    if (!selectedCourse) return;
    try {
      await updateCourse.mutateAsync({
        id: selectedCourse.id,
        data: { status: "draft" },
      });
      setLastSaved(new Date());
      toast.success("Draft saved");
    } catch (error) {
      toast.error("Failed to save draft");
    }
  };

  const handlePublishCourse = async () => {
    if (!selectedCourse) return;
    try {
      await publishCourse.mutateAsync(selectedCourse.id);
      // Refresh course data
      const updated = await updateCourse.mutateAsync({
        id: selectedCourse.id,
        data: {},
      });
      setSelectedCourse(updated);
      setIsPublishDialogOpen(false);
    } catch (error) {
      // Error handled by hook
    }
  };

  const handleArchiveCourse = async () => {
    if (!selectedCourse) return;
    try {
      await archiveCourse.mutateAsync(selectedCourse.id);
      // Refresh course data
      const updated = await updateCourse.mutateAsync({
        id: selectedCourse.id,
        data: {},
      });
      setSelectedCourse(updated);
      setIsArchiveDialogOpen(false);
    } catch (error) {
      // Error handled by hook
    }
  };

  const handleDeleteCourse = async (courseId: string) => {
    try {
      await deleteCourse.mutateAsync(courseId);
      if (selectedCourse?.id === courseId) {
        setSelectedCourse(null);
        setActiveTab("overview");
      }
      setIsDeleteDialogOpen(false);
      setCourseToDelete(null);
    } catch (error) {
      // Error handled by hook
    }
  };

  const handleAddModule = async (reelId: string) => {
    if (!selectedCourse) return;
    try {
      const order = (selectedCourse.modules?.length || 0) + 1;
      await addModule.mutateAsync({
        courseId: selectedCourse.id,
        data: { reel_id: reelId, order },
      });
      // Refresh course data
      const updated = await updateCourse.mutateAsync({
        id: selectedCourse.id,
        data: {},
      });
      setSelectedCourse(updated);
    } catch (error) {
      // Error handled by hook
    }
  };

  const handleRemoveModule = async (moduleId: string) => {
    if (!selectedCourse) return;
    try {
      await removeModule.mutateAsync({
        courseId: selectedCourse.id,
        moduleId,
      });
      // Refresh course data
      const updated = await updateCourse.mutateAsync({
        id: selectedCourse.id,
        data: {},
      });
      setSelectedCourse(updated);
    } catch (error) {
      // Error handled by hook
    }
  };

  const handleReorderModules = async (
    newOrder: { module_id: string; order: number }[]
  ) => {
    if (!selectedCourse) return;
    try {
      await updateModuleOrder.mutateAsync({
        courseId: selectedCourse.id,
        moduleOrders: newOrder,
      });
      // Refresh course data
      const updated = await updateCourse.mutateAsync({
        id: selectedCourse.id,
        data: {},
      });
      setSelectedCourse(updated);
    } catch (error) {
      // Error handled by hook
    }
  };

  const handlePublishingSettingsSave = async (data: {
    visibility: string;
    enrollment_method: string;
    expiration_date?: string;
    auto_enroll?: boolean;
  }) => {
    if (!selectedCourse) return;
    try {
      await updateCourse.mutateAsync({
        id: selectedCourse.id,
        data: data as Partial<Course>,
      });
      // Refresh course data
      const updated = await updateCourse.mutateAsync({
        id: selectedCourse.id,
        data: {},
      });
      setSelectedCourse(updated);
    } catch (error) {
      toast.error("Failed to save publishing settings");
    }
  };

  const getStatusBadge = (status: Course["status"]) => {
    const variants: Record<
      Course["status"],
      { className: string; label: string }
    > = {
      draft: { className: "bg-muted text-muted-foreground", label: "Draft" },
      published: { className: "bg-success text-white", label: "Published" },
      archived: { className: "bg-archived text-white", label: "Archived" },
    };
    const config = variants[status];
    return <Badge className={config.className}>{config.label}</Badge>;
  };

  // Course detail view
  if (selectedCourse) {
    return (
      <div className="space-y-6 animate-fade-in-up">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold text-foreground-primary">
                {selectedCourse.title}
              </h1>
              {getStatusBadge(selectedCourse.status)}
              {lastSaved && (
                <span className="text-xs text-muted-foreground animate-fade-in">
                  Saved {format(lastSaved, "HH:mm:ss")}
                </span>
              )}
            </div>
            <p className="text-foreground-secondary">
              {selectedCourse.description}
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setSelectedCourse(null);
                setActiveTab("overview");
              }}
            >
              Back to Courses
            </Button>
            <Button
              variant="outline"
              onClick={() => setIsEditDialogOpen(true)}
            >
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
            <Button
              variant="outline"
              onClick={() => setIsPreviewOpen(true)}
            >
              <Play className="h-4 w-4 mr-2" />
              Preview
            </Button>
            {selectedCourse.status === "draft" && (
              <>
                <Button
                  variant="outline"
                  onClick={handleSaveDraft}
                  disabled={updateCourse.isPending}
                >
                  <Save className="h-4 w-4 mr-2" />
                  Save Draft
                </Button>
                <Button
                  onClick={() => setIsPublishDialogOpen(true)}
                  disabled={publishCourse.isPending}
                >
                  Publish
                </Button>
              </>
            )}
            {selectedCourse.status === "published" && (
              <Button
                variant="outline"
                onClick={() => setIsArchiveDialogOpen(true)}
                disabled={archiveCourse.isPending}
              >
                <Archive className="h-4 w-4 mr-2" />
                Archive
              </Button>
            )}
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="modules">Modules</TabsTrigger>
            <TabsTrigger value="publishing">Publishing</TabsTrigger>
            <TabsTrigger value="enrollments">Enrollments</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <Card className="card-base">
              <CardHeader>
                <CardTitle>Course Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Estimated Time</p>
                    <p className="text-foreground-primary">{selectedCourse.estimated_time} minutes</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Modules</p>
                    <p className="text-foreground-primary">
                      {selectedCourse.modules?.length || 0} modules
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Target Roles</p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {selectedCourse.target_roles.map((role) => (
                        <Badge key={role} variant="secondary" className="capitalize">
                          {role.replace("_", " ")}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Created</p>
                    <p className="text-foreground-primary">
                      {format(new Date(selectedCourse.created_at), "MMM d, yyyy")}
                    </p>
                  </div>
                  {selectedCourse.prerequisites && selectedCourse.prerequisites.length > 0 && (
                    <div className="col-span-2">
                      <p className="text-sm font-medium text-muted-foreground">Prerequisites</p>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {selectedCourse.prerequisites.map((prereqId) => {
                          const prereqCourse = courses?.find((c) => c.id === prereqId);
                          return prereqCourse ? (
                            <Badge key={prereqId} variant="outline">
                              {prereqCourse.title}
                            </Badge>
                          ) : null;
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="modules" className="space-y-4">
            <ModuleListEditor
              modules={selectedCourse.modules || []}
              onAddModule={handleAddModule}
              onRemoveModule={handleRemoveModule}
              onReorderModules={handleReorderModules}
              isLoading={addModule.isPending || removeModule.isPending}
            />
            {selectedCourse.modules && selectedCourse.modules.length > 0 && (
              <div className="space-y-4">
                {selectedCourse.modules
                  .sort((a, b) => a.order - b.order)
                  .map((module) => (
                    <ModuleQuizEditor
                      key={module.id}
                      module={module}
                    />
                  ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="publishing" className="space-y-4">
            <PublishingSettingsPanel
              course={selectedCourse}
              onSave={handlePublishingSettingsSave}
              isLoading={updateCourse.isPending}
            />
          </TabsContent>

          <TabsContent value="enrollments">
            <EnrollmentManagement
              courseId={selectedCourse.id}
              onEnroll={async () => {
                await enrollUser.mutateAsync({ courseId: selectedCourse.id });
              }}
              onUnenroll={async (enrollmentId) => {
                await unenrollUser.mutateAsync(enrollmentId);
              }}
              onBulkEnroll={async (userIds) => {
                await bulkEnroll.mutateAsync({
                  courseId: selectedCourse.id,
                  userIds,
                });
              }}
              isLoading={
                enrollUser.isPending || unenrollUser.isPending || bulkEnroll.isPending
              }
            />
          </TabsContent>
        </Tabs>

        {/* Edit Course Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Course</DialogTitle>
              <DialogDescription>
                Update course details and settings.
              </DialogDescription>
            </DialogHeader>
            <CourseForm
              course={selectedCourse}
              onSubmit={handleUpdateCourse}
              onCancel={() => setIsEditDialogOpen(false)}
              isLoading={updateCourse.isPending}
            />
          </DialogContent>
        </Dialog>

        {/* Preview Dialog */}
        {isPreviewOpen && selectedCourse && (
          <CoursePreview
            course={selectedCourse}
            onClose={() => setIsPreviewOpen(false)}
          />
        )}

        {/* Publish Confirmation Dialog */}
        <AlertDialog open={isPublishDialogOpen} onOpenChange={setIsPublishDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Publish Course</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to publish this course? Once published, it will be visible
                to users based on your publishing settings.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handlePublishCourse}>
                Publish
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Archive Confirmation Dialog */}
        <AlertDialog open={isArchiveDialogOpen} onOpenChange={setIsArchiveDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Archive Course</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to archive this course? Archived courses will no longer be
                available for new enrollments but existing enrollments will remain active.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleArchiveCourse}>
                Archive
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    );
  }

  // Course list view
  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground-primary">Course Builder</h1>
          <p className="text-foreground-secondary mt-1">
            Assemble reels into courses with quizzes
          </p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Course
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Course</DialogTitle>
              <DialogDescription>
                Create a new course by adding modules and quizzes.
              </DialogDescription>
            </DialogHeader>
            <CourseForm
              onSubmit={handleCreateCourse}
              onCancel={() => setIsCreateDialogOpen(false)}
              isLoading={createCourse.isPending}
            />
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <LoadingState variant="grid" count={3} />
      ) : !courses || courses.length === 0 ? (
        <EmptyState
          icon={BookOpen}
          title="No courses yet"
          description="Create your first course to get started"
          action={{
            label: "Create Course",
            onClick: () => setIsCreateDialogOpen(true),
          }}
        />
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {courses.map((course) => (
            <Card
              key={course.id}
              className="card-base card-hover"
              onClick={() => {
                setSelectedCourse(course);
                setActiveTab("overview");
              }}
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="line-clamp-2">{course.title}</CardTitle>
                    <CardDescription className="mt-1 line-clamp-2">
                      {course.description}
                    </CardDescription>
                  </div>
                  {getStatusBadge(course.status)}
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span>{course.modules?.length || 0} modules</span>
                  <span>{course.estimated_time} min</span>
                </div>
                <div className="flex items-center gap-2 mt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedCourse(course);
                      setActiveTab("overview");
                    }}
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    View
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedCourse(course);
                      setIsEditDialogOpen(true);
                    }}
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      setCourseToDelete(course.id);
                      setIsDeleteDialogOpen(true);
                    }}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Course</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this course? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setCourseToDelete(null)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => courseToDelete && handleDeleteCourse(courseToDelete)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

// Module Quiz Editor Component
function ModuleQuizEditor({ module }: { module: CourseModule }) {
  const { data: quiz } = useQuiz(module.id);
  const upsertQuiz = useUpsertQuiz();
  const deleteQuiz = useDeleteQuiz();

  return (
    <Card className="card-base">
      <CardHeader>
        <CardTitle>Module {module.order} - Quiz</CardTitle>
      </CardHeader>
      <CardContent>
        <QuizEditor
          quiz={quiz}
          moduleId={module.id}
          onSave={async (data) => {
            await upsertQuiz.mutateAsync({ moduleId: module.id, data });
          }}
          onDelete={
            quiz
              ? async () => {
                  await deleteQuiz.mutateAsync(module.id);
                }
              : undefined
          }
          isLoading={upsertQuiz.isPending || deleteQuiz.isPending}
        />
      </CardContent>
    </Card>
  );
}
