import { useState } from "react";
import { Plus, Edit, Trash2, Eye, BookOpen } from "lucide-react";
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
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { CourseForm } from "@/components/courses/CourseForm";
import { ModuleListEditor } from "@/components/courses/ModuleListEditor";
import { QuizEditor } from "@/components/courses/QuizEditor";
import { EnrollmentManagement } from "@/components/courses/EnrollmentManagement";
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
import type { Course, CourseModule } from "@/types";

export default function CourseBuilderPage() {
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");

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
    } catch (error) {
      // Error handled by hook
    }
  };

  const handleDeleteCourse = async (courseId: string) => {
    if (!confirm("Are you sure you want to delete this course?")) return;
    try {
      await deleteCourse.mutateAsync(courseId);
      if (selectedCourse?.id === courseId) {
        setSelectedCourse(null);
        setActiveTab("overview");
      }
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

  if (selectedCourse) {
    return (
      <div className="space-y-6 animate-fade-in-up">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold text-foreground-primary">
                {selectedCourse.title}
              </h1>
              {getStatusBadge(selectedCourse.status)}
            </div>
            <p className="text-foreground-secondary mt-1">
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
            {selectedCourse.status === "draft" && (
              <Button
                onClick={() => publishCourse.mutate(selectedCourse.id)}
                disabled={publishCourse.isPending}
              >
                Publish
              </Button>
            )}
            {selectedCourse.status === "published" && (
              <Button
                variant="outline"
                onClick={() => archiveCourse.mutate(selectedCourse.id)}
                disabled={archiveCourse.isPending}
              >
                Archive
              </Button>
            )}
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="modules">Modules</TabsTrigger>
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
                      courseId={selectedCourse.id}
                    />
                  ))}
              </div>
            )}
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
      </div>
    );
  }

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
                      handleDeleteCourse(course.id);
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
    </div>
  );
}

// Module Quiz Editor Component
function ModuleQuizEditor({ module }: { module: CourseModule; courseId: string }) {
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
