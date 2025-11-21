import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { useCourses, useAddModule, useCreateCourse } from '@/hooks/use-courses';
import { toast } from 'sonner';

interface AddToCourseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  reelId: string;
  reelTitle: string;
}

export function AddToCourseDialog({
  open,
  onOpenChange,
  reelId,
  reelTitle,
}: AddToCourseDialogProps) {
  const [selectedCourseId, setSelectedCourseId] = useState<string>('');
  const [createNewCourse, setCreateNewCourse] = useState(false);
  const [newCourseTitle, setNewCourseTitle] = useState('');
  const [newCourseDescription, setNewCourseDescription] = useState('');

  const { data: courses, isLoading: coursesLoading } = useCourses({ status: 'published' });
  const addModule = useAddModule();
  const createCourse = useCreateCourse();

  const handleSubmit = async () => {
    if (createNewCourse) {
      if (!newCourseTitle.trim()) {
        toast.error('Please enter a course title');
        return;
      }

      try {
        const newCourse = await createCourse.mutateAsync({
          title: newCourseTitle,
          description: newCourseDescription,
          modules: [],
          target_roles: [],
          estimated_time: 0,
          status: 'draft',
        });

        // Add reel as first module
        await addModule.mutateAsync({
          courseId: newCourse.id,
          data: { reel_id: reelId, order: 0 },
        });

        toast.success('Course created and reel added successfully');
        onOpenChange(false);
        resetForm();
      } catch (error) {
        // Error handled by mutation
      }
    } else {
      if (!selectedCourseId) {
        toast.error('Please select a course');
        return;
      }

      try {
        const course = courses?.find((c) => c.id === selectedCourseId);
        if (!course) return;

        const nextOrder = course.modules.length;
        await addModule.mutateAsync({
          courseId: selectedCourseId,
          data: { reel_id: reelId, order: nextOrder },
        });

        toast.success('Reel added to course successfully');
        onOpenChange(false);
        resetForm();
      } catch (error) {
        // Error handled by mutation
      }
    }
  };

  const resetForm = () => {
    setSelectedCourseId('');
    setCreateNewCourse(false);
    setNewCourseTitle('');
    setNewCourseDescription('');
  };

  const isLoading = addModule.isPending || createCourse.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Add to Course
          </DialogTitle>
          <DialogDescription>
            Add "{reelTitle}" to an existing course or create a new course.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <Button
                type="button"
                variant={!createNewCourse ? 'default' : 'outline'}
                onClick={() => setCreateNewCourse(false)}
                className="flex-1"
              >
                Select Existing Course
              </Button>
              <Button
                type="button"
                variant={createNewCourse ? 'default' : 'outline'}
                onClick={() => setCreateNewCourse(true)}
                className="flex-1"
              >
                Create New Course
              </Button>
            </div>

            {!createNewCourse ? (
              <div className="space-y-2">
                <Label htmlFor="course">Select Course</Label>
                {coursesLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-foreground-secondary" />
                  </div>
                ) : (
                  <Select value={selectedCourseId} onValueChange={setSelectedCourseId}>
                    <SelectTrigger id="course">
                      <SelectValue placeholder="Choose a course..." />
                    </SelectTrigger>
                    <SelectContent>
                      {courses && courses.length > 0 ? (
                        courses.map((course) => (
                          <SelectItem key={course.id} value={course.id}>
                            {course.title}
                            {course.modules.length > 0 && (
                              <span className="text-xs text-foreground-secondary ml-2">
                                ({course.modules.length} modules)
                              </span>
                            )}
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem value="no-courses" disabled>
                          No courses available
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="course-title">Course Title *</Label>
                  <Input
                    id="course-title"
                    value={newCourseTitle}
                    onChange={(e) => setNewCourseTitle(e.target.value)}
                    placeholder="Enter course title..."
                    disabled={isLoading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="course-description">Description</Label>
                  <Textarea
                    id="course-description"
                    value={newCourseDescription}
                    onChange={(e) => setNewCourseDescription(e.target.value)}
                    placeholder="Enter course description..."
                    rows={4}
                    disabled={isLoading}
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => {
              onOpenChange(false);
              resetForm();
            }}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isLoading} className="gap-2">
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                {createNewCourse ? 'Creating...' : 'Adding...'}
              </>
            ) : (
              <>
                <Plus className="h-4 w-4" />
                {createNewCourse ? 'Create Course' : 'Add to Course'}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
