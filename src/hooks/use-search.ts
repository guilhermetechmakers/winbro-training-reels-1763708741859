import { useQuery } from "@tanstack/react-query";
import { searchApi } from "@/lib/api";
import type { SearchQuery, SearchFilters } from "@/types";
import { useMemo } from "react";

// Hook for performing search
export function useSearch(query: SearchQuery) {
  return useQuery({
    queryKey: ["search", query.query, query.filters, query.sort_by, query.sort_order, query.page, query.per_page],
    queryFn: () => searchApi.search(query),
    enabled: !!query.query || Object.keys(query.filters || {}).length > 0,
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
}

// Hook for getting NLP suggestions (debounced)
export function useSearchSuggestions(query: string, enabled: boolean = true) {
  return useQuery({
    queryKey: ["search-suggestions", query],
    queryFn: () => searchApi.getSuggestions(query, 10),
    enabled: enabled && query.length >= 2, // Only fetch if query is at least 2 characters
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

// Hook for getting filter options
export function useFilterOptions(customerId?: string) {
  return useQuery({
    queryKey: ["filter-options", customerId],
    queryFn: () => searchApi.getFilterOptions(customerId),
    staleTime: 1000 * 60 * 10, // 10 minutes
  });
}

// Hook for getting search facets
export function useSearchFacets(query: string, filters?: SearchFilters) {
  return useQuery({
    queryKey: ["search-facets", query, filters],
    queryFn: () => searchApi.getFacets(query, filters),
    enabled: !!query || Object.keys(filters || {}).length > 0,
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
}

// Helper hook to build search query from URL params
export function useSearchQueryFromParams(searchParams: URLSearchParams) {
  return useMemo(() => {
    const query: SearchQuery = {
      query: searchParams.get("q") || "",
      page: parseInt(searchParams.get("page") || "1", 10),
      per_page: parseInt(searchParams.get("per_page") || "20", 10),
      sort_by: (searchParams.get("sort_by") as SearchQuery["sort_by"]) || "relevance",
      sort_order: (searchParams.get("sort_order") as SearchQuery["sort_order"]) || "desc",
    };

    const filters: SearchFilters = {};

    // Parse array params
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

    // Parse single value params
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

    if (Object.keys(filters).length > 0) {
      query.filters = filters;
    }

    return query;
  }, [searchParams]);
}
