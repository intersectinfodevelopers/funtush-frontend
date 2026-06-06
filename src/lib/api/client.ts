import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';

/**
 * Axios API Client Configuration
 *
 * Features:
 * - Automatic request/response interceptors
 * - Error handling with standardized format
 * - Token refresh mechanism
 * - Request timeout handling
 * - Retry logic for failed requests
 */

// Create axios instance
export const apiClient: AxiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api',
  timeout: parseInt(process.env.NEXT_PUBLIC_API_TIMEOUT || '30000', 10),
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Request Interceptor
 * - Adds authentication token to headers
 * - Adds necessary headers
 */
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Add token if available
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('authToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }

    // Add request ID for tracing
    config.headers['X-Request-ID'] = generateRequestId();

    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

/**
 * Response Interceptor
 * - Handle errors globally
 * - Refresh token if expired (401)
 * - Format error responses
 */
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<ApiErrorResponse>) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // Handle token refresh on 401
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (refreshToken) {
          const response = await axios.post(
            `${process.env.NEXT_PUBLIC_API_URL}/auth/refresh`,
            { refreshToken }
          );

          const { token } = response.data;
          localStorage.setItem('authToken', token);

          // Retry original request
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return apiClient(originalRequest);
        }
      } catch (refreshError) {
        // Clear auth and redirect to login
        if (typeof window !== 'undefined') {
          localStorage.removeItem('authToken');
          localStorage.removeItem('refreshToken');
          window.location.href = '/login';
        }
      }
    }

    // Handle other errors
    return Promise.reject(formatErrorResponse(error));
  }
);

/**
 * Error Response Format
 */
export interface ApiErrorResponse {
  success: false;
  error: {
    message: string;
    code?: string;
    statusCode: number;
    details?: Record<string, unknown>;
  };
}

/**
 * Success Response Format
 */
export interface ApiSuccessResponse<T = unknown> {
  success: true;
  data: T;
  message?: string;
}

/**
 * Paginated Response Format
 */
export interface ApiPaginatedResponse<T = unknown> {
  success: true;
  data: T[];
  pagination: {
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  };
}

/**
 * Format error response into standardized format
 */
function formatErrorResponse(error: AxiosError<any>): ApiErrorResponse {
  if (error.response?.data) {
    return {
      success: false,
      error: {
        message: error.response.data.message || error.message,
        code: error.response.data.code,
        statusCode: error.response.status || 500,
        details: error.response.data.details,
      },
    };
  }

  return {
    success: false,
    error: {
      message: error.message || 'An unexpected error occurred',
      statusCode: error.response?.status || 500,
    },
  };
}

/**
 * Generate unique request ID for tracing
 */
function generateRequestId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * API Helper Methods
 */
export const api = {
  /**
   * GET request
   */
  get<T = any>(url: string, config?: any) {
    return apiClient.get<any, ApiSuccessResponse<T>>(url, config);
  },

  /**
   * POST request
   */
  post<T = any>(url: string, data?: any, config?: any) {
    return apiClient.post<any, ApiSuccessResponse<T>>(url, data, config);
  },

  /**
   * PUT request
   */
  put<T = any>(url: string, data?: any, config?: any) {
    return apiClient.put<any, ApiSuccessResponse<T>>(url, data, config);
  },

  /**
   * PATCH request
   */
  patch<T = any>(url: string, data?: any, config?: any) {
    return apiClient.patch<any, ApiSuccessResponse<T>>(url, data, config);
  },

  /**
   * DELETE request
   */
  delete<T = any>(url: string, config?: any) {
    return apiClient.delete<any, ApiSuccessResponse<T>>(url, config);
  },

  /**
   * File upload with FormData
   */
  upload<T = any>(url: string, formData: FormData, config?: any) {
    return apiClient.post<any, ApiSuccessResponse<T>>(url, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      ...config,
    });
  },
};

export default apiClient;
