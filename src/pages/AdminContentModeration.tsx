import { useState } from "react";
import { useModerationQueue, useModerateContent, useModerationItem } from "@/hooks/use-admin";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { CheckCircle2, XCircle, MessageSquare, Eye, Clock, User } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";
import type { ModerationQueueItem } from "@/types";

export default function AdminContentModeration() {
  const [statusFilter, setStatusFilter] = useState<string>("pending");
  const [selectedItem, setSelectedItem] = useState<string | null>(null);
  const [actionDialogOpen, setActionDialogOpen] = useState(false);
  const [actionType, setActionType] = useState<'approve' | 'reject' | 'request_revision'>('approve');
  const [feedback, setFeedback] = useState("");

  const { data: queue, isLoading } = useModerationQueue({ status: statusFilter });
  const { data: selectedItemData } = useModerationItem(selectedItem || "");
  const moderateMutation = useModerateContent();

  const handleAction = (itemId: string, action: 'approve' | 'reject' | 'request_revision') => {
    setSelectedItem(itemId);
    setActionType(action);
    setFeedback("");
    setActionDialogOpen(true);
  };

  const handleSubmitAction = () => {
    if (!selectedItem) return;
    
    moderateMutation.mutate({
      item_id: selectedItem,
      action: actionType,
      feedback: feedback || undefined,
    }, {
      onSuccess: () => {
        setActionDialogOpen(false);
        setSelectedItem(null);
        setFeedback("");
      },
    });
  };

  const getStatusBadge = (status: ModerationQueueItem['status']) => {
    const variants = {
      pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
      approved: "bg-green-100 text-green-800 border-green-200",
      rejected: "bg-red-100 text-red-800 border-red-200",
      needs_revision: "bg-blue-100 text-blue-800 border-blue-200",
    };
    return variants[status] || variants.pending;
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div>
        <h1 className="text-3xl font-bold text-foreground-primary">Content Moderation</h1>
        <p className="text-foreground-secondary mt-1">
          Review and moderate user-submitted content
        </p>
      </div>

      <Tabs value={statusFilter} onValueChange={setStatusFilter} className="space-y-4">
        <TabsList>
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="approved">Approved</TabsTrigger>
          <TabsTrigger value="rejected">Rejected</TabsTrigger>
          <TabsTrigger value="needs_revision">Needs Revision</TabsTrigger>
        </TabsList>

        <TabsContent value={statusFilter} className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Moderation Queue</CardTitle>
              <CardDescription>
                {isLoading ? "Loading..." : `${queue?.length || 0} items in ${statusFilter} status`}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex items-center space-x-4">
                      <Skeleton className="h-16 w-16 rounded" />
                      <div className="space-y-2 flex-1">
                        <Skeleton className="h-4 w-3/4" />
                        <Skeleton className="h-4 w-1/2" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : !queue || queue.length === 0 ? (
                <div className="text-center py-12">
                  <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-foreground-secondary">No items in {statusFilter} status</p>
                </div>
              ) : (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Content</TableHead>
                        <TableHead>Creator</TableHead>
                        <TableHead>Duration</TableHead>
                        <TableHead>Submitted</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {queue.map((item) => (
                        <TableRow key={item.id} className="hover:bg-muted/50 transition-colors">
                          <TableCell>
                            <div className="flex items-center space-x-3">
                              {item.thumbnail_url ? (
                                <img
                                  src={item.thumbnail_url}
                                  alt={item.title}
                                  className="h-12 w-12 rounded object-cover"
                                />
                              ) : (
                                <div className="h-12 w-12 rounded bg-muted flex items-center justify-center">
                                  <Eye className="h-6 w-6 text-muted-foreground" />
                                </div>
                              )}
                              <div>
                                <div className="font-medium text-foreground-primary">{item.title}</div>
                                <div className="text-sm text-foreground-secondary line-clamp-1">
                                  {item.description}
                                </div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <User className="h-4 w-4 text-muted-foreground" />
                              <div>
                                <div className="text-sm font-medium">{item.creator_name}</div>
                                <div className="text-xs text-muted-foreground">{item.creator_email}</div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-1 text-sm">
                              <Clock className="h-4 w-4 text-muted-foreground" />
                              <span>{formatDuration(item.duration)}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm text-foreground-secondary">
                              {formatDistanceToNow(new Date(item.submission_date), { addSuffix: true })}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge className={cn("border", getStatusBadge(item.status))}>
                              {item.status.replace('_', ' ')}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end space-x-2">
                              {item.status === 'pending' && (
                                <>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleAction(item.id, 'approve')}
                                    className="text-green-600 hover:text-green-700 hover:bg-green-50"
                                  >
                                    <CheckCircle2 className="h-4 w-4 mr-1" />
                                    Approve
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleAction(item.id, 'request_revision')}
                                    className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                                  >
                                    <MessageSquare className="h-4 w-4 mr-1" />
                                    Request Revision
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleAction(item.id, 'reject')}
                                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                  >
                                    <XCircle className="h-4 w-4 mr-1" />
                                    Reject
                                  </Button>
                                </>
                              )}
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => {
                                  setSelectedItem(item.id);
                                  setActionDialogOpen(true);
                                  setActionType('approve');
                                }}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Action Dialog */}
      <Dialog open={actionDialogOpen} onOpenChange={setActionDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>
              {actionType === 'approve' && 'Approve Content'}
              {actionType === 'reject' && 'Reject Content'}
              {actionType === 'request_revision' && 'Request Revision'}
            </DialogTitle>
            <DialogDescription>
              {selectedItemData && (
                <div className="mt-2 space-y-2">
                  <div>
                    <span className="font-medium">Title:</span> {selectedItemData.title}
                  </div>
                  <div>
                    <span className="font-medium">Creator:</span> {selectedItemData.creator_name}
                  </div>
                </div>
              )}
            </DialogDescription>
          </DialogHeader>
          
          {selectedItemData && (
            <div className="space-y-4">
              {selectedItemData.thumbnail_url && (
                <div>
                  <img
                    src={selectedItemData.thumbnail_url}
                    alt={selectedItemData.title}
                    className="w-full h-48 object-cover rounded-md"
                  />
                </div>
              )}
              <div>
                <Label htmlFor="feedback">
                  Feedback {actionType === 'approve' ? '(optional)' : '(required)'}
                </Label>
                <Textarea
                  id="feedback"
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  placeholder={
                    actionType === 'approve'
                      ? 'Optional feedback for the creator...'
                      : actionType === 'reject'
                      ? 'Please provide a reason for rejection...'
                      : 'Please specify what needs to be revised...'
                  }
                  className="mt-1"
                  rows={4}
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setActionDialogOpen(false);
                setFeedback("");
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmitAction}
              disabled={moderateMutation.isPending || (actionType !== 'approve' && !feedback.trim())}
              className={
                actionType === 'approve'
                  ? 'bg-green-600 hover:bg-green-700'
                  : actionType === 'reject'
                  ? 'bg-red-600 hover:bg-red-700'
                  : 'bg-blue-600 hover:bg-blue-700'
              }
            >
              {moderateMutation.isPending ? 'Processing...' : 
                actionType === 'approve' ? 'Approve' :
                actionType === 'reject' ? 'Reject' :
                'Request Revision'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
