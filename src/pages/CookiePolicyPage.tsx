import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
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
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Cookie,
  Shield,
  Settings,
  BarChart3,
  Target,
  CheckCircle2,
  ExternalLink,
  Info,
} from "lucide-react";
import { cookieApi } from "@/lib/api";
import type { CookiePreferences, CookieCategory } from "@/types";
import { cn } from "@/lib/utils";

// Form validation schema
const cookiePreferencesSchema = z.object({
  essential_cookies: z.boolean(),
  performance_cookies: z.boolean(),
  functional_cookies: z.boolean(),
  targeting_cookies: z.boolean(),
});

type CookiePreferencesFormData = z.infer<typeof cookiePreferencesSchema>;

// Default cookie categories if API doesn't return data
const defaultCookieCategories: CookieCategory[] = [
  {
    id: "essential",
    name: "Essential Cookies",
    description:
      "These cookies are necessary for the website to function properly. They enable core functionality such as security, network management, and accessibility. You cannot opt-out of these cookies as they are required for the site to work.",
    required: true,
  },
  {
    id: "performance",
    name: "Performance Cookies",
    description:
      "These cookies help us understand how visitors interact with our website by collecting and reporting information anonymously. This helps us improve the way our website works, for example, by ensuring that users find what they are looking for easily.",
    required: false,
  },
  {
    id: "functional",
    name: "Functional Cookies",
    description:
      "These cookies enable the website to provide enhanced functionality and personalization. They may be set by us or by third-party providers whose services we have added to our pages. If you do not allow these cookies, some or all of these services may not function properly.",
    required: false,
  },
  {
    id: "targeting",
    name: "Targeting Cookies",
    description:
      "These cookies may be set through our site by our advertising partners. They may be used by those companies to build a profile of your interests and show you relevant adverts on other sites. They do not store directly personal information but are based on uniquely identifying your browser and internet device.",
    required: false,
  },
];

