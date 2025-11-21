import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Library, BookOpen, TrendingUp, Activity, Play } from "lucide-react";
import { useRecentActivity, useUserLibraries } from "@/hooks/use-dashboard";
import { useCurrentUser } from "@/hooks/use-auth";
import { LoadingState, EmptyState } from "@/components/states";
import { RecommendedReelsCarousel } from "@/components/dashboard/RecommendedReelsCarousel";
import { CourseProgressWidget } from "@/components/dashboard/CourseProgressWidget";
import { QuickActionsPanel } from "@/components/dashboard/QuickActionsPanel";
import type { Library as LibraryType, RecentActivity } from "@/types";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";

export default function UserDashboard() {
  const { data: user } = useCurrentUser();
  
  // Fetch data using hooks
  const { data: libraries, isLoading: librariesLoading } = useUserLibraries();
  const { data: recentActivity, isLoading: activityLoading } = useRecentActivity(10);

  return (
    <div className="space-y-8 animate-fade-in-up">
      {/* Welcome Section */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground-primary mb-2">
            Welcome back{user?.full_name ? `, ${user.full_name.split(' ')[0]}` : ''}!
          </h1>
          <p className="text-foreground-secondary">
            Here's what's happening with your training content today.
          </p>
        </div>
        <QuickActionsPanel className="hidden lg:block w-64 flex-shrink-0" />
      </div>

      {/* Quick Actions - Mobile */}
      <div className="lg:hidden">
        <QuickActionsPanel />
      </div>

      {/* Libraries Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-foreground-primary">Your Libraries</h2>
            <p className="text-sm text-foreground-secondary mt-1">
              Access your assigned content libraries
            </p>
          </div>
          <Link to="/library">
            <Button variant="ghost" size="sm">
              View all
            </Button>
          </Link>
        </div>
        {librariesLoading ? (
          <LoadingState variant="grid" count={3} />
        ) : libraries && libraries.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {libraries.slice(0, 6).map((library, index) => (
              <LibraryCard key={library.id} library={library} index={index} />
            ))}
          </div>
        ) : (
          <EmptyState
            icon={Library}
            title="No libraries yet"
            description="Get started by browsing the content library or uploading your first reel."
            action={{
              label: "Browse Library",
              href: "/library",
            }}
          />
        )}
      </div>

      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-3 gap-8">
        {/* Left Column - Recent Activity & Recommended Reels */}
        <div className="lg:col-span-2 space-y-8">
          {/* Recent Activity Section */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-2xl font-bold text-foreground-primary">Recent Activity</h2>
                <p className="text-sm text-foreground-secondary mt-1">
                  Your recent interactions with content
                </p>
              </div>
              <Link to="/library">
                <Button variant="ghost" size="sm">
                  View all
                </Button>
              </Link>
            </div>
            {activityLoading ? (
              <LoadingState variant="list" count={5} />
            ) : recentActivity && recentActivity.length > 0 ? (
              <Card className="card-base">
                <CardContent className="p-6">
                  <div className="space-y-4">
                    {recentActivity.slice(0, 8).map((activity, index) => (
                      <ActivityItem key={activity.id} activity={activity} index={index} />
                    ))}
                  </div>
                </CardContent>
              </Card>
            ) : (
              <EmptyState
                icon={Activity}
                title="No recent activity"
                description="Reels and courses you interact with will appear here."
                size="sm"
              />
            )}
          </div>

          {/* Recommended Reels Section */}
          <RecommendedReelsCarousel limit={6} />
        </div>

        {/* Right Column - Course Progress */}
        <div className="space-y-8">
          <CourseProgressWidget limit={5} />
        </div>
      </div>
    </div>
  );
}

interface LibraryCardProps {
  library: LibraryType;
  index: number;
}

function LibraryCard({ library, index }: LibraryCardProps) {
  return (
    <Link to={`/library?library=${library.id}`}>
      <Card className="card-base card-hover animate-fade-in-up" style={{ animationDelay: `${index * 0.1}s` }}>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="text-lg mb-1">{library.name}</CardTitle>
              <CardDescription>
                {library.reel_ids.length} {library.reel_ids.length === 1 ? 'reel' : 'reels'}
              </CardDescription>
            </div>
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
              <Library className="h-5 w-5 text-primary" />
            </div>
          </div>
        </CardHeader>
      </Card>
    </Link>
  );
}

interface ActivityItemProps {
  activity: RecentActivity;
  index: number;
}

function ActivityItem({ activity, index }: ActivityItemProps) {
  const timeAgo = formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true });
  const isLast = index === 7;

  const getActionIcon = () => {
    switch (activity.action) {
      case 'viewed':
        return <Activity className="h-4 w-4" />;
      case 'completed':
        return <TrendingUp className="h-4 w-4" />;
      case 'started':
        return <Play className="h-4 w-4" />;
      case 'enrolled':
        return <BookOpen className="h-4 w-4" />;
      default:
        return <Activity className="h-4 w-4" />;
    }
  };

  const getActionColor = () => {
    switch (activity.action) {
      case 'completed':
        return 'text-success';
      case 'started':
        return 'text-primary';
      case 'enrolled':
        return 'text-accent';
      default:
        return 'text-foreground-secondary';
    }
  };

  const href = activity.type === 'reel' ? `/reel/${activity.item_id}` : `/courses/${activity.item_id}`;

  return (
    <Link to={href}>
      <div className={cn(
        "flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors group",
        !isLast && "border-b border-border pb-4"
      )}>
        <div className={cn(
          "h-8 w-8 rounded-lg bg-muted flex items-center justify-center flex-shrink-0",
          getActionColor()
        )}>
          {getActionIcon()}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <h4 className="font-medium text-foreground-primary group-hover:text-primary transition-colors line-clamp-1">
                {activity.item_title}
              </h4>
              {activity.item_description && (
                <p className="text-sm text-foreground-secondary line-clamp-1 mt-0.5">
                  {activity.item_description}
                </p>
              )}
            </div>
            <Badge variant="outline" className="text-xs flex-shrink-0">
              {activity.type}
            </Badge>
          </div>
          <div className="flex items-center gap-2 mt-2">
            <span className="text-xs text-foreground-secondary capitalize">
              {activity.action}
            </span>
            <span className="text-xs text-foreground-secondary">•</span>
            <span className="text-xs text-foreground-secondary">
              {timeAgo}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
