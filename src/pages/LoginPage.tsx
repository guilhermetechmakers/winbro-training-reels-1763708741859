import { useState } from "react";
import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail, Lock, Chrome, Building2 } from "lucide-react";
import { useSSOProviders, useInitiateSSO } from "@/hooks/use-auth";
import { TwoFactorAuthPrompt } from "@/components/auth/TwoFactorAuthPrompt";
import { authApi, tokenManager } from "@/lib/api";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { authKeys } from "@/hooks/use-auth";
import type { LoginWith2FAResponse } from "@/types";

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const [requires2FA, setRequires2FA] = useState(false);
  const [twoFactorMethod, setTwoFactorMethod] = useState<"totp" | "sms">("totp");
  const [phoneNumber, setPhoneNumber] = useState<string>();
  const [credentials, setCredentials] = useState<LoginForm | null>(null);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: ssoProviders } = useSSOProviders();
  const initiateSSO = useInitiateSSO();
  
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginForm) => {
    try {
      const response: LoginWith2FAResponse = await authApi.loginWith2FA({
        email: data.email,
        password: data.password,
      });

      if (response.requires_2fa) {
        // Store credentials for 2FA verification
        setCredentials(data);
        setTwoFactorMethod(response.message?.includes("SMS") ? "sms" : "totp");
        setPhoneNumber(response.message?.match(/\+?[\d\s-]+/)?.[0]);
        setRequires2FA(true);
      } else if (response.auth_response) {
        // Login successful without 2FA
        handleLoginSuccess(response.auth_response);
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Login failed. Please check your credentials.");
    }
  };

  const handleLoginSuccess = (authResponse: typeof authApi.login extends (...args: any[]) => Promise<infer T> ? T : never) => {
    // Store tokens and user
    tokenManager.setTokens(authResponse.access_token, authResponse.refresh_token);
    tokenManager.setUser(authResponse.user);
    
    // Invalidate and refetch user
    queryClient.setQueryData(authKeys.user(), authResponse.user);
    
    toast.success("Logged in successfully!");
    navigate("/dashboard");
  };

  const handle2FAVerified = async (code?: string, recoveryCode?: string) => {
    if (!credentials) return;

    try {
      // Complete login with 2FA code
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
      toast.error(error instanceof Error ? error.message : "2FA verification failed");
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
            // Recovery code flow would be handled in the component
            setRequires2FA(false);
          }}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background-primary flex items-center justify-center p-4">
      <Card className="w-full max-w-md animate-fade-in-up">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">Welcome back</CardTitle>
          <CardDescription className="text-center">
            Sign in to your account to continue
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-foreground-secondary" />
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  className="pl-10"
                  {...register("email")}
                />
              </div>
              {errors.email && (
                <p className="text-sm text-red-500">{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <Link
                  to="/reset-password"
                  className="text-sm text-primary hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-foreground-secondary" />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  className="pl-10"
                  {...register("password")}
                />
              </div>
              {errors.password && (
                <p className="text-sm text-red-500">{errors.password.message}</p>
              )}
            </div>

            <Button type="submit" className="w-full">
              Sign in
            </Button>
          </form>

          {(ssoProviders && ssoProviders.length > 0) && (
            <>
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-border" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white px-2 text-foreground-secondary">Or continue with</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {ssoProviders.find(p => p.provider_name === 'google') && (
                  <Button 
                    variant="outline" 
                    type="button" 
                    className="w-full"
                    onClick={() => handleSSO(ssoProviders.find(p => p.provider_name === 'google')!.provider_id)}
                    disabled={initiateSSO.isPending}
                  >
                    <Chrome className="mr-2 h-4 w-4" />
                    Google
                  </Button>
                )}
                {ssoProviders.find(p => p.provider_name === 'microsoft') && (
                  <Button 
                    variant="outline" 
                    type="button" 
                    className="w-full"
                    onClick={() => handleSSO(ssoProviders.find(p => p.provider_name === 'microsoft')!.provider_id)}
                    disabled={initiateSSO.isPending}
                  >
                    <Building2 className="mr-2 h-4 w-4" />
                    Microsoft
                  </Button>
                )}
                {ssoProviders.find(p => p.provider_name === 'saml' || p.provider_name === 'oidc') && (
                  <Button 
                    variant="outline" 
                    type="button" 
                    className="w-full col-span-2"
                    onClick={() => handleSSO(ssoProviders.find(p => p.provider_name === 'saml' || p.provider_name === 'oidc')!.provider_id)}
                    disabled={initiateSSO.isPending}
                  >
                    <Building2 className="mr-2 h-4 w-4" />
                    Enterprise SSO
                  </Button>
                )}
              </div>
            </>
          )}

          <div className="text-center text-sm">
            <span className="text-foreground-secondary">Don't have an account? </span>
            <Link to="/signup" className="text-primary hover:underline font-medium">
              Sign up
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
