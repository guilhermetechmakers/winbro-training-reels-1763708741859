import { Navigate } from "react-router-dom";
import { useCurrentUser } from "@/hooks/use-auth";
import { tokenManager } from "@/lib/api";
import { LoadingState } from "@/components/states";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  allowedRoles?: Array<'admin' | 'trainer' | 'operator' | 'customer_admin'>;
}

export default function ProtectedRoute({ 
  children, 
  requireAuth = true,
  allowedRoles 
}: ProtectedRouteProps) {
  const hasToken = !!tokenManager.getAccessToken();
  const { data: user, isLoading, isError } = useCurrentUser();

  // If auth is not required, render children
  if (!requireAuth) {
    return <>{children}</>;
  }

  // Show loading state while checking auth
  if (isLoading && hasToken) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingState variant="card" />
      </div>
    );
  }

  // If no token or error, redirect to login
  if (!hasToken || isError || !user) {
    return <Navigate to="/login" replace />;
  }

  // Check role-based access
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}
