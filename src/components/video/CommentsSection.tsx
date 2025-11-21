import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Send, MessageSquare, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';

interface Comment {
  id: string;
  reel_id: string;
  user_id: string;
  user_name: string;
  user_avatar?: string;
  comment_text: string;
  timestamp?: number; // Optional timestamp in video (seconds)
  created_at: string;
  updated_at: string;
}

interface CommentsSectionProps {
  reelId: string;
  currentTime?: number;
  onSeekToTimestamp?: (time: number) => void;
  className?: string;
}

export function CommentsSection({
  reelId,
  currentTime = 0,
  onSeekToTimestamp,
  className,
}: CommentsSectionProps) {
  const [commentText, setCommentText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const queryClient = useQueryClient();

  const { data: comments, isLoading } = useQuery({
    queryKey: ['reel-comments', reelId],
    queryFn: async () => {
      try {
        const response = await api.get<Comment[]>(`/reels/${reelId}/comments`);
        return response || [];
      } catch (error) {
        // Return empty array if comments are not enabled or endpoint doesn't exist
        return [];
      }
    },
    enabled: !!reelId,
  });

  const createComment = useMutation({
    mutationFn: async (data: { comment_text: string; timestamp?: number }) => {
      return api.post<Comment>(`/reels/${reelId}/comments`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reel-comments', reelId] });
      setCommentText('');
      toast.success('Comment added successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to add comment');
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    setIsSubmitting(true);
    try {
      await createComment.mutateAsync({
        comment_text: commentText.trim(),
        timestamp: currentTime > 0 ? Math.floor(currentTime) : undefined,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Card className={cn('flex flex-col', className)}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          Comments & Annotations
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col space-y-4">
        {/* Comment Form */}
        <form onSubmit={handleSubmit} className="space-y-3">
          <Textarea
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            placeholder="Add a comment or annotation..."
            rows={3}
            disabled={isSubmitting}
            className="resize-none"
          />
          <div className="flex items-center justify-between">
            <p className="text-xs text-foreground-secondary">
              {currentTime > 0 && (
                <span>Comment will be linked to {formatTime(currentTime)}</span>
              )}
            </p>
            <Button
              type="submit"
              disabled={!commentText.trim() || isSubmitting}
              size="sm"
              className="gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Posting...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  Post Comment
                </>
              )}
            </Button>
          </div>
        </form>

        {/* Comments List */}
        <ScrollArea className="flex-1 pr-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-foreground-secondary" />
            </div>
          ) : !comments || comments.length === 0 ? (
            <div className="py-12 text-center">
              <MessageSquare className="h-12 w-12 text-foreground-secondary/30 mx-auto mb-4" />
              <p className="text-foreground-secondary">No comments yet</p>
              <p className="text-sm text-foreground-secondary/70 mt-1">
                Be the first to add a comment or annotation
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {comments.map((comment) => (
                <div
                  key={comment.id}
                  className="flex gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>
                      {comment.user_name
                        .split(' ')
                        .map((n) => n[0])
                        .join('')
                        .toUpperCase()
                        .slice(0, 2)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm">{comment.user_name}</span>
                      {comment.timestamp !== undefined && comment.timestamp !== null && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 px-2 text-xs text-primary hover:text-primary"
                          onClick={() => onSeekToTimestamp?.(comment.timestamp!)}
                        >
                          {formatTime(comment.timestamp)}
                        </Button>
                      )}
                      <span className="text-xs text-foreground-secondary">
                        {formatDistanceToNow(new Date(comment.created_at), {
                          addSuffix: true,
                        })}
                      </span>
                    </div>
                    <p className="text-sm text-foreground-primary whitespace-pre-wrap">
                      {comment.comment_text}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
