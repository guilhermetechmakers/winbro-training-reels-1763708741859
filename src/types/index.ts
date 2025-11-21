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

// Authentication types
export interface AuthResponse {
  user: User;
  access_token: string;
  refresh_token?: string;
  expires_in: number;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface SignupData {
  email: string;
  password: string;
  full_name: string;
  company: string;
  role: 'trainer' | 'operator' | 'customer_admin';
  accept_terms: boolean;
}

export interface Session {
  session_id: string;
  user_id: string;
  device_info: string;
  ip_address?: string;
  login_time: string;
  last_access_time: string;
  is_current: boolean;
}

export interface SSOProvider {
  provider_id: string;
  provider_name: 'google' | 'microsoft' | 'saml' | 'oidc';
  display_name: string;
  auth_url: string;
}

export interface EmailVerificationResponse {
  verified: boolean;
  message: string;
}

export interface PasswordResetRequest {
  email: string;
}

export interface PasswordResetConfirm {
  token: string;
  password: string;
  confirm_password: string;
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

export interface Enrollment {
  id: string;
  course_id: string;
  user_id: string;
  enrolled_at: string;
  progress: number; // 0-100
  completed_at?: string;
  status: 'enrolled' | 'in_progress' | 'completed' | 'dropped';
  course?: Course;
  user?: User;
}

export interface QuizAttempt {
  id: string;
  quiz_id: string;
  module_id: string;
  user_id: string;
  course_id: string;
  started_at: string;
  submitted_at?: string;
  time_spent?: number; // in seconds
  answers: QuizAnswer[];
  score?: number; // percentage
  passed: boolean;
  status: 'in_progress' | 'submitted' | 'expired';
}

export interface QuizAnswer {
  question_id: string;
  selected_indices: number[];
  is_correct?: boolean;
}

export interface Certificate {
  id: string;
  course_id: string;
  user_id: string;
  issued_at: string;
  verification_id: string;
  pdf_url?: string;
  course?: Course;
  user?: User;
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

export interface Subscription {
  id: string;
  user_id: string;
  plan_id: string;
  status: 'active' | 'cancelled' | 'expired' | 'pending' | 'past_due';
  start_date: string;
  end_date?: string;
  current_period_start: string;
  current_period_end: string;
  cancel_at_period_end: boolean;
  cancelled_at?: string;
  plan?: SubscriptionPlan;
  created_at: string;
  updated_at: string;
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

// Two-Factor Authentication types
export interface TwoFactorAuth {
  user_id: string;
  method: 'totp' | 'sms' | null;
  phone_number?: string;
  is_enabled: boolean;
  is_enforced: boolean;
  recovery_codes_count: number;
  created_at: string;
  updated_at: string;
}

export interface TOTPSetupResponse {
  secret: string;
  qr_code_url: string;
  manual_entry_key: string;
}

export interface SMSOTPRequest {
  phone_number: string;
}

export interface SMSOTPResponse {
  message: string;
  expires_in: number; // seconds
}

export interface Verify2FACodeRequest {
  code: string;
  method?: 'totp' | 'sms';
}

export interface Verify2FACodeResponse {
  verified: boolean;
  message: string;
}

export interface RecoveryCodesResponse {
  codes: string[];
  created_at: string;
}

export interface AuthAttempt {
  id: string;
  user_id: string;
  attempt_time: string;
  success: boolean;
  method: 'totp' | 'sms' | 'recovery_code';
  ip_address?: string;
  user_agent?: string;
}

export interface LoginWith2FARequest extends LoginCredentials {
  two_factor_code?: string;
  recovery_code?: string;
}

export interface LoginWith2FAResponse {
  requires_2fa: boolean;
  auth_response?: AuthResponse;
  message?: string;
}

// Video Upload & Processing types
export interface VideoUpload {
  upload_id: string;
  user_id: string;
  file_name: string;
  file_size: number;
  file_type: string;
  upload_status: 'pending' | 'uploading' | 'uploaded' | 'processing' | 'completed' | 'failed';
  upload_progress: number; // 0-100
  uploaded_bytes: number;
  total_bytes: number;
  upload_url?: string;
  resume_url?: string;
  created_at: string;
  updated_at: string;
}

export interface VideoProcessingJob {
  job_id: string;
  upload_id: string;
  reel_id?: string;
  status: 'pending' | 'scanning' | 'transcoding' | 'transcribing' | 'generating_thumbnails' | 'completed' | 'failed';
  progress: number; // 0-100
  current_step?: string;
  error_message?: string;
  virus_scan_status?: 'pending' | 'scanning' | 'clean' | 'infected';
  transcoding_status?: 'pending' | 'processing' | 'completed' | 'failed';
  transcription_status?: 'pending' | 'processing' | 'completed' | 'failed';
  thumbnail_status?: 'pending' | 'processing' | 'completed' | 'failed';
  created_at: string;
  updated_at: string;
}

export interface UploadInitResponse {
  upload_id: string;
  upload_url: string;
  chunk_size: number;
  resume_url: string;
}

export interface UploadChunkResponse {
  uploaded_bytes: number;
  upload_progress: number;
  is_complete: boolean;
}

export interface ProcessingStatusResponse {
  job: VideoProcessingJob;
  video?: Reel;
}

export interface VideoMetadata {
  title: string;
  description: string;
  machine_model?: string;
  tooling?: string;
  process_step?: string;
  tags?: string[];
  skill_level: 'beginner' | 'intermediate' | 'advanced';
  language: string;
  auto_transcribe: boolean;
  customer_scope?: string;
}

// Structured Metadata & Tagging types
export interface MachineModel {
  id: string;
  name: string;
  description?: string;
  customer_id?: string;
  created_at: string;
  updated_at: string;
}

export interface Tooling {
  id: string;
  name: string;
  description?: string;
  customer_id?: string;
  created_at: string;
  updated_at: string;
}

export interface ProcessStep {
  id: string;
  name: string;
  description?: string;
  customer_id?: string;
  created_at: string;
  updated_at: string;
}

export interface ReelMetadata {
  id: string;
  reel_id: string;
  machine_model_id?: string;
  tooling_id?: string;
  process_step_id?: string;
  tags: string[];
  customer_id?: string;
  created_at: string;
  updated_at: string;
  machine_model?: MachineModel;
  tooling?: Tooling;
  process_step?: ProcessStep;
}

export interface TagSuggestion {
  tag: string;
  confidence: number;
  source: 'transcript' | 'title' | 'description' | 'nlp';
}

export interface NLPTagSuggestionsRequest {
  title?: string;
  description?: string;
  transcript?: string;
  existing_tags?: string[];
}

export interface NLPTagSuggestionsResponse {
  suggestions: TagSuggestion[];
}

export interface MetadataValidationResult {
  valid: boolean;
  errors: {
    field: string;
    message: string;
  }[];
  warnings?: {
    field: string;
    message: string;
  }[];
}

// Search & Filter types
export interface SearchResult {
  id: string;
  type: 'reel' | 'course' | 'transcript';
  title: string;
  description?: string;
  snippet?: string; // Highlighted snippet from transcript
  transcript_highlights?: TranscriptHighlight[];
  thumbnail_url?: string;
  duration?: number;
  machine_model?: string;
  tooling?: string;
  tags: string[];
  skill_level?: 'beginner' | 'intermediate' | 'advanced';
  status: 'draft' | 'pending' | 'published' | 'archived';
  relevance_score: number;
  created_at: string;
  updated_at: string;
}

export interface TranscriptHighlight {
  text: string;
  start_time: number;
  end_time: number;
  confidence?: number;
}

export interface SearchFilters {
  tags?: string[];
  machine_model?: string[];
  tooling?: string[];
  skill_level?: ('beginner' | 'intermediate' | 'advanced')[];
  status?: ('draft' | 'pending' | 'published' | 'archived')[];
  customer_id?: string;
  date_from?: string;
  date_to?: string;
  duration_min?: number;
  duration_max?: number;
  language?: string[];
}

export interface SearchQuery {
  query: string;
  filters?: SearchFilters;
  sort_by?: 'relevance' | 'date' | 'duration' | 'title';
  sort_order?: 'asc' | 'desc';
  page?: number;
  per_page?: number;
}

export interface SearchResponse {
  results: SearchResult[];
  total: number;
  page: number;
  per_page: number;
  total_pages: number;
  facets?: SearchFacets;
  query_time_ms?: number;
}

export interface SearchFacets {
  tags: FacetItem[];
  machine_models: FacetItem[];
  tooling: FacetItem[];
  skill_levels: FacetItem[];
  statuses: FacetItem[];
  languages: FacetItem[];
}

export interface FacetItem {
  value: string;
  count: number;
}

export interface NLPSuggestion {
  text: string;
  type: 'query' | 'tag' | 'machine' | 'tooling';
  confidence: number;
  context?: string;
}

export interface NLPSuggestionsResponse {
  suggestions: NLPSuggestion[];
  query_enhancements?: string[];
}

export interface FilterOptions {
  tags: string[];
  machine_models: string[];
  tooling: string[];
  skill_levels: ('beginner' | 'intermediate' | 'advanced')[];
  statuses: ('draft' | 'pending' | 'published' | 'archived')[];
  languages: string[];
  date_range?: {
    min: string;
    max: string;
  };
  duration_range?: {
    min: number;
    max: number;
  };
}

// Video Player & Offline Downloads types
export interface VideoQuality {
  label: string;
  value: string;
  resolution?: string;
  bitrate?: number;
}

export interface VideoPlayerState {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  playbackRate: number;
  quality: string;
  availableQualities: VideoQuality[];
  isLoading: boolean;
  error?: string;
}

export interface VideoDownload {
  id: string;
  user_id: string;
  video_id: string;
  device_id: string;
  status: 'pending' | 'downloading' | 'completed' | 'failed' | 'expired';
  progress: number; // 0-100
  file_path?: string;
  file_size?: number;
  encrypted: boolean;
  access_token?: string;
  expires_at?: string;
  created_at: string;
  updated_at: string;
}

export interface DownloadRequest {
  video_id: string;
  quality?: string;
  device_id?: string;
}

export interface DownloadResponse {
  download_id: string;
  download_url: string;
  file_size: number;
  expires_at: string;
  access_token: string;
}

export interface PlaybackAnalytics {
  id: string;
  user_id: string;
  video_id: string;
  event_type: 'play' | 'pause' | 'seek' | 'complete' | 'quality_change' | 'volume_change';
  timestamp: number; // video timestamp in seconds
  duration?: number; // event duration in seconds
  metadata?: {
    quality?: string;
    volume?: number;
    playback_rate?: number;
    seek_from?: number;
    seek_to?: number;
  };
  created_at: string;
}

export interface PlaybackSession {
  session_id: string;
  user_id: string;
  video_id: string;
  start_time: string;
  end_time?: string;
  total_watch_time: number; // in seconds
  completion_percentage: number; // 0-100
  events: PlaybackAnalytics[];
  created_at: string;
  updated_at: string;
}

export interface DeviceRegistration {
  device_id: string;
  user_id: string;
  device_name: string;
  device_type: 'desktop' | 'mobile' | 'tablet';
  os?: string;
  browser?: string;
  is_active: boolean;
  registered_at: string;
  last_used_at?: string;
}

export interface OfflineVideoAccess {
  video_id: string;
  device_id: string;
  access_token: string;
  expires_at: string;
  is_valid: boolean;
}

// Notifications & Email types
export interface Notification {
  id: string;
  user_id: string;
  type: 'course_invite' | 'content_update' | 'admin_alert' | 'system' | 'course_completed' | 'quiz_result';
  title: string;
  message: string;
  status: 'read' | 'unread';
  action_url?: string;
  action_label?: string;
  metadata?: {
    course_id?: string;
    reel_id?: string;
    quiz_id?: string;
    [key: string]: unknown;
  };
  created_at: string;
  read_at?: string;
}

export interface NotificationPreferences {
  user_id: string;
  channels: {
    in_app: boolean;
    email: boolean;
  };
  types: {
    course_invites: boolean;
    content_updates: boolean;
    admin_alerts: boolean;
    system_notifications: boolean;
    course_completed: boolean;
    quiz_results: boolean;
  };
  email_frequency: 'instant' | 'digest' | 'daily' | 'weekly';
  digest_time?: string; // HH:MM format
  created_at: string;
  updated_at: string;
}

export interface EmailLog {
  id: string;
  user_id: string;
  email_type: 'course_invite' | 'verification' | 'password_reset' | 'course_invite' | 'content_update' | 'admin_alert' | 'digest' | 'billing';
  recipient_email: string;
  subject: string;
  status: 'pending' | 'sent' | 'delivered' | 'bounced' | 'failed';
  sent_at?: string;
  delivered_at?: string;
  bounced_at?: string;
  retry_count: number;
  error_message?: string;
  created_at: string;
  updated_at: string;
}

export interface NotificationCount {
  unread: number;
  total: number;
}

// Admin Tools & Content Moderation types
export interface ModerationQueueItem {
  id: string;
  reel_id: string;
  creator_id: string;
  creator_name: string;
  creator_email: string;
  title: string;
  description: string;
  thumbnail_url?: string;
  duration: number;
  submission_date: string;
  status: 'pending' | 'approved' | 'rejected' | 'needs_revision';
  feedback?: string;
  reviewed_by?: string;
  reviewed_at?: string;
  reel?: Reel;
}

export interface ModerationAction {
  item_id: string;
  action: 'approve' | 'reject' | 'request_revision';
  feedback?: string;
}

export interface LibraryProvision {
  id: string;
  name: string;
  description?: string;
  customer_id?: string;
  assigned_user_groups: string[];
  reel_ids: string[];
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface AdminSupportTicket {
  id: string;
  ticket_id: string;
  user_id: string;
  user_name: string;
  user_email: string;
  issue_type: 'technical' | 'billing' | 'content' | 'account' | 'other';
  subject: string;
  message: string;
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  assigned_to?: string;
  assigned_to_name?: string;
  resolution?: string;
  created_at: string;
  updated_at: string;
  resolved_at?: string;
}

export interface AuditLog {
  id: string;
  log_id: string;
  action_type: 'content_approve' | 'content_reject' | 'user_create' | 'user_update' | 'user_deactivate' | 'library_create' | 'library_update' | 'library_delete' | 'ticket_assign' | 'ticket_resolve' | 'subscription_update' | 'system_config';
  admin_id: string;
  admin_name: string;
  target_type: 'content' | 'user' | 'library' | 'ticket' | 'subscription' | 'system';
  target_id: string;
  description: string;
  metadata?: Record<string, unknown>;
  ip_address?: string;
  user_agent?: string;
  timestamp: string;
  created_at: string;
}

export interface AdminKPIs {
  active_customers: number;
  videos_uploaded: number;
  weekly_views: number;
  pending_moderations: number;
  open_tickets: number;
  total_users: number;
  active_subscriptions: number;
}

export interface AdminDashboardStats {
  kpis: AdminKPIs;
  moderation_queue_count: number;
  recent_activity: AuditLog[];
  system_health: {
    status: 'healthy' | 'degraded' | 'down';
    message?: string;
  };
}
