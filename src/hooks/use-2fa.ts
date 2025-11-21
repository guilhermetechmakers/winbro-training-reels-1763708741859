import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { twoFactorApi } from "@/lib/api";
import type { 
  SMSOTPRequest,
  Verify2FACodeRequest,
} from "@/types";

// Query keys
export const twoFactorKeys = {
  all: ['2fa'] as const,
  status: () => [...twoFactorKeys.all, 'status'] as const,
  recoveryCodes: () => [...twoFactorKeys.all, 'recovery-codes'] as const,
  attempts: (limit?: number) => [...twoFactorKeys.all, 'attempts', limit] as const,
};

// Get 2FA status
export function use2FAStatus() {
  return useQuery({
    queryKey: twoFactorKeys.status(),
    queryFn: () => twoFactorApi.get2FAStatus(),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

// Generate TOTP secret
export function useGenerateTOTPSecret() {
  return useMutation({
    mutationFn: () => twoFactorApi.generateTOTPSecret(),
    onError: (error: Error) => {
      toast.error(error.message || "Failed to generate TOTP secret");
    },
  });
}

// Verify TOTP setup
export function useVerifyTOTPSetup() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (code: string) => twoFactorApi.verifyTOTPSetup(code),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: twoFactorKeys.status() });
      if (data.verified) {
        toast.success("2FA enabled successfully!");
      } else {
        toast.error("Invalid code. Please try again.");
      }
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to verify TOTP code");
    },
  });
}

// Send SMS OTP
export function useSendSMSOTP() {
  return useMutation({
    mutationFn: (data: SMSOTPRequest) => twoFactorApi.sendSMSOTP(data),
    onSuccess: () => {
      toast.success("Verification code sent to your phone");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to send SMS code");
    },
  });
}

// Verify SMS OTP
export function useVerifySMSOTP() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { phone_number: string; code: string }) => 
      twoFactorApi.verifySMSOTP(data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: twoFactorKeys.status() });
      if (data.verified) {
        toast.success("2FA enabled successfully!");
      } else {
        toast.error("Invalid code. Please try again.");
      }
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to verify SMS code");
    },
  });
}

// Verify 2FA code (for login)
export function useVerify2FACode() {
  return useMutation({
    mutationFn: (data: Verify2FACodeRequest) => twoFactorApi.verify2FACode(data),
    onError: (error: Error) => {
      toast.error(error.message || "Invalid 2FA code");
    },
  });
}

// Disable 2FA
export function useDisable2FA() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => twoFactorApi.disable2FA(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: twoFactorKeys.status() });
      toast.success("2FA disabled successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to disable 2FA");
    },
  });
}

// Regenerate recovery codes
export function useRegenerateRecoveryCodes() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => twoFactorApi.regenerateRecoveryCodes(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: twoFactorKeys.recoveryCodes() });
      toast.success("Recovery codes regenerated. Please save them securely.");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to regenerate recovery codes");
    },
  });
}

// Get recovery codes
export function useRecoveryCodes() {
  return useQuery({
    queryKey: twoFactorKeys.recoveryCodes(),
    queryFn: () => twoFactorApi.getRecoveryCodes(),
    enabled: false, // Only fetch when explicitly needed
    retry: false,
  });
}

// Get auth attempts
export function useAuthAttempts(limit?: number) {
  return useQuery({
    queryKey: twoFactorKeys.attempts(limit),
    queryFn: () => twoFactorApi.getAuthAttempts(limit),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}
