import axios from 'axios';
import { handleMockRequest } from './mockEngine';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

// Request interceptor — attach JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor — handle token expiry globally or fallback to mockEngine when server offline
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const isOfflineOr404 =
      !error.response ||
      error.response.status === 404 ||
      error.code === 'ERR_NETWORK' ||
      error.code === 'ECONNABORTED';

    if (isOfflineOr404 && error.config) {
      try {
        const mockResponse = await handleMockRequest(error.config);
        return mockResponse;
      } catch (mockError) {
        return Promise.reject(mockError);
      }
    }

    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
