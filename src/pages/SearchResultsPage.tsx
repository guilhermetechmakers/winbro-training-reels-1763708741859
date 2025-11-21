import { useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Search, Filter, Grid, List, Clock, Video, ArrowUpDown } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SearchBar } from "@/components/search/SearchBar";
import { FilterPanel } from "@/components/search/FilterPanel";
import { useSearch, useSearchQueryFromParams } from "@/hooks/use-search";
import { LoadingState, EmptyState } from "@/components/states";
import { cn } from "@/lib/utils";
import type { SearchFilters, SearchResult } from "@/types";

export default function SearchResultsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [showFilters, setShowFilters] = useState(false);

  const searchQuery = useSearchQueryFromParams(searchParams);
  const { data: searchResponse, isLoading } = useSearch(searchQuery);

  const results = searchResponse?.results || [];
  const total = searchResponse?.total || 0;
  const currentPage = searchResponse?.page || 1;
  const totalPages = searchResponse?.total_pages || 1;

  // Update URL params when filters change
  const handleFiltersChange = (filters: SearchFilters) => {
    const params = new URLSearchParams(searchParams);
    
    // Clear existing filter params
    ["tags", "machine_model", "tooling", "skill_level", "status", "language", "customer_id", "date_from", "date_to", "duration_min", "duration_max"].forEach(key => {
      params.delete(key);
    });

    // Add new filter params
    if (filters.tags?.length) {
      params.set("tags", filters.tags.join(","));
    }
    if (filters.machine_model?.length) {
      params.set("machine_model", filters.machine_model.join(","));
    }
    if (filters.tooling?.length) {
      params.set("tooling", filters.tooling.join(","));
    }
    if (filters.skill_level?.length) {
      params.set("skill_level", filters.skill_level.join(","));
    }
    if (filters.status?.length) {
      params.set("status", filters.status.join(","));
    }
    if (filters.language?.length) {
      params.set("language", filters.language.join(","));
    }
    if (filters.customer_id) {
      params.set("customer_id", filters.customer_id);
    }
    if (filters.date_from) {
      params.set("date_from", filters.date_from);
    }
    if (filters.date_to) {
      params.set("date_to", filters.date_to);
    }
    if (filters.duration_min !== undefined) {
      params.set("duration_min", filters.duration_min.toString());
    }
    if (filters.duration_max !== undefined) {
      params.set("duration_max", filters.duration_max.toString());
    }

    params.set("page", "1"); // Reset to first page
    setSearchParams(params);
  };

  // Handle sort change
  const handleSortChange = (sortBy: "relevance" | "date" | "duration" | "title", sortOrder: "asc" | "desc") => {
    const params = new URLSearchParams(searchParams);
    params.set("sort_by", sortBy);
    params.set("sort_order", sortOrder);
    params.set("page", "1");
    setSearchParams(params);
  };

  // Handle page change
  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams);
    params.set("page", page.toString());
    setSearchParams(params);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Handle search from search bar
  const handleSearch = (query: string) => {
    const params = new URLSearchParams();
    params.set("q", query);
    setSearchParams(params);
  };

  const activeFiltersCount = Object.keys(searchQuery.filters || {}).length;

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground-primary">Search Results</h1>
          {searchQuery.query && (
            <p className="text-foreground-secondary mt-1">
              {total > 0 ? (
                <>
                  Found {total} result{total !== 1 ? "s" : ""} for "{searchQuery.query}"
                </>
              ) : (
                <>No results found for "{searchQuery.query}"</>
              )}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant={showFilters ? "default" : "outline"}
            onClick={() => setShowFilters(!showFilters)}
            className="relative"
          >
            <Filter className="mr-2 h-4 w-4" />
            Filters
            {activeFiltersCount > 0 && (
              <Badge className="ml-2 h-5 w-5 p-0 flex items-center justify-center text-xs">
                {activeFiltersCount}
              </Badge>
            )}
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
      </div>

      {/* Search Bar */}
      <Card>
        <CardContent className="p-4">
          <SearchBar
            initialValue={searchQuery.query}
            onSearch={handleSearch}
            placeholder="Search reels, transcripts, courses..."
          />
        </CardContent>
      </Card>

      {/* Main Content */}
      <div className="flex gap-6">
        {/* Filter Panel */}
        {showFilters && (
          <div className="w-80 flex-shrink-0 animate-slide-in-left">
            <FilterPanel
              filters={searchQuery.filters || {}}
              onFiltersChange={handleFiltersChange}
            />
          </div>
        )}

        {/* Results Area */}
        <div className="flex-1 space-y-4">
          {/* Sort and Results Header */}
          {!isLoading && results.length > 0 && (
            <div className="flex items-center justify-between">
              <div className="text-sm text-foreground-secondary">
                Showing {((currentPage - 1) * (searchQuery.per_page || 20)) + 1} - {Math.min(currentPage * (searchQuery.per_page || 20), total)} of {total} results
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-foreground-secondary">Sort by:</span>
                <div className="flex items-center gap-1">
                  <Button
                    variant={searchQuery.sort_by === "relevance" ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleSortChange("relevance", "desc")}
                  >
                    Relevance
                  </Button>
                  <Button
                    variant={searchQuery.sort_by === "date" ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleSortChange("date", searchQuery.sort_order === "asc" ? "desc" : "asc")}
                  >
                    Date
                    <ArrowUpDown className="ml-1 h-3 w-3" />
                  </Button>
                  <Button
                    variant={searchQuery.sort_by === "duration" ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleSortChange("duration", searchQuery.sort_order === "asc" ? "desc" : "asc")}
                  >
                    Duration
                    <ArrowUpDown className="ml-1 h-3 w-3" />
                  </Button>
                  <Button
                    variant={searchQuery.sort_by === "title" ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleSortChange("title", searchQuery.sort_order === "asc" ? "desc" : "asc")}
                  >
                    Title
                    <ArrowUpDown className="ml-1 h-3 w-3" />
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Results */}
          {isLoading ? (
            <LoadingState
              variant={viewMode === "grid" ? "thumbnail" : "list"}
              count={8}
            />
          ) : results.length > 0 ? (
            <>
              <div className={cn(
                viewMode === "grid"
                  ? "grid md:grid-cols-2 lg:grid-cols-3 gap-4"
                  : "space-y-4"
              )}>
                {results.map((result) => (
                  <SearchResultCard key={result.id} result={result} viewMode={viewMode} />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 pt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                  >
                    Previous
                  </Button>
                  <div className="flex items-center gap-1">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNum: number;
                      if (totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (currentPage <= 3) {
                        pageNum = i + 1;
                      } else if (currentPage >= totalPages - 2) {
                        pageNum = totalPages - 4 + i;
                      } else {
                        pageNum = currentPage - 2 + i;
                      }
                      return (
                        <Button
                          key={pageNum}
                          variant={currentPage === pageNum ? "default" : "outline"}
                          size="sm"
                          onClick={() => handlePageChange(pageNum)}
                        >
                          {pageNum}
                        </Button>
                      );
                    })}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                  >
                    Next
                  </Button>
                </div>
              )}
            </>
          ) : (
            <EmptyState
              icon={Search}
              title="No results found"
              description={
                searchQuery.query
                  ? `No results match your search "${searchQuery.query}". Try different keywords or adjust your filters.`
                  : "Enter a search query to find reels, transcripts, and courses."
              }
              action={
                searchQuery.query
                  ? {
                      label: "Clear Search",
                      onClick: () => {
                        const params = new URLSearchParams();
                        setSearchParams(params);
                      },
                    }
                  : undefined
              }
            />
          )}
        </div>
      </div>
    </div>
  );
}

