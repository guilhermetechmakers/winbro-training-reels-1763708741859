import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Clock, CheckCircle, XCircle, Award, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useQuizAttempt, useStartQuizAttempt, useSubmitQuizAttempt } from "@/hooks/use-quizzes";
import { useCourse } from "@/hooks/use-courses";
import { useGenerateCertificate, useDownloadCertificate } from "@/hooks/use-courses";
import { CertificatePreview } from "@/components/courses/CertificatePreview";
import { toast } from "sonner";
import type { QuizAnswer } from "@/types";

export default function QuizPage() {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const [moduleId, setModuleId] = useState<string>("");
  const [quizId, setQuizId] = useState<string>("");
  const [attemptId, setAttemptId] = useState<string>("");
  const [answers, setAnswers] = useState<Record<string, number[]>>({});
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [showCertificate, setShowCertificate] = useState(false);

  const { data: course } = useCourse(courseId || "");
  const startQuizAttempt = useStartQuizAttempt();
  const submitQuizAttempt = useSubmitQuizAttempt();
  const { data: attempt, isLoading: attemptLoading } = useQuizAttempt(attemptId);
  const generateCertificate = useGenerateCertificate();
  const downloadCertificate = useDownloadCertificate();

  // Initialize quiz attempt when course and module are available
  useEffect(() => {
    if (course && course.modules && course.modules.length > 0 && !attemptId) {
      // For now, use the first module with a quiz
      const moduleWithQuiz = course.modules.find((m) => m.quiz);
      if (moduleWithQuiz && moduleWithQuiz.quiz) {
        setModuleId(moduleWithQuiz.id);
        setQuizId(moduleWithQuiz.quiz.id);
        handleStartQuiz();
      }
    }
  }, [course, attemptId]);

  // Timer countdown
  useEffect(() => {
    if (timeRemaining !== null && timeRemaining > 0 && !isSubmitted) {
      const timer = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev === null || prev <= 1) {
            handleSubmit();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [timeRemaining, isSubmitted]);

  const handleStartQuiz = async () => {
    if (!quizId || !moduleId || !courseId) return;
    try {
      const newAttempt = await startQuizAttempt.mutateAsync({
        quizId,
        moduleId,
        courseId,
      });
      setAttemptId(newAttempt.id);
      if (newAttempt.time_spent !== undefined) {
        // Calculate remaining time if time limit exists
        const quiz = course?.modules.find((m) => m.id === moduleId)?.quiz;
        if (quiz?.time_limit) {
          setTimeRemaining(quiz.time_limit - newAttempt.time_spent);
        }
      }
    } catch (error) {
      toast.error("Failed to start quiz");
    }
  };

  const handleAnswerChange = (questionId: string, optionIndex: number, isMultiple: boolean) => {
    setAnswers((prev) => {
      const current = prev[questionId] || [];
      if (isMultiple) {
        const newAnswers = current.includes(optionIndex)
          ? current.filter((idx) => idx !== optionIndex)
          : [...current, optionIndex];
        return { ...prev, [questionId]: newAnswers };
      } else {
        return { ...prev, [questionId]: [optionIndex] };
      }
    });
  };

  const handleSubmit = async () => {
    if (!attemptId) return;
    try {
      const quizAnswers: QuizAnswer[] = Object.entries(answers).map(([questionId, selectedIndices]) => ({
        question_id: questionId,
        selected_indices: selectedIndices,
      }));

      const result = await submitQuizAttempt.mutateAsync({
        attemptId,
        answers: quizAnswers,
      });

      setIsSubmitted(true);

      // If passed and course completed, show certificate option
      if (result.passed && course) {
        // Check if all modules/quizzes are completed
        // For now, just show certificate option if quiz passed
        // In a real app, you'd check course completion status
      }
    } catch (error) {
      toast.error("Failed to submit quiz");
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  if (!course) {
    return (
      <div className="max-w-3xl mx-auto space-y-6 animate-fade-in-up">
        <div className="text-center py-12">
          <p className="text-foreground-secondary">Loading course...</p>
        </div>
      </div>
    );
  }

  const quiz = course.modules?.find((m) => m.id === moduleId)?.quiz;
  if (!quiz) {
    return (
      <div className="max-w-3xl mx-auto space-y-6 animate-fade-in-up">
        <Button variant="ghost" onClick={() => navigate(`/courses`)}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Courses
        </Button>
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-foreground-secondary">No quiz found for this course module.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (showCertificate && attempt?.passed) {
    // In a real app, fetch the actual certificate
    return (
      <div className="max-w-3xl mx-auto space-y-6 animate-fade-in-up">
        <Button variant="ghost" onClick={() => setShowCertificate(false)}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <CertificatePreview
          certificate={{
            id: "temp",
            course_id: courseId || "",
            user_id: "current-user",
            issued_at: new Date().toISOString(),
            verification_id: `CERT-${Date.now()}`,
          }}
          course={course}
          onDownload={async () => {
            // Generate and download certificate
            try {
              const cert = await generateCertificate.mutateAsync({
                courseId: courseId || "",
              });
              await downloadCertificate.mutateAsync(cert.id);
            } catch (error) {
              toast.error("Failed to download certificate");
            }
          }}
          isLoading={generateCertificate.isPending || downloadCertificate.isPending}
        />
      </div>
    );
  }

  if (isSubmitted && attempt) {
    const score = attempt.score || 0;
    const passed = attempt.passed;
    const totalQuestions = quiz.questions.length;
    const correctAnswers = attempt.answers.filter((a) => a.is_correct).length;

    return (
      <div className="max-w-3xl mx-auto space-y-6 animate-fade-in-up">
        <Card className="card-base">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {passed ? (
                <>
                  <CheckCircle className="h-6 w-6 text-success" />
                  Quiz Passed!
                </>
              ) : (
                <>
                  <XCircle className="h-6 w-6 text-destructive" />
                  Quiz Failed
                </>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center space-y-2">
              <div className="text-4xl font-bold text-foreground-primary">{score}%</div>
              <p className="text-muted-foreground">
                You got {correctAnswers} out of {totalQuestions} questions correct
              </p>
              <Badge className={passed ? "bg-success text-white" : "bg-destructive text-white"}>
                {passed ? "Passed" : "Failed"} (Threshold: {quiz.pass_threshold}%)
              </Badge>
            </div>

            <Separator />

            <div className="space-y-4">
              <h3 className="font-semibold text-foreground-primary">Review Answers</h3>
              {quiz.questions.map((question, qIndex) => {
                const userAnswer = attempt.answers.find((a) => a.question_id === question.id);
                const isCorrect = userAnswer?.is_correct;
                const selectedIndices = userAnswer?.selected_indices || [];

                return (
                  <Card key={question.id} className="card-base">
                    <CardContent className="p-4 space-y-3">
                      <div className="flex items-start justify-between">
                        <h4 className="font-medium text-foreground-primary">
                          Question {qIndex + 1}: {question.question}
                        </h4>
                        {isCorrect ? (
                          <CheckCircle className="h-5 w-5 text-success flex-shrink-0" />
                        ) : (
                          <XCircle className="h-5 w-5 text-destructive flex-shrink-0" />
                        )}
                      </div>
                      <div className="space-y-2">
                        {question.options.map((option, optIndex) => {
                          const isSelected = selectedIndices.includes(optIndex);
                          const isCorrectAnswer = question.correct_answers.includes(optIndex);

                          return (
                            <div
                              key={optIndex}
                              className={`p-2 rounded border ${
                                isCorrectAnswer
                                  ? "bg-success/10 border-success"
                                  : isSelected && !isCorrectAnswer
                                  ? "bg-destructive/10 border-destructive"
                                  : "bg-muted/50"
                              }`}
                            >
                              <div className="flex items-center gap-2">
                                {isCorrectAnswer && (
                                  <CheckCircle className="h-4 w-4 text-success" />
                                )}
                                {isSelected && !isCorrectAnswer && (
                                  <XCircle className="h-4 w-4 text-destructive" />
                                )}
                                <span
                                  className={
                                    isCorrectAnswer
                                      ? "font-medium text-success"
                                      : isSelected && !isCorrectAnswer
                                      ? "font-medium text-destructive"
                                      : ""
                                  }
                                >
                                  {option}
                                </span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                      {question.explanation && (
                        <div className="mt-2 p-2 bg-muted rounded text-sm">
                          <strong>Explanation:</strong> {question.explanation}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {passed && (
              <div className="flex justify-center gap-2 pt-4">
                <Button
                  onClick={() => setShowCertificate(true)}
                  className="gap-2"
                >
                  <Award className="h-4 w-4" />
                  View Certificate
                </Button>
              </div>
            )}

            <div className="flex justify-center gap-2 pt-4">
              <Button variant="outline" onClick={() => navigate(`/courses`)}>
                Back to Courses
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (attemptLoading || !attempt) {
    return (
      <div className="max-w-3xl mx-auto space-y-6 animate-fade-in-up">
        <div className="text-center py-12">
          <p className="text-foreground-secondary">Loading quiz...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fade-in-up">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground-primary">Quiz: {course.title}</h1>
          <p className="text-foreground-secondary mt-1">
            Complete the quiz to earn your certificate
          </p>
        </div>
        {timeRemaining !== null && (
          <div className="flex items-center gap-2 px-4 py-2 bg-muted rounded-lg">
            <Clock className="h-5 w-5 text-primary" />
            <span className="font-mono font-semibold text-foreground-primary">
              {formatTime(timeRemaining)}
            </span>
          </div>
        )}
      </div>

      <Card className="card-base">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Quiz Questions</CardTitle>
            <Badge>
              {Object.keys(answers).length} / {quiz.questions.length} answered
            </Badge>
          </div>
          {quiz.time_limit && (
            <div className="mt-2">
              <Progress
                value={
                  timeRemaining !== null
                    ? ((quiz.time_limit - timeRemaining) / quiz.time_limit) * 100
                    : 0
                }
              />
            </div>
          )}
        </CardHeader>
        <CardContent className="space-y-6">
          {quiz.questions.map((question, index) => {
            const selectedIndices = answers[question.id] || [];

            return (
              <div key={question.id} className="space-y-3">
                <h3 className="font-semibold text-foreground-primary">
                  Question {index + 1}: {question.question}
                </h3>
                {question.type === "single" ? (
                  <RadioGroup
                    value={selectedIndices[0]?.toString()}
                    onValueChange={(value) =>
                      handleAnswerChange(question.id, parseInt(value), false)
                    }
                  >
                    {question.options.map((option, optIndex) => (
                      <div key={optIndex} className="flex items-center space-x-2">
                        <RadioGroupItem value={optIndex.toString()} id={`${question.id}-${optIndex}`} />
                        <Label htmlFor={`${question.id}-${optIndex}`} className="cursor-pointer">
                          {option}
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                ) : (
                  <div className="space-y-2">
                    {question.options.map((option, optIndex) => (
                      <div key={optIndex} className="flex items-center space-x-2">
                        <Checkbox
                          id={`${question.id}-${optIndex}`}
                          checked={selectedIndices.includes(optIndex)}
                          onCheckedChange={() =>
                            handleAnswerChange(question.id, optIndex, true)
                          }
                        />
                        <Label htmlFor={`${question.id}-${optIndex}`} className="cursor-pointer">
                          {option}
                        </Label>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}

          <Separator />

          <div className="flex justify-between items-center">
            <p className="text-sm text-muted-foreground">
              Pass threshold: {quiz.pass_threshold}%
            </p>
            <Button
              onClick={handleSubmit}
              disabled={
                Object.keys(answers).length !== quiz.questions.length ||
                submitQuizAttempt.isPending
              }
            >
              {submitQuizAttempt.isPending ? "Submitting..." : "Submit Quiz"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
