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
