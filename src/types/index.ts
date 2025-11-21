// Common types for the application

export interface User {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
  role: 'admin' | 'trainer' | 'operator' | 'customer_admin';
  created_at: string;
  updated_at: string;
}

export interface Reel {
  id: string;
  title: string;
  description: string;
  duration: number; // in seconds
  thumbnail_url?: string;
  video_url: string;
  hls_url?: string;
  machine_model?: string;
  tooling?: string;
  process_step?: string;
  tags: string[];
  skill_level: 'beginner' | 'intermediate' | 'advanced';
  language: string;
  status: 'draft' | 'pending' | 'published' | 'archived';
  uploader_id: string;
  customer_id?: string;
  created_at: string;
  updated_at: string;
  transcript?: Transcript;
}

export interface Transcript {
  id: string;
  reel_id: string;
  text: string;
  segments: TranscriptSegment[];
  version: number;
  created_at: string;
  updated_at: string;
}

export interface TranscriptSegment {
  id: string;
  start: number; // timestamp in seconds
  end: number;
  text: string;
  confidence?: number;
}

export interface Course {
  id: string;
  title: string;
  description: string;
  modules: CourseModule[];
  target_roles: string[];
  prerequisites?: string[];
  estimated_time: number; // in minutes
  status: 'draft' | 'published' | 'archived';
  created_at: string;
  updated_at: string;
}

export interface CourseModule {
  id: string;
  reel_id: string;
  order: number;
  quiz?: Quiz;
}

export interface Quiz {
  id: string;
  module_id: string;
  questions: QuizQuestion[];
  time_limit?: number; // in seconds
  pass_threshold: number; // percentage
}

export interface QuizQuestion {
  id: string;
  type: 'single' | 'multiple';
  question: string;
  options: string[];
  correct_answers: number[]; // indices
  explanation?: string;
}

export interface Library {
  id: string;
  name: string;
  customer_id: string;
  reel_ids: string[];
  created_at: string;
  updated_at: string;
}

export interface Transaction {
  id: string;
  user_id: string;
  date: string;
  plan: string;
  amount: number;
  status: 'completed' | 'pending' | 'failed' | 'refunded';
  invoice_link?: string;
  refund_requested: boolean;
  created_at: string;
  updated_at: string;
}

export interface Invoice {
  id: string;
  transaction_id: string;
  pdf_link?: string;
  issue_date: string;
  created_at: string;
}

export interface Refund {
  id: string;
  transaction_id: string;
  user_id: string;
  request_date: string;
  status: 'pending' | 'approved' | 'rejected' | 'processed';
  reason?: string;
  comments?: string;
  created_at: string;
  updated_at: string;
}

export interface BillingContact {
  user_id: string;
  contact_name: string;
  email: string;
  phone?: string;
  created_at: string;
  updated_at: string;
}

