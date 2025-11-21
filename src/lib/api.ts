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
