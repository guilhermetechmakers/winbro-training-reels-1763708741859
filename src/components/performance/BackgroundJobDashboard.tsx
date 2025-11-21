import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  useBackgroundJobs,
  useRetryJob,
  useCancelJob,
  useReprocessJob,
} from "@/hooks/use-performance";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  RefreshCw,
  X,
  Play,
  Clock,
  CheckCircle2,
  XCircle,
  Loader2,
} from "lucide-react";
import { format } from "date-fns";

export function BackgroundJobDashboard() {
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [jobTypeFilter, setJobTypeFilter] = useState<string>('all');
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const [action, setAction] = useState<'retry' | 'cancel' | 'reprocess' | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);

  const { data: jobs, isLoading } = useBackgroundJobs({
    status: statusFilter === 'all' ? undefined : statusFilter,
    job_type: jobTypeFilter === 'all' ? undefined : jobTypeFilter,
    limit: 50,
  });

  const retryJob = useRetryJob();
  const cancelJob = useCancelJob();
  const reprocessJob = useReprocessJob();

  const handleAction = (jobId: string, actionType: 'retry' | 'cancel' | 'reprocess') => {
    setSelectedJobId(jobId);
    setAction(actionType);
    setShowConfirm(true);
  };

  const handleConfirm = () => {
    if (!selectedJobId || !action) return;

    if (action === 'retry') {
      retryJob.mutate(selectedJobId);
    } else if (action === 'cancel') {
      cancelJob.mutate(selectedJobId);
    } else if (action === 'reprocess') {
      reprocessJob.mutate(selectedJobId);
    }

    setShowConfirm(false);
    setSelectedJobId(null);
    setAction(null);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'processing':
      case 'queued':
        return <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'cancelled':
        return <X className="h-4 w-4 text-gray-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-500';
      case 'failed':
        return 'bg-red-500';
      case 'processing':
      case 'queued':
        return 'bg-blue-500';
      case 'pending':
        return 'bg-yellow-500';
      case 'cancelled':
        return 'bg-gray-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-500';
      case 'high':
        return 'bg-orange-500';
      case 'normal':
        return 'bg-blue-500';
      case 'low':
        return 'bg-gray-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <>
      <div className="space-y-4">
        {/* Filters */}
        <Card className="card-base">
          <CardHeader>
            <CardTitle className="text-lg">Filters</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Status</label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="queued">Queued</SelectItem>
                    <SelectItem value="processing">Processing</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="failed">Failed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Job Type</label>
                <Select value={jobTypeFilter} onValueChange={setJobTypeFilter}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="transcode">Transcode</SelectItem>
                    <SelectItem value="transcribe">Transcribe</SelectItem>
                    <SelectItem value="index">Index</SelectItem>
                    <SelectItem value="export">Export</SelectItem>
                    <SelectItem value="notification">Notification</SelectItem>
                    <SelectItem value="cleanup">Cleanup</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Jobs List */}
        <Card className="card-base">
          <CardHeader>
            <CardTitle className="text-lg">Background Jobs</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-2">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-20 w-full" />
                ))}
              </div>
            ) : jobs && jobs.length > 0 ? (
              <div className="space-y-2">
                {jobs.map((job) => (
                  <div
                    key={job.id}
                    className="p-4 rounded-lg border border-neutral-200 hover:bg-neutral-50 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          {getStatusIcon(job.status)}
                          <span className="font-semibold text-foreground-primary">
                            {job.job_type}
                          </span>
                          <Badge
                            variant="outline"
                            className={`${getStatusColor(job.status)} text-white border-0`}
                          >
                            {job.status}
                          </Badge>
                          <Badge
                            variant="outline"
                            className={`${getPriorityColor(job.priority)} text-white border-0`}
                          >
                            {job.priority}
                          </Badge>
                        </div>
                        {job.status === 'processing' && (
                          <div className="mb-2">
                            <Progress value={job.progress} className="h-2" />
                            <div className="text-xs text-foreground-secondary mt-1">
                              {job.progress}% complete
                            </div>
                          </div>
                        )}
                        {job.error_message && (
                          <div className="text-sm text-red-600 mb-2">
                            Error: {job.error_message}
                          </div>
                        )}
                        <div className="text-xs text-foreground-secondary space-y-1">
                          <div>Created: {format(new Date(job.created_at), 'MMM d, yyyy HH:mm')}</div>
                          {job.started_at && (
                            <div>Started: {format(new Date(job.started_at), 'MMM d, yyyy HH:mm')}</div>
                          )}
                          {job.completed_at && (
                            <div>Completed: {format(new Date(job.completed_at), 'MMM d, yyyy HH:mm')}</div>
                          )}
                          {job.retry_count > 0 && (
                            <div>Retries: {job.retry_count}/{job.max_retries}</div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 ml-4">
                        {job.status === 'failed' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleAction(job.id, 'retry')}
                          >
                            <RefreshCw className="h-4 w-4 mr-1" />
                            Retry
                          </Button>
                        )}
                        {(job.status === 'pending' || job.status === 'queued' || job.status === 'processing') && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleAction(job.id, 'cancel')}
                          >
                            <X className="h-4 w-4 mr-1" />
                            Cancel
                          </Button>
                        )}
                        {job.status === 'completed' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleAction(job.id, 'reprocess')}
                          >
                            <Play className="h-4 w-4 mr-1" />
                            Reprocess
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-foreground-secondary">
                <Clock className="h-12 w-12 mx-auto mb-2" />
                <p>No background jobs found</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <AlertDialog open={showConfirm} onOpenChange={setShowConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Confirm {action === 'retry' ? 'Retry' : action === 'cancel' ? 'Cancel' : 'Reprocess'} Job
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to {action} this job? 
              {action === 'cancel' && ' This will stop the job immediately.'}
              {action === 'reprocess' && ' This will restart the job from the beginning.'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirm}>
              Confirm
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
