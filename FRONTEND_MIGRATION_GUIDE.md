# Frontend Migration Guide: Supabase to Python Backend

This guide explains how to update the frontend to use the new Python FastAPI backend instead of Supabase.

## Overview of Changes

### 1. Authentication System
- **Before**: Supabase Auth with `supabase.auth.signInWithPassword()`
- **After**: JWT-based authentication with custom API endpoints

### 2. Data Storage
- **Before**: Supabase client with real-time subscriptions
- **After**: REST API calls to Python backend

### 3. File Storage
- **Before**: Supabase Storage
- **After**: Local file storage with base64 encoding or cloud storage integration

## Step-by-Step Migration

### Step 1: Update Environment Variables

Create/update `.env.local`:
```env
VITE_API_BASE_URL=http://localhost:8000
VITE_API_VERSION=v1
```

### Step 2: Create API Client

Create `src/lib/apiClient.ts`:
```typescript
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
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
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
        window.location.href = '/login';
      }
      throw new Error(`API Error: ${response.statusText}`);
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

  // Add other endpoints as needed...
}

export const apiClient = new ApiClient(API_BASE_URL);
```

### Step 3: Update AuthContext

Replace `src/context/AuthContext.tsx`:
```typescript
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { apiClient } from '@/lib/apiClient';
import { showSuccess, showError } from '@/utils/toast';

interface User {
  id: string;
  email: string;
  is_active: boolean;
  created_at: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is already logged in
    const token = localStorage.getItem('auth_token');
    if (token) {
      loadUser();
    } else {
      setLoading(false);
    }
  }, []);

  const loadUser = async () => {
    try {
      const userData = await apiClient.getCurrentUser();
      setUser(userData);
    } catch (error) {
      console.error('Failed to load user:', error);
      apiClient.clearToken();
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      await apiClient.login(email, password);
      await loadUser();
      showSuccess('Successfully signed in!');
    } catch (error: any) {
      showError(error.message || 'Failed to sign in');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string) => {
    try {
      setLoading(true);
      await apiClient.register(email, password);
      showSuccess('Account created successfully! Please sign in.');
    } catch (error: any) {
      showError(error.message || 'Failed to create account');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      apiClient.clearToken();
      setUser(null);
      showSuccess('Successfully signed out!');
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      signIn,
      signUp,
      signOut,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
```

### Step 4: Update TaxDeductionContext

