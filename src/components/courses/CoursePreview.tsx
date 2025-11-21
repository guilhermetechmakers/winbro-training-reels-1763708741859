import { useState } from "react";
import { Play, CheckCircle2, Clock, ArrowRight, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import type { Course, Reel } from "@/types";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";

interface CoursePreviewProps {
  course: Course;
  onClose: () => void;
}

export function CoursePreview({ course, onClose }: CoursePreviewProps) {
  const [currentModuleIndex, setCurrentModuleIndex] = useState(0);
  const [completedModules, setCompletedModules] = useState<Set<string>>(new Set());

  const sortedModules = [...(course.modules || [])].sort((a, b) => a.order - b.order);
  const currentModule = sortedModules[currentModuleIndex];
  const progress = sortedModules.length > 0 
    ? (completedModules.size / sortedModules.length) * 100 
    : 0;

  // Fetch reel details for current module
  const { data: reel } = useQuery({
    queryKey: ["reel", currentModule?.reel_id],
    queryFn: () => api.get<Reel>(`/reels/${currentModule?.reel_id}`),
    enabled: !!currentModule?.reel_id,
  });

  const handleModuleComplete = () => {
    if (currentModule) {
      setCompletedModules((prev) => new Set([...prev, currentModule.id]));
    }
  };

  const handleNext = () => {
    if (currentModuleIndex < sortedModules.length - 1) {
      setCurrentModuleIndex(currentModuleIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentModuleIndex > 0) {
      setCurrentModuleIndex(currentModuleIndex - 1);
    }
  };

  const isLastModule = currentModuleIndex === sortedModules.length - 1;
  const isFirstModule = currentModuleIndex === 0;

  return (
    <div className="fixed inset-0 z-50 bg-background-primary flex items-center justify-center p-4">
      <Card className="card-base w-full max-w-6xl max-h-[90vh] flex flex-col animate-scale-in">
        <CardHeader className="border-b">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <CardTitle className="text-2xl">{course.title}</CardTitle>
              <p className="text-foreground-secondary mt-1 text-sm">
                Course Preview - Module {currentModuleIndex + 1} of {sortedModules.length}
              </p>
            </div>
            <Button variant="outline" onClick={onClose}>
              Close Preview
            </Button>
          </div>
          <div className="mt-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-foreground-primary">Progress</span>
              <span className="text-sm text-muted-foreground">{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        </CardHeader>

        <CardContent className="flex-1 overflow-y-auto p-6">
          {currentModule ? (
            <div className="space-y-6">
              {/* Module Header */}
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <Badge variant="outline" className="text-sm">
                      Module {currentModule.order}
                    </Badge>
                    {completedModules.has(currentModule.id) && (
                      <Badge className="bg-success text-white">
                        <CheckCircle2 className="h-3 w-3 mr-1" />
                        Completed
                      </Badge>
                    )}
                  </div>
                  {reel ? (
                    <>
                      <h3 className="text-xl font-semibold text-foreground-primary mb-2">
                        {reel.title}
                      </h3>
                      {reel.description && (
                        <p className="text-foreground-secondary mb-4">{reel.description}</p>
                      )}
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        {reel.duration && (
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            <span>{Math.floor(reel.duration / 60)}m {reel.duration % 60}s</span>
                          </div>
                        )}
                        {reel.skill_level && (
                          <Badge variant="secondary" className="capitalize">
                            {reel.skill_level}
                          </Badge>
                        )}
                      </div>
                    </>
                  ) : (
                    <div className="animate-pulse">
                      <div className="h-6 bg-muted rounded w-3/4 mb-2"></div>
                      <div className="h-4 bg-muted rounded w-1/2"></div>
                    </div>
                  )}
                </div>
              </div>

              {/* Video Player Placeholder */}
              <div className="bg-muted rounded-lg aspect-video flex items-center justify-center relative overflow-hidden">
                {reel?.thumbnail_url ? (
                  <img
                    src={reel.thumbnail_url}
                    alt={reel.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="text-center text-muted-foreground">
                    <Play className="h-16 w-16 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">Video Player</p>
                  </div>
                )}
                <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                  <Button size="lg" className="rounded-full h-16 w-16">
                    <Play className="h-8 w-8" />
                  </Button>
                </div>
              </div>

              {/* Quiz Section */}
              {currentModule.quiz && (
                <Card className="card-base border-2 border-primary/20">
                  <CardHeader>
                    <CardTitle className="text-lg">Module Quiz</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-foreground-secondary mb-4">
                      This module includes a quiz with {currentModule.quiz.questions.length} question(s).
                      Pass threshold: {currentModule.quiz.pass_threshold}%
                    </p>
                    <Button variant="outline" className="w-full">
                      Start Quiz
                    </Button>
                  </CardContent>
                </Card>
              )}

              {/* Module Navigation */}
              <div className="flex items-center justify-between pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={handlePrevious}
                  disabled={isFirstModule}
                  className="gap-2"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Previous Module
                </Button>

                <div className="flex items-center gap-2">
                  {sortedModules.map((module, idx) => (
                    <button
                      key={module.id}
                      onClick={() => setCurrentModuleIndex(idx)}
                      className={cn(
                        "h-2 w-2 rounded-full transition-all",
                        idx === currentModuleIndex
                          ? "bg-primary w-8"
                          : completedModules.has(module.id)
                          ? "bg-success"
                          : "bg-muted hover:bg-muted-foreground"
                      )}
                      aria-label={`Go to module ${idx + 1}`}
                    />
                  ))}
                </div>

                {isLastModule ? (
                  <Button onClick={handleModuleComplete} className="gap-2">
                    <CheckCircle2 className="h-4 w-4" />
                    Complete Course
                  </Button>
                ) : (
                  <Button onClick={handleNext} className="gap-2">
                    Next Module
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <p>No modules in this course yet.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