export interface PaymentMethod {
  id: string;
  user_id: string;
  method_type: 'card' | 'bank_account' | 'other';
  card_last_four?: string;
  card_brand?: string;
  expiration_date?: string;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

export interface ReelVersion {
  id: string;
  reel_id: string;
  version_number: number;
  changes: string; // JSON string or description of changes
  created_by: string;
  created_at: string;
  metadata_snapshot: Partial<Reel>;
}

export interface ReprocessJob {
  id: string;
  reel_id: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress?: number; // 0-100
  error_message?: string;
  created_at: string;
  updated_at: string;
}

export interface ReelPermission {
  id: string;
  reel_id: string;
  user_id?: string;
  access_level: 'view' | 'edit' | 'admin';
  visibility: 'tenant' | 'public' | 'internal';
  created_at: string;
  updated_at: string;
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  description: string;
  price: number; // monthly price in USD
  billing_interval: 'monthly' | 'yearly';
  features: string[];
  max_users?: number;
  max_reels?: number;
  max_storage_gb?: number;
  is_popular?: boolean;
}

export interface PromoCode {
  id: string;
  code: string;
  discount_type: 'percentage' | 'fixed';
  discount_value: number;
  expiration_date?: string;
  usage_limit?: number;
  usage_count: number;
  is_active: boolean;
}

export interface InvoicePreview {
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  currency: string;
  billing_period: string;
  promo_code?: string;
}

export interface CheckoutData {
  plan_id: string;
  billing_details: {
    company_name: string;
    billing_address: {
      street: string;
      city: string;
      state: string;
      zip_code: string;
      country: string;
    };
    tax_id?: string;
  };
  payment_method_id?: string;
  payment_method?: {
    card_number: string;
    expiry_month: string;
    expiry_year: string;
    cvv: string;
    cardholder_name: string;
  };
  promo_code?: string;
  save_payment_method: boolean;
  terms_accepted: boolean;
}

export interface CheckoutResponse {
  transaction_id: string;
  subscription_id: string;
  invoice_id: string;
  success: boolean;
  message: string;
}

// Help & Support types
export interface FAQ {
  question_id: string;
  question_text: string;
  answer_text: string;
  category: string;
  created_at: string;
  updated_at: string;
}

export interface UserGuide {
  guide_id: string;
  title: string;
  content: string;
  category: string;
  created_at: string;
  updated_at: string;
}

export interface SupportTicket {
  ticket_id: string;
  user_name: string;
  user_email: string;
  message: string;
  attachment_path?: string;
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  created_at: string;
  updated_at: string;
}

export interface VideoTutorial {
  video_id: string;
  title: string;
  description: string;
  video_url: string;
  thumbnail_url?: string;
  duration?: number;
  category: string;
  created_at: string;
}

export interface ReleaseNote {
  release_id: string;
  version: string;
  description: string;
  date: string;
  features?: string[];
  bug_fixes?: string[];
  improvements?: string[];
  created_at: string;
}

export interface SystemStatus {
  status_id: string;
  current_status: 'operational' | 'degraded' | 'down' | 'maintenance';
  message?: string;
  last_updated: string;
  incidents?: SystemIncident[];
}

export interface SystemIncident {
  id: string;
  title: string;
  description: string;
  status: 'investigating' | 'identified' | 'monitoring' | 'resolved';
  severity: 'minor' | 'major' | 'critical';
  started_at: string;
  resolved_at?: string;
}

export interface OnboardingChecklistItem {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  order: number;
}

// Privacy & Data Subject Request types
export interface DataSubjectRequest {
  request_id: string;
  user_id: string;
  request_type: 'access' | 'correction' | 'deletion';
  request_status: 'pending' | 'in_progress' | 'completed' | 'rejected';
  request_date: string;
  completion_date?: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

export interface PrivacyPolicySection {
  section_id: string;
  section_title: string;
  content: string;
  order: number;
  last_updated: string;
}

export interface PrivacyPolicy {
  policy_id: string;
  sections: PrivacyPolicySection[];
  last_updated: string;
  version: string;
}

// Terms of Service types
export interface TermsOfServiceSection {
  section_id: string;
  section_title: string;
  content: string;
  order: number;
  last_updated: string;
}

export interface TermsOfService {
  version_id: string;
  effective_date: string;
  content?: string; // Full text content (if not using sections)
  sections?: TermsOfServiceSection[]; // Structured sections
  is_active: boolean;
  last_updated: string;
  version: string;
}

export interface UserAgreement {
  agreement_id: string;
  user_id: string;
  version_id: string;
  accepted_date: string;
  ip_address?: string;
  user_agent?: string;
  created_at: string;
}

// Cookie Preferences types
export interface CookiePreferences {
  user_id: string;
  essential_cookies: boolean;
  performance_cookies: boolean;
  functional_cookies: boolean;
  targeting_cookies: boolean;
  consent_date: string;
  created_at: string;
  updated_at: string;
}

export interface CookieCategory {
  id: 'essential' | 'performance' | 'functional' | 'targeting';
  name: string;
  description: string;
  required: boolean;
}

// Error Report types
export interface ErrorReport {
  id: string;
  request_id: string;
  user_id?: string;
  user_email?: string;
  user_name?: string;
  error_description: string;
  user_agent?: string;
  url?: string;
  timestamp: string;
  status: 'pending' | 'reviewed' | 'resolved';
  created_at: string;
  updated_at: string;
}
