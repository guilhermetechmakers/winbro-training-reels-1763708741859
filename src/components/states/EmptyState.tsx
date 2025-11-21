import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

interface EmptyStateProps {
  /**
   * Icon to display (Lucide icon component)
   */
  icon?: LucideIcon;
  /**
   * Main title/heading
   */
  title: string;
  /**
   * Description text
   */
  description?: string;
  /**
   * Primary action button
   */
  action?: {
    label: string;
    onClick?: () => void;
    href?: string;
    variant?: "default" | "outline" | "ghost";
  };
  /**
   * Secondary action button
   */
  secondaryAction?: {
    label: string;
    onClick?: () => void;
    href?: string;
    variant?: "default" | "outline" | "ghost";
  };
  /**
   * Custom illustration/content
   */
  illustration?: ReactNode;
  /**
   * Additional className
   */
  className?: string;
  /**
   * Size variant
   */
  size?: "sm" | "md" | "lg";
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  secondaryAction,
  illustration,
  className,
  size = "md",
}: EmptyStateProps) {
  const iconSize = size === "sm" ? "h-8 w-8" : size === "md" ? "h-12 w-12" : "h-16 w-16";
  const titleSize = size === "sm" ? "text-lg" : size === "md" ? "text-xl" : "text-2xl";
  const padding = size === "sm" ? "py-8" : size === "md" ? "py-12" : "py-16";

  return (
    <Card className={cn("card-base", className)}>
      <CardContent className={cn("text-center", padding)}>
        {illustration ? (
          <div className="mb-6 flex justify-center animate-fade-in-up">
            {illustration}
          </div>
        ) : Icon ? (
          <div className="mb-6 flex justify-center animate-fade-in-up">
            <div className={cn(
              "rounded-full bg-muted/50 p-4 flex items-center justify-center",
              "text-muted-foreground"
            )}>
              <Icon className={iconSize} />
            </div>
          </div>
        ) : null}

        <h3 className={cn(
          "font-bold text-foreground-primary mb-2",
          titleSize
        )}>
          {title}
        </h3>

        {description && (
          <p className="text-foreground-secondary mb-6 max-w-md mx-auto">
            {description}
          </p>
        )}

        {(action || secondaryAction) && (
          <div className="flex items-center justify-center gap-3 flex-wrap">
            {action && (
              action.href ? (
                <Link to={action.href}>
                  <Button
                    variant={action.variant || "default"}
                    className="animate-fade-in-up"
                    style={{ animationDelay: "0.1s" }}
                  >
                    {action.label}
                  </Button>
                </Link>
              ) : (
                <Button
                  onClick={action.onClick}
                  variant={action.variant || "default"}
                  className="animate-fade-in-up"
                  style={{ animationDelay: "0.1s" }}
                >
                  {action.label}
                </Button>
              )
            )}
            {secondaryAction && (
              secondaryAction.href ? (
                <Link to={secondaryAction.href}>
                  <Button
                    variant={secondaryAction.variant || "outline"}
                    className="animate-fade-in-up"
                    style={{ animationDelay: "0.2s" }}
                  >
                    {secondaryAction.label}
                  </Button>
                </Link>
              ) : (
                <Button
                  onClick={secondaryAction.onClick}
                  variant={secondaryAction.variant || "outline"}
                  className="animate-fade-in-up"
                  style={{ animationDelay: "0.2s" }}
                >
                  {secondaryAction.label}
                </Button>
              )
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
