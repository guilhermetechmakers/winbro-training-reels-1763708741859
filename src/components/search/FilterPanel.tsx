import { X, Filter, Calendar, Clock, Tag, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useFilterOptions } from "@/hooks/use-search";
import { cn } from "@/lib/utils";
import type { SearchFilters } from "@/types";

interface FilterPanelProps {
  filters: SearchFilters;
  onFiltersChange: (filters: SearchFilters) => void;
  customerId?: string;
  className?: string;
}

export function FilterPanel({
  filters,
  onFiltersChange,
  customerId,
  className,
}: FilterPanelProps) {
  const { data: filterOptions } = useFilterOptions(customerId);

  const updateFilter = <K extends keyof SearchFilters>(
    key: K,
    value: SearchFilters[K] | undefined
  ) => {
    if (value === undefined) {
      const { [key]: _, ...rest } = filters;
      onFiltersChange(rest);
    } else {
      onFiltersChange({
        ...filters,
        [key]: value,
      });
    }
  };

  const toggleArrayFilter = <K extends keyof SearchFilters>(
    key: K,
    value: string
  ) => {
    const current = (filters[key] as string[] | undefined) || [];
    const updated = current.includes(value)
      ? current.filter((v) => v !== value)
      : [...current, value];
    updateFilter(key, updated.length > 0 ? (updated as SearchFilters[K]) : undefined);
  };

  const clearFilter = (key: keyof SearchFilters) => {
    const { [key]: _, ...rest } = filters;
    onFiltersChange(rest);
  };

  const clearAllFilters = () => {
    onFiltersChange({});
  };

  const hasActiveFilters = Object.keys(filters).length > 0;

  return (
    <Card className={cn("card-base", className)}>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearAllFilters}
              className="text-xs"
            >
              Clear All
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Tags Filter */}
        {filterOptions?.tags && filterOptions.tags.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium flex items-center gap-2">
                <Tag className="h-4 w-4" />
                Tags
              </Label>
              {filters.tags && filters.tags.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => clearFilter("tags")}
                  className="h-6 w-6 p-0"
                >
                  <X className="h-3 w-3" />
                </Button>
              )}
            </div>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {filterOptions.tags.slice(0, 20).map((tag) => (
                <div key={tag} className="flex items-center space-x-2">
                  <Checkbox
                    id={`tag-${tag}`}
                    checked={filters.tags?.includes(tag) || false}
                    onCheckedChange={() => toggleArrayFilter("tags", tag)}
                  />
                  <Label
                    htmlFor={`tag-${tag}`}
                    className="text-sm font-normal cursor-pointer flex-1"
                  >
                    {tag}
                  </Label>
                </div>
              ))}
            </div>
          </div>
        )}

        <Separator />

        {/* Machine Models Filter */}
        {filterOptions?.machine_models && filterOptions.machine_models.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium flex items-center gap-2">
                <Settings className="h-4 w-4" />
                Machine Models
              </Label>
              {filters.machine_model && filters.machine_model.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => clearFilter("machine_model")}
                  className="h-6 w-6 p-0"
                >
                  <X className="h-3 w-3" />
                </Button>
              )}
            </div>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {filterOptions.machine_models.map((model) => (
                <div key={model} className="flex items-center space-x-2">
                  <Checkbox
                    id={`machine-${model}`}
                    checked={filters.machine_model?.includes(model) || false}
                    onCheckedChange={() => toggleArrayFilter("machine_model", model)}
                  />
                  <Label
                    htmlFor={`machine-${model}`}
                    className="text-sm font-normal cursor-pointer flex-1"
                  >
                    {model}
                  </Label>
                </div>
              ))}
            </div>
          </div>
        )}

        <Separator />

        {/* Tooling Filter */}
        {filterOptions?.tooling && filterOptions.tooling.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium flex items-center gap-2">
                <Settings className="h-4 w-4" />
                Tooling
              </Label>
              {filters.tooling && filters.tooling.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => clearFilter("tooling")}
                  className="h-6 w-6 p-0"
                >
                  <X className="h-3 w-3" />
                </Button>
              )}
            </div>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {filterOptions.tooling.map((tool) => (
                <div key={tool} className="flex items-center space-x-2">
                  <Checkbox
                    id={`tooling-${tool}`}
                    checked={filters.tooling?.includes(tool) || false}
                    onCheckedChange={() => toggleArrayFilter("tooling", tool)}
                  />
                  <Label
                    htmlFor={`tooling-${tool}`}
                    className="text-sm font-normal cursor-pointer flex-1"
                  >
                    {tool}
                  </Label>
                </div>
              ))}
            </div>
          </div>
        )}

        <Separator />

        {/* Skill Level Filter */}
        {filterOptions?.skill_levels && filterOptions.skill_levels.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium">Skill Level</Label>
              {filters.skill_level && filters.skill_level.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => clearFilter("skill_level")}
                  className="h-6 w-6 p-0"
                >
                  <X className="h-3 w-3" />
                </Button>
              )}
            </div>
            <div className="space-y-2">
              {filterOptions.skill_levels.map((level) => (
                <div key={level} className="flex items-center space-x-2">
                  <Checkbox
                    id={`skill-${level}`}
                    checked={filters.skill_level?.includes(level) || false}
                    onCheckedChange={() => toggleArrayFilter("skill_level", level)}
                  />
                  <Label
                    htmlFor={`skill-${level}`}
                    className="text-sm font-normal cursor-pointer flex-1 capitalize"
                  >
                    {level}
                  </Label>
                </div>
              ))}
            </div>
          </div>
        )}

        <Separator />

        {/* Status Filter */}
        {filterOptions?.statuses && filterOptions.statuses.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium">Status</Label>
              {filters.status && filters.status.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => clearFilter("status")}
                  className="h-6 w-6 p-0"
                >
                  <X className="h-3 w-3" />
                </Button>
              )}
            </div>
            <div className="space-y-2">
              {filterOptions.statuses.map((status) => (
                <div key={status} className="flex items-center space-x-2">
                  <Checkbox
                    id={`status-${status}`}
                    checked={filters.status?.includes(status) || false}
                    onCheckedChange={() => toggleArrayFilter("status", status)}
                  />
                  <Label
                    htmlFor={`status-${status}`}
                    className="text-sm font-normal cursor-pointer flex-1 capitalize"
                  >
                    {status}
                  </Label>
                </div>
              ))}
            </div>
          </div>
        )}

        <Separator />

        {/* Duration Filter */}
        <div className="space-y-3">
          <Label className="text-sm font-medium flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Duration (seconds)
          </Label>
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <Label htmlFor="duration-min" className="text-xs text-foreground-secondary">
                Min
              </Label>
              <input
                id="duration-min"
                type="number"
                min="0"
                value={filters.duration_min || ""}
                onChange={(e) =>
                  updateFilter(
                    "duration_min",
                    e.target.value ? parseInt(e.target.value, 10) : undefined
                  )
                }
                placeholder="0"
                className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="duration-max" className="text-xs text-foreground-secondary">
                Max
              </Label>
              <input
                id="duration-max"
                type="number"
                min="0"
                value={filters.duration_max || ""}
                onChange={(e) =>
                  updateFilter(
                    "duration_max",
                    e.target.value ? parseInt(e.target.value, 10) : undefined
                  )
                }
                placeholder="∞"
                className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm"
              />
            </div>
          </div>
          {(filters.duration_min || filters.duration_max) && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                clearFilter("duration_min");
                clearFilter("duration_max");
              }}
              className="w-full text-xs"
            >
              Clear Duration
            </Button>
          )}
        </div>

        <Separator />

        {/* Date Range Filter */}
        <div className="space-y-3">
          <Label className="text-sm font-medium flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Date Range
          </Label>
          <div className="space-y-2">
            <div className="space-y-1">
              <Label htmlFor="date-from" className="text-xs text-foreground-secondary">
                From
              </Label>
              <input
                id="date-from"
                type="date"
                value={filters.date_from || ""}
                onChange={(e) =>
                  updateFilter("date_from", e.target.value || undefined)
                }
                className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="date-to" className="text-xs text-foreground-secondary">
                To
              </Label>
              <input
                id="date-to"
                type="date"
                value={filters.date_to || ""}
                onChange={(e) =>
                  updateFilter("date_to", e.target.value || undefined)
                }
                className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm"
              />
            </div>
          </div>
          {(filters.date_from || filters.date_to) && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                clearFilter("date_from");
                clearFilter("date_to");
              }}
              className="w-full text-xs"
            >
              Clear Date Range
            </Button>
          )}
        </div>

        {/* Active Filters Summary */}
        {hasActiveFilters && (
          <>
            <Separator />
            <div className="space-y-2">
              <Label className="text-sm font-medium">Active Filters</Label>
              <div className="flex flex-wrap gap-2">
                {filters.tags?.map((tag) => (
                  <Badge
                    key={`tag-${tag}`}
                    variant="secondary"
                    className="flex items-center gap-1"
                  >
                    {tag}
                    <button
                      onClick={() => toggleArrayFilter("tags", tag)}
                      className="ml-1 hover:text-destructive"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
                {filters.machine_model?.map((model) => (
                  <Badge
                    key={`machine-${model}`}
                    variant="secondary"
                    className="flex items-center gap-1"
                  >
                    {model}
                    <button
                      onClick={() => toggleArrayFilter("machine_model", model)}
                      className="ml-1 hover:text-destructive"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
                {filters.tooling?.map((tool) => (
                  <Badge
                    key={`tooling-${tool}`}
                    variant="secondary"
                    className="flex items-center gap-1"
                  >
                    {tool}
                    <button
                      onClick={() => toggleArrayFilter("tooling", tool)}
                      className="ml-1 hover:text-destructive"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
                {filters.skill_level?.map((level) => (
                  <Badge
                    key={`skill-${level}`}
                    variant="secondary"
                    className="flex items-center gap-1 capitalize"
                  >
                    {level}
                    <button
                      onClick={() => toggleArrayFilter("skill_level", level)}
                      className="ml-1 hover:text-destructive"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
                {filters.status?.map((status) => (
                  <Badge
                    key={`status-${status}`}
                    variant="secondary"
                    className="flex items-center gap-1 capitalize"
                  >
                    {status}
                    <button
                      onClick={() => toggleArrayFilter("status", status)}
                      className="ml-1 hover:text-destructive"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
                {(filters.duration_min || filters.duration_max) && (
                  <Badge
                    variant="secondary"
                    className="flex items-center gap-1"
                  >
                    Duration: {filters.duration_min || 0}s - {filters.duration_max || "∞"}s
                    <button
                      onClick={() => {
                        clearFilter("duration_min");
                        clearFilter("duration_max");
                      }}
                      className="ml-1 hover:text-destructive"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                )}
                {(filters.date_from || filters.date_to) && (
                  <Badge
                    variant="secondary"
                    className="flex items-center gap-1"
                  >
                    {filters.date_from || "..."} to {filters.date_to || "..."}
                    <button
                      onClick={() => {
                        clearFilter("date_from");
                        clearFilter("date_to");
                      }}
                      className="ml-1 hover:text-destructive"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                )}
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
