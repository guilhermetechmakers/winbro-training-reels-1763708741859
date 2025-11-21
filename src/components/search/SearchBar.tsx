import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Search, X, Clock, TrendingUp } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useSearchSuggestions } from "@/hooks/use-search";
import { cn } from "@/lib/utils";
import type { NLPSuggestion } from "@/types";

// Hook to handle clicks outside element
function useClickOutside(ref: React.RefObject<HTMLElement>, handler: () => void) {
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        handler();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [ref, handler]);
}

interface SearchBarProps {
  placeholder?: string;
  className?: string;
  onSearch?: (query: string) => void;
  initialValue?: string;
  showSuggestions?: boolean;
}

export function SearchBar({
  placeholder = "Search reels, transcripts, courses...",
  className,
  onSearch,
  initialValue = "",
  showSuggestions = true,
}: SearchBarProps) {
  const [query, setQuery] = useState(initialValue);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close suggestions when clicking outside
  useClickOutside(containerRef, () => {
    if (isOpen) {
      setIsOpen(false);
    }
  });

  // Debounce query for suggestions
  const [debouncedQuery, setDebouncedQuery] = useState(query);
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
    }, 300);
    return () => clearTimeout(timer);
  }, [query]);

  const { data: suggestionsData, isLoading: isLoadingSuggestions } =
    useSearchSuggestions(debouncedQuery, showSuggestions && isOpen);

  const suggestions = suggestionsData?.suggestions || [];

  // Handle search submission
  const handleSearch = useCallback(
    (searchQuery: string) => {
      if (!searchQuery.trim()) return;

      if (onSearch) {
        onSearch(searchQuery);
      } else {
        navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
      }
      setIsOpen(false);
      inputRef.current?.blur();
    },
    [navigate, onSearch]
  );

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    setIsOpen(value.length > 0 && showSuggestions);
    setSelectedIndex(-1);
  };

  // Handle input keydown
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      if (selectedIndex >= 0 && suggestions[selectedIndex]) {
        handleSearch(suggestions[selectedIndex].text);
      } else {
        handleSearch(query);
      }
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) =>
        prev < suggestions.length - 1 ? prev + 1 : prev
      );
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1));
    } else if (e.key === "Escape") {
      setIsOpen(false);
      inputRef.current?.blur();
    }
  };

  // Handle suggestion click
  const handleSuggestionClick = (suggestion: NLPSuggestion) => {
    handleSearch(suggestion.text);
  };

  // Clear search
  const handleClear = () => {
    setQuery("");
    setIsOpen(false);
    inputRef.current?.focus();
  };

  // Update selected index scroll into view
  useEffect(() => {
    if (selectedIndex >= 0 && suggestionsRef.current) {
      const selectedElement = suggestionsRef.current.children[selectedIndex] as HTMLElement;
      if (selectedElement) {
        selectedElement.scrollIntoView({ block: "nearest", behavior: "smooth" });
      }
    }
  }, [selectedIndex, suggestions.length]);

  // Update query when initialValue changes
  useEffect(() => {
    if (initialValue !== query) {
      setQuery(initialValue);
    }
  }, [initialValue]);

  const getSuggestionIcon = (type: NLPSuggestion["type"]) => {
    switch (type) {
      case "query":
        return <Search className="h-4 w-4" />;
      case "tag":
        return <TrendingUp className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  return (
    <div ref={containerRef} className={cn("relative w-full", className)}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-foreground-secondary pointer-events-none" />
        <Input
          ref={inputRef}
          type="search"
          placeholder={placeholder}
          value={query}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => query.length > 0 && showSuggestions && setIsOpen(true)}
          className="pl-10 pr-10 w-full"
        />
        {query && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-1 top-1/2 transform -translate-y-1/2 h-7 w-7"
            onClick={handleClear}
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {isOpen && showSuggestions && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-border rounded-lg shadow-lg max-h-[400px] overflow-hidden animate-fade-in-down">
          <div
            ref={suggestionsRef}
            className="overflow-y-auto max-h-[400px]"
          >
            {isLoadingSuggestions ? (
              <div className="p-4 text-center text-sm text-foreground-secondary">
                Loading suggestions...
              </div>
            ) : suggestions.length > 0 ? (
              <div className="py-2">
                {suggestions.map((suggestion, index) => (
                  <button
                    key={`${suggestion.text}-${index}`}
                    type="button"
                    onClick={() => handleSuggestionClick(suggestion)}
                    className={cn(
                      "w-full px-4 py-2 text-left hover:bg-muted transition-colors duration-150 flex items-center gap-3",
                      selectedIndex === index && "bg-muted"
                    )}
                  >
                    <div className="text-foreground-secondary">
                      {getSuggestionIcon(suggestion.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-foreground-primary truncate">
                        {suggestion.text}
                      </div>
                      {suggestion.context && (
                        <div className="text-xs text-foreground-secondary truncate">
                          {suggestion.context}
                        </div>
                      )}
                    </div>
                    {suggestion.confidence > 0.7 && (
                      <Badge variant="secondary" className="text-xs">
                        {Math.round(suggestion.confidence * 100)}%
                      </Badge>
                    )}
                  </button>
                ))}
              </div>
            ) : debouncedQuery.length >= 2 ? (
              <div className="p-4 text-center text-sm text-foreground-secondary">
                No suggestions found
              </div>
            ) : null}
          </div>
          {query && (
            <div className="border-t border-border p-2">
              <button
                type="button"
                onClick={() => handleSearch(query)}
                className="w-full px-3 py-2 text-sm font-medium text-primary hover:bg-muted rounded-md transition-colors duration-150 flex items-center gap-2"
              >
                <Search className="h-4 w-4" />
                Search for "{query}"
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