Replace `context/TaxDeductionContext.tsx`:
```typescript
import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { TaxDeduction, DocumentAttachment } from '@/types';
import { showSuccess, showError } from '@/utils/toast';
import { apiClient } from '@/lib/apiClient';

interface TaxDeductionContextType {
  taxDeductions: TaxDeduction[];
  loading: boolean;
  error: string | null;
  addTaxDeduction: (deduction: Omit<TaxDeduction, 'id' | 'createdAt' | 'attachments'>) => void;
  updateTaxDeduction: (id: string, updates: Partial<TaxDeduction>) => void;
  removeTaxDeduction: (id: string) => void;
  getTaxDeductionsByYear: (year: number) => TaxDeduction[];
  addAttachment: (deductionId: string, attachment: Omit<DocumentAttachment, 'id' | 'uploadDate'>) => void;
  removeAttachment: (deductionId: string, attachmentId: string) => void;
}

const TaxDeductionContext = createContext<TaxDeductionContextType | undefined>(undefined);

export const TaxDeductionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [taxDeductions, setTaxDeductions] = useState<TaxDeduction[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load deductions on mount
  useEffect(() => {
    loadDeductions();
  }, []);

  const loadDeductions = async () => {
    try {
      setLoading(true);
      setError(null);
      const deductions = await apiClient.getTaxDeductions();
      setTaxDeductions(deductions);
    } catch (error: any) {
      setError(error.message || 'Failed to load tax deductions');
      showError('Failed to load tax deductions');
    } finally {
      setLoading(false);
    }
  };

  const addTaxDeduction = async (deductionData: Omit<TaxDeduction, 'id' | 'createdAt' | 'attachments'>) => {
    try {
      const newDeduction = await apiClient.createTaxDeduction(deductionData);
      setTaxDeductions(prev => [...prev, newDeduction]);
      showSuccess('Tax deduction added successfully!');
    } catch (error: any) {
      showError(error.message || 'Failed to add tax deduction');
      throw error;
    }
  };

  const updateTaxDeduction = async (id: string, updates: Partial<TaxDeduction>) => {
    try {
      const updatedDeduction = await apiClient.updateTaxDeduction(id, updates);
      setTaxDeductions(prev => 
        prev.map(deduction => 
          deduction.id === id ? updatedDeduction : deduction
        )
      );
      showSuccess('Tax deduction updated successfully!');
    } catch (error: any) {
      showError(error.message || 'Failed to update tax deduction');
      throw error;
    }
  };

  const removeTaxDeduction = async (id: string) => {
    try {
      await apiClient.deleteTaxDeduction(id);
      setTaxDeductions(prev => prev.filter(deduction => deduction.id !== id));
      showSuccess('Tax deduction deleted successfully!');
    } catch (error: any) {
      showError(error.message || 'Failed to delete tax deduction');
      throw error;
    }
  };

  const getTaxDeductionsByYear = (year: number) => {
    return taxDeductions.filter(deduction => deduction.year === year);
  };

  const addAttachment = async (deductionId: string, attachment: Omit<DocumentAttachment, 'id' | 'uploadDate'>) => {
    try {
      // Update the deduction with new attachment
      const deduction = taxDeductions.find(d => d.id === deductionId);
      if (deduction) {
        const updatedDeduction = await apiClient.updateTaxDeduction(deductionId, {
          attachments: [...(deduction.attachments || []), attachment]
        });
        setTaxDeductions(prev => 
          prev.map(d => d.id === deductionId ? updatedDeduction : d)
        );
        showSuccess('Attachment added successfully!');
      }
    } catch (error: any) {
      showError(error.message || 'Failed to add attachment');
      throw error;
    }
  };

  const removeAttachment = async (deductionId: string, attachmentId: string) => {
    try {
      const deduction = taxDeductions.find(d => d.id === deductionId);
      if (deduction) {
        const updatedAttachments = deduction.attachments?.filter(a => a.id !== attachmentId) || [];
        const updatedDeduction = await apiClient.updateTaxDeduction(deductionId, {
          attachments: updatedAttachments
        });
        setTaxDeductions(prev => 
          prev.map(d => d.id === deductionId ? updatedDeduction : d)
        );
        showSuccess('Attachment removed successfully!');
      }
    } catch (error: any) {
      showError(error.message || 'Failed to remove attachment');
      throw error;
    }
  };

  return (
    <TaxDeductionContext.Provider value={{
      taxDeductions,
      loading,
      error,
      addTaxDeduction,
      updateTaxDeduction,
      removeTaxDeduction,
      getTaxDeductionsByYear,
      addAttachment,
      removeAttachment,
    }}>
      {children}
    </TaxDeductionContext.Provider>
  );
};

export const useTaxDeductions = () => {
  const context = useContext(TaxDeductionContext);
  if (context === undefined) {
    throw new Error('useTaxDeductions must be used within a TaxDeductionProvider');
  }
  return context;
};
```

### Step 5: Update Type Definitions

Update `src/types/index.ts` to match the API response format:
```typescript
export interface TaxDeduction {
  id: string;
  year: number;
  deduction_type: string; // Note: changed from deductionType
  amount: number;
  description?: string;
  created_at: string; // Note: changed from createdAt to created_at
  attachments?: DocumentAttachment[];
}

export interface DocumentAttachment {
  id: string;
  file_name: string; // Note: changed from fileName
  file_type: string; // Note: changed from fileType
  file_size: number; // Note: changed from fileSize
  upload_date: string; // Note: changed from uploadDate
  document_type: string; // Note: changed from documentType
  file_url?: string;
  file_data?: string;
}

// Add other interfaces as needed...
```

### Step 6: Remove Supabase Dependencies

1. Remove Supabase client configuration from `src/lib/supabaseClient.ts`
2. Remove Supabase imports from all components
3. Update package.json to remove Supabase dependencies:
```bash
npm uninstall @supabase/supabase-js
```

### Step 7: Update Other Contexts

Follow the same pattern for other contexts:
- `ExpenseContext`
- `InvestmentContext`
- `AssetContext`
- `IncomeContext`
- `InsuranceContext`

### Step 8: Update File Upload Handling

For file uploads, you can either:
1. Convert files to base64 and send as part of the JSON payload
2. Implement multipart form uploads in the API client
3. Use a cloud storage service (AWS S3, Cloudinary, etc.)

## Testing the Migration

1. Start the Python backend:
```bash
cd backend
./start.sh
```

2. Update your frontend to use the new API client
3. Test all functionality:
   - User registration/login
   - Tax deduction CRUD operations
   - File uploads
   - Other features

## Benefits of the Migration

1. **Full Control**: Complete control over the backend logic and database schema
2. **Performance**: Optimized queries and data structures
3. **Scalability**: Can easily add caching, load balancing, etc.
4. **Security**: Custom authentication and authorization logic
5. **Cost**: No vendor lock-in or per-user pricing

## Next Steps

1. Complete the migration for all contexts
2. Implement comprehensive error handling
3. Add loading states and optimistic updates
4. Set up production deployment
5. Add monitoring and logging
