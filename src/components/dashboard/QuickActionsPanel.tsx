import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload, BookOpen, MessageSquare } from "lucide-react";
import { useCurrentUser } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";

interface QuickActionsPanelProps {
  className?: string;
}

export function QuickActionsPanel({ className }: QuickActionsPanelProps) {
  const { data: user } = useCurrentUser();
  
  // Show for trainers, customer admins, and admins
  const canUpload = user?.role === 'trainer' || user?.role === 'customer_admin' || user?.role === 'admin';
  
  if (!canUpload) {
    return null;
  }

  const actions = [
    {
      title: "Upload Reel",
      description: "Add a new training video",
      icon: Upload,
      href: "/upload",
      color: "bg-primary/10 text-primary",
    },
    {
      title: "Create Course",
      description: "Build a new training course",
      icon: BookOpen,
      href: "/courses",
      color: "bg-success/10 text-success",
    },
    {
      title: "Request Content",
      description: "Request a new reel or course",
      icon: MessageSquare,
      href: "/help",
      color: "bg-accent/10 text-accent",
    },
  ];

  return (
    <Card className={cn("card-base", className)}>
      <CardHeader>
        <CardTitle className="text-lg">Quick Actions</CardTitle>
        <CardDescription>
          Streamline your content management
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        {actions.map((action, index) => {
          const Icon = action.icon;
          return (
            <Link key={action.title} to={action.href}>
              <Button
                variant="ghost"
                className="w-full justify-start gap-3 h-auto py-3 px-3 hover:bg-muted/50 transition-colors animate-fade-in-up"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className={cn("h-10 w-10 rounded-lg flex items-center justify-center", action.color)}>
                  <Icon className="h-5 w-5" />
                </div>
                <div className="flex-1 text-left">
                  <div className="font-medium text-foreground-primary">{action.title}</div>
                  <div className="text-xs text-foreground-secondary">{action.description}</div>
                </div>
              </Button>
            </Link>
          );
        })}
      </CardContent>
    </Card>
  );
}
