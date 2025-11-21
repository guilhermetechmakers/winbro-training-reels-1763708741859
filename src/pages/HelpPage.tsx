import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  HelpCircle,
  MessageSquare,
  Video,
  CheckCircle2,
  Circle,
  AlertCircle,
  Clock,
  FileText,
  X,
  ExternalLink,
} from "lucide-react";
import { helpApi } from "@/lib/api";
import type {
  FAQ,
  UserGuide,
  VideoTutorial,
  ReleaseNote,
  SystemStatus,
  OnboardingChecklistItem,
} from "@/types";
import { cn } from "@/lib/utils";

// Form validation schema
const supportFormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  message: z.string().min(10, "Message must be at least 10 characters"),
});

type SupportFormData = z.infer<typeof supportFormSchema>;

export default function HelpPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>();
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const queryClient = useQueryClient();

  // Fetch FAQs
  const { data: faqs = [], isLoading: faqsLoading } = useQuery<FAQ[]>({
    queryKey: ["faqs", selectedCategory],
    queryFn: () => helpApi.getFAQs(selectedCategory),
  });

  // Search FAQs
  const { data: searchResults = [] } = useQuery<FAQ[]>({
    queryKey: ["faqs-search", searchQuery],
    queryFn: () => helpApi.searchFAQs(searchQuery),
    enabled: searchQuery.length > 2,
  });

  // Fetch FAQ categories
  const { data: categories = [] } = useQuery<string[]>({
    queryKey: ["faq-categories"],
    queryFn: () => helpApi.getFAQCategories(),
  });

  // Fetch user guides
  const { data: guides = [] } = useQuery<UserGuide[]>({
    queryKey: ["user-guides", selectedCategory],
    queryFn: () => helpApi.getUserGuides(selectedCategory),
  });

  // Fetch video tutorials
  const { data: tutorials = [] } = useQuery<VideoTutorial[]>({
    queryKey: ["video-tutorials"],
    queryFn: () => helpApi.getVideoTutorials(),
  });

  // Fetch onboarding checklist
  const { data: checklist = [] } = useQuery<OnboardingChecklistItem[]>({
    queryKey: ["onboarding-checklist"],
    queryFn: () => helpApi.getOnboardingChecklist(),
  });

  // Fetch system status
  const { data: systemStatus } = useQuery<SystemStatus>({
    queryKey: ["system-status"],
    queryFn: () => helpApi.getSystemStatus(),
    refetchInterval: 60000, // Refetch every minute
  });

  // Fetch release notes
  const { data: releaseNotes = [] } = useQuery<ReleaseNote[]>({
    queryKey: ["release-notes"],
    queryFn: () => helpApi.getReleaseNotes(10),
  });

  // Update checklist item mutation
  const updateChecklistMutation = useMutation({
    mutationFn: ({ itemId, completed }: { itemId: string; completed: boolean }) =>
      helpApi.updateOnboardingChecklistItem(itemId, completed),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["onboarding-checklist"] });
    },
  });

  // Submit support ticket mutation
  const submitTicketMutation = useMutation({
    mutationFn: (data: SupportFormData & { attachment?: File }) =>
      helpApi.submitSupportTicket({
        name: data.name,
        email: data.email,
        message: data.message,
        attachment: data.attachment,
      }),
    onSuccess: () => {
      toast.success("Support ticket submitted successfully!");
      setShowSuccessDialog(true);
      reset();
      setSelectedFile(null);
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to submit support ticket");
    },
  });

  // Form setup
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<SupportFormData>({
    resolver: zodResolver(supportFormSchema),
  });

  // Filter FAQs based on search
  const displayedFAQs = useMemo(() => {
    if (searchQuery.length > 2) {
      return searchResults;
    }
    return faqs;
  }, [searchQuery, searchResults, faqs]);

  // Handle file selection
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        toast.error("File size must be less than 10MB");
        return;
      }
      setSelectedFile(file);
    }
  };

  // Handle form submission
  const onSubmit = (data: SupportFormData) => {
    submitTicketMutation.mutate({
      ...data,
      attachment: selectedFile || undefined,
    });
  };

  // Get status badge color
  const getStatusColor = (status: SystemStatus["current_status"]) => {
    switch (status) {
      case "operational":
        return "bg-success text-white";
      case "degraded":
        return "bg-yellow-500 text-white";
      case "down":
        return "bg-red-500 text-white";
      case "maintenance":
        return "bg-blue-500 text-white";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  return (
    <div className="space-y-8 animate-fade-in-up">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground-primary mb-2">
          Help & Support
        </h1>
        <p className="text-foreground-secondary">
          Find answers, get help, and learn how to use Winbro Training Reels
        </p>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-foreground-secondary" />
        <Input
          type="search"
          placeholder="Search FAQ, guides, tutorials..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 h-12 text-base"
        />
      </div>

      {/* FAQ Categories Filter */}
      {categories.length > 0 && (
        <div className="flex flex-wrap gap-2">
          <Button
            variant={selectedCategory === undefined ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedCategory(undefined)}
          >
            All
          </Button>
          {categories.map((category) => (
            <Button
              key={category}
              variant={selectedCategory === category ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(category)}
            >
              {category}
            </Button>
          ))}
        </div>
      )}

      {/* FAQs Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <HelpCircle className="h-5 w-5 text-primary" />
            <CardTitle>Frequently Asked Questions</CardTitle>
          </div>
          <CardDescription>
            Find quick answers to common questions
          </CardDescription>
        </CardHeader>
        <CardContent>
          {faqsLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-16 bg-muted animate-pulse rounded-lg" />
              ))}
            </div>
          ) : displayedFAQs.length === 0 ? (
            <div className="text-center py-12">
              <HelpCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-foreground-secondary">
                {searchQuery.length > 2
                  ? "No FAQs found matching your search"
                  : "No FAQs available"}
              </p>
            </div>
          ) : (
            <Accordion type="single" collapsible className="w-full">
              {displayedFAQs.map((faq) => (
                <AccordionItem key={faq.question_id} value={faq.question_id}>
                  <AccordionTrigger className="text-left">
                    {faq.question_text}
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="prose prose-sm max-w-none text-foreground-secondary">
                      {faq.answer_text}
                    </div>
                    {faq.category && (
                      <Badge variant="outline" className="mt-4">
                        {faq.category}
                      </Badge>
                    )}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          )}
        </CardContent>
      </Card>

      {/* User Guides Section */}
      {guides.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              <CardTitle>User Guides</CardTitle>
            </div>
            <CardDescription>
              Step-by-step guides to help you get started
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {guides.map((guide) => (
                <div
                  key={guide.guide_id}
                  className="p-4 border border-border rounded-lg hover:border-primary/50 transition-colors"
                >
                  <h3 className="font-semibold text-foreground-primary mb-2">
                    {guide.title}
                  </h3>
                  <p className="text-sm text-foreground-secondary line-clamp-2">
                    {guide.content}
                  </p>
                  {guide.category && (
                    <Badge variant="outline" className="mt-2">
                      {guide.category}
                    </Badge>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Contact/Support Form Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-primary" />
            <CardTitle>Contact Support</CardTitle>
          </div>
          <CardDescription>
            Need help? Send us a message and we'll get back to you soon
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                {...register("name")}
                placeholder="Your name"
                className={cn(errors.name && "border-red-500")}
              />
              {errors.name && (
                <p className="text-sm text-red-500">{errors.name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                {...register("email")}
                placeholder="your.email@example.com"
                className={cn(errors.email && "border-red-500")}
              />
              {errors.email && (
                <p className="text-sm text-red-500">{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="message">Message</Label>
              <Textarea
                id="message"
                {...register("message")}
                placeholder="Describe your issue or question..."
                rows={6}
                className={cn(errors.message && "border-red-500")}
              />
              {errors.message && (
                <p className="text-sm text-red-500">{errors.message.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="attachment">Attachment (Optional)</Label>
              <div className="flex items-center gap-4">
                <Input
                  id="attachment"
                  type="file"
                  onChange={handleFileSelect}
                  accept=".pdf,.doc,.docx,.txt,.png,.jpg,.jpeg"
                  className="cursor-pointer"
                />
                {selectedFile && (
                  <div className="flex items-center gap-2 text-sm text-foreground-secondary">
                    <FileText className="h-4 w-4" />
                    <span>{selectedFile.name}</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => setSelectedFile(null)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
              <p className="text-xs text-foreground-secondary">
                Maximum file size: 10MB. Supported formats: PDF, DOC, DOCX, TXT, PNG, JPG, JPEG
              </p>
            </div>

            <Button
              type="submit"
              disabled={isSubmitting || submitTicketMutation.isPending}
              className="w-full"
            >
              {isSubmitting || submitTicketMutation.isPending ? (
                <>
                  <Clock className="h-4 w-4 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Submit Support Request
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Video Tutorials Section */}
      {tutorials.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Video className="h-5 w-5 text-primary" />
              <CardTitle>Video Tutorials</CardTitle>
            </div>
            <CardDescription>
              Watch step-by-step video guides
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              {tutorials.map((tutorial) => (
                <div
                  key={tutorial.video_id}
                  className="border border-border rounded-lg overflow-hidden hover:border-primary/50 transition-colors"
                >
                  {tutorial.thumbnail_url ? (
                    <img
                      src={tutorial.thumbnail_url}
                      alt={tutorial.title}
                      className="w-full h-48 object-cover"
                    />
                  ) : (
                    <div className="w-full h-48 bg-muted flex items-center justify-center">
                      <Video className="h-12 w-12 text-muted-foreground" />
                    </div>
                  )}
                  <div className="p-4">
                    <h3 className="font-semibold text-foreground-primary mb-2">
                      {tutorial.title}
                    </h3>
                    <p className="text-sm text-foreground-secondary mb-3 line-clamp-2">
                      {tutorial.description}
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(tutorial.video_url, "_blank")}
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Watch Video
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Onboarding Checklist Section */}
      {checklist.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-primary" />
              <CardTitle>Onboarding Checklist</CardTitle>
            </div>
            <CardDescription>
              Complete these steps to get the most out of Winbro Training Reels
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {checklist
                .sort((a, b) => a.order - b.order)
                .map((item) => (
                  <div
                    key={item.id}
                    className="flex items-start gap-3 p-4 border border-border rounded-lg hover:border-primary/50 transition-colors"
                  >
                    <button
                      onClick={() =>
                        updateChecklistMutation.mutate({
                          itemId: item.id,
                          completed: !item.completed,
                        })
                      }
                      className="mt-0.5"
                    >
                      {item.completed ? (
                        <CheckCircle2 className="h-5 w-5 text-success" />
                      ) : (
                        <Circle className="h-5 w-5 text-muted-foreground" />
                      )}
                    </button>
                    <div className="flex-1">
                      <h3
                        className={cn(
                          "font-medium mb-1",
                          item.completed
                            ? "text-foreground-secondary line-through"
                            : "text-foreground-primary"
                        )}
                      >
                        {item.title}
                      </h3>
                      <p className="text-sm text-foreground-secondary">
                        {item.description}
                      </p>
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* System Status Section */}
      {systemStatus && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-primary" />
                <CardTitle>System Status</CardTitle>
              </div>
              <Badge className={getStatusColor(systemStatus.current_status)}>
                {systemStatus.current_status.toUpperCase()}
              </Badge>
            </div>
            {systemStatus.message && (
              <CardDescription>{systemStatus.message}</CardDescription>
            )}
          </CardHeader>
          {systemStatus.incidents && systemStatus.incidents.length > 0 && (
            <CardContent>
              <div className="space-y-3">
                {systemStatus.incidents.map((incident) => (
                  <div
                    key={incident.id}
                    className="p-4 border border-border rounded-lg"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-semibold text-foreground-primary">
                        {incident.title}
                      </h3>
                      <Badge
                        variant="outline"
                        className={cn(
                          incident.severity === "critical" && "border-red-500 text-red-500",
                          incident.severity === "major" && "border-orange-500 text-orange-500",
                          incident.severity === "minor" && "border-yellow-500 text-yellow-500"
                        )}
                      >
                        {incident.severity}
                      </Badge>
                    </div>
                    <p className="text-sm text-foreground-secondary mb-2">
                      {incident.description}
                    </p>
                    <div className="flex items-center gap-4 text-xs text-foreground-secondary">
                      <span>Status: {incident.status}</span>
                      <span>
                        Started: {new Date(incident.started_at).toLocaleString()}
                      </span>
                      {incident.resolved_at && (
                        <span>
                          Resolved: {new Date(incident.resolved_at).toLocaleString()}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          )}
        </Card>
      )}

      {/* Release Notes Section */}
      {releaseNotes.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              <CardTitle>Release Notes</CardTitle>
            </div>
            <CardDescription>
              Stay updated with the latest features and improvements
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {releaseNotes.map((release) => (
                <div
                  key={release.release_id}
                  className="border-l-2 border-primary pl-4 pb-4"
                >
                  <div className="flex items-center gap-3 mb-2">
                    <Badge variant="outline">v{release.version}</Badge>
                    <span className="text-sm text-foreground-secondary">
                      {new Date(release.date).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-foreground-primary mb-3">{release.description}</p>
                  {release.features && release.features.length > 0 && (
                    <div className="mb-3">
                      <h4 className="text-sm font-semibold text-foreground-primary mb-2">
                        New Features
                      </h4>
                      <ul className="list-disc list-inside space-y-1 text-sm text-foreground-secondary">
                        {release.features.map((feature, idx) => (
                          <li key={idx}>{feature}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {release.improvements && release.improvements.length > 0 && (
                    <div className="mb-3">
                      <h4 className="text-sm font-semibold text-foreground-primary mb-2">
                        Improvements
                      </h4>
                      <ul className="list-disc list-inside space-y-1 text-sm text-foreground-secondary">
                        {release.improvements.map((improvement, idx) => (
                          <li key={idx}>{improvement}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {release.bug_fixes && release.bug_fixes.length > 0 && (
                    <div>
                      <h4 className="text-sm font-semibold text-foreground-primary mb-2">
                        Bug Fixes
                      </h4>
                      <ul className="list-disc list-inside space-y-1 text-sm text-foreground-secondary">
                        {release.bug_fixes.map((fix, idx) => (
                          <li key={idx}>{fix}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Success Dialog */}
      <Dialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Support Request Submitted</DialogTitle>
            <DialogDescription>
              Thank you for contacting us! We've received your support request and
              will get back to you as soon as possible. You should receive a
              confirmation email shortly.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={() => setShowSuccessDialog(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
