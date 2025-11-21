import { useEffect, useRef, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Edit2, Check, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Transcript, TranscriptSegment } from '@/types';

interface TranscriptViewerProps {
  transcript: Transcript | null;
  currentTime: number;
  onSeek: (time: number) => void;
  isEditing?: boolean;
  onEdit?: (segments: TranscriptSegment[]) => void;
  className?: string;
}

export function TranscriptViewer({
  transcript,
  currentTime,
  onSeek,
  isEditing = false,
  onEdit,
  className,
}: TranscriptViewerProps) {
  const [editingSegments, setEditingSegments] = useState<TranscriptSegment[]>([]);
  const [editingSegmentId, setEditingSegmentId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');
  const segmentRefs = useRef<Record<string, HTMLDivElement>>({});
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (transcript && isEditing) {
      setEditingSegments([...transcript.segments]);
    }
  }, [transcript, isEditing]);

  // Auto-scroll to current segment
  useEffect(() => {
    if (!transcript || !scrollAreaRef.current) return;

    const currentSegment = transcript.segments.find(
      (seg) => currentTime >= seg.start && currentTime <= seg.end
    );

    if (currentSegment && segmentRefs.current[currentSegment.id]) {
      const element = segmentRefs.current[currentSegment.id];
      element?.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
    }
  }, [currentTime, transcript]);

  const handleSegmentClick = (segment: TranscriptSegment) => {
    onSeek(segment.start);
  };

  const handleEditStart = (segment: TranscriptSegment) => {
    setEditingSegmentId(segment.id);
    setEditText(segment.text);
  };

  const handleEditSave = () => {
    if (!editingSegmentId) return;

    const updated = editingSegments.map((seg) =>
      seg.id === editingSegmentId ? { ...seg, text: editText } : seg
    );
    setEditingSegments(updated);
    setEditingSegmentId(null);
    setEditText('');
    onEdit?.(updated);
  };

  const handleEditCancel = () => {
    setEditingSegmentId(null);
    setEditText('');
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!transcript) {
    return (
      <Card className={className}>
        <CardContent className="py-12 text-center">
          <p className="text-foreground-secondary">No transcript available</p>
        </CardContent>
      </Card>
    );
  }

  const segments = isEditing ? editingSegments : transcript.segments;

  return (
    <Card className={cn('flex flex-col h-full', className)}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Transcript</CardTitle>
            <CardDescription>
              Click on any timestamp to seek to that point in the video
            </CardDescription>
          </div>
          {isEditing && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onEdit?.(editingSegments)}
            >
              <Edit2 className="h-4 w-4 mr-2" />
              Save Changes
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="flex-1 p-0">
        <ScrollArea className="h-full px-4" ref={scrollAreaRef}>
          <div className="space-y-2 py-4">
            {segments.map((segment) => {
              const isActive = currentTime >= segment.start && currentTime <= segment.end;
              const isEditingThis = editingSegmentId === segment.id;

              return (
                <div
                  key={segment.id}
                  ref={(el) => {
                    if (el) segmentRefs.current[segment.id] = el;
                  }}
                  className={cn(
                    'p-3 rounded-lg transition-all duration-200 cursor-pointer',
                    isActive
                      ? 'bg-primary text-primary-foreground shadow-md'
                      : 'bg-muted/50 hover:bg-muted',
                    isEditingThis && 'ring-2 ring-primary'
                  )}
                  onClick={() => !isEditingThis && handleSegmentClick(segment)}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span
                          className={cn(
                            'text-xs font-mono',
                            isActive ? 'text-primary-foreground/80' : 'text-foreground-secondary'
                          )}
                        >
                          {formatTime(segment.start)} - {formatTime(segment.end)}
                        </span>
                        {segment.confidence !== undefined && (
                          <span
                            className={cn(
                              'text-xs',
                              isActive ? 'text-primary-foreground/60' : 'text-foreground-secondary/60'
                            )}
                          >
                            {Math.round(segment.confidence * 100)}% confidence
                          </span>
                        )}
                      </div>
                      {isEditingThis ? (
                        <div className="space-y-2">
                          <textarea
                            value={editText}
                            onChange={(e) => setEditText(e.target.value)}
                            className="w-full p-2 border rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-primary"
                            rows={3}
                            autoFocus
                          />
                          <div className="flex items-center gap-2">
                            <Button
                              size="sm"
                              onClick={handleEditSave}
                              className="h-8"
                            >
                              <Check className="h-4 w-4 mr-1" />
                              Save
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={handleEditCancel}
                              className="h-8"
                            >
                              <X className="h-4 w-4 mr-1" />
                              Cancel
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <p
                          className={cn(
                            'text-sm leading-relaxed',
                            isActive ? 'text-primary-foreground' : 'text-foreground-primary'
                          )}
                        >
                          {segment.text}
                        </p>
                      )}
                    </div>
                    {isEditing && !isEditingThis && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditStart(segment);
                        }}
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
