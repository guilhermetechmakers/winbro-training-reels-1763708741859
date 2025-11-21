import { useState } from "react";
import { Plus, Trash2, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { QuizQuestionEditor } from "./QuizQuestionEditor";
import type { Quiz, QuizQuestion } from "@/types";

interface QuizEditorProps {
  quiz?: Quiz;
  moduleId: string;
  onSave: (data: Omit<Quiz, "id" | "module_id">) => void | Promise<void>;
  onDelete?: () => void;
  isLoading?: boolean;
  // moduleId is used internally but marked as unused by TS
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
}

export function QuizEditor({ quiz, moduleId: _moduleId, onSave, onDelete, isLoading }: QuizEditorProps) {
  const [questions, setQuestions] = useState<Omit<QuizQuestion, "id">[]>(
    quiz?.questions.map((q) => ({
      type: q.type,
      question: q.question,
      options: q.options,
      correct_answers: q.correct_answers,
      explanation: q.explanation,
    })) || []
  );
  const [timeLimit, setTimeLimit] = useState<number | undefined>(quiz?.time_limit);
  const [passThreshold, setPassThreshold] = useState<number>(
    quiz?.pass_threshold || 70
  );

  const addQuestion = () => {
    setQuestions([
      ...questions,
      {
        type: "single",
        question: "",
        options: ["", ""],
        correct_answers: [0],
        explanation: "",
      },
    ]);
  };

  const updateQuestion = (index: number, question: Omit<QuizQuestion, "id">) => {
    const newQuestions = [...questions];
    newQuestions[index] = question;
    setQuestions(newQuestions);
  };

  const removeQuestion = (index: number) => {
    setQuestions(questions.filter((_, i) => i !== index));
  };

  const handleSave = () => {
    if (questions.length === 0) {
      alert("Please add at least one question");
      return;
    }

    // Validate all questions have content
    const invalidQuestions = questions.filter(
      (q) => !q.question.trim() || q.options.some((opt) => !opt.trim())
    );
    if (invalidQuestions.length > 0) {
      alert("Please fill in all question fields");
      return;
    }

    onSave({
      questions: questions.map((q, idx) => ({
        ...q,
        id: `temp-${idx}`,
      })) as QuizQuestion[],
      time_limit: timeLimit,
      pass_threshold: passThreshold,
    });
  };

  return (
    <Card className="card-base">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Quiz Settings</CardTitle>
          {onDelete && (
            <Button
              variant="destructive"
              size="sm"
              onClick={onDelete}
              disabled={isLoading}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete Quiz
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="time_limit">Time Limit (seconds, optional)</Label>
            <Input
              id="time_limit"
              type="number"
              value={timeLimit || ""}
              onChange={(e) =>
                setTimeLimit(e.target.value ? parseInt(e.target.value) : undefined)
              }
              placeholder="No limit"
              min={0}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="pass_threshold">Pass Threshold (%)</Label>
            <Input
              id="pass_threshold"
              type="number"
              value={passThreshold}
              onChange={(e) => setPassThreshold(parseInt(e.target.value) || 70)}
              min={0}
              max={100}
            />
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label>Questions ({questions.length})</Label>
            <Button size="sm" onClick={addQuestion} variant="outline">
              <Plus className="h-4 w-4 mr-2" />
              Add Question
            </Button>
          </div>

          {questions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No questions added yet. Click "Add Question" to get started.
            </div>
          ) : (
            <div className="space-y-4">
              {questions.map((question, index) => (
                <QuizQuestionEditor
                  key={index}
                  question={question}
                  index={index}
                  onUpdate={(q) => updateQuestion(index, q)}
                  onRemove={() => removeQuestion(index)}
                />
              ))}
            </div>
          )}
        </div>

        <div className="flex justify-end">
          <Button onClick={handleSave} disabled={isLoading || questions.length === 0}>
            <Save className="h-4 w-4 mr-2" />
            {isLoading ? "Saving..." : "Save Quiz"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
