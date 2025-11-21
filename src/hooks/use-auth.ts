import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { authApi, tokenManager } from "@/lib/api";
import type { 
  LoginCredentials, 
  SignupData, 
  PasswordResetRequest, 
  PasswordResetConfirm
} from "@/types";

// Query keys
export const authKeys = {
  all: ['auth'] as const,
  user: () => [...authKeys.all, 'user'] as const,
  sessions: () => [...authKeys.all, 'sessions'] as const,
  ssoProviders: () => [...authKeys.all, 'sso-providers'] as const,
};

// Get current user
export function useCurrentUser() {
  return useQuery({
    queryKey: authKeys.user(),
    queryFn: async () => {
      // Try to get from localStorage first
      const cachedUser = tokenManager.getUser();
      if (cachedUser) {
        // Verify with API
        try {
          const user = await authApi.getCurrentUser();
          tokenManager.setUser(user);
          return user;
        } catch {
          // If API fails, return cached user
          return cachedUser;
        }
      }
      // If no cached user, fetch from API
      const user = await authApi.getCurrentUser();
      tokenManager.setUser(user);
      return user;
    },
    retry: false,
    staleTime: 1000 * 60 * 5, // 5 minutes
    enabled: !!tokenManager.getAccessToken(),
  });
}

// Login mutation
export function useLogin() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (credentials: LoginCredentials) => authApi.login(credentials),
    onSuccess: (data) => {
      // Store tokens and user
      tokenManager.setTokens(data.access_token, data.refresh_token);
      tokenManager.setUser(data.user);
      
      // Invalidate and refetch user
      queryClient.setQueryData(authKeys.user(), data.user);
      
      toast.success("Logged in successfully!");
      navigate("/dashboard");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Login failed. Please check your credentials.");
    },
  });
}

// Signup mutation
export function useSignup() {
  const navigate = useNavigate();

  return useMutation({
    mutationFn: (data: SignupData) => authApi.signup(data),
    onSuccess: () => {
      toast.success("Account created! Please check your email to verify.");
      navigate("/verify-email");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Signup failed. Please try again.");
    },
  });
}

// Logout mutation
export function useLogout() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => authApi.logout(),
    onSuccess: () => {
      // Clear tokens and user
      tokenManager.clearTokens();
      
      // Clear all queries
      queryClient.clear();
      
      toast.success("Logged out successfully");
      navigate("/login");
    },
    onError: (error: Error) => {
      // Even if API call fails, clear local data
      tokenManager.clearTokens();
      queryClient.clear();
      navigate("/login");
      toast.error(error.message || "Logout failed");
    },
  });
}

// Email verification
export function useVerifyEmail() {
  return useMutation({
    mutationFn: (token: string) => authApi.verifyEmail(token),
    onSuccess: (data) => {
      if (data.verified) {
        toast.success("Email verified successfully!");
      } else {
        toast.error(data.message || "Email verification failed");
      }
    },
    onError: (error: Error) => {
      toast.error(error.message || "Email verification failed");
    },
  });
}

// Resend verification email
export function useResendVerification() {
  return useMutation({
    mutationFn: (email?: string) => authApi.resendVerificationEmail(email),
    onSuccess: () => {
      toast.success("Verification email sent!");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to send verification email");
    },
  });
}

// Request password reset
export function useRequestPasswordReset() {
  return useMutation({
    mutationFn: (data: PasswordResetRequest) => authApi.requestPasswordReset(data),
    onSuccess: () => {
      toast.success("Password reset email sent!");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to send reset email");
    },
  });
}

// Reset password
export function useResetPassword() {
  const navigate = useNavigate();

  return useMutation({
    mutationFn: (data: PasswordResetConfirm) => authApi.resetPassword(data),
    onSuccess: () => {
      toast.success("Password reset successfully!");
      navigate("/login");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to reset password");
    },
  });
}

// Get sessions
export function useSessions() {
  return useQuery({
    queryKey: authKeys.sessions(),
    queryFn: () => authApi.getSessions(),
    enabled: !!tokenManager.getAccessToken(),
  });
}

// Revoke session
export function useRevokeSession() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (sessionId: string) => authApi.revokeSession(sessionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: authKeys.sessions() });
      toast.success("Session revoked successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to revoke session");
    },
  });
}

// Revoke all sessions
export function useRevokeAllSessions() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => authApi.revokeAllSessions(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: authKeys.sessions() });
      toast.success("All other sessions revoked");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to revoke sessions");
    },
  });
}

// Get SSO providers
export function useSSOProviders() {
  return useQuery({
    queryKey: authKeys.ssoProviders(),
    queryFn: () => authApi.getSSOProviders(),
    staleTime: 1000 * 60 * 60, // 1 hour
  });
}

// Initiate SSO
export function useInitiateSSO() {
  return useMutation({
    mutationFn: ({ providerId, redirectUrl }: { providerId: string; redirectUrl?: string }) =>
      authApi.initiateSSO(providerId, redirectUrl),
    onSuccess: (data) => {
      // Redirect to SSO provider
      window.location.href = data.auth_url;
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to initiate SSO");
    },
  });
}
