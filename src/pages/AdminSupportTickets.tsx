import { useState } from "react";
import { useSupportTickets, useSupportTicket, useAssignTicket, useUpdateTicketStatus, useResolveTicket } from "@/hooks/use-admin";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { MessageSquare, User, Clock, CheckCircle2, UserPlus } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";
import type { AdminSupportTicket } from "@/types";

export default function AdminSupportTickets() {
  const [statusFilter, setStatusFilter] = useState<string>("open");
  const [selectedTicket, setSelectedTicket] = useState<string | null>(null);
  const [ticketDialogOpen, setTicketDialogOpen] = useState(false);
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [resolveDialogOpen, setResolveDialogOpen] = useState(false);
  const [resolution, setResolution] = useState("");
  const [assignTo, setAssignTo] = useState("");

  const { data: tickets, isLoading } = useSupportTickets({ status: statusFilter });
  const { data: selectedTicketData } = useSupportTicket(selectedTicket || "");
  const assignMutation = useAssignTicket();
  const updateStatusMutation = useUpdateTicketStatus();
  const resolveMutation = useResolveTicket();

  const handleViewTicket = (ticketId: string) => {
    setSelectedTicket(ticketId);
    setTicketDialogOpen(true);
  };

  const handleAssign = () => {
    if (!selectedTicket || !assignTo) return;
    
    assignMutation.mutate(
      { id: selectedTicket, adminId: assignTo },
      {
        onSuccess: () => {
          setAssignDialogOpen(false);
          setAssignTo("");
        },
      }
    );
  };

  const handleResolve = () => {
    if (!selectedTicket || !resolution.trim()) return;
    
    resolveMutation.mutate(
      { id: selectedTicket, resolution },
      {
        onSuccess: () => {
          setResolveDialogOpen(false);
          setResolution("");
          setTicketDialogOpen(false);
        },
      }
    );
  };

  const handleStatusChange = (ticketId: string, newStatus: string) => {
    updateStatusMutation.mutate(
      { id: ticketId, status: newStatus },
      {
        onSuccess: () => {
          setTicketDialogOpen(false);
        },
      }
    );
  };

  const getPriorityBadge = (priority: AdminSupportTicket['priority']) => {
    const variants = {
      low: "bg-gray-100 text-gray-800 border-gray-200",
      medium: "bg-yellow-100 text-yellow-800 border-yellow-200",
      high: "bg-orange-100 text-orange-800 border-orange-200",
      urgent: "bg-red-100 text-red-800 border-red-200",
    };
    return variants[priority] || variants.medium;
  };

  const getStatusBadge = (status: AdminSupportTicket['status']) => {
    const variants = {
      open: "bg-blue-100 text-blue-800 border-blue-200",
      in_progress: "bg-yellow-100 text-yellow-800 border-yellow-200",
      resolved: "bg-green-100 text-green-800 border-green-200",
      closed: "bg-gray-100 text-gray-800 border-gray-200",
    };
    return variants[status] || variants.open;
  };

  const getIssueTypeBadge = (type: AdminSupportTicket['issue_type']) => {
    const colors = {
      technical: "bg-purple-100 text-purple-800 border-purple-200",
      billing: "bg-green-100 text-green-800 border-green-200",
      content: "bg-blue-100 text-blue-800 border-blue-200",
      account: "bg-indigo-100 text-indigo-800 border-indigo-200",
      other: "bg-gray-100 text-gray-800 border-gray-200",
    };
    return colors[type] || colors.other;
  };

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div>
        <h1 className="text-3xl font-bold text-foreground-primary">Support Tickets</h1>
        <p className="text-foreground-secondary mt-1">
          Manage and resolve customer support tickets
        </p>
      </div>

      <Tabs value={statusFilter} onValueChange={setStatusFilter} className="space-y-4">
        <TabsList>
          <TabsTrigger value="open">Open</TabsTrigger>
          <TabsTrigger value="in_progress">In Progress</TabsTrigger>
          <TabsTrigger value="resolved">Resolved</TabsTrigger>
          <TabsTrigger value="closed">Closed</TabsTrigger>
        </TabsList>

        <TabsContent value={statusFilter} className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Ticket Queue</CardTitle>
              <CardDescription>
                {isLoading ? "Loading..." : `${tickets?.length || 0} tickets in ${statusFilter} status`}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-20 w-full" />
                  ))}
                </div>
              ) : !tickets || tickets.length === 0 ? (
                <div className="text-center py-12">
                  <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-foreground-secondary">No tickets in {statusFilter} status</p>
                </div>
              ) : (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Ticket ID</TableHead>
                        <TableHead>User</TableHead>
                        <TableHead>Subject</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Priority</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Assigned To</TableHead>
                        <TableHead>Created</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {tickets.map((ticket) => (
                        <TableRow key={ticket.id} className="hover:bg-muted/50 transition-colors">
                          <TableCell className="font-mono text-sm">
                            #{ticket.ticket_id.slice(0, 8)}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <User className="h-4 w-4 text-muted-foreground" />
                              <div>
                                <div className="text-sm font-medium">{ticket.user_name}</div>
                                <div className="text-xs text-muted-foreground">{ticket.user_email}</div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="max-w-md">
                              <div className="font-medium truncate">{ticket.subject}</div>
                              <div className="text-sm text-muted-foreground line-clamp-1">
                                {ticket.message}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge className={cn("border text-xs", getIssueTypeBadge(ticket.issue_type))}>
                              {ticket.issue_type}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge className={cn("border text-xs", getPriorityBadge(ticket.priority))}>
                              {ticket.priority}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge className={cn("border", getStatusBadge(ticket.status))}>
                              {ticket.status.replace('_', ' ')}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {ticket.assigned_to_name ? (
                              <div className="flex items-center space-x-1">
                                <UserPlus className="h-3 w-3 text-muted-foreground" />
                                <span className="text-sm">{ticket.assigned_to_name}</span>
                              </div>
                            ) : (
                              <span className="text-sm text-muted-foreground">Unassigned</span>
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-1 text-sm text-foreground-secondary">
                              <Clock className="h-3 w-3" />
                              <span>{formatDistanceToNow(new Date(ticket.created_at), { addSuffix: true })}</span>
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleViewTicket(ticket.id)}
                            >
                              View
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
        </TabsContent>
      </Tabs>

      {/* Ticket Detail Dialog */}
      <Dialog open={ticketDialogOpen} onOpenChange={setTicketDialogOpen}>
        <DialogContent className="sm:max-w-[700px]">
          <DialogHeader>
            <DialogTitle>
              Ticket #{selectedTicketData?.ticket_id.slice(0, 8)}
            </DialogTitle>
            <DialogDescription>
              {selectedTicketData?.subject}
            </DialogDescription>
          </DialogHeader>

          {selectedTicketData && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs text-muted-foreground">User</Label>
                  <div className="text-sm font-medium">{selectedTicketData.user_name}</div>
                  <div className="text-xs text-muted-foreground">{selectedTicketData.user_email}</div>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Type</Label>
                  <Badge className={cn("border mt-1", getIssueTypeBadge(selectedTicketData.issue_type))}>
                    {selectedTicketData.issue_type}
                  </Badge>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Priority</Label>
                  <Badge className={cn("border mt-1", getPriorityBadge(selectedTicketData.priority))}>
                    {selectedTicketData.priority}
                  </Badge>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Status</Label>
                  <Badge className={cn("border mt-1", getStatusBadge(selectedTicketData.status))}>
                    {selectedTicketData.status.replace('_', ' ')}
                  </Badge>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Assigned To</Label>
                  <div className="text-sm">
                    {selectedTicketData.assigned_to_name || "Unassigned"}
                  </div>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Created</Label>
                  <div className="text-sm">
                    {formatDistanceToNow(new Date(selectedTicketData.created_at), { addSuffix: true })}
                  </div>
                </div>
              </div>

              <div>
                <Label className="text-xs text-muted-foreground">Message</Label>
                <div className="mt-1 p-3 bg-muted rounded-md text-sm">
                  {selectedTicketData.message}
                </div>
              </div>

              {selectedTicketData.resolution && (
                <div>
                  <Label className="text-xs text-muted-foreground">Resolution</Label>
                  <div className="mt-1 p-3 bg-green-50 border border-green-200 rounded-md text-sm">
                    {selectedTicketData.resolution}
                  </div>
                </div>
              )}

              <div className="flex items-center space-x-2 pt-4 border-t">
                <Select
                  value={selectedTicketData.status}
                  onValueChange={(value) => handleStatusChange(selectedTicketData.id, value)}
                >
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="open">Open</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="resolved">Resolved</SelectItem>
                    <SelectItem value="closed">Closed</SelectItem>
                  </SelectContent>
                </Select>

                {!selectedTicketData.assigned_to && (
                  <Button
                    variant="outline"
                    onClick={() => {
                      setAssignDialogOpen(true);
                    }}
                  >
                    <UserPlus className="h-4 w-4 mr-2" />
                    Assign
                  </Button>
                )}

                {selectedTicketData.status !== 'resolved' && selectedTicketData.status !== 'closed' && (
                  <Button
                    variant="outline"
                    onClick={() => {
                      setResolveDialogOpen(true);
                    }}
                    className="text-green-600 hover:text-green-700 hover:bg-green-50"
                  >
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    Resolve
                  </Button>
                )}
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setTicketDialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Assign Dialog */}
      <Dialog open={assignDialogOpen} onOpenChange={setAssignDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assign Ticket</DialogTitle>
            <DialogDescription>
              Assign this ticket to an admin user
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="assign-to">Admin User ID</Label>
              <Input
                id="assign-to"
                value={assignTo}
                onChange={(e) => setAssignTo(e.target.value)}
                placeholder="Enter admin user ID"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAssignDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleAssign}
              disabled={!assignTo.trim() || assignMutation.isPending}
            >
              {assignMutation.isPending ? "Assigning..." : "Assign"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Resolve Dialog */}
      <Dialog open={resolveDialogOpen} onOpenChange={setResolveDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Resolve Ticket</DialogTitle>
            <DialogDescription>
              Provide a resolution for this ticket
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="resolution">Resolution *</Label>
              <Textarea
                id="resolution"
                value={resolution}
                onChange={(e) => setResolution(e.target.value)}
                placeholder="Enter resolution details..."
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setResolveDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleResolve}
              disabled={!resolution.trim() || resolveMutation.isPending}
              className="bg-green-600 hover:bg-green-700"
            >
              {resolveMutation.isPending ? "Resolving..." : "Resolve Ticket"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
