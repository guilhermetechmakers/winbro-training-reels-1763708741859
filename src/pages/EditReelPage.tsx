import { useParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { Reel } from "@/types";

export default function EditReelPage() {
  const { id } = useParams<{ id: string }>();
  
  const { data: reel, isLoading } = useQuery({
    queryKey: ["reel", id],
    queryFn: () => api.get<Reel>(`/reels/${id}`),
    enabled: !!id,
  });

  if (isLoading) {
    return <div className="animate-pulse">Loading...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in-up">
      <div>
        <h1 className="text-3xl font-bold text-foreground-primary">Edit Reel</h1>
        <p className="text-foreground-secondary mt-1">
          Edit metadata, transcript, and manage versions
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{reel?.title || "Edit Reel"}</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="metadata">
            <TabsList>
              <TabsTrigger value="metadata">Metadata</TabsTrigger>
              <TabsTrigger value="transcript">Transcript Editor</TabsTrigger>
              <TabsTrigger value="versions">Version History</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
            </TabsList>
            <TabsContent value="metadata">
              <p className="text-foreground-secondary">Metadata editor would be here</p>
            </TabsContent>
            <TabsContent value="transcript">
              <p className="text-foreground-secondary">Time-aligned transcript editor would be here</p>
            </TabsContent>
            <TabsContent value="versions">
              <p className="text-foreground-secondary">Version history and rollback would be here</p>
            </TabsContent>
            <TabsContent value="settings">
              <p className="text-foreground-secondary">Permission and visibility controls would be here</p>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
