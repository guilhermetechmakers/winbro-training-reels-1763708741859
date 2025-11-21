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
import NotFoundPage from "@/pages/NotFoundPage";
import ErrorPage from "@/pages/ErrorPage";
import DashboardLayout from "@/components/layout/DashboardLayout";

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
          
          {/* Dashboard routes with layout */}
          <Route element={<DashboardLayout />}>
            <Route path="/dashboard" element={<UserDashboard />} />
            <Route path="/library" element={<ContentLibrary />} />
            <Route path="/reel/:id" element={<VideoPlayerPage />} />
            <Route path="/upload" element={<UploadReelPage />} />
            <Route path="/reel/:id/edit" element={<EditReelPage />} />
            <Route path="/courses" element={<CourseBuilderPage />} />
            <Route path="/course/:courseId/quiz" element={<QuizPage />} />
            <Route path="/checkout" element={<CheckoutPage />} />
            <Route path="/transactions" element={<TransactionHistoryPage />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/users" element={<AdminUserManagement />} />
            <Route path="/analytics" element={<AnalyticsPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/help" element={<HelpPage />} />
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