interface SearchResultCardProps {
  result: SearchResult;
  viewMode: "grid" | "list";
}

function SearchResultCard({ result, viewMode }: SearchResultCardProps) {
  const navigate = useNavigate();

  const handleClick = () => {
    if (result.type === "reel") {
      navigate(`/reel/${result.id}`);
    } else if (result.type === "course") {
      navigate(`/courses/${result.id}`);
    }
  };

  if (viewMode === "list") {
    return (
      <Card className="card-base card-hover" onClick={handleClick}>
        <CardContent className="p-4">
          <div className="flex gap-4">
            {result.thumbnail_url && (
              <div className="w-32 h-20 flex-shrink-0 rounded-lg overflow-hidden bg-muted">
                <img
                  src={result.thumbnail_url}
                  alt={result.title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge
                      className={
                        result.status === "published"
                          ? "badge-published"
                          : "badge-archived"
                      }
                    >
                      {result.status.toUpperCase()}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {result.type}
                    </Badge>
                  </div>
                  <CardTitle className="text-lg line-clamp-1">{result.title}</CardTitle>
                  {result.description && (
                    <CardDescription className="line-clamp-2 mt-1">
                      {result.description}
                    </CardDescription>
                  )}
                  {result.snippet && (
                    <p className="text-sm text-foreground-secondary mt-2 line-clamp-2">
                      {result.snippet}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-4 text-sm text-foreground-secondary mt-2">
                {result.duration && (
                  <span className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {Math.floor(result.duration / 60)}:{(result.duration % 60).toString().padStart(2, "0")}
                  </span>
                )}
                {result.machine_model && (
                  <Badge variant="outline" className="text-xs">
                    {result.machine_model}
                  </Badge>
                )}
                {result.tooling && (
                  <Badge variant="outline" className="text-xs">
                    {result.tooling}
                  </Badge>
                )}
              </div>
              {result.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {result.tags.slice(0, 5).map((tag) => (
                    <Badge key={tag} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="card-base card-hover" onClick={handleClick}>
      <div className="aspect-video bg-muted rounded-t-lg flex items-center justify-center overflow-hidden">
        {result.thumbnail_url ? (
          <img
            src={result.thumbnail_url}
            alt={result.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <Video className="h-8 w-8 text-foreground-secondary" />
        )}
      </div>
      <CardHeader>
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center gap-2">
            <Badge
              className={
                result.status === "published" ? "badge-published" : "badge-archived"
              }
            >
              {result.status.toUpperCase()}
            </Badge>
            <Badge variant="outline" className="text-xs">
              {result.type}
            </Badge>
          </div>
        </div>
        <CardTitle className="text-lg line-clamp-2">{result.title}</CardTitle>
        {result.description && (
          <CardDescription className="line-clamp-2">{result.description}</CardDescription>
        )}
        {result.snippet && (
          <p className="text-sm text-foreground-secondary mt-2 line-clamp-2">
            {result.snippet}
          </p>
        )}
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-4 text-sm text-foreground-secondary">
          {result.duration && (
            <span className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              {Math.floor(result.duration / 60)}:{(result.duration % 60).toString().padStart(2, "0")}
            </span>
          )}
          {result.machine_model && (
            <Badge variant="outline" className="text-xs">
              {result.machine_model}
            </Badge>
          )}
        </div>
        {result.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {result.tags.slice(0, 3).map((tag) => (
              <Badge key={tag} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
