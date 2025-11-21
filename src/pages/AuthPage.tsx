import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "@tanstack/react-query";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Mail,
  Lock,
  User,
  Building2,
  Chrome,
  Phone,
  Eye,
  EyeOff,
} from "lucide-react";
import { useSSOProviders, useInitiateSSO, useSignup } from "@/hooks/use-auth";
import { TwoFactorAuthPrompt } from "@/components/auth/TwoFactorAuthPrompt";
import { authApi, tokenManager, termsApi } from "@/lib/api";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { authKeys } from "@/hooks/use-auth";
import type { LoginWith2FAResponse } from "@/types";
import { PasswordResetModal } from "@/components/auth/PasswordResetModal";

// Login form schema
const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  rememberMe: z.boolean().optional(),
});

type LoginForm = z.infer<typeof loginSchema>;

// Signup form schema
const signupSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  fullName: z.string().min(2, "Name must be at least 2 characters"),
  company: z.string().min(2, "Company name is required"),
  role: z.enum(["trainer", "operator", "customer_admin"]),
  phone: z.string().optional(),
  acceptTerms: z.boolean().refine((val) => val === true, {
    message: "You must accept the terms and conditions",
  }),
});

type SignupForm = z.infer<typeof signupSchema>;

export default function AuthPage() {
  const [searchParams] = useSearchParams();
  const initialTab = searchParams.get("tab") || "login";
  const [activeTab, setActiveTab] = useState<"login" | "signup">(
    initialTab === "signup" ? "signup" : "login"
  );
  const [showPassword, setShowPassword] = useState(false);
  const [showSignupPassword, setShowSignupPassword] = useState(false);
  const [requires2FA, setRequires2FA] = useState(false);
  const [twoFactorMethod, setTwoFactorMethod] = useState<"totp" | "sms">("totp");
  const [phoneNumber, setPhoneNumber] = useState<string>();
  const [credentials, setCredentials] = useState<LoginForm | null>(null);
  const [isPasswordResetOpen, setIsPasswordResetOpen] = useState(false);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: ssoProviders } = useSSOProviders();
  const initiateSSO = useInitiateSSO();
  const signupMutation = useSignup();

  // Fetch current terms of service
  const { data: terms } = useQuery({
    queryKey: ["terms-of-service"],
    queryFn: () => termsApi.getTermsOfService(),
  });

  // Login form
  const {
    register: registerLogin,
    handleSubmit: handleLoginSubmit,
    formState: { errors: loginErrors },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      rememberMe: false,
    },
  });

  // Signup form
  const {
    register: registerSignup,
    handleSubmit: handleSignupSubmit,
    formState: { errors: signupErrors },
    watch: watchSignup,
    setValue: setSignupValue,
  } = useForm<SignupForm>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      acceptTerms: false,
    },
  });

  const signupRole = watchSignup("role");

  // Login submit handler
  const onLoginSubmit = async (data: LoginForm) => {
    try {
      const response: LoginWith2FAResponse = await authApi.loginWith2FA({
        email: data.email,
        password: data.password,
      });

      if (response.requires_2fa) {
        setCredentials(data);
        setTwoFactorMethod(response.message?.includes("SMS") ? "sms" : "totp");
        setPhoneNumber(response.message?.match(/\+?[\d\s-]+/)?.[0]);
        setRequires2FA(true);
      } else if (response.auth_response) {
        handleLoginSuccess(response.auth_response);
      }
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Login failed. Please check your credentials."
      );
    }
  };

  // Signup submit handler
  const onSignupSubmit = async (data: SignupForm) => {
    if (!data.acceptTerms) {
      return;
    }

    signupMutation.mutate({
      email: data.email,
      password: data.password,
      full_name: data.fullName,
      company: data.company,
      role: data.role,
      accept_terms: data.acceptTerms,
    });

    // Record terms acceptance after successful signup
    if (terms?.version_id) {
      try {
        await termsApi.recordUserAgreement({
          version_id: terms.version_id,
          ip_address: undefined,
          user_agent: navigator.userAgent,
        });
      } catch (error) {
        console.error("Failed to record terms acceptance:", error);
      }
    }
  };

  const handleLoginSuccess = (
    authResponse: typeof authApi.login extends (...args: any[]) => Promise<infer T>
      ? T
      : never
  ) => {
    tokenManager.setTokens(authResponse.access_token, authResponse.refresh_token);
    tokenManager.setUser(authResponse.user);

    queryClient.setQueryData(authKeys.user(), authResponse.user);

    toast.success("Logged in successfully!");
    navigate("/dashboard");
  };

  const handle2FAVerified = async (code?: string, recoveryCode?: string) => {
    if (!credentials) return;

    try {
      const response: LoginWith2FAResponse = await authApi.loginWith2FA({
        email: credentials.email,
        password: credentials.password,
        two_factor_code: code,
        recovery_code: recoveryCode,
      });

      if (response.auth_response) {
        handleLoginSuccess(response.auth_response);
      } else {
        toast.error("2FA verification failed");
      }
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "2FA verification failed"
      );
    }
  };

  const handleSSO = (providerId: string) => {
    initiateSSO.mutate({ providerId });
  };

  if (requires2FA) {
    return (
      <div className="min-h-screen bg-background-primary flex items-center justify-center p-4">
        <TwoFactorAuthPrompt
          method={twoFactorMethod}
          phoneNumber={phoneNumber}
          onVerified={handle2FAVerified}
          onUseRecoveryCode={() => {
            setRequires2FA(false);
          }}
        />
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-background-primary flex items-center justify-center p-4">
        <Card className="w-full max-w-md animate-fade-in-up shadow-card">
          <CardHeader className="space-y-1 pb-6">
            <CardTitle className="text-2xl font-bold text-center text-foreground-primary">
              {activeTab === "login" ? "Welcome back" : "Create an account"}
            </CardTitle>
            <CardDescription className="text-center text-foreground-secondary">
              {activeTab === "login"
                ? "Sign in to your account to continue"
                : "Get started with Winbro Training Reels"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs
              value={activeTab}
              onValueChange={(value) => setActiveTab(value as "login" | "signup")}
              className="w-full"
            >
              <TabsList className="grid w-full grid-cols-2 mb-6 bg-muted p-1">
                <TabsTrigger
                  value="login"
                  className="data-[state=active]:bg-white data-[state=active]:text-foreground-primary data-[state=active]:shadow-sm transition-all duration-200"
                >
                  Sign In
                </TabsTrigger>
                <TabsTrigger
                  value="signup"
                  className="data-[state=active]:bg-white data-[state=active]:text-foreground-primary data-[state=active]:shadow-sm transition-all duration-200"
                >
                  Sign Up
                </TabsTrigger>
              </TabsList>

              {/* Login Tab */}
              <TabsContent value="login" className="space-y-4 mt-0">
                <form
                  onSubmit={handleLoginSubmit(onLoginSubmit)}
                  className="space-y-4"
                >
                  <div className="space-y-2">
                    <Label htmlFor="login-email" className="text-foreground-primary">
                      Email
                    </Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-foreground-secondary" />
                      <Input
                        id="login-email"
                        type="email"
                        placeholder="you@example.com"
                        className="pl-10 border-input focus:border-primary focus:ring-primary transition-colors duration-200"
                        {...registerLogin("email")}
                      />
                    </div>
                    {loginErrors.email && (
                      <p className="text-sm text-destructive">
                        {loginErrors.email.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label
                        htmlFor="login-password"
                        className="text-foreground-primary"
                      >
                        Password
                      </Label>
                      <button
                        type="button"
                        onClick={() => setIsPasswordResetOpen(true)}
                        className="text-sm text-primary hover:underline transition-colors duration-200"
                      >
                        Forgot password?
                      </button>
                    </div>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-foreground-secondary" />
                      <Input
                        id="login-password"
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        className="pl-10 pr-10 border-input focus:border-primary focus:ring-primary transition-colors duration-200"
                        {...registerLogin("password")}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-foreground-secondary hover:text-foreground-primary transition-colors duration-200"
                        aria-label="Toggle password visibility"
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                    {loginErrors.password && (
                      <p className="text-sm text-destructive">
                        {loginErrors.password.message}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="remember-me"
                      {...registerLogin("rememberMe")}
                    />
                    <Label
                      htmlFor="remember-me"
                      className="text-sm text-foreground-secondary leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                    >
                      Remember me
                    </Label>
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
                  >
                    Sign in
                  </Button>
                </form>

                {/* SSO Buttons */}
                {(ssoProviders && ssoProviders.length > 0) && (
                  <>
                    <div className="relative my-6">
                      <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t border-border" />
                      </div>
                      <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-white px-2 text-foreground-secondary">
                          Or continue with
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      {ssoProviders.find((p) => p.provider_name === "google") && (
                        <Button
                          variant="outline"
                          type="button"
                          className="w-full border-input hover:bg-muted/50 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
                          onClick={() =>
                            handleSSO(
                              ssoProviders.find((p) => p.provider_name === "google")!
                                .provider_id
                            )
                          }
                          disabled={initiateSSO.isPending}
                        >
                          <Chrome className="mr-2 h-4 w-4" />
                          Google
                        </Button>
                      )}
                      {ssoProviders.find(
                        (p) => p.provider_name === "microsoft"
                      ) && (
                        <Button
                          variant="outline"
                          type="button"
                          className="w-full border-input hover:bg-muted/50 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
                          onClick={() =>
                            handleSSO(
                              ssoProviders.find(
                                (p) => p.provider_name === "microsoft"
                              )!.provider_id
                            )
                          }
                          disabled={initiateSSO.isPending}
                        >
                          <Building2 className="mr-2 h-4 w-4" />
                          Microsoft
                        </Button>
                      )}
                      {ssoProviders.find(
                        (p) =>
                          p.provider_name === "saml" ||
                          p.provider_name === "oidc"
                      ) && (
                        <Button
                          variant="outline"
                          type="button"
                          className="w-full col-span-2 border-input hover:bg-muted/50 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
                          onClick={() =>
                            handleSSO(
                              ssoProviders.find(
                                (p) =>
                                  p.provider_name === "saml" ||
                                  p.provider_name === "oidc"
                              )!.provider_id
                            )
                          }
                          disabled={initiateSSO.isPending}
                        >
                          <Building2 className="mr-2 h-4 w-4" />
                          Enterprise SSO
                        </Button>
                      )}
                    </div>
                  </>
                )}
              </TabsContent>

              {/* Signup Tab */}
              <TabsContent value="signup" className="space-y-4 mt-0">
                <form
                  onSubmit={handleSignupSubmit(onSignupSubmit)}
                  className="space-y-4"
                >
                  <div className="space-y-2">
                    <Label htmlFor="signup-name" className="text-foreground-primary">
                      Full Name
                    </Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-foreground-secondary" />
                      <Input
                        id="signup-name"
                        type="text"
                        placeholder="John Doe"
                        className="pl-10 border-input focus:border-primary focus:ring-primary transition-colors duration-200"
                        {...registerSignup("fullName")}
                      />
                    </div>
                    {signupErrors.fullName && (
                      <p className="text-sm text-destructive">
                        {signupErrors.fullName.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-email" className="text-foreground-primary">
                      Email
                    </Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-foreground-secondary" />
                      <Input
                        id="signup-email"
                        type="email"
                        placeholder="you@example.com"
                        className="pl-10 border-input focus:border-primary focus:ring-primary transition-colors duration-200"
                        {...registerSignup("email")}
                      />
                    </div>
                    {signupErrors.email && (
                      <p className="text-sm text-destructive">
                        {signupErrors.email.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-company" className="text-foreground-primary">
                      Company
                    </Label>
                    <div className="relative">
                      <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-foreground-secondary" />
                      <Input
                        id="signup-company"
                        type="text"
                        placeholder="Your Company"
                        className="pl-10 border-input focus:border-primary focus:ring-primary transition-colors duration-200"
                        {...registerSignup("company")}
                      />
                    </div>
                    {signupErrors.company && (
                      <p className="text-sm text-destructive">
                        {signupErrors.company.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-password" className="text-foreground-primary">
                      Password
                    </Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-foreground-secondary" />
                      <Input
                        id="signup-password"
                        type={showSignupPassword ? "text" : "password"}
                        placeholder="••••••••"
                        className="pl-10 pr-10 border-input focus:border-primary focus:ring-primary transition-colors duration-200"
                        {...registerSignup("password")}
                      />
                      <button
                        type="button"
                        onClick={() => setShowSignupPassword(!showSignupPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-foreground-secondary hover:text-foreground-primary transition-colors duration-200"
                        aria-label="Toggle password visibility"
                      >
                        {showSignupPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                    {signupErrors.password && (
                      <p className="text-sm text-destructive">
                        {signupErrors.password.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-role" className="text-foreground-primary">
                      Role
                    </Label>
                    <Select
                      value={signupRole}
                      onValueChange={(value) =>
                        setSignupValue("role", value as "trainer" | "operator" | "customer_admin")
                      }
                    >
                      <SelectTrigger
                        id="signup-role"
                        className="border-input focus:border-primary focus:ring-primary transition-colors duration-200"
                      >
                        <SelectValue placeholder="Select your role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="trainer">Trainer</SelectItem>
                        <SelectItem value="operator">Operator</SelectItem>
                        <SelectItem value="customer_admin">
                          Customer Admin
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    {signupErrors.role && (
                      <p className="text-sm text-destructive">
                        {signupErrors.role.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="signup-phone"
                      className="text-foreground-primary"
                    >
                      Phone <span className="text-foreground-secondary">(optional)</span>
                    </Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-foreground-secondary" />
                      <Input
                        id="signup-phone"
                        type="tel"
                        placeholder="+1 (555) 123-4567"
                        className="pl-10 border-input focus:border-primary focus:ring-primary transition-colors duration-200"
                        {...registerSignup("phone")}
                      />
                    </div>
                  </div>

                  <div className="flex items-start space-x-2">
                    <Checkbox
                      id="terms"
                      checked={watchSignup("acceptTerms")}
                      onCheckedChange={(checked) =>
                        setSignupValue("acceptTerms", checked === true)
                      }
                    />
                    <label
                      htmlFor="terms"
                      className="text-sm text-foreground-secondary leading-relaxed peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                    >
                      I agree to the{" "}
                      <Link
                        to="/terms"
                        className="text-primary hover:underline font-medium"
                        target="_blank"
                      >
                        Terms of Service
                      </Link>{" "}
                      and{" "}
                      <Link
                        to="/privacy"
                        className="text-primary hover:underline font-medium"
                        target="_blank"
                      >
                        Privacy Policy
                      </Link>
                    </label>
                  </div>
                  {signupErrors.acceptTerms && (
                    <p className="text-sm text-destructive">
                      {signupErrors.acceptTerms.message}
                    </p>
                  )}

                  <Button
                    type="submit"
                    className="w-full bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
                    disabled={signupMutation.isPending}
                  >
                    {signupMutation.isPending
                      ? "Creating account..."
                      : "Create account"}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>

            {/* Footer Links */}
            <div className="mt-6 text-center text-sm">
              {activeTab === "login" ? (
                <span className="text-foreground-secondary">
                  Don't have an account?{" "}
                  <button
                    type="button"
                    onClick={() => setActiveTab("signup")}
                    className="text-primary hover:underline font-medium transition-colors duration-200"
                  >
                    Sign up
                  </button>
                </span>
              ) : (
                <span className="text-foreground-secondary">
                  Already have an account?{" "}
                  <button
                    type="button"
                    onClick={() => setActiveTab("login")}
                    className="text-primary hover:underline font-medium transition-colors duration-200"
                  >
                    Sign in
                  </button>
                </span>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Password Reset Modal */}
      <PasswordResetModal
        isOpen={isPasswordResetOpen}
        onClose={() => setIsPasswordResetOpen(false)}
      />
    </>
  );
}
