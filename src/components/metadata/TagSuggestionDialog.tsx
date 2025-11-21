import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, Sparkles, X } from "lucide-react";
import { useTagSuggestions } from "@/hooks/use-metadata";
import type { TagSuggestion } from "@/types";
import { cn } from "@/lib/utils";

interface TagSuggestionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTags: (tags: string[]) => void;
  title?: string;
  description?: string;
  transcript?: string;
  existingTags?: string[];
}

export function TagSuggestionDialog({
  isOpen,
  onClose,
  onSelectTags,
  title,
  description,
  transcript,
  existingTags = [],
}: TagSuggestionDialogProps) {
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const tagSuggestionsMutation = useTagSuggestions();
  const [suggestions, setSuggestions] = useState<TagSuggestion[]>([]);

  useEffect(() => {
    if (isOpen && (title || description || transcript)) {
      tagSuggestionsMutation.mutate(
        {
          title,
          description,
          transcript,
          existing_tags: existingTags,
        },
        {
          onSuccess: (response) => {
            setSuggestions(response.suggestions);
            setSelectedTags([]);
          },
        }
      );
    }
  }, [isOpen, title, description, transcript]);

  const handleToggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleApply = () => {
    onSelectTags(selectedTags);
    onClose();
  };

  const getSourceColor = (source: TagSuggestion["source"]) => {
    switch (source) {
      case "transcript":
        return "bg-primary/10 text-primary border-primary/20";
      case "title":
        return "bg-success/10 text-success border-success/20";
      case "description":
        return "bg-accent/10 text-accent border-accent/20";
      default:
        return "bg-muted text-foreground-secondary border-border";
    }
  };

  const getSourceLabel = (source: TagSuggestion["source"]) => {
    switch (source) {
      case "transcript":
        return "Transcript";
      case "title":
        return "Title";
      case "description":
        return "Description";
      default:
        return "NLP";
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Tag Suggestions
          </DialogTitle>
          <DialogDescription>
            AI-powered tag suggestions based on your content. Select tags to add
            them to your reel.
          </DialogDescription>
        </DialogHeader>

        {tagSuggestionsMutation.isPending ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
            <span className="ml-2 text-foreground-secondary">
              Analyzing content...
            </span>
          </div>
        ) : tagSuggestionsMutation.isError ? (
          <div className="py-12 text-center">
            <p className="text-destructive">
              Failed to load suggestions. Please try again.
            </p>
          </div>
        ) : suggestions.length === 0 ? (
          <div className="py-12 text-center">
            <p className="text-foreground-secondary">
              No suggestions available. Try adding more content to your reel.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2">
              {suggestions
                .sort((a, b) => b.confidence - a.confidence)
                .map((suggestion) => {
                  const isSelected = selectedTags.includes(suggestion.tag);
                  return (
                    <button
                      key={suggestion.tag}
                      type="button"
                      onClick={() => handleToggleTag(suggestion.tag)}
                      className={cn(
                        "inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-all",
                        "hover:scale-105 hover:shadow-sm",
                        isSelected
                          ? "bg-primary text-primary-foreground border-primary shadow-sm"
                          : "bg-white border-border hover:border-primary/50",
                        "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                      )}
                    >
                      <span className="text-sm font-medium">{suggestion.tag}</span>
                      <Badge
                        variant="secondary"
                        className={cn(
                          "text-xs",
                          getSourceColor(suggestion.source)
                        )}
                      >
                        {getSourceLabel(suggestion.source)}
                      </Badge>
                      <span className="text-xs text-foreground-secondary">
                        {Math.round(suggestion.confidence * 100)}%
                      </span>
                    </button>
                  );
                })}
            </div>

            {selectedTags.length > 0 && (
              <div className="pt-4 border-t border-border">
                <p className="text-sm font-medium text-foreground-primary mb-2">
                  Selected Tags ({selectedTags.length})
                </p>
                <div className="flex flex-wrap gap-2">
                  {selectedTags.map((tag) => (
                    <Badge
                      key={tag}
                      variant="default"
                      className="bg-primary text-primary-foreground"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => handleToggleTag(tag)}
                        className="ml-2 hover:bg-primary-foreground/20 rounded-full p-0.5"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        <div className="flex justify-end gap-3 pt-4 border-t border-border">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={handleApply}
            disabled={selectedTags.length === 0}
          >
            Apply {selectedTags.length > 0 && `(${selectedTags.length})`}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
