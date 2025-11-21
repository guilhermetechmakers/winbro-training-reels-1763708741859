import { useState } from "react";
import type { FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Home, LayoutDashboard, HelpCircle, ArrowRight, FileQuestion } from "lucide-react";

export default function NotFoundPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  const handleSearch = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // Navigate to library with search query
      navigate(`/library?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleSupportClick = () => {
    navigate("/help");
  };

  return (
    <div className="min-h-screen bg-background-primary flex items-center justify-center p-4 md:p-8">
      <div className="w-full max-w-4xl space-y-6">
        {/* Main 404 Card */}
        <Card className="w-full animate-fade-in-up shadow-card">
          <CardHeader className="text-center pb-4">
            <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-muted/50 mb-6 animate-scale-in">
              <FileQuestion className="h-12 w-12 text-foreground-secondary" />
            </div>
            <div className="text-7xl md:text-8xl font-bold text-foreground-secondary mb-4 tracking-tight">
              404
            </div>
            <CardTitle className="text-3xl md:text-4xl font-bold text-foreground-primary mb-3">
              Page Not Found
            </CardTitle>
            <CardDescription className="text-base md:text-lg max-w-2xl mx-auto">
              Oops! The page you're looking for doesn't exist or has been moved. 
              Don't worry—we'll help you find what you need.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Search Box */}
            <form onSubmit={handleSearch} className="space-y-4">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-foreground-secondary pointer-events-none" />
                <Input
                  type="search"
                  placeholder="Search reels, transcripts, courses..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 text-base border-input rounded-lg focus-visible:ring-2 focus-visible:ring-primary transition-all duration-200"
                  aria-label="Search for content"
                />
              </div>
              <Button
                type="submit"
                className="w-full md:w-auto md:mx-auto flex items-center justify-center gap-2 bg-primary text-primary-foreground hover:bg-primary/90 hover:scale-[1.02] transition-all duration-200"
                disabled={!searchQuery.trim()}
              >
                <Search className="h-4 w-4" />
                Search Content
                <ArrowRight className="h-4 w-4" />
              </Button>
            </form>

            {/* Navigation Links */}
            <div className="pt-4 border-t border-border">
              <p className="text-sm text-foreground-secondary mb-4 text-center">
                Or navigate to:
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link to="/" className="flex-1 sm:flex-initial">
                  <Button
                    variant="outline"
                    className="w-full sm:w-auto min-w-[160px] flex items-center justify-center gap-2 hover:bg-muted/50 hover:scale-[1.02] transition-all duration-200"
                  >
                    <Home className="h-4 w-4" />
                    Go Home
                  </Button>
                </Link>
                <Link to="/dashboard" className="flex-1 sm:flex-initial">
                  <Button
                    variant="outline"
                    className="w-full sm:w-auto min-w-[160px] flex items-center justify-center gap-2 hover:bg-muted/50 hover:scale-[1.02] transition-all duration-200"
                  >
                    <LayoutDashboard className="h-4 w-4" />
                    Dashboard
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Support Card */}
        <Card className="animate-fade-in-up shadow-card" style={{ animationDelay: '0.2s' }}>
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-start gap-4 flex-1">
                <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                  <HelpCircle className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-foreground-primary mb-1">
                    Need Help?
                  </h3>
                  <p className="text-sm text-foreground-secondary">
                    Can't find what you're looking for? Our support team is here to help you navigate the platform.
                  </p>
                </div>
              </div>
              <Button
                onClick={handleSupportClick}
                className="w-full md:w-auto flex items-center justify-center gap-2 bg-primary text-primary-foreground hover:bg-primary/90 hover:scale-[1.02] transition-all duration-200 whitespace-nowrap"
              >
                <HelpCircle className="h-4 w-4" />
                Contact Support
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Quick Links */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
          <Link
            to="/library"
            className="p-4 rounded-lg bg-card border border-border hover:shadow-card-hover hover:-translate-y-0.5 transition-all duration-200 text-center group"
          >
            <p className="text-sm font-medium text-foreground-primary group-hover:text-primary transition-colors">
              Content Library
            </p>
          </Link>
          <Link
            to="/courses"
            className="p-4 rounded-lg bg-card border border-border hover:shadow-card-hover hover:-translate-y-0.5 transition-all duration-200 text-center group"
          >
            <p className="text-sm font-medium text-foreground-primary group-hover:text-primary transition-colors">
              Courses
            </p>
          </Link>
          <Link
            to="/help"
            className="p-4 rounded-lg bg-card border border-border hover:shadow-card-hover hover:-translate-y-0.5 transition-all duration-200 text-center group"
          >
            <p className="text-sm font-medium text-foreground-primary group-hover:text-primary transition-colors">
              Help Center
            </p>
          </Link>
          <Link
            to="/settings"
            className="p-4 rounded-lg bg-card border border-border hover:shadow-card-hover hover:-translate-y-0.5 transition-all duration-200 text-center group"
          >
            <p className="text-sm font-medium text-foreground-primary group-hover:text-primary transition-colors">
              Settings
            </p>
          </Link>
        </div>
      </div>
    </div>
  );
}
