import axios from 'axios';
import type { AxiosInstance, InternalAxiosRequestConfig, AxiosResponse } from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Automatically attach customer JWT token
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    if (typeof window !== 'undefined') {
      try {
        const customerToken = localStorage.getItem('crochet_customer_token');
        if (customerToken) {
          config.headers.Authorization = `Bearer ${customerToken}`;
        }
      } catch (err) {
        console.warn('Could not read token from localStorage:', err);
      }
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// Format and unwrap responses
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    if (response?.data && response.data.data !== undefined) {
      return response.data;
    }
    return response;
  },
  (error) => {
    const message =
      error.response?.data?.message ||
      error.response?.data?.error ||
      error.message ||
      'An unexpected error occurred';

    const customError: any = new Error(
      Array.isArray(message) ? message.join(', ') : String(message),
    );
    customError.status = error.response?.status;
    customError.response = error.response;

    return Promise.reject(customError);
  },
);