export default function CookiePolicyPage() {
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const queryClient = useQueryClient();

  // Fetch cookie preferences
  const { data: preferences, isLoading: preferencesLoading } = useQuery<
    CookiePreferences
  >({
    queryKey: ["cookie-preferences"],
    queryFn: () => cookieApi.getCookiePreferences(),
    retry: false, // Don't retry if user is not logged in
  });

  // Fetch cookie categories
  const { data: categories = defaultCookieCategories } = useQuery<
    CookieCategory[]
  >({
    queryKey: ["cookie-categories"],
    queryFn: () => cookieApi.getCookieCategories(),
    retry: false,
  });

  // Update preferences mutation
  const updatePreferencesMutation = useMutation({
    mutationFn: (data: CookiePreferencesFormData) =>
      cookieApi.updateCookiePreferences(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cookie-preferences"] });
      toast.success("Cookie preferences saved successfully!");
      setShowSuccessDialog(true);
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to save cookie preferences");
    },
  });

  // Form setup
  const {
    handleSubmit,
    formState: { isSubmitting },
    watch,
    setValue,
    reset,
  } = useForm<CookiePreferencesFormData>({
    resolver: zodResolver(cookiePreferencesSchema),
    defaultValues: {
      essential_cookies: true, // Always true, cannot be disabled
      performance_cookies: preferences?.performance_cookies ?? false,
      functional_cookies: preferences?.functional_cookies ?? false,
      targeting_cookies: preferences?.targeting_cookies ?? false,
    },
  });

  // Update form when preferences are loaded
  useEffect(() => {
    if (preferences) {
      reset({
        essential_cookies: true,
        performance_cookies: preferences.performance_cookies,
        functional_cookies: preferences.functional_cookies,
        targeting_cookies: preferences.targeting_cookies,
      });
    }
  }, [preferences, reset]);

  // Watch form values
  const watchedValues = watch();

  // Handle form submission
  const onSubmit = (data: CookiePreferencesFormData) => {
    updatePreferencesMutation.mutate(data);
  };

  // Get icon for cookie category
  const getCategoryIcon = (categoryId: CookieCategory["id"]) => {
    switch (categoryId) {
      case "essential":
        return Shield;
      case "performance":
        return BarChart3;
      case "functional":
        return Settings;
      case "targeting":
        return Target;
      default:
        return Cookie;
    }
  };

  // Get current preference value for a category
  const getPreferenceValue = (categoryId: CookieCategory["id"]): boolean => {
    switch (categoryId) {
      case "essential":
        return true; // Always true
      case "performance":
        return watchedValues.performance_cookies ?? false;
      case "functional":
        return watchedValues.functional_cookies ?? false;
      case "targeting":
        return watchedValues.targeting_cookies ?? false;
      default:
        return false;
    }
  };

  // Handle toggle change
  const handleToggleChange = (
    categoryId: CookieCategory["id"],
    checked: boolean
  ) => {
    if (categoryId === "essential") {
      return; // Cannot disable essential cookies
    }

    const fieldName = `${categoryId}_cookies` as keyof CookiePreferencesFormData;
    setValue(fieldName, checked, { shouldValidate: true });
  };

  return (
    <div className="min-h-screen bg-background-primary">
      <div className="container mx-auto px-6 py-8 max-w-5xl">
        {/* Header */}
        <div className="mb-8 animate-fade-in-up">
          <div className="flex items-center gap-3 mb-4">
            <Cookie className="h-8 w-8 text-primary" />
            <h1 className="text-4xl font-bold text-foreground-primary">
              Cookie Policy
            </h1>
          </div>
          <p className="text-lg text-foreground-secondary">
            Manage your cookie preferences and learn how we use cookies to
            enhance your experience.
          </p>
        </div>

        {/* Main Content */}
        <div className="space-y-8">
          {/* Introduction Card */}
          <Card className="animate-fade-in-up">
            <CardHeader>
              <CardTitle>About Cookies</CardTitle>
              <CardDescription>
                Cookies are small text files that are placed on your device when
                you visit our website. They help us provide you with a better
                experience by remembering your preferences and understanding how
                you use our site.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="prose prose-sm max-w-none text-foreground-secondary">
                <p>
                  We use cookies to make our website work properly, analyze how
                  you use it, and provide personalized content. You can control
                  which cookies we use through the settings below, except for
                  essential cookies which are necessary for the website to
                  function.
                </p>
                <p className="mt-4">
                  For more information about how we handle your data, please see
                  our{" "}
                  <Link
                    to="/privacy"
                    className="text-primary hover:underline inline-flex items-center gap-1"
                  >
                    Privacy Policy
                    <ExternalLink className="h-3 w-3" />
                  </Link>
                  .
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Cookie Preferences Form */}
          <Card className="animate-fade-in-up">
            <CardHeader>
              <CardTitle>Cookie Preferences</CardTitle>
              <CardDescription>
                Choose which types of cookies you want to accept. You can change
                these settings at any time.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {preferencesLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className="h-32 bg-muted animate-pulse rounded-lg"
                    />
                  ))}
                </div>
              ) : (
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                  {/* Cookie Categories */}
                  <div className="space-y-6">
                    {categories.map((category) => {
                      const Icon = getCategoryIcon(category.id);
                      const isEnabled = getPreferenceValue(category.id);
                      const isRequired = category.required;

                      return (
                        <div
                          key={category.id}
                          className={cn(
                            "p-6 border rounded-lg transition-all duration-200",
                            isEnabled
                              ? "border-primary/50 bg-primary/5"
                              : "border-border bg-card"
                          )}
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <Icon className="h-5 w-5 text-primary" />
                                <div className="flex items-center gap-2">
                                  <Label
                                    htmlFor={`cookie-${category.id}`}
                                    className="text-lg font-semibold text-foreground-primary cursor-pointer"
                                  >
                                    {category.name}
                                  </Label>
                                  {isRequired && (
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-muted text-foreground-secondary">
                                      <Info className="h-3 w-3" />
                                      Required
                                    </span>
                                  )}
                                </div>
                              </div>
                              <p className="text-sm text-foreground-secondary leading-relaxed mt-2">
                                {category.description}
                              </p>
                            </div>
                            <div className="flex items-center gap-3">
                              <Switch
                                id={`cookie-${category.id}`}
                                checked={isEnabled}
                                onCheckedChange={(checked) =>
                                  handleToggleChange(category.id, checked)
                                }
                                disabled={isRequired}
                              />
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Form Actions */}
                  <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-border">
                    <Button
                      type="submit"
                      disabled={
                        isSubmitting || updatePreferencesMutation.isPending
                      }
                      className="sm:w-auto"
                    >
                      {isSubmitting || updatePreferencesMutation.isPending ? (
                        <>
                          <Settings className="h-4 w-4 mr-2 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="h-4 w-4 mr-2" />
                          Save Preferences
                        </>
                      )}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        if (preferences) {
                          reset({
                            essential_cookies: true,
                            performance_cookies:
                              preferences.performance_cookies,
                            functional_cookies: preferences.functional_cookies,
                            targeting_cookies: preferences.targeting_cookies,
                          });
                        }
                      }}
                      disabled={
                        isSubmitting || updatePreferencesMutation.isPending
                      }
                    >
                      Reset to Saved
                    </Button>
                  </div>

                  {/* Info Box */}
                  <div className="bg-muted/50 p-4 rounded-lg">
                    <div className="flex items-start gap-3">
                      <Info className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                      <div className="text-sm text-foreground-secondary">
                        <p className="font-medium text-foreground-primary mb-1">
                          Important Information
                        </p>
                        <ul className="space-y-1 list-disc list-inside ml-2">
                          <li>
                            Essential cookies cannot be disabled as they are
                            required for the website to function properly.
                          </li>
                          <li>
                            Your preferences will be saved and applied across
                            all devices where you are logged in.
                          </li>
                          <li>
                            Some features may not work correctly if you disable
                            certain cookie types.
                          </li>
                          <li>
                            You can update your preferences at any time by
                            visiting this page.
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </form>
              )}
            </CardContent>
          </Card>

          {/* Additional Information */}
          <Card className="animate-fade-in-up">
            <CardHeader>
              <CardTitle>More Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-foreground-primary mb-2">
                    How to Manage Cookies in Your Browser
                  </h3>
                  <p className="text-sm text-foreground-secondary">
                    Most web browsers allow you to control cookies through their
                    settings preferences. However, limiting cookies may impact
                    your ability to use certain features of our website. For
                    more information about managing cookies in your browser,
                    please visit your browser's help documentation.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold text-foreground-primary mb-2">
                    Third-Party Cookies
                  </h3>
                  <p className="text-sm text-foreground-secondary">
                    Some cookies are placed by third-party services that appear
                    on our pages. We do not control the setting of these
                    cookies, so please check the third-party websites for more
                    information about their cookies and how to manage them.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold text-foreground-primary mb-2">
                    Updates to This Policy
                  </h3>
                  <p className="text-sm text-foreground-secondary">
                    We may update this Cookie Policy from time to time to reflect
                    changes in our practices or for other operational, legal, or
                    regulatory reasons. Please revisit this page periodically to
                    stay informed about our use of cookies.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Footer Navigation */}
          <div className="flex flex-wrap gap-4 text-sm text-foreground-secondary animate-fade-in-up">
            <Link
              to="/privacy"
              className="hover:text-foreground-primary transition-colors"
            >
              Privacy Policy
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
              to="/help"
              className="hover:text-foreground-primary transition-colors"
            >
              Help & Support
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

      {/* Success Dialog */}
      <Dialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-success" />
              Preferences Saved
            </DialogTitle>
            <DialogDescription>
              Your cookie preferences have been saved successfully. These
              settings will be applied across all your devices where you are
              logged in.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={() => setShowSuccessDialog(false)}>
              Continue
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
