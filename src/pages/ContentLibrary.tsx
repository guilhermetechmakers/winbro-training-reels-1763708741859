import { useState, useMemo } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Grid, List, Filter, Upload } from "lucide-react";
import { useSearch, useSearchQueryFromParams } from "@/hooks/use-search";
import { SearchBar } from "@/components/search/SearchBar";
import { FilterPanel } from "@/components/search/FilterPanel";
import { SortSelector } from "@/components/search/SortSelector";
import { Pagination } from "@/components/search/Pagination";
import { CustomerScopeSelector } from "@/components/search/CustomerScopeSelector";
import { ContentCard } from "@/components/reels/ContentCard";
import { LoadingState, EmptyState } from "@/components/states";
import { Video } from "lucide-react";
import type { SearchQuery, SearchFilters } from "@/types";
import { cn } from "@/lib/utils";

export default function ContentLibrary() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [viewMode, setViewMode] = useState<"grid" | "list">(
    (searchParams.get("view") as "grid" | "list") || "grid"
  );
  const [showFilters, setShowFilters] = useState(false);

  // Build search query from URL params
  const searchQuery = useSearchQueryFromParams(searchParams);

  // Perform search
  const { data: searchResponse, isLoading, error } = useSearch(searchQuery);

  const results = searchResponse?.results || [];
  const total = searchResponse?.total || 0;
  const currentPage = searchResponse?.page || 1;
  const totalPages = searchResponse?.total_pages || 1;

  // Update URL params when filters/search change
  const updateSearchParams = (
    updates: Partial<{
      q: string;
      page: number;
      per_page: number;
      sort_by: string;
      sort_order: string;
      view: string;
      customer_id: string;
      [key: string]: string | number | undefined;
    }>
  ) => {
    const newParams = new URLSearchParams(searchParams);
    
    Object.entries(updates).forEach(([key, value]) => {
      if (value === undefined || value === "" || value === null) {
        newParams.delete(key);
      } else {
        newParams.set(key, String(value));
      }
    });

    // Remove page if it's 1 (cleaner URL)
    if (newParams.get("page") === "1") {
      newParams.delete("page");
    }

    setSearchParams(newParams, { replace: true });
  };

  // Handle search
  const handleSearch = (query: string) => {
    updateSearchParams({ q: query, page: 1 });
  };

  // Handle filter changes
  const handleFiltersChange = (filters: SearchFilters) => {
    const newParams = new URLSearchParams(searchParams);
    
    // Clear existing filter params
    [
      "tags",
      "machine_model",
      "tooling",
      "skill_level",
      "status",
      "customer_id",
      "date_from",
      "date_to",
      "duration_min",
      "duration_max",
      "language",
    ].forEach((key) => newParams.delete(key));

    // Add new filter params
    if (filters.tags?.length) {
      newParams.set("tags", filters.tags.join(","));
    }
    if (filters.machine_model?.length) {
      newParams.set("machine_model", filters.machine_model.join(","));
    }
    if (filters.tooling?.length) {
      newParams.set("tooling", filters.tooling.join(","));
    }
    if (filters.skill_level?.length) {
      newParams.set("skill_level", filters.skill_level.join(","));
    }
    if (filters.status?.length) {
      newParams.set("status", filters.status.join(","));
    }
    if (filters.language?.length) {
      newParams.set("language", filters.language.join(","));
    }
    if (filters.customer_id) {
      newParams.set("customer_id", filters.customer_id);
    }
    if (filters.date_from) {
      newParams.set("date_from", filters.date_from);
    }
    if (filters.date_to) {
      newParams.set("date_to", filters.date_to);
    }
    if (filters.duration_min !== undefined) {
      newParams.set("duration_min", filters.duration_min.toString());
    }
    if (filters.duration_max !== undefined) {
      newParams.set("duration_max", filters.duration_max.toString());
    }

    // Reset to page 1 when filters change
    newParams.delete("page");
    setSearchParams(newParams, { replace: true });
  };

  // Handle sort change
  const handleSortChange = (
    sortBy: SearchQuery["sort_by"],
    sortOrder: SearchQuery["sort_order"]
  ) => {
    updateSearchParams({
      sort_by: sortBy || "relevance",
      sort_order: sortOrder || "desc",
      page: 1,
    });
  };

  // Handle page change
  const handlePageChange = (page: number) => {
    updateSearchParams({ page });
    // Scroll to top on page change
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Handle customer scope change
  const handleCustomerChange = (customerId: string | undefined) => {
    const newParams = new URLSearchParams(searchParams);
    if (customerId) {
      newParams.set("customer_id", customerId);
    } else {
      newParams.delete("customer_id");
    }
    newParams.delete("page"); // Reset to page 1
    setSearchParams(newParams, { replace: true });
  };

  // Handle view mode change
  const handleViewModeChange = (mode: "grid" | "list") => {
    setViewMode(mode);
    updateSearchParams({ view: mode });
  };

  // Get active filters from search params
  const activeFilters = useMemo<SearchFilters>(() => {
    const filters: SearchFilters = {};

    const parseArrayParam = (param: string): string[] => {
      const value = searchParams.get(param);
      return value ? value.split(",") : [];
    };

    const tags = parseArrayParam("tags");
    if (tags.length > 0) filters.tags = tags;

    const machineModels = parseArrayParam("machine_model");
    if (machineModels.length > 0) filters.machine_model = machineModels;

    const tooling = parseArrayParam("tooling");
    if (tooling.length > 0) filters.tooling = tooling;

    const skillLevels = parseArrayParam("skill_level");
    if (skillLevels.length > 0) {
      filters.skill_level = skillLevels as SearchFilters["skill_level"];
    }

    const statuses = parseArrayParam("status");
    if (statuses.length > 0) {
      filters.status = statuses as SearchFilters["status"];
    }

    const languages = parseArrayParam("language");
    if (languages.length > 0) filters.language = languages;

    const customerId = searchParams.get("customer_id");
    if (customerId) filters.customer_id = customerId;

    const dateFrom = searchParams.get("date_from");
    if (dateFrom) filters.date_from = dateFrom;

    const dateTo = searchParams.get("date_to");
    if (dateTo) filters.date_to = dateTo;

    const durationMin = searchParams.get("duration_min");
    if (durationMin) filters.duration_min = parseInt(durationMin, 10);

    const durationMax = searchParams.get("duration_max");
    if (durationMax) filters.duration_max = parseInt(durationMax, 10);

    return filters;
  }, [searchParams]);

  const hasActiveFilters = Object.keys(activeFilters).length > 0;
  const hasSearchQuery = !!searchQuery.query;

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground-primary">
            Content Library
          </h1>
          <p className="text-foreground-secondary mt-1">
            {total > 0
              ? `Found ${total} ${total === 1 ? "reel" : "reels"}`
              : "Browse and search all training reels"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link to="/upload">
            <Button>
              <Upload className="mr-2 h-4 w-4" />
              Upload Reel
            </Button>
          </Link>
        </div>
      </div>

      {/* Search and Controls */}
      <Card className="card-base">
        <CardContent className="p-4 space-y-4">
          {/* Search Bar */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <SearchBar
                placeholder="Search reels, transcripts, tags..."
                initialValue={searchQuery.query}
                onSearch={handleSearch}
                showSuggestions={true}
              />
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant={showFilters ? "default" : "outline"}
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2"
              >
                <Filter className="h-4 w-4" />
                Filters
                {hasActiveFilters && (
                  <span className="ml-1 px-1.5 py-0.5 text-xs bg-primary-foreground text-primary rounded-full">
                    {Object.values(activeFilters).reduce(
                      (acc, val) =>
                        acc + (Array.isArray(val) ? val.length : val ? 1 : 0),
                      0
                    )}
                  </span>
                )}
              </Button>
              <div className="flex gap-2 border-l border-border pl-2">
                <Button
                  variant={viewMode === "grid" ? "default" : "outline"}
                  size="icon"
                  onClick={() => handleViewModeChange("grid")}
                  aria-label="Grid view"
                >
                  <Grid className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === "list" ? "default" : "outline"}
                  size="icon"
                  onClick={() => handleViewModeChange("list")}
                  aria-label="List view"
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Sort and Customer Scope */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-2 border-t border-border">
            <SortSelector
              sortBy={searchQuery.sort_by || "relevance"}
              sortOrder={searchQuery.sort_order || "desc"}
              onSortChange={handleSortChange}
            />
            <CustomerScopeSelector
              customerId={activeFilters.customer_id}
              onCustomerChange={handleCustomerChange}
            />
          </div>
        </CardContent>
      </Card>

      {/* Main Content Area */}
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Filter Panel */}
        {showFilters && (
          <div className="lg:w-64 flex-shrink-0">
            <FilterPanel
              filters={activeFilters}
              onFiltersChange={handleFiltersChange}
              customerId={activeFilters.customer_id}
            />
          </div>
        )}

        {/* Results */}
        <div className="flex-1 min-w-0">
          {isLoading ? (
            <LoadingState
              variant={viewMode === "grid" ? "thumbnail" : "list"}
              count={8}
            />
          ) : error ? (
            <EmptyState
              icon={Video}
              title="Error loading content"
              description="There was an error loading the content library. Please try again."
              action={{
                label: "Retry",
                onClick: () => window.location.reload(),
              }}
            />
          ) : results.length > 0 ? (
            <>
              <div
                className={cn(
                  viewMode === "grid"
                    ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
                    : "space-y-4"
                )}
              >
                {results.map((result) => (
                  <ContentCard
                    key={result.id}
                    reel={result}
                    viewMode={viewMode}
                    className="animate-fade-in-up"
                  />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-8">
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={handlePageChange}
                  />
                </div>
              )}
            </>
          ) : (
            <EmptyState
              icon={Video}
              title="No reels found"
              description={
                hasSearchQuery || hasActiveFilters
                  ? `No reels match your ${hasSearchQuery ? "search" : ""}${hasSearchQuery && hasActiveFilters ? " and " : ""}${hasActiveFilters ? "filters" : ""}. Try adjusting your search or filters.`
                  : "Get started by uploading your first training reel to the library."
              }
              action={
                hasSearchQuery || hasActiveFilters
                  ? {
                      label: "Clear Search & Filters",
                      onClick: () => {
                        setSearchParams({});
                        setShowFilters(false);
                      },
                    }
                  : {
                      label: "Upload Your First Reel",
                      href: "/upload",
                    }
              }
              secondaryAction={
                hasSearchQuery || hasActiveFilters
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
      </div>
    </div>
  );
}
