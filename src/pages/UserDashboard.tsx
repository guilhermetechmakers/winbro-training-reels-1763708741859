import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Library, Upload, BookOpen, Clock } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { Reel, Course, Library as LibraryType } from "@/types";
import { LoadingState, EmptyState } from "@/components/states";

export default function UserDashboard() {
  // TODO: Replace with actual API hooks
  const { data: libraries, isLoading: librariesLoading } = useQuery({
    queryKey: ["libraries"],
    queryFn: () => api.get<LibraryType[]>("/libraries"),
  });

  const { data: recentReels, isLoading: reelsLoading } = useQuery({
    queryKey: ["recent-reels"],
    queryFn: () => api.get<Reel[]>("/reels/recent"),
  });

  const { data: courses, isLoading: coursesLoading } = useQuery({
    queryKey: ["courses"],
    queryFn: () => api.get<Course[]>("/courses"),
  });

  return (
    <div className="space-y-8 animate-fade-in-up">
      {/* Welcome Section */}
      <div>
        <h1 className="text-3xl font-bold text-foreground-primary mb-2">
          Welcome back!
        </h1>
        <p className="text-foreground-secondary">
          Here's what's happening with your training content today.
        </p>
      </div>

      {/* Quick Actions */}
      <div className="grid md:grid-cols-3 gap-4">
        <Link to="/upload">
          <Card className="card-base card-hover">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Upload className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-lg">Upload Reel</CardTitle>
                  <CardDescription>Add a new training video</CardDescription>
                </div>
              </div>
            </CardHeader>
          </Card>
        </Link>
        <Link to="/courses">
          <Card className="card-base card-hover">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <BookOpen className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-lg">Create Course</CardTitle>
                  <CardDescription>Build a new training course</CardDescription>
                </div>
              </div>
            </CardHeader>
          </Card>
        </Link>
        <Link to="/library">
          <Card className="card-base card-hover">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Library className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-lg">Browse Library</CardTitle>
                  <CardDescription>Explore all content</CardDescription>
                </div>
              </div>
            </CardHeader>
          </Card>
        </Link>
      </div>

      {/* Libraries */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-foreground-primary">Your Libraries</h2>
          <Link to="/library">
            <Button variant="ghost" size="sm">
              View all
            </Button>
          </Link>
        </div>
        {librariesLoading ? (
          <LoadingState variant="grid" count={3} />
        ) : libraries && libraries.length > 0 ? (
          <div className="grid md:grid-cols-3 gap-4">
            {libraries.slice(0, 3).map((library) => (
              <Link key={library.id} to={`/library?library=${library.id}`}>
                <Card className="card-base card-hover">
                  <CardHeader>
                    <CardTitle>{library.name}</CardTitle>
                    <CardDescription>
                      {library.reel_ids.length} reels
                    </CardDescription>
                  </CardHeader>
                </Card>
              </Link>
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

      {/* Recent Activity */}
      <div className="grid lg:grid-cols-2 gap-8">
        {/* Recent Reels */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-foreground-primary">Recent Reels</h2>
            <Link to="/library">
              <Button variant="ghost" size="sm">
                View all
              </Button>
            </Link>
          </div>
          {reelsLoading ? (
            <LoadingState variant="list" count={3} />
          ) : recentReels && recentReels.length > 0 ? (
            <div className="space-y-4">
              {recentReels.slice(0, 5).map((reel) => (
                <Link key={reel.id} to={`/reel/${reel.id}`}>
                  <Card className="card-base card-hover">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-semibold text-foreground-primary mb-1">
                            {reel.title}
                          </h3>
                          <p className="text-sm text-foreground-secondary line-clamp-2">
                            {reel.description}
                          </p>
                          <div className="flex items-center gap-2 mt-2">
                            <Badge variant="secondary" className="text-xs">
                              {reel.skill_level}
                            </Badge>
                            <span className="text-xs text-foreground-secondary flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {Math.floor(reel.duration / 60)}:{(reel.duration % 60).toString().padStart(2, '0')}
                            </span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          ) : (
            <EmptyState
              title="No recent reels"
              description="Reels you've watched recently will appear here."
              size="sm"
            />
          )}
        </div>

        {/* Course Progress */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-foreground-primary">Course Progress</h2>
            <Link to="/courses">
              <Button variant="ghost" size="sm">
                View all
              </Button>
            </Link>
          </div>
          {coursesLoading ? (
            <LoadingState variant="list" count={2} />
          ) : courses && courses.length > 0 ? (
            <div className="space-y-4">
              {courses.slice(0, 3).map((course) => (
                <Link key={course.id} to={`/courses/${course.id}`}>
                  <Card className="card-base card-hover">
                    <CardHeader>
                      <CardTitle className="text-lg">{course.title}</CardTitle>
                      <CardDescription>
                        {course.modules.length} modules • {course.estimated_time} min
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                          <div className="h-full bg-primary" style={{ width: '60%' }}></div>
                        </div>
                        <span className="text-sm text-foreground-secondary">60%</span>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          ) : (
            <EmptyState
              icon={BookOpen}
              title="No courses in progress"
              description="Start learning by enrolling in a course or creating your own."
              action={{
                label: "Browse Courses",
                href: "/courses",
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
}
