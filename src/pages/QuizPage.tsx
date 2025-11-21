import { useParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function QuizPage() {
  const { courseId: _courseId } = useParams<{ courseId: string }>();

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fade-in-up">
      <div>
        <h1 className="text-3xl font-bold text-foreground-primary">Quiz</h1>
        <p className="text-foreground-secondary mt-1">
          Complete the quiz to earn your certificate
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Course Quiz</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-foreground-secondary text-center py-12">
            Quiz UI with single/multi-select questions, timer, and feedback would be here
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
