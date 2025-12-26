const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

class ApiClient {
  private baseURL: string;
  private token: string | null = null;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
    this.token = localStorage.getItem('auth_token');
  }

  setToken(token: string) {
    this.token = token;
    localStorage.setItem('auth_token', token);
  }

  clearToken() {
    this.token = null;
    localStorage.removeItem('auth_token');
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      if (response.status === 401) {
        this.clearToken();
        // Redirect to login or emit event for auth context to handle
        window.dispatchEvent(new CustomEvent('auth:logout'));
      }
      const errorData = await response.json().catch(() => ({ error: response.statusText }));
      throw new Error(errorData.detail || errorData.error || `API Error: ${response.statusText}`);
    }

    return response.json();
  }

  // Auth endpoints
  async register(email: string, password: string) {
    return this.request('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  async login(email: string, password: string) {
    const response = await this.request<{ access_token: string; token_type: string }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    this.setToken(response.access_token);
    return response;
  }

  async getCurrentUser() {
    return this.request('/api/auth/me');
  }

  // Tax deductions
  async getTaxDeductions() {
    return this.request('/api/tax-deductions/');
  }

  async createTaxDeduction(data: any) {
    return this.request('/api/tax-deductions/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateTaxDeduction(id: string, data: any) {
    return this.request(`/api/tax-deductions/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteTaxDeduction(id: string) {
    return this.request(`/api/tax-deductions/${id}`, {
      method: 'DELETE',
    });
  }

  // Investments
  async getInvestments() {
    return this.request('/api/investments/');
  }

  async createInvestment(data: any) {
    return this.request('/api/investments/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Assets
  async getAssets() {
    return this.request('/api/assets/');
  }

  async createAsset(data: any) {
    return this.request('/api/assets/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Expenses
  async getExpenses() {
    return this.request('/api/expenses/');
  }

  async createExpense(data: any) {
    return this.request('/api/expenses/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Income
  async getIncome() {
    return this.request('/api/income/');
  }

  async createIncome(data: any) {
    return this.request('/api/income/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Insurance
  async getInsurancePolicies() {
    return this.request('/api/insurance/');
  }

  async createInsurancePolicy(data: any) {
    return this.request('/api/insurance/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }
}

export const apiClient = new ApiClient(API_BASE_URL);
