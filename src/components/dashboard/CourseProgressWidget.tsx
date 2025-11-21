import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { BookOpen, Play, ChevronRight } from "lucide-react";
import { useCourseProgress } from "@/hooks/use-dashboard";
import { LoadingState, EmptyState } from "@/components/states";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";

interface CourseProgressWidgetProps {
  limit?: number;
  className?: string;
}

export function CourseProgressWidget({ limit = 3, className }: CourseProgressWidgetProps) {
  const { data: courses, isLoading } = useCourseProgress();

  if (isLoading) {
    return (
      <div className={className}>
        <LoadingState variant="list" count={limit} />
      </div>
    );
  }

  if (!courses || courses.length === 0) {
    return (
      <EmptyState
        icon={BookOpen}
        title="No courses in progress"
        description="Start learning by enrolling in a course or creating your own."
        action={{
          label: "Browse Courses",
          href: "/courses",
        }}
        size="sm"
      />
    );
  }

  const displayedCourses = courses.slice(0, limit);

  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-foreground-primary">Course Progress</h3>
          <p className="text-sm text-foreground-secondary mt-1">
            Continue your learning journey
          </p>
        </div>
        <Link to="/courses">
          <Button variant="ghost" size="sm" className="gap-2">
            View all
            <ChevronRight className="h-4 w-4" />
          </Button>
        </Link>
      </div>

      <div className="space-y-3">
        {displayedCourses.map((course, index) => (
          <CourseCard key={course.course_id} course={course} index={index} />
        ))}
      </div>
    </div>
  );
}

interface CourseCardProps {
  course: import("@/types").CourseProgress;
  index: number;
}

function CourseCard({ course, index }: CourseCardProps) {
  const progressPercentage = Math.round(course.progress);
  const lastAccessed = course.last_accessed_at
    ? formatDistanceToNow(new Date(course.last_accessed_at), { addSuffix: true })
    : null;

  return (
    <Link to={`/courses/${course.course_id}`}>
      <Card className="card-base card-hover animate-fade-in-up" style={{ animationDelay: `${index * 0.1}s` }}>
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1">
              <CardTitle className="text-base mb-1 line-clamp-1">
                {course.course_title}
              </CardTitle>
              {course.course_description && (
                <CardDescription className="line-clamp-1">
                  {course.course_description}
                </CardDescription>
              )}
            </div>
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
              <BookOpen className="h-5 w-5 text-primary" />
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-foreground-secondary">
                {course.completed_modules} of {course.total_modules} modules
              </span>
              <span className="font-medium text-foreground-primary">
                {progressPercentage}%
              </span>
            </div>
            <Progress value={progressPercentage} className="h-2" />
            <div className="flex items-center justify-between">
              {lastAccessed && (
                <span className="text-xs text-foreground-secondary">
                  Last accessed {lastAccessed}
                </span>
              )}
              <Button
                variant="ghost"
                size="sm"
                className="gap-2 h-8"
                onClick={(e) => {
                  e.preventDefault();
                  window.location.href = `/courses/${course.course_id}`;
                }}
              >
                <Play className="h-3 w-3" />
                Resume
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
