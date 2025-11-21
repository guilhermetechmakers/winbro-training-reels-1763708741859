import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { Link } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  FileText,
  Shield,
  Mail,
  ExternalLink,
  CheckCircle2,
  Clock,
  AlertCircle,
  ChevronRight,
} from "lucide-react";
import { privacyApi } from "@/lib/api";
import type { PrivacyPolicy, DataSubjectRequest } from "@/types";
import { cn } from "@/lib/utils";

// Form validation schemas
const dataRequestFormSchema = z.object({
  request_type: z.enum(["access", "correction", "deletion"], {
    required_error: "Please select a request type",
  }),
  description: z.string().optional(),
});

const privacyInquiryFormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  message: z.string().min(10, "Message must be at least 10 characters"),
});

type DataRequestFormData = z.infer<typeof dataRequestFormSchema>;
type PrivacyInquiryFormData = z.infer<typeof privacyInquiryFormSchema>;

export default function PrivacyPolicyPage() {
  const [showDataRequestModal, setShowDataRequestModal] = useState(false);
  const [showInquiryModal, setShowInquiryModal] = useState(false);
  const [activeSection, setActiveSection] = useState<string | null>(null);

  // Fetch privacy policy
  const { data: privacyPolicy, isLoading: policyLoading } = useQuery<PrivacyPolicy>({
    queryKey: ["privacy-policy"],
    queryFn: () => privacyApi.getPrivacyPolicy(),
  });

  // Fetch user's data requests
  const { data: dataRequests = [] } = useQuery<DataSubjectRequest[]>({
    queryKey: ["data-requests"],
    queryFn: () => privacyApi.getDataRequests(),
  });

  // Submit data request mutation
  const submitDataRequestMutation = useMutation({
    mutationFn: (data: DataRequestFormData) => privacyApi.submitDataRequest(data),
    onSuccess: () => {
      toast.success("Data request submitted successfully!");
      setShowDataRequestModal(false);
      resetDataRequest();
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to submit data request");
    },
  });

  // Submit privacy inquiry mutation
  const submitInquiryMutation = useMutation({
    mutationFn: (data: PrivacyInquiryFormData) => privacyApi.sendPrivacyInquiry(data),
    onSuccess: () => {
      toast.success("Privacy inquiry sent successfully!");
      setShowInquiryModal(false);
      resetInquiry();
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to send inquiry");
    },
  });

  // Data request form
  const {
    register: registerDataRequest,
    handleSubmit: handleSubmitDataRequest,
    formState: { errors: dataRequestErrors, isSubmitting: isSubmittingDataRequest },
    reset: resetDataRequest,
    setValue: setDataRequestValue,
    watch: watchDataRequest,
  } = useForm<DataRequestFormData>({
    resolver: zodResolver(dataRequestFormSchema),
  });

  // Privacy inquiry form
  const {
    register: registerInquiry,
    handleSubmit: handleSubmitInquiry,
    formState: { errors: inquiryErrors, isSubmitting: isSubmittingInquiry },
    reset: resetInquiry,
  } = useForm<PrivacyInquiryFormData>({
    resolver: zodResolver(privacyInquiryFormSchema),
  });

  // Handle smooth scroll to section
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      const offset = 100; // Account for fixed header
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      });
      setActiveSection(sectionId);
    }
  };

  // Track active section on scroll
  useEffect(() => {
    const handleScroll = () => {
      const sections = privacyPolicy?.sections || [];
      const scrollPosition = window.scrollY + 150;

      for (let i = sections.length - 1; i >= 0; i--) {
        const section = sections[i];
        const element = document.getElementById(section.section_id);
        if (element) {
          const offsetTop = element.offsetTop;
          if (scrollPosition >= offsetTop) {
            setActiveSection(section.section_id);
            break;
          }
        }
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [privacyPolicy]);

  // Handle data request submission
  const onDataRequestSubmit = (data: DataRequestFormData) => {
    submitDataRequestMutation.mutate(data);
  };

  // Handle privacy inquiry submission
  const onInquirySubmit = (data: PrivacyInquiryFormData) => {
    submitInquiryMutation.mutate(data);
  };

  // Get status badge for data requests
  const getStatusBadge = (status: DataSubjectRequest["request_status"]) => {
    switch (status) {
      case "completed":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium bg-success text-white">
            <CheckCircle2 className="h-3 w-3" />
            Completed
          </span>
        );
      case "in_progress":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium bg-primary text-white">
            <Clock className="h-3 w-3" />
            In Progress
          </span>
        );
      case "rejected":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium bg-red-500 text-white">
            <AlertCircle className="h-3 w-3" />
            Rejected
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium bg-muted text-muted-foreground">
            <Clock className="h-3 w-3" />
            Pending
          </span>
        );
    }
  };

  // Get request type label
  const getRequestTypeLabel = (type: DataSubjectRequest["request_type"]) => {
    switch (type) {
      case "access":
        return "Data Access";
      case "correction":
        return "Data Correction";
      case "deletion":
        return "Data Deletion";
      default:
        return type;
    }
  };

  // Default privacy policy content if API doesn't return data
  const defaultSections = [
    {
      section_id: "introduction",
      section_title: "Introduction",
      content: `<p>Welcome to Winbro Training Reels. We are committed to protecting your privacy and ensuring the security of your personal information. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our platform.</p>
        <p>By using Winbro Training Reels, you agree to the collection and use of information in accordance with this policy. If you do not agree with our policies and practices, please do not use our services.</p>`,
      order: 1,
      last_updated: new Date().toISOString(),
    },
    {
      section_id: "data-collection",
      section_title: "Data Collection",
      content: `<p>We collect information that you provide directly to us, including:</p>
        <ul>
          <li><strong>Account Information:</strong> Name, email address, company name, and role when you create an account</li>
          <li><strong>Usage Data:</strong> Information about how you interact with our platform, including videos watched, courses completed, and quiz results</li>
          <li><strong>Content Data:</strong> Videos, transcripts, and metadata that you upload or create</li>
          <li><strong>Payment Information:</strong> Billing details and payment method information processed through secure third-party payment processors</li>
          <li><strong>Device Information:</strong> IP address, browser type, device identifiers, and operating system</li>
        </ul>`,
      order: 2,
      last_updated: new Date().toISOString(),
    },
    {
      section_id: "data-usage",
      section_title: "Data Usage",
      content: `<p>We use the information we collect to:</p>
        <ul>
          <li>Provide, maintain, and improve our services</li>
          <li>Process transactions and manage subscriptions</li>
          <li>Send you technical notices, updates, and support messages</li>
          <li>Respond to your comments, questions, and requests</li>
          <li>Monitor and analyze usage patterns and trends</li>
          <li>Detect, prevent, and address technical issues and security threats</li>
          <li>Personalize your experience and provide content recommendations</li>
          <li>Comply with legal obligations and enforce our terms of service</li>
        </ul>`,
      order: 3,
      last_updated: new Date().toISOString(),
    },
    {
      section_id: "data-sharing",
      section_title: "Data Sharing",
      content: `<p>We do not sell your personal information. We may share your information only in the following circumstances:</p>
        <ul>
          <li><strong>Service Providers:</strong> With trusted third-party service providers who assist us in operating our platform, such as cloud hosting, payment processing, and analytics services</li>
          <li><strong>Legal Requirements:</strong> When required by law, court order, or government regulation</li>
          <li><strong>Business Transfers:</strong> In connection with a merger, acquisition, or sale of assets, with notice to users</li>
          <li><strong>With Your Consent:</strong> When you explicitly authorize us to share your information</li>
          <li><strong>Tenant-Scoped Content:</strong> Content and usage data are scoped to your organization and not shared with other tenants</li>
        </ul>`,
      order: 4,
      last_updated: new Date().toISOString(),
    },
    {
      section_id: "user-rights",
      section_title: "Your Rights",
      content: `<p>You have the following rights regarding your personal information:</p>
        <ul>
          <li><strong>Access:</strong> Request a copy of the personal data we hold about you</li>
          <li><strong>Correction:</strong> Request correction of inaccurate or incomplete data</li>
          <li><strong>Deletion:</strong> Request deletion of your personal data, subject to legal and contractual obligations</li>
          <li><strong>Portability:</strong> Request transfer of your data to another service provider</li>
          <li><strong>Objection:</strong> Object to processing of your data for certain purposes</li>
          <li><strong>Restriction:</strong> Request restriction of processing in certain circumstances</li>
        </ul>
        <p>To exercise these rights, please use the data request forms below or contact our privacy team directly.</p>`,
      order: 5,
      last_updated: new Date().toISOString(),
    },
    {
      section_id: "data-security",
      section_title: "Data Security",
      content: `<p>We implement appropriate technical and organizational measures to protect your personal information:</p>
        <ul>
          <li>Encryption of data in transit using TLS/SSL</li>
          <li>Encryption of sensitive data at rest</li>
          <li>Regular security assessments and penetration testing</li>
          <li>Access controls and authentication mechanisms</li>
          <li>Regular backups and disaster recovery procedures</li>
          <li>Employee training on data protection and privacy</li>
        </ul>
        <p>However, no method of transmission over the internet or electronic storage is 100% secure. While we strive to use commercially acceptable means to protect your information, we cannot guarantee absolute security.</p>`,
      order: 6,
      last_updated: new Date().toISOString(),
    },
    {
      section_id: "data-retention",
      section_title: "Data Retention",
      content: `<p>We retain your personal information for as long as necessary to:</p>
        <ul>
          <li>Provide our services to you</li>
          <li>Comply with legal obligations</li>
          <li>Resolve disputes and enforce agreements</li>
          <li>Maintain security and prevent fraud</li>
        </ul>
        <p>When you request account deletion, we will delete or anonymize your personal data within 30 days, except where we are required to retain it for legal or regulatory purposes.</p>`,
      order: 7,
      last_updated: new Date().toISOString(),
    },
    {
      section_id: "cookies",
      section_title: "Cookies and Tracking",
      content: `<p>We use cookies and similar tracking technologies to:</p>
        <ul>
          <li>Remember your preferences and settings</li>
          <li>Analyze how you use our platform</li>
          <li>Provide personalized content and advertisements</li>
          <li>Improve our services and user experience</li>
        </ul>
        <p>You can control cookies through your browser settings. However, disabling cookies may limit your ability to use certain features of our platform.</p>`,
      order: 8,
      last_updated: new Date().toISOString(),
    },
    {
      section_id: "children-privacy",
      section_title: "Children's Privacy",
      content: `<p>Our services are not intended for individuals under the age of 18. We do not knowingly collect personal information from children. If you believe we have collected information from a child, please contact us immediately, and we will take steps to delete such information.</p>`,
      order: 9,
      last_updated: new Date().toISOString(),
    },
    {
      section_id: "changes",
      section_title: "Changes to This Policy",
      content: `<p>We may update this Privacy Policy from time to time. We will notify you of any material changes by:</p>
        <ul>
          <li>Posting the new Privacy Policy on this page</li>
          <li>Updating the "Last Updated" date</li>
          <li>Sending you an email notification (for significant changes)</li>
          <li>Displaying a notice on our platform</li>
        </ul>
        <p>You are advised to review this Privacy Policy periodically for any changes. Changes are effective when posted on this page.</p>`,
      order: 10,
      last_updated: new Date().toISOString(),
    },
  ];

  const sections = privacyPolicy?.sections || defaultSections;
  const sortedSections = [...sections].sort((a, b) => a.order - b.order);

  return (
    <div className="min-h-screen bg-background-primary">
      <div className="container mx-auto px-6 py-8 max-w-5xl">
        {/* Header */}
        <div className="mb-8 animate-fade-in-up">
          <div className="flex items-center gap-3 mb-4">
            <Shield className="h-8 w-8 text-primary" />
            <h1 className="text-4xl font-bold text-foreground-primary">
              Privacy Policy
            </h1>
          </div>
          <p className="text-lg text-foreground-secondary">
            Last Updated:{" "}
            {privacyPolicy?.last_updated
              ? new Date(privacyPolicy.last_updated).toLocaleDateString()
              : new Date().toLocaleDateString()}
          </p>
        </div>

        <div className="grid lg:grid-cols-4 gap-8">
          {/* Table of Contents Sidebar */}
          <div className="lg:col-span-1">
            <Card className="sticky top-8">
              <CardHeader>
                <CardTitle className="text-lg">Table of Contents</CardTitle>
              </CardHeader>
              <CardContent>
                <nav className="space-y-2">
                  {sortedSections.map((section) => (
                    <button
                      key={section.section_id}
                      onClick={() => scrollToSection(section.section_id)}
                      className={cn(
                        "w-full text-left px-3 py-2 rounded-lg text-sm transition-colors duration-150 flex items-center justify-between group",
                        activeSection === section.section_id
                          ? "bg-muted font-semibold text-foreground-primary"
                          : "text-foreground-secondary hover:bg-muted/50 hover:text-foreground-primary"
                      )}
                    >
                      <span>{section.section_title}</span>
                      <ChevronRight
                        className={cn(
                          "h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity",
                          activeSection === section.section_id && "opacity-100"
                        )}
                      />
                    </button>
                  ))}
                </nav>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3 space-y-8">
            {/* Policy Content */}
            <Card className="animate-fade-in-up">
              <CardContent className="pt-6">
                {policyLoading ? (
                  <div className="space-y-4">
                    {[1, 2, 3, 4].map((i) => (
                      <div
                        key={i}
                        className="h-32 bg-muted animate-pulse rounded-lg"
                      />
                    ))}
                  </div>
                ) : (
                  <div className="prose prose-sm max-w-none">
                    {sortedSections.map((section, index) => (
                      <section
                        key={section.section_id}
                        id={section.section_id}
                        className={cn(
                          "mb-12 scroll-mt-24",
                          index === 0 && "mt-0"
                        )}
                      >
                        <h2 className="text-2xl font-bold text-foreground-primary mb-4">
                          {section.section_title}
                        </h2>
                        <div
                          className="text-foreground-secondary leading-relaxed"
                          dangerouslySetInnerHTML={{ __html: section.content }}
                        />
                      </section>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Data Subject Request Section */}
            <Card className="animate-fade-in-up">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-primary" />
                  <CardTitle>Your Data Rights</CardTitle>
                </div>
                <CardDescription>
                  Exercise your rights to access, correct, or delete your personal
                  data
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-3 gap-4">
                  <Button
                    variant="outline"
                    className="h-auto flex-col items-start p-4 hover:border-primary hover:bg-primary/5 transition-colors"
                    onClick={() => {
                      setDataRequestValue("request_type", "access");
                      setShowDataRequestModal(true);
                    }}
                  >
                    <FileText className="h-5 w-5 mb-2 text-primary" />
                    <span className="font-semibold">Request Data Access</span>
                    <span className="text-xs text-foreground-secondary mt-1">
                      Get a copy of your data
                    </span>
                  </Button>
                  <Button
                    variant="outline"
                    className="h-auto flex-col items-start p-4 hover:border-primary hover:bg-primary/5 transition-colors"
                    onClick={() => {
                      setDataRequestValue("request_type", "correction");
                      setShowDataRequestModal(true);
                    }}
                  >
                    <FileText className="h-5 w-5 mb-2 text-primary" />
                    <span className="font-semibold">Request Correction</span>
                    <span className="text-xs text-foreground-secondary mt-1">
                      Update inaccurate data
                    </span>
                  </Button>
                  <Button
                    variant="outline"
                    className="h-auto flex-col items-start p-4 hover:border-primary hover:bg-primary/5 transition-colors"
                    onClick={() => {
                      setDataRequestValue("request_type", "deletion");
                      setShowDataRequestModal(true);
                    }}
                  >
                    <FileText className="h-5 w-5 mb-2 text-primary" />
                    <span className="font-semibold">Request Deletion</span>
                    <span className="text-xs text-foreground-secondary mt-1">
                      Delete your account data
                    </span>
                  </Button>
                </div>

                {/* Existing Data Requests */}
                {dataRequests.length > 0 && (
                  <div className="mt-6 pt-6 border-t border-border">
                    <h3 className="font-semibold text-foreground-primary mb-4">
                      Your Data Requests
                    </h3>
                    <div className="space-y-3">
                      {dataRequests.map((request) => (
                        <div
                          key={request.request_id}
                          className="p-4 border border-border rounded-lg hover:border-primary/50 transition-colors"
                        >
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-medium text-foreground-primary">
                              {getRequestTypeLabel(request.request_type)}
                            </span>
                            {getStatusBadge(request.request_status)}
                          </div>
                          <div className="flex items-center gap-4 text-sm text-foreground-secondary">
                            <span>
                              Submitted:{" "}
                              {new Date(request.request_date).toLocaleDateString()}
                            </span>
                            {request.completion_date && (
                              <span>
                                Completed:{" "}
                                {new Date(
                                  request.completion_date
                                ).toLocaleDateString()}
                              </span>
                            )}
                          </div>
                          {request.description && (
                            <p className="text-sm text-foreground-secondary mt-2">
                              {request.description}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Contact Section */}
            <Card className="animate-fade-in-up">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Mail className="h-5 w-5 text-primary" />
                  <CardTitle>Contact Us</CardTitle>
                </div>
                <CardDescription>
                  Have questions about our privacy practices? We're here to help.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <p className="text-foreground-secondary">
                    For privacy-related inquiries, you can:
                  </p>
                  <ul className="list-disc list-inside space-y-1 text-foreground-secondary ml-4">
                    <li>Email us at{" "}
                      <a
                        href="mailto:privacy@winbro.com"
                        className="text-primary hover:underline inline-flex items-center gap-1"
                      >
                        privacy@winbro.com
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </li>
                    <li>Submit a privacy inquiry using the form below</li>
                    <li>Contact our support team through the Help page</li>
                  </ul>
                </div>
                <Button
                  variant="outline"
                  onClick={() => setShowInquiryModal(true)}
                  className="w-full"
                >
                  <Mail className="h-4 w-4 mr-2" />
                  Send Privacy Inquiry
                </Button>
              </CardContent>
            </Card>

            {/* Footer Navigation */}
            <div className="flex flex-wrap gap-4 text-sm text-foreground-secondary animate-fade-in-up">
              <Link
                to="/help"
                className="hover:text-foreground-primary transition-colors"
              >
                Help & Support
              </Link>
              <span>•</span>
              <Link
                to="/terms"
                className="hover:text-foreground-primary transition-colors"
              >
                Terms of Service
              </Link>
              <span>•</span>
              <Link
                to="/"
                className="hover:text-foreground-primary transition-colors"
              >
                Home
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Data Request Modal */}
      <Dialog open={showDataRequestModal} onOpenChange={setShowDataRequestModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Submit Data Request</DialogTitle>
            <DialogDescription>
              Please select the type of data request you would like to submit.
              We will process your request within 30 days as required by law.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmitDataRequest(onDataRequestSubmit)}>
            <div className="space-y-6 py-4">
              <div className="space-y-2">
                <Label htmlFor="request_type">Request Type *</Label>
                <Select
                  value={watchDataRequest("request_type")}
                  onValueChange={(value) =>
                    setDataRequestValue("request_type", value as any)
                  }
                >
                  <SelectTrigger
                    id="request_type"
                    className={cn(
                      dataRequestErrors.request_type && "border-red-500"
                    )}
                  >
                    <SelectValue placeholder="Select request type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="access">Data Access</SelectItem>
                    <SelectItem value="correction">Data Correction</SelectItem>
                    <SelectItem value="deletion">Data Deletion</SelectItem>
                  </SelectContent>
                </Select>
                {dataRequestErrors.request_type && (
                  <p className="text-sm text-red-500">
                    {dataRequestErrors.request_type.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">
                  Additional Details (Optional)
                </Label>
                <Textarea
                  id="description"
                  {...registerDataRequest("description")}
                  placeholder="Provide any additional context or specific information about your request..."
                  rows={5}
                  className={cn(
                    dataRequestErrors.description && "border-red-500"
                  )}
                />
                {dataRequestErrors.description && (
                  <p className="text-sm text-red-500">
                    {dataRequestErrors.description.message}
                  </p>
                )}
              </div>

              <div className="bg-muted/50 p-4 rounded-lg">
                <p className="text-sm text-foreground-secondary">
                  <strong>What to expect:</strong>
                </p>
                <ul className="text-sm text-foreground-secondary mt-2 space-y-1 list-disc list-inside ml-2">
                  <li>
                    We will acknowledge your request within 5 business days
                  </li>
                  <li>
                    We will process your request within 30 days (or notify you
                    if we need more time)
                  </li>
                  <li>
                    You will receive updates via email about the status of your
                    request
                  </li>
                </ul>
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowDataRequestModal(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={
                  isSubmittingDataRequest ||
                  submitDataRequestMutation.isPending
                }
              >
                {isSubmittingDataRequest ||
                submitDataRequestMutation.isPending ? (
                  <>
                    <Clock className="h-4 w-4 mr-2 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <FileText className="h-4 w-4 mr-2" />
                    Submit Request
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Privacy Inquiry Modal */}
      <Dialog open={showInquiryModal} onOpenChange={setShowInquiryModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Contact Privacy Team</DialogTitle>
            <DialogDescription>
              Send us a message about privacy concerns or questions. We'll get
              back to you as soon as possible.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmitInquiry(onInquirySubmit)}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="inquiry-name">Name *</Label>
                <Input
                  id="inquiry-name"
                  {...registerInquiry("name")}
                  placeholder="Your name"
                  className={cn(inquiryErrors.name && "border-red-500")}
                />
                {inquiryErrors.name && (
                  <p className="text-sm text-red-500">
                    {inquiryErrors.name.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="inquiry-email">Email *</Label>
                <Input
                  id="inquiry-email"
                  type="email"
                  {...registerInquiry("email")}
                  placeholder="your.email@example.com"
                  className={cn(inquiryErrors.email && "border-red-500")}
                />
                {inquiryErrors.email && (
                  <p className="text-sm text-red-500">
                    {inquiryErrors.email.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="inquiry-message">Message *</Label>
                <Textarea
                  id="inquiry-message"
                  {...registerInquiry("message")}
                  placeholder="Describe your privacy concern or question..."
                  rows={6}
                  className={cn(inquiryErrors.message && "border-red-500")}
                />
                {inquiryErrors.message && (
                  <p className="text-sm text-red-500">
                    {inquiryErrors.message.message}
                  </p>
                )}
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowInquiryModal(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={
                  isSubmittingInquiry || submitInquiryMutation.isPending
                }
              >
                {isSubmittingInquiry || submitInquiryMutation.isPending ? (
                  <>
                    <Clock className="h-4 w-4 mr-2 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Mail className="h-4 w-4 mr-2" />
                    Send Inquiry
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
