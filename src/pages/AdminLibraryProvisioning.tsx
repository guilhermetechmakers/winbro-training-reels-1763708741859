import { useState } from "react";
import { useLibraries, useCreateLibrary, useUpdateLibrary, useDeleteLibrary } from "@/hooks/use-admin";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, Edit, Trash2, Search, BookOpen, Users } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import type { LibraryProvision } from "@/types";

const librarySchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  customer_id: z.string().optional(),
  assigned_user_groups: z.array(z.string()).default([]),
  reel_ids: z.array(z.string()).default([]),
});

type LibraryFormData = z.infer<typeof librarySchema>;

export default function AdminLibraryProvisioning() {
  const [searchQuery, setSearchQuery] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editingLibrary, setEditingLibrary] = useState<LibraryProvision | null>(null);
  const [libraryToDelete, setLibraryToDelete] = useState<string | null>(null);

  const { data: libraries, isLoading } = useLibraries({ search: searchQuery || undefined });
  const createMutation = useCreateLibrary();
  const updateMutation = useUpdateLibrary();
  const deleteMutation = useDeleteLibrary();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm<LibraryFormData>({
    resolver: zodResolver(librarySchema),
    defaultValues: {
      name: "",
      description: "",
      customer_id: "",
      assigned_user_groups: [],
      reel_ids: [],
    },
  });

  const handleCreate = () => {
    setEditingLibrary(null);
    reset({
      name: "",
      description: "",
      customer_id: "",
      assigned_user_groups: [],
      reel_ids: [],
    });
    setDialogOpen(true);
  };

  const handleEdit = (library: LibraryProvision) => {
    setEditingLibrary(library);
    reset({
      name: library.name,
      description: library.description || "",
      customer_id: library.customer_id || "",
      assigned_user_groups: library.assigned_user_groups || [],
      reel_ids: library.reel_ids || [],
    });
    setDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    setLibraryToDelete(id);
    setDeleteDialogOpen(true);
  };

  const onSubmit = (data: LibraryFormData) => {
    if (editingLibrary) {
      updateMutation.mutate(
        {
          id: editingLibrary.id,
          data: {
            name: data.name,
            description: data.description,
            customer_id: data.customer_id || undefined,
            assigned_user_groups: data.assigned_user_groups,
            reel_ids: data.reel_ids,
          },
        },
        {
          onSuccess: () => {
            setDialogOpen(false);
            reset();
            setEditingLibrary(null);
          },
        }
      );
    } else {
      createMutation.mutate(
        {
          name: data.name,
          description: data.description,
          customer_id: data.customer_id || undefined,
          assigned_user_groups: data.assigned_user_groups,
          reel_ids: data.reel_ids,
        },
        {
          onSuccess: () => {
            setDialogOpen(false);
            reset();
          },
        }
      );
    }
  };

  const confirmDelete = () => {
    if (libraryToDelete) {
      deleteMutation.mutate(libraryToDelete, {
        onSuccess: () => {
          setDeleteDialogOpen(false);
          setLibraryToDelete(null);
        },
      });
    }
  };

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground-primary">Library Provisioning</h1>
          <p className="text-foreground-secondary mt-1">
            Create and manage content libraries for user groups
          </p>
        </div>
        <Button onClick={handleCreate}>
          <Plus className="h-4 w-4 mr-2" />
          Create Library
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Libraries</CardTitle>
              <CardDescription>
                {isLoading ? "Loading..." : `${libraries?.length || 0} libraries`}
              </CardDescription>
            </div>
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search libraries..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-20 w-full" />
              ))}
            </div>
          ) : !libraries || libraries.length === 0 ? (
            <div className="text-center py-12">
              <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-foreground-secondary mb-4">No libraries found</p>
              <Button onClick={handleCreate} variant="outline">
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Library
              </Button>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>User Groups</TableHead>
                    <TableHead>Reels</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {libraries.map((library) => (
                    <TableRow key={library.id} className="hover:bg-muted/50 transition-colors">
                      <TableCell className="font-medium">{library.name}</TableCell>
                      <TableCell className="text-foreground-secondary">
                        {library.description || "—"}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-1">
                          <Users className="h-4 w-4 text-muted-foreground" />
                          <Badge variant="outline">
                            {library.assigned_user_groups.length} groups
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{library.reel_ids.length} reels</Badge>
                      </TableCell>
                      <TableCell className="text-sm text-foreground-secondary">
                        {formatDistanceToNow(new Date(library.created_at), { addSuffix: true })}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleEdit(library)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDelete(library.id)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
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

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>
              {editingLibrary ? "Edit Library" : "Create Library"}
            </DialogTitle>
            <DialogDescription>
              {editingLibrary
                ? "Update library details and assignments"
                : "Create a new content library for user groups"}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                {...register("name")}
                placeholder="Library name"
              />
              {errors.name && (
                <p className="text-sm text-red-600">{errors.name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                {...register("description")}
                placeholder="Library description (optional)"
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="customer_id">Customer ID</Label>
              <Input
                id="customer_id"
                {...register("customer_id")}
                placeholder="Customer ID (optional)"
              />
            </div>

            <div className="space-y-2">
              <Label>Assigned User Groups</Label>
              <Input
                placeholder="Comma-separated group IDs (e.g., group1,group2)"
                onChange={(e) => {
                  const groups = e.target.value
                    .split(",")
                    .map((g) => g.trim())
                    .filter((g) => g.length > 0);
                  setValue("assigned_user_groups", groups);
                }}
                defaultValue={editingLibrary?.assigned_user_groups.join(",") || ""}
              />
              <p className="text-xs text-muted-foreground">
                Enter user group IDs separated by commas
              </p>
            </div>

            <div className="space-y-2">
              <Label>Reel IDs</Label>
              <Input
                placeholder="Comma-separated reel IDs (e.g., reel1,reel2)"
                onChange={(e) => {
                  const reels = e.target.value
                    .split(",")
                    .map((r) => r.trim())
                    .filter((r) => r.length > 0);
                  setValue("reel_ids", reels);
                }}
                defaultValue={editingLibrary?.reel_ids.join(",") || ""}
              />
              <p className="text-xs text-muted-foreground">
                Enter reel IDs separated by commas
              </p>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setDialogOpen(false);
                  reset();
                  setEditingLibrary(null);
                }}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={createMutation.isPending || updateMutation.isPending}
              >
                {createMutation.isPending || updateMutation.isPending
                  ? "Saving..."
                  : editingLibrary
                  ? "Update Library"
                  : "Create Library"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the library
              and remove all assignments.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setLibraryToDelete(null)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-red-600 hover:bg-red-700"
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
