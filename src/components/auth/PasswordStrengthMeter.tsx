import { useMemo } from "react";
import { CheckCircle2, XCircle, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export type PasswordStrength = "weak" | "fair" | "good" | "strong";

interface PasswordStrengthMeterProps {
  password: string;
  className?: string;
}

interface StrengthCriteria {
  label: string;
  test: (password: string) => boolean;
}

const criteria: StrengthCriteria[] = [
  { label: "At least 8 characters", test: (pwd) => pwd.length >= 8 },
  { label: "Contains uppercase letter", test: (pwd) => /[A-Z]/.test(pwd) },
  { label: "Contains lowercase letter", test: (pwd) => /[a-z]/.test(pwd) },
  { label: "Contains number", test: (pwd) => /[0-9]/.test(pwd) },
  { label: "Contains special character", test: (pwd) => /[!@#$%^&*(),.?":{}|<>]/.test(pwd) },
];

export function PasswordStrengthMeter({ password, className }: PasswordStrengthMeterProps) {
  const strength = useMemo<PasswordStrength>(() => {
    if (!password) return "weak";
    
    const metCriteria = criteria.filter((c) => c.test(password)).length;
    const length = password.length;
    
    if (length >= 12 && metCriteria >= 5) return "strong";
    if (length >= 10 && metCriteria >= 4) return "good";
    if (length >= 8 && metCriteria >= 3) return "fair";
    return "weak";
  }, [password]);

  const metCriteria = useMemo(() => {
    return criteria.map((criterion) => ({
      ...criterion,
      met: criterion.test(password),
    }));
  }, [password]);

  const strengthConfig = {
    weak: {
      label: "Weak",
      color: "bg-red-500",
      textColor: "text-red-500",
      bgColor: "bg-red-50",
      borderColor: "border-red-200",
    },
    fair: {
      label: "Fair",
      color: "bg-yellow-500",
      textColor: "text-yellow-600",
      bgColor: "bg-yellow-50",
      borderColor: "border-yellow-200",
    },
    good: {
      label: "Good",
      color: "bg-blue-500",
      textColor: "text-blue-600",
      bgColor: "bg-blue-50",
      borderColor: "border-blue-200",
    },
    strong: {
      label: "Strong",
      color: "bg-success",
      textColor: "text-success",
      bgColor: "bg-green-50",
      borderColor: "border-green-200",
    },
  };

  const config = strengthConfig[strength];
  const strengthPercentage = (metCriteria.filter((c) => c.met).length / criteria.length) * 100;

  if (!password) return null;

  return (
    <div className={cn("space-y-3", className)}>
      {/* Strength indicator bar */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-foreground-secondary">Password strength</span>
          <span className={cn("font-medium", config.textColor)}>{config.label}</span>
        </div>
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <div
            className={cn(
              "h-full transition-all duration-300 ease-out",
              config.color
            )}
            style={{ width: `${strengthPercentage}%` }}
          />
        </div>
      </div>

      {/* Criteria checklist */}
      <div className={cn("rounded-lg border p-3 space-y-2", config.bgColor, config.borderColor)}>
        <div className="text-xs font-medium text-foreground-primary mb-2">
          Password requirements:
        </div>
        {criteria.map((criterion, index) => {
          const met = criterion.test(password);
          return (
            <div
              key={index}
              className="flex items-center gap-2 text-sm transition-all duration-200"
            >
              {met ? (
                <CheckCircle2 className="h-4 w-4 text-success flex-shrink-0" />
              ) : (
                <XCircle className="h-4 w-4 text-foreground-secondary flex-shrink-0" />
              )}
              <span
                className={cn(
                  "transition-colors duration-200",
                  met ? "text-foreground-primary" : "text-foreground-secondary"
                )}
              >
                {criterion.label}
              </span>
            </div>
          );
        })}
      </div>

      {/* Additional feedback */}
      {password.length > 0 && strength === "weak" && (
        <div className="flex items-start gap-2 text-sm text-yellow-600 bg-yellow-50 border border-yellow-200 rounded-lg p-2">
          <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
          <span>Consider adding more characters and mixing different character types for better security.</span>
        </div>
      )}
    </div>
  );
}
