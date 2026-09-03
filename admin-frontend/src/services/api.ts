import * as axiosModule from 'axios';

const axiosInstanceFactory: any = (axiosModule as any).default || axiosModule;
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export const apiClient = axiosInstanceFactory.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Attach admin JWT token automatically
apiClient.interceptors.request.use(
  (config: any) => {
    if (typeof window !== 'undefined') {
      try {
        const adminToken = localStorage.getItem('crochet_admin_token');
        if (adminToken) {
          config.headers = config.headers || {};
          config.headers.Authorization = `Bearer ${adminToken}`;
        }
      } catch (err) {
        console.warn('Could not read admin token from localStorage:', err);
      }
    }
    return config;
  },
  (error: any) => Promise.reject(error),
);

// Format and unwrap responses
apiClient.interceptors.response.use(
  (response: any) => {
    if (response?.data && response.data.data !== undefined) {
      return response.data;
    }
    return response;
  },
  (error: any) => {
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
