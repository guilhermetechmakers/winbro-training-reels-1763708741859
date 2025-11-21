import { ArrowUpDown, TrendingUp, Calendar, Clock, FileText } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import type { SearchQuery } from "@/types";

interface SortSelectorProps {
  sortBy: SearchQuery["sort_by"];
  sortOrder: SearchQuery["sort_order"];
  onSortChange: (sortBy: SearchQuery["sort_by"], sortOrder: SearchQuery["sort_order"]) => void;
  className?: string;
}

export function SortSelector({
  sortBy = "relevance",
  sortOrder = "desc",
  onSortChange,
  className,
}: SortSelectorProps) {
  const handleSortByChange = (value: string) => {
    onSortChange(value as SearchQuery["sort_by"], sortOrder);
  };

  const handleSortOrderChange = (value: string) => {
    onSortChange(sortBy, value as SearchQuery["sort_order"]);
  };

  const getSortIcon = (sort: SearchQuery["sort_by"]) => {
    switch (sort) {
      case "relevance":
        return <TrendingUp className="h-4 w-4" />;
      case "date":
        return <Calendar className="h-4 w-4" />;
      case "duration":
        return <Clock className="h-4 w-4" />;
      case "title":
        return <FileText className="h-4 w-4" />;
      default:
        return <ArrowUpDown className="h-4 w-4" />;
    }
  };

  return (
    <div className={`flex items-center gap-3 ${className || ""}`}>
      <Label className="text-sm font-medium text-foreground-secondary whitespace-nowrap">
        Sort by:
      </Label>
      <div className="flex items-center gap-2">
        <Select value={sortBy} onValueChange={handleSortByChange}>
          <SelectTrigger className="w-[160px]">
            <div className="flex items-center gap-2">
              {getSortIcon(sortBy)}
              <SelectValue />
            </div>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="relevance">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                <span>Relevance</span>
              </div>
            </SelectItem>
            <SelectItem value="date">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span>Date</span>
              </div>
            </SelectItem>
            <SelectItem value="duration">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                <span>Duration</span>
              </div>
            </SelectItem>
            <SelectItem value="title">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                <span>Title</span>
              </div>
            </SelectItem>
          </SelectContent>
        </Select>

        <Select value={sortOrder} onValueChange={handleSortOrderChange}>
          <SelectTrigger className="w-[120px]">
            <div className="flex items-center gap-2">
              <ArrowUpDown className="h-4 w-4" />
              <SelectValue />
            </div>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="desc">Descending</SelectItem>
            <SelectItem value="asc">Ascending</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
