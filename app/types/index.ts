export interface User {
    id: number;
    email: string;
    username: string;
    credits: number;
    created_at: string;
  }
  
  export enum SubmissionStatus {
    PENDING = "pending",
    PROCESSING = "processing",
    COMPLETED = "completed",
    FAILED = "failed",
  }
  
  export interface Submission {
    id: number;
    filename: string;
    original_filename: string;
    status: SubmissionStatus;
    score: number | null;
    feedback: string | null;
    submitted_at: string;
    completed_at: string | null;
  }
  
  export enum TransactionType {
    PURCHASE = "purchase",
    USAGE = "usage",
    REFUND = "refund",
    BONUS = "bonus",
  }
  
  export interface CreditTransaction {
    id: number;
    amount: number;
    type: TransactionType;
    description: string;
    created_at: string;
  }
  
  export interface CreditPricing {
    amount: number;
    price: number;
  }
  
  export interface PricingTiers {
    [key: string]: CreditPricing;
  }
  
  export interface LoginCredentials {
    username: string;
    password: string;
  }
  
  export interface RegisterCredentials {
    email: string;
    username: string;
    password: string;
  }
  
  export interface SubmissionStats {
    total_submissions: number;
    status_counts: Record<SubmissionStatus, number>;
    average_score: number;
  }
  
  export interface AuthResponse {
    access_token: string;
    token_type: string;
  }