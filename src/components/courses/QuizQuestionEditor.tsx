import { useState } from "react";
import { X, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import type { QuizQuestion } from "@/types";

interface QuizQuestionEditorProps {
  question: Omit<QuizQuestion, "id">;
  index: number;
  onUpdate: (question: Omit<QuizQuestion, "id">) => void;
  onRemove: () => void;
}

export function QuizQuestionEditor({
  question,
  index,
  onUpdate,
  onRemove,
}: QuizQuestionEditorProps) {
  const [localQuestion, setLocalQuestion] = useState(question);

  const updateField = <K extends keyof typeof localQuestion>(
    field: K,
    value: typeof localQuestion[K]
  ) => {
    const updated = { ...localQuestion, [field]: value };
    setLocalQuestion(updated);
    onUpdate(updated);
  };

  const addOption = () => {
    const newOptions = [...localQuestion.options, ""];
    updateField("options", newOptions);
  };

  const updateOption = (optionIndex: number, value: string) => {
    const newOptions = [...localQuestion.options];
    newOptions[optionIndex] = value;
    updateField("options", newOptions);
  };

  const removeOption = (optionIndex: number) => {
    if (localQuestion.options.length <= 2) {
      alert("A question must have at least 2 options");
      return;
    }
    const newOptions = localQuestion.options.filter((_, i) => i !== optionIndex);
    const newCorrectAnswers = localQuestion.correct_answers
      .map((idx) => (idx > optionIndex ? idx - 1 : idx))
      .filter((idx) => idx >= 0 && idx < newOptions.length);
    updateField("options", newOptions);
    updateField("correct_answers", newCorrectAnswers.length > 0 ? newCorrectAnswers : [0]);
  };

  const toggleCorrectAnswer = (optionIndex: number) => {
    const currentAnswers = localQuestion.correct_answers;
    if (localQuestion.type === "single") {
      updateField("correct_answers", [optionIndex]);
    } else {
      if (currentAnswers.includes(optionIndex)) {
        if (currentAnswers.length > 1) {
          updateField(
            "correct_answers",
            currentAnswers.filter((idx) => idx !== optionIndex)
          );
        } else {
          alert("At least one answer must be correct");
        }
      } else {
        updateField("correct_answers", [...currentAnswers, optionIndex]);
      }
    }
  };

  return (
    <Card className="card-base">
      <CardContent className="p-4 space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="font-semibold text-foreground-primary">Question {index + 1}</h4>
          <Button variant="ghost" size="sm" onClick={onRemove} className="text-destructive">
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="space-y-2">
          <Label>Question Type</Label>
          <Select
            value={localQuestion.type}
            onValueChange={(value: "single" | "multiple") => {
              updateField("type", value);
              if (value === "single" && localQuestion.correct_answers.length > 1) {
                updateField("correct_answers", [localQuestion.correct_answers[0]]);
              }
            }}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="single">Single Choice</SelectItem>
              <SelectItem value="multiple">Multiple Choice</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Question Text</Label>
          <Textarea
            value={localQuestion.question}
            onChange={(e) => updateField("question", e.target.value)}
            placeholder="Enter your question"
            rows={2}
          />
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label>Answer Options</Label>
            <Button size="sm" variant="outline" onClick={addOption}>
              <Plus className="h-4 w-4 mr-2" />
              Add Option
            </Button>
          </div>
          {localQuestion.options.map((option, optIndex) => (
            <div key={optIndex} className="flex items-center gap-2">
              <Checkbox
                checked={localQuestion.correct_answers.includes(optIndex)}
                onCheckedChange={() => toggleCorrectAnswer(optIndex)}
              />
              <Input
                value={option}
                onChange={(e) => updateOption(optIndex, e.target.value)}
                placeholder={`Option ${optIndex + 1}`}
                className="flex-1"
              />
              {localQuestion.options.length > 2 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeOption(optIndex)}
                  className="text-destructive"
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          ))}
        </div>

        <div className="space-y-2">
          <Label>Explanation (optional)</Label>
          <Textarea
            value={localQuestion.explanation || ""}
            onChange={(e) => updateField("explanation", e.target.value)}
            placeholder="Explain why the correct answer is correct"
            rows={2}
          />
        </div>
      </CardContent>
    </Card>
  );
}
