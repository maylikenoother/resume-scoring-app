import axios from 'axios';
import { 
  AuthResponse, 
  CreditTransaction, 
  LoginCredentials, 
  PricingTiers,
  RegisterCredentials, 
  Submission, 
  SubmissionStats, 
  User 
} from '@/app/types';

// Create an axios instance with base URL
const api = axios.create({
  baseURL: '/api/py',
});

// Add request interceptor to add authorization header
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth API
export const authApi = {
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const formData = new FormData();
    formData.append('username', credentials.username);
    formData.append('password', credentials.password);
    
    const response = await api.post<AuthResponse>('/auth/login', formData);
    return response.data;
  },
  
  register: async (data: RegisterCredentials): Promise<User> => {
    const response = await api.post<User>('/auth/register', data);
    return response.data;
  },
};

// User API
export const userApi = {
  getMe: async (): Promise<User> => {
    const response = await api.get<User>('/users/me');
    return response.data;
  },
  
  getTransactions: async (): Promise<CreditTransaction[]> => {
    const response = await api.get<CreditTransaction[]>('/users/me/transactions');
    return response.data;
  },
};

// Credits API
export const creditsApi = {
  getPricing: async (): Promise<PricingTiers> => {
    const response = await api.get<PricingTiers>('/credits/pricing');
    return response.data;
  },
  
  purchaseCredits: async (tier: string): Promise<CreditTransaction> => {
    const response = await api.post<CreditTransaction>('/credits/purchase', { tier });
    return response.data;
  },
};

// CV Submissions API
export const cvApi = {
  uploadCV: async (file: File): Promise<Submission> => {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await api.post<Submission>('/cv/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
  
  getSubmissions: async (): Promise<Submission[]> => {
    const response = await api.get<Submission[]>('/cv/submissions');
    return response.data;
  },
  
  getSubmission: async (id: number): Promise<Submission> => {
    const response = await api.get<Submission>(`/cv/submissions/${id}`);
    return response.data;
  },
};

// Submissions API
export const submissionsApi = {
  getSubmissions: async (): Promise<Submission[]> => {
    const response = await api.get<Submission[]>('/submissions');
    return response.data;
  },
  
  getSubmission: async (id: number): Promise<Submission> => {
    const response = await api.get<Submission>(`/submissions/${id}`);
    return response.data;
  },
  
  getStats: async (): Promise<SubmissionStats> => {
    const response = await api.get<SubmissionStats>('/submissions/stats/summary');
    return response.data;
  },
};