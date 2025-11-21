import { useState } from "react";
import { GripVertical, Plus, X, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { CourseModule, Reel } from "@/types";
import { cn } from "@/lib/utils";

interface ModuleListEditorProps {
  modules: CourseModule[];
  onAddModule: (reelId: string) => void;
  onRemoveModule: (moduleId: string) => void;
  onReorderModules: (newOrder: { module_id: string; order: number }[]) => void;
  isLoading?: boolean;
}

export function ModuleListEditor({
  modules,
  onAddModule,
  onRemoveModule,
  onReorderModules,
  isLoading,
}: ModuleListEditorProps) {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [selectedReelId, setSelectedReelId] = useState<string>("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Fetch available reels
  const { data: reels, isLoading: reelsLoading } = useQuery({
    queryKey: ["reels", "published"],
    queryFn: () => api.get<Reel[]>("/reels?status=published"),
  });

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;

    const newModules = [...modules];
    const draggedModule = newModules[draggedIndex];
    newModules.splice(draggedIndex, 1);
    newModules.splice(index, 0, draggedModule);

    const newOrder = newModules.map((module, idx) => ({
      module_id: module.id,
      order: idx + 1,
    }));

    onReorderModules(newOrder);
    setDraggedIndex(index);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  const handleAddModule = () => {
    if (selectedReelId) {
      onAddModule(selectedReelId);
      setSelectedReelId("");
      setIsDialogOpen(false);
    }
  };

  const availableReelIds = modules.map((m) => m.reel_id);
  const availableReels = reels?.filter((r) => !availableReelIds.includes(r.id)) || [];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-foreground-primary">Course Modules</h3>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-2">
              <Plus className="h-4 w-4" />
              Add Module
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Module</DialogTitle>
              <DialogDescription>
                Select a reel to add as a module to this course.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <Select value={selectedReelId} onValueChange={setSelectedReelId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a reel" />
                </SelectTrigger>
                <SelectContent>
                  {reelsLoading ? (
                    <SelectItem value="loading" disabled>
                      Loading reels...
                    </SelectItem>
                  ) : availableReels.length === 0 ? (
                    <SelectItem value="none" disabled>
                      No available reels
                    </SelectItem>
                  ) : (
                    availableReels.map((reel) => (
                      <SelectItem key={reel.id} value={reel.id}>
                        {reel.title}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button onClick={handleAddModule} disabled={!selectedReelId || isLoading}>
                  Add Module
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {modules.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-foreground-secondary">
              No modules added yet. Click "Add Module" to get started.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {modules
            .sort((a, b) => a.order - b.order)
            .map((module, index) => {
              const reel = reels?.find((r) => r.id === module.reel_id);
              return (
                <Card
                  key={module.id}
                  draggable
                  onDragStart={() => handleDragStart(index)}
                  onDragOver={(e) => handleDragOver(e, index)}
                  onDragEnd={handleDragEnd}
                  className={cn(
                    "card-base transition-all duration-200",
                    draggedIndex === index && "opacity-50",
                    "hover:shadow-md cursor-move"
                  )}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <GripVertical className="h-5 w-5 text-muted-foreground cursor-grab" />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-muted-foreground">
                            Module {module.order}
                          </span>
                          {reel ? (
                            <>
                              <Play className="h-4 w-4 text-muted-foreground" />
                              <span className="font-medium text-foreground-primary">
                                {reel.title}
                              </span>
                              {reel.duration && (
                                <span className="text-sm text-muted-foreground">
                                  ({Math.floor(reel.duration / 60)}m {reel.duration % 60}s)
                                </span>
                              )}
                            </>
                          ) : (
                            <span className="text-sm text-muted-foreground">
                              Loading reel info...
                            </span>
                          )}
                        </div>
                        {reel?.description && (
                          <p className="text-sm text-foreground-secondary mt-1 line-clamp-1">
                            {reel.description}
                          </p>
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onRemoveModule(module.id)}
                        disabled={isLoading}
                        className="text-destructive hover:text-destructive"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
        </div>
      )}
    </div>
  );
}
