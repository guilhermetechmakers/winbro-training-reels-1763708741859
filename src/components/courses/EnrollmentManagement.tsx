import { useState } from "react";
import { UserPlus, X, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useQuery } from "@tanstack/react-query";
import { usersApi, enrollmentsApi } from "@/lib/api";
import type { Enrollment } from "@/types";
import { format } from "date-fns";

interface EnrollmentManagementProps {
  courseId: string;
  onEnroll: (userId?: string) => void | Promise<void>;
  onUnenroll: (enrollmentId: string) => void | Promise<void>;
  onBulkEnroll?: (userIds: string[]) => void | Promise<void>;
  isLoading?: boolean;
}

export function EnrollmentManagement({
  courseId,
  onEnroll,
  onUnenroll,
  onBulkEnroll,
  isLoading,
}: EnrollmentManagementProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const { data: enrollments, isLoading: enrollmentsLoading } = useQuery({
    queryKey: ["enrollments", { course_id: courseId }],
    queryFn: () => enrollmentsApi.getEnrollments({ course_id: courseId }),
  });

  const { data: users, isLoading: usersLoading } = useQuery({
    queryKey: ["users"],
    queryFn: () => usersApi.getUsers(),
  });

  const filteredEnrollments = enrollments?.filter((enrollment) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      enrollment.user?.email?.toLowerCase().includes(query) ||
      enrollment.user?.full_name?.toLowerCase().includes(query)
    );
  });

  const availableUsers =
    users?.filter(
      (user) => !enrollments?.some((e) => e.user_id === user.id)
    ) || [];

  const toggleUserSelection = (userId: string) => {
    setSelectedUserIds((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    );
  };

  const handleBulkEnroll = async () => {
    if (selectedUserIds.length === 0) return;
    if (onBulkEnroll) {
      await onBulkEnroll(selectedUserIds);
      setSelectedUserIds([]);
      setIsDialogOpen(false);
    }
  };

  const getStatusBadge = (status: Enrollment["status"]) => {
    const variants: Record<Enrollment["status"], { className: string; label: string }> = {
      enrolled: { className: "bg-primary text-primary-foreground", label: "Enrolled" },
      in_progress: { className: "bg-muted text-muted-foreground", label: "In Progress" },
      completed: { className: "bg-success text-white", label: "Completed" },
      dropped: { className: "bg-destructive text-destructive-foreground", label: "Dropped" },
    };
    const config = variants[status];
    return <Badge className={config.className}>{config.label}</Badge>;
  };

  return (
    <Card className="card-base">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Enrollments</CardTitle>
          <div className="flex gap-2">
            {onBulkEnroll && (
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="sm" variant="outline">
                    <UserPlus className="h-4 w-4 mr-2" />
                    Bulk Enroll
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Bulk Enroll Users</DialogTitle>
                    <DialogDescription>
                      Select multiple users to enroll in this course.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4 max-h-[400px] overflow-y-auto">
                    {usersLoading ? (
                      <div className="text-center py-8 text-muted-foreground">
                        Loading users...
                      </div>
                    ) : availableUsers.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        All users are already enrolled.
                      </div>
                    ) : (
                      availableUsers.map((user) => (
                        <div
                          key={user.id}
                          className="flex items-center space-x-2 p-2 rounded hover:bg-muted cursor-pointer"
                          onClick={() => toggleUserSelection(user.id)}
                        >
                          <input
                            type="checkbox"
                            checked={selectedUserIds.includes(user.id)}
                            onChange={() => toggleUserSelection(user.id)}
                            className="rounded"
                          />
                          <div className="flex-1">
                            <p className="font-medium">{user.full_name || user.email}</p>
                            <p className="text-sm text-muted-foreground">{user.email}</p>
                          </div>
                        </div>
                      ))
                    )}
                    <div className="flex justify-end gap-2 pt-4 border-t">
                      <Button
                        variant="outline"
                        onClick={() => {
                          setIsDialogOpen(false);
                          setSelectedUserIds([]);
                        }}
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={handleBulkEnroll}
                        disabled={selectedUserIds.length === 0 || isLoading}
                      >
                        Enroll {selectedUserIds.length} User{selectedUserIds.length !== 1 ? "s" : ""}
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            )}
            <Button size="sm" onClick={() => onEnroll()} disabled={isLoading}>
              <UserPlus className="h-4 w-4 mr-2" />
              Enroll User
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search enrollments..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {enrollmentsLoading ? (
          <div className="text-center py-8 text-muted-foreground">Loading enrollments...</div>
        ) : !filteredEnrollments || filteredEnrollments.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No enrollments found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Progress</TableHead>
                  <TableHead>Enrolled</TableHead>
                  <TableHead>Completed</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEnrollments.map((enrollment) => (
                  <TableRow key={enrollment.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">
                          {enrollment.user?.full_name || enrollment.user?.email || "Unknown"}
                        </p>
                        {enrollment.user?.email && (
                          <p className="text-sm text-muted-foreground">
                            {enrollment.user.email}
                          </p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(enrollment.status)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 w-32">
                        <Progress value={enrollment.progress} className="flex-1" />
                        <span className="text-sm text-muted-foreground w-10">
                          {enrollment.progress}%
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {format(new Date(enrollment.enrolled_at), "MMM d, yyyy")}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {enrollment.completed_at
                        ? format(new Date(enrollment.completed_at), "MMM d, yyyy")
                        : "-"}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onUnenroll(enrollment.id)}
                        disabled={isLoading}
                        className="text-destructive hover:text-destructive"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
