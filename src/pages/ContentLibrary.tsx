import { useState, useEffect } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Filter, Grid, List, Clock, Video } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { SearchBar } from "@/components/search/SearchBar";
import type { Reel } from "@/types";
import { LoadingState, EmptyState } from "@/components/states";

export default function ContentLibrary() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState(searchParams.get("search") || "");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  // Update search query when URL param changes
  useEffect(() => {
    const urlSearch = searchParams.get("search");
    if (urlSearch !== null && urlSearch !== searchQuery) {
      setSearchQuery(urlSearch);
    }
  }, [searchParams, searchQuery]);

  const { data: reels, isLoading } = useQuery({
    queryKey: ["reels", searchQuery],
    queryFn: () => api.get<Reel[]>(`/reels?search=${searchQuery}`),
  });

  // Handle search - navigate to search results page
  const handleSearch = (query: string) => {
    if (query.trim()) {
      navigate(`/search?q=${encodeURIComponent(query)}`);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground-primary">Content Library</h1>
          <p className="text-foreground-secondary mt-1">
            Browse and search all training reels
          </p>
        </div>
        <Link to="/upload">
          <Button>Upload Reel</Button>
        </Link>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <SearchBar
                placeholder="Search reels, transcripts, tags..."
                initialValue={searchQuery}
                onSearch={handleSearch}
                showSuggestions={true}
              />
            </div>
            <Button variant="outline" onClick={() => navigate("/search")}>
              <Filter className="mr-2 h-4 w-4" />
              Advanced Filters
            </Button>
            <div className="flex gap-2">
              <Button
                variant={viewMode === "grid" ? "default" : "outline"}
                size="icon"
                onClick={() => setViewMode("grid")}
              >
                <Grid className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === "list" ? "default" : "outline"}
                size="icon"
                onClick={() => setViewMode("list")}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      {isLoading ? (
        <LoadingState
          variant={viewMode === "grid" ? "thumbnail" : "list"}
          count={8}
        />
      ) : reels && reels.length > 0 ? (
        <div className={viewMode === "grid" ? "grid md:grid-cols-3 lg:grid-cols-4 gap-4" : "space-y-4"}>
          {reels.map((reel) => (
            <Link key={reel.id} to={`/reel/${reel.id}`}>
              <Card className="card-base card-hover">
                <div className="aspect-video bg-muted rounded-t-lg flex items-center justify-center">
                  {reel.thumbnail_url ? (
                    <img src={reel.thumbnail_url} alt={reel.title} className="w-full h-full object-cover rounded-t-lg" />
                  ) : (
                    <Clock className="h-8 w-8 text-foreground-secondary" />
                  )}
                </div>
                <CardHeader>
                  <div className="flex items-start justify-between mb-2">
                    <Badge className={reel.status === "published" ? "badge-published" : "badge-archived"}>
                      {reel.status.toUpperCase()}
                    </Badge>
                  </div>
                  <CardTitle className="text-lg line-clamp-2">{reel.title}</CardTitle>
                  <CardDescription className="line-clamp-2">{reel.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-4 text-sm text-foreground-secondary">
                    <span className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {Math.floor(reel.duration / 60)}:{(reel.duration % 60).toString().padStart(2, '0')}
                    </span>
                    {reel.machine_model && (
                      <Badge variant="outline" className="text-xs">
                        {reel.machine_model}
                      </Badge>
                    )}
                  </div>
                  {reel.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {reel.tags.slice(0, 3).map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={Video}
          title="No reels found"
          description={
            searchQuery
              ? `No reels match your search "${searchQuery}". Try different keywords or clear your search.`
              : "Get started by uploading your first training reel to the library."
          }
          action={{
            label: searchQuery ? "Clear Search" : "Upload Your First Reel",
            onClick: searchQuery
              ? () => {
                  setSearchQuery("");
                  setSearchParams({});
                }
              : undefined,
            href: searchQuery ? undefined : "/upload",
          }}
          secondaryAction={
            searchQuery
              ? {
                  label: "Upload Reel",
                  href: "/upload",
                  variant: "outline",
                }
              : undefined
          }
        />
      )}
    </div>
  );
}
