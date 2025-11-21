import { BrowserRouter, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as SonnerToaster } from "sonner";
import LandingPage from "@/pages/LandingPage";
import LoginPage from "@/pages/LoginPage";
import SignupPage from "@/pages/SignupPage";
import EmailVerificationPage from "@/pages/EmailVerificationPage";
import PasswordResetPage from "@/pages/PasswordResetPage";
import UserDashboard from "@/pages/UserDashboard";
import ContentLibrary from "@/pages/ContentLibrary";
import VideoPlayerPage from "@/pages/VideoPlayerPage";
import UploadReelPage from "@/pages/UploadReelPage";
import EditReelPage from "@/pages/EditReelPage";
import CourseBuilderPage from "@/pages/CourseBuilderPage";
import QuizPage from "@/pages/QuizPage";
import CheckoutPage from "@/pages/CheckoutPage";
import TransactionHistoryPage from "@/pages/TransactionHistoryPage";
import AdminDashboard from "@/pages/AdminDashboard";
import AdminUserManagement from "@/pages/AdminUserManagement";
import AnalyticsPage from "@/pages/AnalyticsPage";
import SettingsPage from "@/pages/SettingsPage";
import HelpPage from "@/pages/HelpPage";
import PrivacyPolicyPage from "@/pages/PrivacyPolicyPage";
import TermsOfServicePage from "@/pages/TermsOfServicePage";
import CookiePolicyPage from "@/pages/CookiePolicyPage";
import NotFoundPage from "@/pages/NotFoundPage";
import ErrorPage from "@/pages/ErrorPage";
import SearchResultsPage from "@/pages/SearchResultsPage";
import DashboardLayout from "@/components/layout/DashboardLayout";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import SessionManagementPage from "@/pages/SessionManagementPage";
import NotificationSettingsPage from "@/pages/NotificationSettingsPage";

// React Query client with optimal defaults
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 10, // 10 minutes (formerly cacheTime)
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/verify-email" element={<EmailVerificationPage />} />
          <Route path="/reset-password" element={<PasswordResetPage />} />
          <Route path="/privacy" element={<PrivacyPolicyPage />} />
          <Route path="/terms" element={<TermsOfServicePage />} />
          <Route path="/cookies" element={<CookiePolicyPage />} />
          
          {/* Dashboard routes with layout and protection */}
          <Route element={<DashboardLayout />}>
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  <UserDashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/library" 
              element={
                <ProtectedRoute>
                  <ContentLibrary />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/search" 
              element={
                <ProtectedRoute>
                  <SearchResultsPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/reel/:id" 
              element={
                <ProtectedRoute>
                  <VideoPlayerPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/upload" 
              element={
                <ProtectedRoute>
                  <UploadReelPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/reel/:id/edit" 
              element={
                <ProtectedRoute>
                  <EditReelPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/courses" 
              element={
                <ProtectedRoute>
                  <CourseBuilderPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/course/:courseId/quiz" 
              element={
                <ProtectedRoute>
                  <QuizPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/checkout" 
              element={
                <ProtectedRoute>
                  <CheckoutPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/transactions" 
              element={
                <ProtectedRoute>
                  <TransactionHistoryPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin" 
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminDashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/users" 
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminUserManagement />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/analytics" 
              element={
                <ProtectedRoute>
                  <AnalyticsPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/settings" 
              element={
                <ProtectedRoute>
                  <SettingsPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/settings/notifications" 
              element={
                <ProtectedRoute>
                  <NotificationSettingsPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/sessions" 
              element={
                <ProtectedRoute>
                  <SessionManagementPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/help" 
              element={
                <ProtectedRoute>
                  <HelpPage />
                </ProtectedRoute>
              } 
            />
          </Route>
          
          {/* Error pages */}
          <Route path="/404" element={<NotFoundPage />} />
          <Route path="/500" element={<ErrorPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </BrowserRouter>
      <Toaster />
      <SonnerToaster />
    </QueryClientProvider>
  );
}
