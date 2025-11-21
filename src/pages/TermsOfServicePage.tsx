import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  FileText,
  ChevronRight,
} from "lucide-react";
import { termsApi } from "@/lib/api";
import type { TermsOfService } from "@/types";
import { cn } from "@/lib/utils";

export default function TermsOfServicePage() {
  const [activeSection, setActiveSection] = useState<string | null>(null);

  // Fetch terms of service
  const { data: terms, isLoading: termsLoading } = useQuery<TermsOfService>({
    queryKey: ["terms-of-service"],
    queryFn: () => termsApi.getTermsOfService(),
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
      const sections = terms?.sections || [];
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
  }, [terms]);

  // Default terms content if API doesn't return data
  const defaultSections = [
    {
      section_id: "introduction",
      section_title: "Introduction",
      content: `<p>Welcome to Winbro Training Reels. These Terms of Service ("Terms") govern your access to and use of our micro-learning platform, including our website, mobile applications, and related services (collectively, the "Service").</p>
        <p>By accessing or using the Service, you agree to be bound by these Terms. If you disagree with any part of these Terms, you may not access or use the Service.</p>
        <p>These Terms constitute a legally binding agreement between you and Winbro Training Reels. Please read them carefully.</p>`,
      order: 1,
      last_updated: new Date().toISOString(),
    },
    {
      section_id: "acceptance",
      section_title: "Acceptance of Terms",
      content: `<p>By creating an account, accessing, or using the Service, you acknowledge that you have read, understood, and agree to be bound by these Terms and our Privacy Policy, which is incorporated herein by reference.</p>
        <p>If you are entering into these Terms on behalf of a company or other legal entity, you represent that you have the authority to bind such entity to these Terms, in which case "you" or "your" shall refer to such entity.</p>
        <p>You must be at least 18 years old to use the Service. If you are under 18, you may not use the Service.</p>`,
      order: 2,
      last_updated: new Date().toISOString(),
    },
    {
      section_id: "account-registration",
      section_title: "Account Registration",
      content: `<p>To access certain features of the Service, you must register for an account. When you register, you agree to:</p>
        <ul>
          <li>Provide accurate, current, and complete information</li>
          <li>Maintain and promptly update your account information</li>
          <li>Maintain the security of your password and identification</li>
          <li>Accept all responsibility for activities that occur under your account</li>
          <li>Notify us immediately of any unauthorized use of your account</li>
        </ul>
        <p>You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. We are not liable for any loss or damage arising from your failure to comply with this obligation.</p>`,
      order: 3,
      last_updated: new Date().toISOString(),
    },
    {
      section_id: "subscription-billing",
      section_title: "Subscription and Billing",
      content: `<p>Certain features of the Service require a paid subscription. By subscribing, you agree to pay the fees specified for your selected plan.</p>
        <p><strong>Billing Terms:</strong></p>
        <ul>
          <li>Subscription fees are billed in advance on a monthly or annual basis</li>
          <li>All fees are non-refundable except as required by law or as explicitly stated in these Terms</li>
          <li>We reserve the right to change our pricing with 30 days' notice to existing subscribers</li>
          <li>You authorize us to charge your payment method for all fees due</li>
          <li>If payment fails, we may suspend or terminate your access to paid features</li>
        </ul>
        <p><strong>Cancellation:</strong> You may cancel your subscription at any time. Cancellation takes effect at the end of your current billing period. You will continue to have access to paid features until the end of your billing period.</p>
        <p><strong>Refunds:</strong> Refunds are provided only in accordance with our refund policy or as required by applicable law. Contact our support team for refund requests.</p>`,
      order: 4,
      last_updated: new Date().toISOString(),
    },
    {
      section_id: "user-content",
      section_title: "User Content and Intellectual Property",
      content: `<p><strong>Your Content:</strong> You retain ownership of any content you upload, create, or submit to the Service ("User Content"). By submitting User Content, you grant us a worldwide, non-exclusive, royalty-free license to use, reproduce, modify, adapt, publish, and distribute your User Content solely for the purpose of providing and improving the Service.</p>
        <p><strong>Our Content:</strong> The Service, including its original content, features, and functionality, is owned by Winbro Training Reels and is protected by international copyright, trademark, patent, trade secret, and other intellectual property laws.</p>
        <p><strong>Restrictions:</strong> You agree not to:</p>
        <ul>
          <li>Copy, modify, or create derivative works of the Service</li>
          <li>Reverse engineer, decompile, or disassemble the Service</li>
          <li>Remove any copyright, trademark, or other proprietary notices</li>
          <li>Use the Service for any illegal or unauthorized purpose</li>
          <li>Violate any laws in your jurisdiction</li>
        </ul>`,
      order: 5,
      last_updated: new Date().toISOString(),
    },
    {
      section_id: "acceptable-use",
      section_title: "Acceptable Use Policy",
      content: `<p>You agree to use the Service only for lawful purposes and in accordance with these Terms. You agree not to:</p>
        <ul>
          <li>Upload, post, or transmit any content that is illegal, harmful, threatening, abusive, harassing, defamatory, vulgar, obscene, or otherwise objectionable</li>
          <li>Impersonate any person or entity or falsely state or misrepresent your affiliation with any person or entity</li>
          <li>Upload content that infringes on any patent, trademark, trade secret, copyright, or other proprietary rights</li>
          <li>Upload viruses, malware, or any other malicious code</li>
          <li>Interfere with or disrupt the Service or servers connected to the Service</li>
          <li>Attempt to gain unauthorized access to the Service, other accounts, or computer systems</li>
          <li>Use automated systems (bots, scrapers) to access the Service without permission</li>
          <li>Share your account credentials with others</li>
          <li>Violate any applicable local, state, national, or international law</li>
        </ul>
        <p>We reserve the right to remove any content that violates these Terms and to suspend or terminate accounts that engage in prohibited activities.</p>`,
      order: 6,
      last_updated: new Date().toISOString(),
    },
    {
      section_id: "tenant-scoping",
      section_title: "Tenant-Scoped Content",
      content: `<p>Content uploaded to the Service is scoped to your organization (tenant) by default. This means:</p>
        <ul>
          <li>Content you upload is visible only to users within your organization unless you explicitly make it public</li>
          <li>You are responsible for managing access permissions within your organization</li>
          <li>We maintain strict data isolation between tenants</li>
          <li>You may not access or attempt to access content from other tenants</li>
        </ul>
        <p>You are responsible for ensuring that all users in your organization comply with these Terms.</p>`,
      order: 7,
      last_updated: new Date().toISOString(),
    },
    {
      section_id: "moderation",
      section_title: "Content Moderation",
      content: `<p>We reserve the right to review, moderate, and remove any content uploaded to the Service. Content may be reviewed for:</p>
        <ul>
          <li>Compliance with these Terms and our Acceptable Use Policy</li>
          <li>Quality and appropriateness for the platform</li>
          <li>Technical issues or violations</li>
        </ul>
        <p>We may reject, request modifications to, or remove content at our sole discretion. We will provide feedback when content is rejected or requires modification.</p>
        <p>You may appeal moderation decisions by contacting our support team.</p>`,
      order: 8,
      last_updated: new Date().toISOString(),
    },
    {
      section_id: "service-availability",
      section_title: "Service Availability and Modifications",
      content: `<p>We strive to provide reliable and continuous access to the Service, but we do not guarantee that the Service will be available at all times. The Service may be unavailable due to:</p>
        <ul>
          <li>Scheduled maintenance</li>
          <li>Unscheduled maintenance or repairs</li>
          <li>Technical failures</li>
          <li>Circumstances beyond our reasonable control</li>
        </ul>
        <p>We reserve the right to modify, suspend, or discontinue any part of the Service at any time, with or without notice. We are not liable to you or any third party for any modification, suspension, or discontinuance of the Service.</p>
        <p>For information about our Service Level Agreement (SLA), please contact our support team or refer to your subscription agreement.</p>`,
      order: 9,
      last_updated: new Date().toISOString(),
    },
    {
      section_id: "termination",
      section_title: "Termination",
      content: `<p>You may terminate your account at any time by contacting our support team or using the account deletion feature in your settings.</p>
        <p>We may suspend or terminate your account immediately, without prior notice, if you:</p>
        <ul>
          <li>Violate these Terms or our Acceptable Use Policy</li>
          <li>Engage in fraudulent, illegal, or harmful activities</li>
          <li>Fail to pay subscription fees when due</li>
          <li>Use the Service in a manner that could harm us or other users</li>
        </ul>
        <p>Upon termination, your right to use the Service will immediately cease. We may delete your account and all associated data, subject to our data retention policies and legal obligations.</p>
        <p>Provisions of these Terms that by their nature should survive termination will survive, including ownership provisions, warranty disclaimers, and limitations of liability.</p>`,
      order: 10,
      last_updated: new Date().toISOString(),
    },
    {
      section_id: "disclaimers",
      section_title: "Disclaimers",
      content: `<p>THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT.</p>
        <p>We do not warrant that:</p>
        <ul>
          <li>The Service will meet your requirements</li>
          <li>The Service will be uninterrupted, timely, secure, or error-free</li>
          <li>The results obtained from using the Service will be accurate or reliable</li>
          <li>Any errors in the Service will be corrected</li>
        </ul>
        <p>Some jurisdictions do not allow the exclusion of implied warranties, so some of the above exclusions may not apply to you.</p>`,
      order: 11,
      last_updated: new Date().toISOString(),
    },
    {
      section_id: "limitation-liability",
      section_title: "Limitation of Liability",
      content: `<p>TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, IN NO EVENT SHALL WINBRO TRAINING REELS, ITS AFFILIATES, AGENTS, DIRECTORS, EMPLOYEES, SUPPLIERS, OR LICENSORS BE LIABLE FOR ANY INDIRECT, PUNITIVE, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR EXEMPLARY DAMAGES, INCLUDING WITHOUT LIMITATION DAMAGES FOR LOSS OF PROFITS, GOODWILL, USE, DATA, OR OTHER INTANGIBLE LOSSES, ARISING OUT OF OR RELATING TO THE USE OF, OR INABILITY TO USE, THE SERVICE.</p>
        <p>OUR TOTAL LIABILITY TO YOU FOR ALL CLAIMS ARISING OUT OF OR RELATING TO THE USE OF OR INABILITY TO USE THE SERVICE SHALL NOT EXCEED THE AMOUNT YOU PAID US IN THE TWELVE (12) MONTHS PRIOR TO THE EVENT GIVING RISE TO THE LIABILITY.</p>
        <p>Some jurisdictions do not allow the exclusion or limitation of incidental or consequential damages, so the above limitations may not apply to you.</p>`,
      order: 12,
      last_updated: new Date().toISOString(),
    },
    {
      section_id: "indemnification",
      section_title: "Indemnification",
      content: `<p>You agree to indemnify, defend, and hold harmless Winbro Training Reels, its affiliates, officers, directors, employees, agents, and licensors from and against any claims, liabilities, damages, losses, and expenses, including without limitation reasonable attorney's fees and costs, arising out of or in any way connected with:</p>
        <ul>
          <li>Your access to or use of the Service</li>
          <li>Your violation of these Terms</li>
          <li>Your violation of any third-party right, including without limitation any intellectual property right, privacy right, or proprietary right</li>
          <li>Your User Content</li>
        </ul>
        <p>We reserve the right to assume the exclusive defense and control of any matter subject to indemnification by you, in which event you will assist and cooperate with us in asserting any available defenses.</p>`,
      order: 13,
      last_updated: new Date().toISOString(),
    },
    {
      section_id: "governing-law",
      section_title: "Governing Law and Dispute Resolution",
      content: `<p>These Terms shall be governed by and construed in accordance with the laws of [Jurisdiction], without regard to its conflict of law provisions.</p>
        <p>Any disputes arising out of or relating to these Terms or the Service shall be resolved through binding arbitration in accordance with the rules of [Arbitration Organization], except that either party may seek injunctive relief in any court of competent jurisdiction.</p>
        <p>You agree that any dispute resolution proceedings will be conducted only on an individual basis and not in a class, consolidated, or representative action.</p>`,
      order: 14,
      last_updated: new Date().toISOString(),
    },
    {
      section_id: "changes",
      section_title: "Changes to Terms",
      content: `<p>We reserve the right to modify these Terms at any time. We will notify you of any material changes by:</p>
        <ul>
          <li>Posting the new Terms on this page</li>
          <li>Updating the "Effective Date" at the top of these Terms</li>
          <li>Sending you an email notification (for significant changes)</li>
          <li>Displaying a notice on our platform</li>
        </ul>
        <p>Your continued use of the Service after any changes become effective constitutes your acceptance of the new Terms. If you do not agree to the new Terms, you must stop using the Service and may terminate your account.</p>
        <p>Material changes will be effective 30 days after notice is provided, unless a different effective date is specified.</p>`,
      order: 15,
      last_updated: new Date().toISOString(),
    },
    {
      section_id: "contact",
      section_title: "Contact Information",
      content: `<p>If you have any questions about these Terms, please contact us:</p>
        <ul>
          <li><strong>Email:</strong> <a href="mailto:legal@winbro.com" className="text-primary hover:underline">legal@winbro.com</a></li>
          <li><strong>Support:</strong> <a href="/help" className="text-primary hover:underline">Help & Support Center</a></li>
        </ul>
        <p>For questions about our Service Level Agreement (SLA), please contact your account representative or our support team.</p>`,
      order: 16,
      last_updated: new Date().toISOString(),
    },
  ];

  // Handle both sectioned and single content formats
  const hasSections = terms?.sections && terms.sections.length > 0;
  const hasSingleContent = terms?.content && !hasSections;
  const sections = hasSections ? (terms.sections || []) : defaultSections;
  const sortedSections = [...sections].sort((a, b) => a.order - b.order);
  const effectiveDate = terms?.effective_date 
    ? new Date(terms.effective_date).toLocaleDateString()
    : new Date().toLocaleDateString();

  return (
    <div className="min-h-screen bg-background-primary">
      <div className="container mx-auto px-6 py-8 max-w-5xl">
        {/* Header */}
        <div className="mb-8 animate-fade-in-up">
          <div className="flex items-center gap-3 mb-4">
            <FileText className="h-8 w-8 text-primary" />
            <h1 className="text-4xl font-bold text-foreground-primary">
              Terms of Service
            </h1>
          </div>
          <p className="text-lg text-foreground-secondary">
            Effective Date: {effectiveDate}
          </p>
        </div>

        <div className="grid lg:grid-cols-4 gap-8">
          {/* Table of Contents Sidebar - Only show if sections exist */}
          {hasSections && (
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
          )}

          {/* Main Content */}
          <div className={cn("space-y-8", hasSections ? "lg:col-span-3" : "lg:col-span-4")}>
            {/* Terms Content */}
            <Card className="animate-fade-in-up">
              <CardContent className="pt-6">
                {termsLoading ? (
                  <div className="space-y-4">
                    {[1, 2, 3, 4].map((i) => (
                      <div
                        key={i}
                        className="h-32 bg-muted animate-pulse rounded-lg"
                      />
                    ))}
                  </div>
                ) : hasSingleContent ? (
                  <div className="prose prose-sm max-w-none">
                    <div
                      className="text-foreground-secondary leading-relaxed"
                      dangerouslySetInnerHTML={{ __html: terms.content || "" }}
                    />
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
                to="/privacy"
                className="hover:text-foreground-primary transition-colors"
              >
                Privacy Policy
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
    </div>
  );
}
