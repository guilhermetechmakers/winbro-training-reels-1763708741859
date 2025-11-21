import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function CourseBuilderPage() {
  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground-primary">Course Builder</h1>
          <p className="text-foreground-secondary mt-1">
            Assemble reels into courses with quizzes
          </p>
        </div>
        <Button>Create Course</Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Your Courses</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-foreground-secondary text-center py-12">
            Course builder with drag-and-drop module list and quiz editor would be here
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
