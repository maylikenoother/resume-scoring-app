'use client';

import React from 'react';
import axios from 'axios';

// Define the base URL for the API
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

// Create an axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to include auth token
api.interceptors.request.use(
  (config) => {
    // Get token from localStorage or other storage mechanism
    const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// API functions for authentication
export const authAPI = {
  login: async (email: string, password: string) => {
    // In a real app, this would call the Clerk API
    // For now, we'll simulate a successful login
    const mockResponse = { token: 'mock-auth-token', user: { email } };
    localStorage.setItem('authToken', mockResponse.token);
    return mockResponse;
  },
  
  signup: async (email: string, password: string) => {
    // In a real app, this would call the Clerk API
    // For now, we'll simulate a successful signup
    const mockResponse = { token: 'mock-auth-token', user: { email } };
    localStorage.setItem('authToken', mockResponse.token);
    return mockResponse;
  },
  
  logout: () => {
    localStorage.removeItem('authToken');
  },
  
  getCurrentUser: async () => {
    try {
      const response = await api.get('/users/me');
      return response.data;
    } catch (error) {
      console.error('Error getting current user:', error);
      throw error;
    }
  }
};

// API functions for reviews
export const reviewAPI = {
  submitReview: async (cvFile: File) => {
    try {
      const formData = new FormData();
      formData.append('cv_file', cvFile);
      
      const response = await api.post('/reviews/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      return response.data;
    } catch (error) {
      console.error('Error submitting review:', error);
      throw error;
    }
  },
  
  getReviews: async () => {
    try {
      const response = await api.get('/reviews/');
      return response.data.reviews;
    } catch (error) {
      console.error('Error getting reviews:', error);
      throw error;
    }
  },
  
  getReviewById: async (reviewId: number) => {
    try {
      const response = await api.get(`/reviews/${reviewId}`);
      return response.data;
    } catch (error) {
      console.error(`Error getting review ${reviewId}:`, error);
      throw error;
    }
  }
};

// API functions for credits
export const creditAPI = {
  getCredits: async () => {
    try {
      const response = await api.get('/users/me/credits');
      return response.data;
    } catch (error) {
      console.error('Error getting credits:', error);
      throw error;
    }
  }
};

// API functions for notifications
export const notificationAPI = {
  getNotifications: async () => {
    try {
      const response = await api.get('/notifications/');
      return response.data.notifications;
    } catch (error) {
      console.error('Error getting notifications:', error);
      throw error;
    }
  },
  
  markAsRead: async (notificationId: number) => {
    try {
      const response = await api.put(`/notifications/${notificationId}/read`);
      return response.data;
    } catch (error) {
      console.error(`Error marking notification ${notificationId} as read:`, error);
      throw error;
    }
  },
  
  markAllAsRead: async () => {
    try {
      const response = await api.put('/notifications/read-all');
      return response.data.notifications;
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      throw error;
    }
  }
};

export default api;