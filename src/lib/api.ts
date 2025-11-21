// Simple fetch wrapper with error handling
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${import.meta.env.VITE_API_URL || 'http://localhost:3000/api'}${endpoint}`;
  
  const config: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  // Add auth token if available
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers = {
      ...config.headers,
      Authorization: `Bearer ${token}`,
    };
  }

  const response = await fetch(url, config);

  if (!response.ok) {
    if (response.status === 401) {
      // Clear auth data on unauthorized
      localStorage.removeItem('auth_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user');
      // Only redirect if not already on auth pages
      if (!window.location.pathname.includes('/login') && 
          !window.location.pathname.includes('/signup') &&
          !window.location.pathname.includes('/verify-email') &&
          !window.location.pathname.includes('/reset-password')) {
        window.location.href = '/login';
      }
    }
    const error = await response.json().catch(() => ({ message: `API Error: ${response.status}` }));
    throw new Error(error.message || `API Error: ${response.status}`);
  }

  return response.json();
}

// Token management utilities
export const tokenManager = {
  setTokens: (accessToken: string, refreshToken?: string) => {
    localStorage.setItem('auth_token', accessToken);
    if (refreshToken) {
      localStorage.setItem('refresh_token', refreshToken);
    }
  },
  
  getAccessToken: (): string | null => {
    return localStorage.getItem('auth_token');
  },
  
  getRefreshToken: (): string | null => {
    return localStorage.getItem('refresh_token');
  },
  
  clearTokens: () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
  },
  
  setUser: (user: import("@/types").User) => {
    localStorage.setItem('user', JSON.stringify(user));
  },
  
  getUser: (): import("@/types").User | null => {
    const userStr = localStorage.getItem('user');
    if (!userStr) return null;
    try {
      return JSON.parse(userStr);
    } catch {
      return null;
    }
  },
};

// API utilities
export const api = {
  get: <T>(endpoint: string) => apiRequest<T>(endpoint),
  post: <T>(endpoint: string, data: unknown) => 
    apiRequest<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  put: <T>(endpoint: string, data: unknown) => 
    apiRequest<T>(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  patch: <T>(endpoint: string, data: unknown) => 
    apiRequest<T>(endpoint, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),
  delete: <T = void>(endpoint: string) => 
    apiRequest<T>(endpoint, { method: 'DELETE' }),
};

// Transaction-related API functions
export const transactionsApi = {
  getTransactions: (filters?: { startDate?: string; endDate?: string; status?: string }): Promise<import("@/types").Transaction[]> => {
    const params = new URLSearchParams();
    if (filters?.startDate) params.append('startDate', filters.startDate);
    if (filters?.endDate) params.append('endDate', filters.endDate);
    if (filters?.status) params.append('status', filters.status);
    const query = params.toString();
    return api.get<import("@/types").Transaction[]>(`/transactions${query ? `?${query}` : ''}`);
  },
  getTransaction: (id: string): Promise<import("@/types").Transaction> => api.get<import("@/types").Transaction>(`/transactions/${id}`),
  getInvoice: (transactionId: string): Promise<import("@/types").Invoice> => api.get<import("@/types").Invoice>(`/transactions/${transactionId}/invoice`),
  downloadInvoice: async (transactionId: string) => {
    const url = `${import.meta.env.VITE_API_URL || 'http://localhost:3000/api'}/transactions/${transactionId}/invoice/download`;
    const token = localStorage.getItem('auth_token');
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    if (!response.ok) throw new Error('Failed to download invoice');
    const blob = await response.blob();
    const downloadUrl = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = downloadUrl;
    a.download = `invoice-${transactionId}.pdf`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(downloadUrl);
    document.body.removeChild(a);
  },
  requestRefund: (transactionId: string, data: { reason?: string; comments?: string }): Promise<import("@/types").Refund> =>
    api.post<import("@/types").Refund>(`/transactions/${transactionId}/refund`, data),
  getBillingContact: (): Promise<import("@/types").BillingContact> => api.get<import("@/types").BillingContact>('/billing/contact'),
  updateBillingContact: (data: { contact_name: string; email: string; phone?: string }): Promise<import("@/types").BillingContact> =>
    api.put<import("@/types").BillingContact>('/billing/contact', data),
  getPaymentMethods: (): Promise<import("@/types").PaymentMethod[]> => api.get<import("@/types").PaymentMethod[]>('/billing/payment-methods'),
  addPaymentMethod: (data: unknown): Promise<import("@/types").PaymentMethod> => api.post<import("@/types").PaymentMethod>('/billing/payment-methods', data),
  updatePaymentMethod: (id: string, data: unknown): Promise<import("@/types").PaymentMethod> => api.put<import("@/types").PaymentMethod>(`/billing/payment-methods/${id}`, data),
  deletePaymentMethod: (id: string): Promise<void> => api.delete(`/billing/payment-methods/${id}`),
};

// Reel management API functions
export const reelsApi = {
  getReel: (id: string): Promise<import("@/types").Reel> => api.get<import("@/types").Reel>(`/reels/${id}`),
  updateReel: (id: string, data: Partial<import("@/types").Reel>): Promise<import("@/types").Reel> =>
    api.put<import("@/types").Reel>(`/reels/${id}`, data),
  getReelVersions: (id: string): Promise<import("@/types").ReelVersion[]> =>
    api.get<import("@/types").ReelVersion[]>(`/reels/${id}/versions`),
  rollbackToVersion: (reelId: string, versionId: string): Promise<import("@/types").Reel> =>
    api.post<import("@/types").Reel>(`/reels/${reelId}/versions/${versionId}/rollback`, {}),
  startReprocess: (id: string): Promise<import("@/types").ReprocessJob> =>
    api.post<import("@/types").ReprocessJob>(`/reels/${id}/reprocess`, {}),
  getReprocessStatus: (reelId: string, jobId: string): Promise<import("@/types").ReprocessJob> =>
    api.get<import("@/types").ReprocessJob>(`/reels/${reelId}/reprocess/${jobId}`),
  cancelReprocess: (reelId: string, jobId: string): Promise<void> =>
    api.delete(`/reels/${reelId}/reprocess/${jobId}`),
  getTranscript: (reelId: string): Promise<import("@/types").Transcript> =>
    api.get<import("@/types").Transcript>(`/reels/${reelId}/transcript`),
  updateTranscript: (reelId: string, data: { segments: import("@/types").TranscriptSegment[]; change_note?: string }): Promise<import("@/types").Transcript> =>
    api.put<import("@/types").Transcript>(`/reels/${reelId}/transcript`, data),
  getPermissions: (reelId: string): Promise<import("@/types").ReelPermission> =>
    api.get<import("@/types").ReelPermission>(`/reels/${reelId}/permissions`),
  updatePermissions: (reelId: string, data: { visibility: 'tenant' | 'public' | 'internal'; access_level?: 'view' | 'edit' | 'admin' }): Promise<import("@/types").ReelPermission> =>
    api.put<import("@/types").ReelPermission>(`/reels/${reelId}/permissions`, data),
};

// Checkout and subscription API functions
export const checkoutApi = {
  getPlans: (): Promise<import("@/types").SubscriptionPlan[]> => 
    api.get<import("@/types").SubscriptionPlan[]>('/subscriptions/plans'),
  getPlan: (id: string): Promise<import("@/types").SubscriptionPlan> => 
    api.get<import("@/types").SubscriptionPlan>(`/subscriptions/plans/${id}`),
  validatePromoCode: (code: string, planId: string): Promise<import("@/types").PromoCode> => 
    api.post<import("@/types").PromoCode>('/checkout/validate-promo', { code, plan_id: planId }),
  generateInvoicePreview: (planId: string, promoCode?: string): Promise<import("@/types").InvoicePreview> => {
    const params = new URLSearchParams();
    params.append('plan_id', planId);
    if (promoCode) params.append('promo_code', promoCode);
    return api.get<import("@/types").InvoicePreview>(`/checkout/invoice-preview?${params.toString()}`);
  },
  processCheckout: (data: import("@/types").CheckoutData): Promise<import("@/types").CheckoutResponse> => 
    api.post<import("@/types").CheckoutResponse>('/checkout/process', data),
};

// Help & Support API functions
export const helpApi = {
  searchFAQs: (query: string): Promise<import("@/types").FAQ[]> => {
    const params = new URLSearchParams();
    params.append('q', query);
    return api.get<import("@/types").FAQ[]>(`/help/faqs/search?${params.toString()}`);
  },
  getFAQs: (category?: string): Promise<import("@/types").FAQ[]> => {
    const params = new URLSearchParams();
    if (category) params.append('category', category);
    const query = params.toString();
    return api.get<import("@/types").FAQ[]>(`/help/faqs${query ? `?${query}` : ''}`);
  },
  getFAQCategories: (): Promise<string[]> => 
    api.get<string[]>('/help/faqs/categories'),
  getUserGuides: (category?: string): Promise<import("@/types").UserGuide[]> => {
    const params = new URLSearchParams();
    if (category) params.append('category', category);
    const query = params.toString();
    return api.get<import("@/types").UserGuide[]>(`/help/guides${query ? `?${query}` : ''}`);
  },
  submitSupportTicket: async (data: { name: string; email: string; message: string; attachment?: File }): Promise<import("@/types").SupportTicket> => {
    const formData = new FormData();
    formData.append('name', data.name);
    formData.append('email', data.email);
    formData.append('message', data.message);
    if (data.attachment) {
      formData.append('attachment', data.attachment);
    }
    
    const url = `${import.meta.env.VITE_API_URL || 'http://localhost:3000/api'}/help/support/submit`;
    const token = localStorage.getItem('auth_token');
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: token ? `Bearer ${token}` : '',
      },
      body: formData,
    });
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: `API Error: ${response.status}` }));
      throw new Error(error.message || `API Error: ${response.status}`);
    }
    
    return response.json();
  },
  getVideoTutorials: (category?: string): Promise<import("@/types").VideoTutorial[]> => {
    const params = new URLSearchParams();
    if (category) params.append('category', category);
    const query = params.toString();
    return api.get<import("@/types").VideoTutorial[]>(`/help/tutorials${query ? `?${query}` : ''}`);
  },
  getOnboardingChecklist: (): Promise<import("@/types").OnboardingChecklistItem[]> => 
    api.get<import("@/types").OnboardingChecklistItem[]>('/help/onboarding/checklist'),
  updateOnboardingChecklistItem: (itemId: string, completed: boolean): Promise<import("@/types").OnboardingChecklistItem> =>
    api.patch<import("@/types").OnboardingChecklistItem>(`/help/onboarding/checklist/${itemId}`, { completed }),
  getSystemStatus: (): Promise<import("@/types").SystemStatus> => 
    api.get<import("@/types").SystemStatus>('/help/system/status'),
  getReleaseNotes: (limit?: number): Promise<import("@/types").ReleaseNote[]> => {
    const params = new URLSearchParams();
    if (limit) params.append('limit', limit.toString());
    const query = params.toString();
    return api.get<import("@/types").ReleaseNote[]>(`/help/releases${query ? `?${query}` : ''}`);
  },
};

// Privacy & Data Subject Request API functions
export const privacyApi = {
  getPrivacyPolicy: (): Promise<import("@/types").PrivacyPolicy> =>
    api.get<import("@/types").PrivacyPolicy>('/privacy/policy'),
  submitDataRequest: (data: { request_type: 'access' | 'correction' | 'deletion'; description?: string }): Promise<import("@/types").DataSubjectRequest> =>
    api.post<import("@/types").DataSubjectRequest>('/privacy/data-requests', data),
  getDataRequests: (): Promise<import("@/types").DataSubjectRequest[]> =>
    api.get<import("@/types").DataSubjectRequest[]>('/privacy/data-requests'),
  getDataRequest: (requestId: string): Promise<import("@/types").DataSubjectRequest> =>
    api.get<import("@/types").DataSubjectRequest>(`/privacy/data-requests/${requestId}`),
  sendPrivacyInquiry: (data: { name: string; email: string; message: string }): Promise<{ success: boolean; message: string }> =>
    api.post<{ success: boolean; message: string }>('/privacy/inquiry', data),
};

// Terms of Service API functions
export const termsApi = {
  getTermsOfService: (): Promise<import("@/types").TermsOfService> =>
    api.get<import("@/types").TermsOfService>('/terms/current'),
  recordUserAgreement: (data: { version_id: string; ip_address?: string; user_agent?: string }): Promise<import("@/types").UserAgreement> =>
    api.post<import("@/types").UserAgreement>('/terms/accept', data),
  getUserAgreements: (): Promise<import("@/types").UserAgreement[]> =>
    api.get<import("@/types").UserAgreement[]>('/terms/agreements'),
};

// Cookie Preferences API functions
export const cookieApi = {
  getCookiePreferences: (): Promise<import("@/types").CookiePreferences> =>
    api.get<import("@/types").CookiePreferences>('/cookies/preferences'),
  updateCookiePreferences: (data: {
    essential_cookies: boolean;
    performance_cookies: boolean;
    functional_cookies: boolean;
    targeting_cookies: boolean;
  }): Promise<import("@/types").CookiePreferences> =>
    api.put<import("@/types").CookiePreferences>('/cookies/preferences', data),
  getCookieCategories: (): Promise<import("@/types").CookieCategory[]> =>
    api.get<import("@/types").CookieCategory[]>('/cookies/categories'),
};

// Error Report API functions
export const errorReportApi = {
  submitErrorReport: (data: {
    request_id: string;
    user_email?: string;
    user_name?: string;
    error_description: string;
    user_agent?: string;
    url?: string;
  }): Promise<import("@/types").ErrorReport> =>
    api.post<import("@/types").ErrorReport>('/errors/report', data),
};

// Authentication API functions
export const authApi = {
  login: (credentials: import("@/types").LoginCredentials): Promise<import("@/types").AuthResponse> => {
    return api.post<import("@/types").AuthResponse>('/auth/login', credentials);
  },
  
  signup: (data: import("@/types").SignupData): Promise<{ message: string; user_id: string }> => {
    return api.post<{ message: string; user_id: string }>('/auth/signup', data);
  },
  
  logout: (): Promise<{ message: string }> => {
    return api.post<{ message: string }>('/auth/logout', {});
  },
  
  refreshToken: (refreshToken: string): Promise<import("@/types").AuthResponse> => {
    return api.post<import("@/types").AuthResponse>('/auth/refresh', { refresh_token: refreshToken });
  },
  
  getCurrentUser: (): Promise<import("@/types").User> => {
    return api.get<import("@/types").User>('/auth/me');
  },
  
  verifyEmail: (token: string): Promise<import("@/types").EmailVerificationResponse> => {
    return api.post<import("@/types").EmailVerificationResponse>('/auth/verify-email', { token });
  },
  
  resendVerificationEmail: (email?: string): Promise<{ message: string }> => {
    return api.post<{ message: string }>('/auth/resend-verification', email ? { email } : {});
  },
  
  requestPasswordReset: (data: import("@/types").PasswordResetRequest): Promise<{ message: string }> => {
    return api.post<{ message: string }>('/auth/request-password-reset', data);
  },
  
  resetPassword: (data: import("@/types").PasswordResetConfirm): Promise<{ message: string }> => {
    return api.post<{ message: string }>('/auth/reset-password', data);
  },
  
  getSessions: (): Promise<import("@/types").Session[]> => {
    return api.get<import("@/types").Session[]>('/auth/sessions');
  },
  
  revokeSession: (sessionId: string): Promise<{ message: string }> => {
    return api.delete<{ message: string }>(`/auth/sessions/${sessionId}`);
  },
  
  revokeAllSessions: (): Promise<{ message: string }> => {
    return api.post<{ message: string }>('/auth/sessions/revoke-all', {});
  },
  
  getSSOProviders: (): Promise<import("@/types").SSOProvider[]> => {
    return api.get<import("@/types").SSOProvider[]>('/auth/sso/providers');
  },
  
  initiateSSO: (providerId: string, redirectUrl?: string): Promise<{ auth_url: string }> => {
    return api.post<{ auth_url: string }>('/auth/sso/initiate', { 
      provider_id: providerId,
      redirect_url: redirectUrl || window.location.origin + '/auth/sso/callback'
    });
  },
  
  loginWith2FA: (credentials: import("@/types").LoginWith2FARequest): Promise<import("@/types").LoginWith2FAResponse> => {
    return api.post<import("@/types").LoginWith2FAResponse>('/auth/login-2fa', credentials);
  },
};

// Two-Factor Authentication API functions
export const twoFactorApi = {
  get2FAStatus: (): Promise<import("@/types").TwoFactorAuth> => 
    api.get<import("@/types").TwoFactorAuth>('/auth/2fa/status'),
  
  generateTOTPSecret: (): Promise<import("@/types").TOTPSetupResponse> => 
    api.post<import("@/types").TOTPSetupResponse>('/auth/2fa/totp/generate', {}),
  
  verifyTOTPSetup: (code: string): Promise<{ verified: boolean; recovery_codes: string[] }> => 
    api.post<{ verified: boolean; recovery_codes: string[] }>('/auth/2fa/totp/verify', { code }),
  
  sendSMSOTP: (data: import("@/types").SMSOTPRequest): Promise<import("@/types").SMSOTPResponse> => 
    api.post<import("@/types").SMSOTPResponse>('/auth/2fa/sms/send', data),
  
  verifySMSOTP: (data: { phone_number: string; code: string }): Promise<{ verified: boolean; recovery_codes: string[] }> => 
    api.post<{ verified: boolean; recovery_codes: string[] }>('/auth/2fa/sms/verify', data),
  
  verify2FACode: (data: import("@/types").Verify2FACodeRequest): Promise<import("@/types").Verify2FACodeResponse> => 
    api.post<import("@/types").Verify2FACodeResponse>('/auth/2fa/verify', data),
  
  disable2FA: (): Promise<{ message: string }> => 
    api.post<{ message: string }>('/auth/2fa/disable', {}),
  
  regenerateRecoveryCodes: (): Promise<import("@/types").RecoveryCodesResponse> => 
    api.post<import("@/types").RecoveryCodesResponse>('/auth/2fa/recovery-codes/regenerate', {}),
  
  getRecoveryCodes: (): Promise<import("@/types").RecoveryCodesResponse> => 
    api.get<import("@/types").RecoveryCodesResponse>('/auth/2fa/recovery-codes'),
  
  getAuthAttempts: (limit?: number): Promise<import("@/types").AuthAttempt[]> => {
    const params = new URLSearchParams();
    if (limit) params.append('limit', limit.toString());
    const query = params.toString();
    return api.get<import("@/types").AuthAttempt[]>(`/auth/2fa/attempts${query ? `?${query}` : ''}`);
  },
};

// Video Upload & Processing API functions
export const videoUploadApi = {
  // Initialize resumable upload
  initUpload: (file: File, metadata: Partial<import("@/types").VideoMetadata>): Promise<import("@/types").UploadInitResponse> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('file_name', file.name);
    formData.append('file_size', file.size.toString());
    formData.append('file_type', file.type);
    if (metadata.title) formData.append('title', metadata.title);
    if (metadata.description) formData.append('description', metadata.description);
    if (metadata.auto_transcribe !== undefined) formData.append('auto_transcribe', metadata.auto_transcribe.toString());
    if (metadata.language) formData.append('language', metadata.language);
    
    const url = `${import.meta.env.VITE_API_URL || 'http://localhost:3000/api'}/videos/upload/init`;
    const token = localStorage.getItem('auth_token');
    
    return fetch(url, {
      method: 'POST',
      headers: {
        Authorization: token ? `Bearer ${token}` : '',
      },
      body: formData,
    }).then(async (response) => {
      if (!response.ok) {
        const error = await response.json().catch(() => ({ message: `API Error: ${response.status}` }));
        throw new Error(error.message || `API Error: ${response.status}`);
      }
      return response.json();
    });
  },

  // Upload chunk (resumable)
  uploadChunk: async (
    uploadId: string,
    chunk: Blob,
    chunkNumber: number,
    totalChunks: number,
    uploadedBytes: number
  ): Promise<import("@/types").UploadChunkResponse> => {
    const formData = new FormData();
    formData.append('chunk', chunk);
    formData.append('chunk_number', chunkNumber.toString());
    formData.append('total_chunks', totalChunks.toString());
    formData.append('uploaded_bytes', uploadedBytes.toString());

    const url = `${import.meta.env.VITE_API_URL || 'http://localhost:3000/api'}/videos/upload/${uploadId}/chunk`;
    const token = localStorage.getItem('auth_token');
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: token ? `Bearer ${token}` : '',
      },
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: `API Error: ${response.status}` }));
      throw new Error(error.message || `API Error: ${response.status}`);
    }

    return response.json();
  },

  // Get upload status
  getUploadStatus: (uploadId: string): Promise<import("@/types").VideoUpload> =>
    api.get<import("@/types").VideoUpload>(`/videos/upload/${uploadId}/status`),

  // Resume upload
  resumeUpload: (uploadId: string): Promise<import("@/types").VideoUpload> =>
    api.post<import("@/types").VideoUpload>(`/videos/upload/${uploadId}/resume`, {}),

  // Complete upload and start processing
  completeUpload: (
    uploadId: string,
    metadata: import("@/types").VideoMetadata
  ): Promise<import("@/types").VideoProcessingJob> =>
    api.post<import("@/types").VideoProcessingJob>(`/videos/upload/${uploadId}/complete`, metadata),

  // Get processing status
  getProcessingStatus: (jobId: string): Promise<import("@/types").ProcessingStatusResponse> =>
    api.get<import("@/types").ProcessingStatusResponse>(`/videos/processing/${jobId}/status`),

  // Get user's processing queue
  getProcessingQueue: (): Promise<import("@/types").VideoProcessingJob[]> =>
    api.get<import("@/types").VideoProcessingJob[]>('/videos/processing/queue'),

  // Cancel processing job
  cancelProcessing: (jobId: string): Promise<{ message: string }> =>
    api.post<{ message: string }>(`/videos/processing/${jobId}/cancel`, {}),
};

// Search & Filter API functions
export const searchApi = {
  // Perform search with query and filters
  search: (query: import("@/types").SearchQuery): Promise<import("@/types").SearchResponse> => {
    const params = new URLSearchParams();
    params.append('q', query.query);
    
    if (query.filters) {
      if (query.filters.tags?.length) {
        query.filters.tags.forEach(tag => params.append('tags', tag));
      }
      if (query.filters.machine_model?.length) {
        query.filters.machine_model.forEach(model => params.append('machine_model', model));
      }
      if (query.filters.tooling?.length) {
        query.filters.tooling.forEach(tool => params.append('tooling', tool));
      }
      if (query.filters.skill_level?.length) {
        query.filters.skill_level.forEach(level => params.append('skill_level', level));
      }
      if (query.filters.status?.length) {
        query.filters.status.forEach(status => params.append('status', status));
      }
      if (query.filters.customer_id) {
        params.append('customer_id', query.filters.customer_id);
      }
      if (query.filters.date_from) {
        params.append('date_from', query.filters.date_from);
      }
      if (query.filters.date_to) {
        params.append('date_to', query.filters.date_to);
      }
      if (query.filters.duration_min !== undefined) {
        params.append('duration_min', query.filters.duration_min.toString());
      }
      if (query.filters.duration_max !== undefined) {
        params.append('duration_max', query.filters.duration_max.toString());
      }
      if (query.filters.language?.length) {
        query.filters.language.forEach(lang => params.append('language', lang));
      }
    }
    
    if (query.sort_by) {
      params.append('sort_by', query.sort_by);
    }
    if (query.sort_order) {
      params.append('sort_order', query.sort_order);
    }
    if (query.page) {
      params.append('page', query.page.toString());
    }
    if (query.per_page) {
      params.append('per_page', query.per_page.toString());
    }
    
    return api.get<import("@/types").SearchResponse>(`/search?${params.toString()}`);
  },

  // Get NLP-powered search suggestions
  getSuggestions: (query: string, limit?: number): Promise<import("@/types").NLPSuggestionsResponse> => {
    const params = new URLSearchParams();
    params.append('q', query);
    if (limit) {
      params.append('limit', limit.toString());
    }
    return api.get<import("@/types").NLPSuggestionsResponse>(`/search/suggestions?${params.toString()}`);
  },

  // Get available filter options
  getFilterOptions: (customerId?: string): Promise<import("@/types").FilterOptions> => {
    const params = new URLSearchParams();
    if (customerId) {
      params.append('customer_id', customerId);
    }
    const query = params.toString();
    return api.get<import("@/types").FilterOptions>(`/search/filters${query ? `?${query}` : ''}`);
  },

  // Get search facets (for filter counts)
  getFacets: (query: string, filters?: import("@/types").SearchFilters): Promise<import("@/types").SearchFacets> => {
    const params = new URLSearchParams();
    params.append('q', query);
    
    if (filters) {
      if (filters.tags?.length) {
        filters.tags.forEach(tag => params.append('tags', tag));
      }
      if (filters.machine_model?.length) {
        filters.machine_model.forEach(model => params.append('machine_model', model));
      }
      if (filters.tooling?.length) {
        filters.tooling.forEach(tool => params.append('tooling', tool));
      }
      if (filters.skill_level?.length) {
        filters.skill_level.forEach(level => params.append('skill_level', level));
      }
      if (filters.status?.length) {
        filters.status.forEach(status => params.append('status', status));
      }
      if (filters.customer_id) {
        params.append('customer_id', filters.customer_id);
      }
      if (filters.date_from) {
        params.append('date_from', filters.date_from);
      }
      if (filters.date_to) {
        params.append('date_to', filters.date_to);
      }
      if (filters.duration_min !== undefined) {
        params.append('duration_min', filters.duration_min.toString());
      }
      if (filters.duration_max !== undefined) {
        params.append('duration_max', filters.duration_max.toString());
      }
      if (filters.language?.length) {
        filters.language.forEach(lang => params.append('language', lang));
      }
    }
    
    return api.get<import("@/types").SearchFacets>(`/search/facets?${params.toString()}`);
  },
};

// Video Player & Streaming API functions
export const videoPlayerApi = {
  // Get video streaming URL with available qualities
  getStreamingUrl: (videoId: string, quality?: string): Promise<{ hls_url: string; qualities: import("@/types").VideoQuality[] }> => {
    const params = new URLSearchParams();
    if (quality) params.append('quality', quality);
    const query = params.toString();
    return api.get<{ hls_url: string; qualities: import("@/types").VideoQuality[] }>(`/videos/${videoId}/stream${query ? `?${query}` : ''}`);
  },

  // Get signed playback URL for offline content
  getOfflinePlaybackUrl: (videoId: string, deviceId: string): Promise<{ playback_url: string; access_token: string; expires_at: string }> => {
    return api.get<{ playback_url: string; access_token: string; expires_at: string }>(`/videos/${videoId}/offline/play?device_id=${deviceId}`);
  },

  // Verify offline access token
  verifyOfflineAccess: (videoId: string, deviceId: string, accessToken: string): Promise<import("@/types").OfflineVideoAccess> => {
    return api.post<import("@/types").OfflineVideoAccess>(`/videos/${videoId}/offline/verify`, { device_id: deviceId, access_token: accessToken });
  },
};

// Video Download API functions
export const videoDownloadApi = {
  // Request download for a video
  requestDownload: (data: import("@/types").DownloadRequest): Promise<import("@/types").DownloadResponse> => {
    return api.post<import("@/types").DownloadResponse>('/videos/download/request', data);
  },

  // Get download status
  getDownloadStatus: (downloadId: string): Promise<import("@/types").VideoDownload> => {
    return api.get<import("@/types").VideoDownload>(`/videos/download/${downloadId}/status`);
  },

  // Get user's downloads
  getDownloads: (filters?: { status?: string; video_id?: string }): Promise<import("@/types").VideoDownload[]> => {
    const params = new URLSearchParams();
    if (filters?.status) params.append('status', filters.status);
    if (filters?.video_id) params.append('video_id', filters.video_id);
    const query = params.toString();
    return api.get<import("@/types").VideoDownload[]>(`/videos/download${query ? `?${query}` : ''}`);
  },

  // Cancel download
  cancelDownload: (downloadId: string): Promise<{ message: string }> => {
    return api.post<{ message: string }>(`/videos/download/${downloadId}/cancel`, {});
  },

  // Delete downloaded video
  deleteDownload: (downloadId: string): Promise<{ message: string }> => {
    return api.delete<{ message: string }>(`/videos/download/${downloadId}`);
  },

  // Register device for offline playback
  registerDevice: (data: { device_name: string; device_type: 'desktop' | 'mobile' | 'tablet'; os?: string; browser?: string }): Promise<import("@/types").DeviceRegistration> => {
    return api.post<import("@/types").DeviceRegistration>('/devices/register', data);
  },

  // Get registered devices
  getDevices: (): Promise<import("@/types").DeviceRegistration[]> => {
    return api.get<import("@/types").DeviceRegistration[]>('/devices');
  },

  // Unregister device
  unregisterDevice: (deviceId: string): Promise<{ message: string }> => {
    return api.delete<{ message: string }>(`/devices/${deviceId}`);
  },
};

// Video Analytics API functions
export const videoAnalyticsApi = {
  // Log playback event
  logEvent: (data: Omit<import("@/types").PlaybackAnalytics, 'id' | 'user_id' | 'created_at'>): Promise<import("@/types").PlaybackAnalytics> => {
    return api.post<import("@/types").PlaybackAnalytics>('/analytics/video/events', data);
  },

  // Get playback session
  getSession: (sessionId: string): Promise<import("@/types").PlaybackSession> => {
    return api.get<import("@/types").PlaybackSession>(`/analytics/video/sessions/${sessionId}`);
  },

  // Create or update playback session
  updateSession: (sessionId: string, data: Partial<import("@/types").PlaybackSession>): Promise<import("@/types").PlaybackSession> => {
    return api.patch<import("@/types").PlaybackSession>(`/analytics/video/sessions/${sessionId}`, data);
  },

  // End playback session
  endSession: (sessionId: string): Promise<import("@/types").PlaybackSession> => {
    return api.post<import("@/types").PlaybackSession>(`/analytics/video/sessions/${sessionId}/end`, {});
  },
};

// Course Builder & Quiz Engine API functions
export const coursesApi = {
  // Get all courses
  getCourses: (filters?: { status?: string; search?: string }): Promise<import("@/types").Course[]> => {
    const params = new URLSearchParams();
    if (filters?.status) params.append('status', filters.status);
    if (filters?.search) params.append('search', filters.search);
    const query = params.toString();
    return api.get<import("@/types").Course[]>(`/courses${query ? `?${query}` : ''}`);
  },

  // Get single course
  getCourse: (id: string): Promise<import("@/types").Course> => {
    return api.get<import("@/types").Course>(`/courses/${id}`);
  },

  // Create course
  createCourse: (data: Omit<import("@/types").Course, 'id' | 'created_at' | 'updated_at'>): Promise<import("@/types").Course> => {
    return api.post<import("@/types").Course>('/courses', data);
  },

  // Update course
  updateCourse: (id: string, data: Partial<Omit<import("@/types").Course, 'id' | 'created_at' | 'updated_at'>>): Promise<import("@/types").Course> => {
    return api.put<import("@/types").Course>(`/courses/${id}`, data);
  },

  // Delete course
  deleteCourse: (id: string): Promise<{ message: string }> => {
    return api.delete<{ message: string }>(`/courses/${id}`);
  },

  // Publish course
  publishCourse: (id: string): Promise<import("@/types").Course> => {
    return api.post<import("@/types").Course>(`/courses/${id}/publish`, {});
  },

  // Archive course
  archiveCourse: (id: string): Promise<import("@/types").Course> => {
    return api.post<import("@/types").Course>(`/courses/${id}/archive`, {});
  },

  // Add module to course
  addModule: (courseId: string, data: { reel_id: string; order: number }): Promise<import("@/types").CourseModule> => {
    return api.post<import("@/types").CourseModule>(`/courses/${courseId}/modules`, data);
  },

  // Update module order
  updateModuleOrder: (courseId: string, moduleOrders: { module_id: string; order: number }[]): Promise<import("@/types").Course> => {
    return api.patch<import("@/types").Course>(`/courses/${courseId}/modules/order`, { module_orders: moduleOrders });
  },

  // Remove module from course
  removeModule: (courseId: string, moduleId: string): Promise<{ message: string }> => {
    return api.delete<{ message: string }>(`/courses/${courseId}/modules/${moduleId}`);
  },
};

// Quiz API functions
export const quizzesApi = {
  // Get quiz for module
  getQuiz: (moduleId: string): Promise<import("@/types").Quiz> => {
    return api.get<import("@/types").Quiz>(`/modules/${moduleId}/quiz`);
  },

  // Create or update quiz
  upsertQuiz: (moduleId: string, data: Omit<import("@/types").Quiz, 'id' | 'module_id'>): Promise<import("@/types").Quiz> => {
    return api.post<import("@/types").Quiz>(`/modules/${moduleId}/quiz`, data);
  },

  // Delete quiz
  deleteQuiz: (moduleId: string): Promise<{ message: string }> => {
    return api.delete<{ message: string }>(`/modules/${moduleId}/quiz`);
  },

  // Start quiz attempt
  startQuizAttempt: (quizId: string, moduleId: string, courseId: string): Promise<import("@/types").QuizAttempt> => {
    return api.post<import("@/types").QuizAttempt>('/quizzes/attempts/start', { quiz_id: quizId, module_id: moduleId, course_id: courseId });
  },

  // Submit quiz attempt
  submitQuizAttempt: (attemptId: string, answers: import("@/types").QuizAnswer[]): Promise<import("@/types").QuizAttempt> => {
    return api.post<import("@/types").QuizAttempt>(`/quizzes/attempts/${attemptId}/submit`, { answers });
  },

  // Get quiz attempt
  getQuizAttempt: (attemptId: string): Promise<import("@/types").QuizAttempt> => {
    return api.get<import("@/types").QuizAttempt>(`/quizzes/attempts/${attemptId}`);
  },

  // Get user's quiz attempts for a course
  getQuizAttempts: (courseId: string, moduleId?: string): Promise<import("@/types").QuizAttempt[]> => {
    const params = new URLSearchParams();
    params.append('course_id', courseId);
    if (moduleId) params.append('module_id', moduleId);
    return api.get<import("@/types").QuizAttempt[]>(`/quizzes/attempts?${params.toString()}`);
  },
};

// Enrollment API functions
export const enrollmentsApi = {
  // Get enrollments
  getEnrollments: (filters?: { course_id?: string; user_id?: string; status?: string }): Promise<import("@/types").Enrollment[]> => {
    const params = new URLSearchParams();
    if (filters?.course_id) params.append('course_id', filters.course_id);
    if (filters?.user_id) params.append('user_id', filters.user_id);
    if (filters?.status) params.append('status', filters.status);
    const query = params.toString();
    return api.get<import("@/types").Enrollment[]>(`/enrollments${query ? `?${query}` : ''}`);
  },

  // Get single enrollment
  getEnrollment: (id: string): Promise<import("@/types").Enrollment> => {
    return api.get<import("@/types").Enrollment>(`/enrollments/${id}`);
  },

  // Enroll user in course
  enrollUser: (courseId: string, userId?: string): Promise<import("@/types").Enrollment> => {
    return api.post<import("@/types").Enrollment>('/enrollments', { course_id: courseId, user_id: userId });
  },

  // Update enrollment progress
  updateProgress: (enrollmentId: string, progress: number): Promise<import("@/types").Enrollment> => {
    return api.patch<import("@/types").Enrollment>(`/enrollments/${enrollmentId}/progress`, { progress });
  },

  // Unenroll user
  unenrollUser: (enrollmentId: string): Promise<{ message: string }> => {
    return api.delete<{ message: string }>(`/enrollments/${enrollmentId}`);
  },

  // Bulk enroll users
  bulkEnroll: (courseId: string, userIds: string[]): Promise<import("@/types").Enrollment[]> => {
    return api.post<import("@/types").Enrollment[]>('/enrollments/bulk', { course_id: courseId, user_ids: userIds });
  },
};

// Users API functions
export const usersApi = {
  // Get users (for admin/enrollment purposes)
  getUsers: (filters?: { role?: string; search?: string }): Promise<import("@/types").User[]> => {
    const params = new URLSearchParams();
    if (filters?.role) params.append('role', filters.role);
    if (filters?.search) params.append('search', filters.search);
    const query = params.toString();
    return api.get<import("@/types").User[]>(`/users${query ? `?${query}` : ''}`);
  },

  // Get single user
  getUser: (id: string): Promise<import("@/types").User> => {
    return api.get<import("@/types").User>(`/users/${id}`);
  },
};

// Certificate API functions
export const certificatesApi = {
  // Get certificates
  getCertificates: (filters?: { course_id?: string; user_id?: string }): Promise<import("@/types").Certificate[]> => {
    const params = new URLSearchParams();
    if (filters?.course_id) params.append('course_id', filters.course_id);
    if (filters?.user_id) params.append('user_id', filters.user_id);
    const query = params.toString();
    return api.get<import("@/types").Certificate[]>(`/certificates${query ? `?${query}` : ''}`);
  },

  // Get single certificate
  getCertificate: (id: string): Promise<import("@/types").Certificate> => {
    return api.get<import("@/types").Certificate>(`/certificates/${id}`);
  },

  // Generate certificate
  generateCertificate: (courseId: string, userId?: string): Promise<import("@/types").Certificate> => {
    return api.post<import("@/types").Certificate>('/certificates/generate', { course_id: courseId, user_id: userId });
  },

  // Download certificate PDF
  downloadCertificate: async (certificateId: string) => {
    const url = `${import.meta.env.VITE_API_URL || 'http://localhost:3000/api'}/certificates/${certificateId}/download`;
    const token = localStorage.getItem('auth_token');
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    if (!response.ok) throw new Error('Failed to download certificate');
    const blob = await response.blob();
    const downloadUrl = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = downloadUrl;
    a.download = `certificate-${certificateId}.pdf`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(downloadUrl);
    document.body.removeChild(a);
  },

  // Verify certificate
  verifyCertificate: (verificationId: string): Promise<import("@/types").Certificate> => {
    return api.get<import("@/types").Certificate>(`/certificates/verify/${verificationId}`);
  },
};

// Structured Metadata & Tagging API functions
export const metadataApi = {
  // Machine Models
  getMachineModels: (customerId?: string): Promise<import("@/types").MachineModel[]> => {
    const params = new URLSearchParams();
    if (customerId) params.append('customer_id', customerId);
    const query = params.toString();
    return api.get<import("@/types").MachineModel[]>(`/metadata/machine-models${query ? `?${query}` : ''}`);
  },
  createMachineModel: (data: { name: string; description?: string; customer_id?: string }): Promise<import("@/types").MachineModel> =>
    api.post<import("@/types").MachineModel>('/metadata/machine-models', data),
  updateMachineModel: (id: string, data: { name?: string; description?: string }): Promise<import("@/types").MachineModel> =>
    api.put<import("@/types").MachineModel>(`/metadata/machine-models/${id}`, data),
  deleteMachineModel: (id: string): Promise<void> =>
    api.delete(`/metadata/machine-models/${id}`),

  // Tooling
  getTooling: (customerId?: string): Promise<import("@/types").Tooling[]> => {
    const params = new URLSearchParams();
    if (customerId) params.append('customer_id', customerId);
    const query = params.toString();
    return api.get<import("@/types").Tooling[]>(`/metadata/tooling${query ? `?${query}` : ''}`);
  },
  createTooling: (data: { name: string; description?: string; customer_id?: string }): Promise<import("@/types").Tooling> =>
    api.post<import("@/types").Tooling>('/metadata/tooling', data),
  updateTooling: (id: string, data: { name?: string; description?: string }): Promise<import("@/types").Tooling> =>
    api.put<import("@/types").Tooling>(`/metadata/tooling/${id}`, data),
  deleteTooling: (id: string): Promise<void> =>
    api.delete(`/metadata/tooling/${id}`),

  // Process Steps
  getProcessSteps: (customerId?: string): Promise<import("@/types").ProcessStep[]> => {
    const params = new URLSearchParams();
    if (customerId) params.append('customer_id', customerId);
    const query = params.toString();
    return api.get<import("@/types").ProcessStep[]>(`/metadata/process-steps${query ? `?${query}` : ''}`);
  },
  createProcessStep: (data: { name: string; description?: string; customer_id?: string }): Promise<import("@/types").ProcessStep> =>
    api.post<import("@/types").ProcessStep>('/metadata/process-steps', data),
  updateProcessStep: (id: string, data: { name?: string; description?: string }): Promise<import("@/types").ProcessStep> =>
    api.put<import("@/types").ProcessStep>(`/metadata/process-steps/${id}`, data),
  deleteProcessStep: (id: string): Promise<void> =>
    api.delete(`/metadata/process-steps/${id}`),

  // Reel Metadata
  getReelMetadata: (reelId: string): Promise<import("@/types").ReelMetadata> =>
    api.get<import("@/types").ReelMetadata>(`/metadata/reels/${reelId}`),
  updateReelMetadata: (reelId: string, data: {
    machine_model_id?: string;
    tooling_id?: string;
    process_step_id?: string;
    tags?: string[];
  }): Promise<import("@/types").ReelMetadata> =>
    api.put<import("@/types").ReelMetadata>(`/metadata/reels/${reelId}`, data),
  createReelMetadata: (reelId: string, data: {
    machine_model_id?: string;
    tooling_id?: string;
    process_step_id?: string;
    tags?: string[];
  }): Promise<import("@/types").ReelMetadata> =>
    api.post<import("@/types").ReelMetadata>(`/metadata/reels/${reelId}`, data),

  // NLP Tag Suggestions
  getTagSuggestions: (data: import("@/types").NLPTagSuggestionsRequest): Promise<import("@/types").NLPTagSuggestionsResponse> =>
    api.post<import("@/types").NLPTagSuggestionsResponse>('/metadata/nlp/suggest-tags', data),

  // Metadata Validation
  validateMetadata: (data: {
    machine_model_id?: string;
    tooling_id?: string;
    process_step_id?: string;
    tags?: string[];
    require_all?: boolean;
  }): Promise<import("@/types").MetadataValidationResult> =>
    api.post<import("@/types").MetadataValidationResult>('/metadata/validate', data),
};

// Notifications & Email API functions
export const notificationsApi = {
  // Get notifications
  getNotifications: (filters?: { status?: 'read' | 'unread'; type?: string; limit?: number }): Promise<import("@/types").Notification[]> => {
    const params = new URLSearchParams();
    if (filters?.status) params.append('status', filters.status);
    if (filters?.type) params.append('type', filters.type);
    if (filters?.limit) params.append('limit', filters.limit.toString());
    const query = params.toString();
    return api.get<import("@/types").Notification[]>(`/notifications${query ? `?${query}` : ''}`);
  },

  // Get notification count
  getNotificationCount: (): Promise<import("@/types").NotificationCount> =>
    api.get<import("@/types").NotificationCount>('/notifications/count'),

  // Get single notification
  getNotification: (id: string): Promise<import("@/types").Notification> =>
    api.get<import("@/types").Notification>(`/notifications/${id}`),

  // Mark notification as read
  markAsRead: (id: string): Promise<import("@/types").Notification> =>
    api.patch<import("@/types").Notification>(`/notifications/${id}/read`, {}),

  // Mark all notifications as read
  markAllAsRead: (): Promise<{ message: string }> =>
    api.post<{ message: string }>('/notifications/read-all', {}),

  // Delete notification
  deleteNotification: (id: string): Promise<{ message: string }> =>
    api.delete<{ message: string }>(`/notifications/${id}`),

  // Archive notification
  archiveNotification: (id: string): Promise<import("@/types").Notification> =>
    api.post<import("@/types").Notification>(`/notifications/${id}/archive`, {}),

  // Get notification preferences
  getPreferences: (): Promise<import("@/types").NotificationPreferences> =>
    api.get<import("@/types").NotificationPreferences>('/notifications/preferences'),

  // Update notification preferences
  updatePreferences: (data: Partial<import("@/types").NotificationPreferences>): Promise<import("@/types").NotificationPreferences> =>
    api.put<import("@/types").NotificationPreferences>('/notifications/preferences', data),

  // Get email logs
  getEmailLogs: (filters?: { status?: string; email_type?: string; limit?: number }): Promise<import("@/types").EmailLog[]> => {
    const params = new URLSearchParams();
    if (filters?.status) params.append('status', filters.status);
    if (filters?.email_type) params.append('email_type', filters.email_type);
    if (filters?.limit) params.append('limit', filters.limit.toString());
    const query = params.toString();
    return api.get<import("@/types").EmailLog[]>(`/notifications/email-logs${query ? `?${query}` : ''}`);
  },
};
