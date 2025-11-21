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
      localStorage.removeItem('auth_token');
      window.location.href = '/login';
    }
    const error = await response.json().catch(() => ({ message: `API Error: ${response.status}` }));
    throw new Error(error.message || `API Error: ${response.status}`);
  }

  return response.json();
}

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
