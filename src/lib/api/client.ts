import axios, {
  AxiosError,
  AxiosInstance,
  AxiosRequestConfig,
  InternalAxiosRequestConfig,
} from 'axios';

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
  async (error: AxiosError<ApiErrorData>) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // Handle token refresh on 401
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (refreshToken) {
          const response = await axios.post<{ token: string }>(
            `${process.env.NEXT_PUBLIC_API_URL}/auth/refresh`,
            { refreshToken }
          );

          const { token } = response.data;
          localStorage.setItem('authToken', token);

          // Retry original request
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return apiClient(originalRequest);
        }
      } catch {
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
interface ApiErrorData {
  message?: string;
  code?: string;
  details?: Record<string, unknown>;
}

export interface ApiErrorResponse {
  success: false;
  error: {
    message: string;
    code?: string;
    statusCode: number;
    details?: Record<string, unknown>;
  };
}

interface ApiErrorData {
  message?: string;
  code?: string;
  details?: Record<string, unknown>;
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
function formatErrorResponse(error: AxiosError<ApiErrorData>): ApiErrorResponse {
  const responseData = error.response?.data;

  if (responseData) {
    return {
      success: false,
      error: {
        message: responseData.message || error.message,
        code: responseData.code,
        statusCode: error.response?.status || 500,
        details: responseData.details,
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
  get<T = unknown>(url: string, config?: AxiosRequestConfig) {
    return apiClient.get<unknown, ApiSuccessResponse<T>>(url, config);
  },

  /**
   * POST request
   */
  post<T = unknown>(url: string, data?: unknown, config?: AxiosRequestConfig) {
    return apiClient.post<unknown, ApiSuccessResponse<T>>(url, data, config);
  },

  /**
   * PUT request
   */
  put<T = unknown>(url: string, data?: unknown, config?: AxiosRequestConfig) {
    return apiClient.put<unknown, ApiSuccessResponse<T>>(url, data, config);
  },

  /**
   * PATCH request
   */
  patch<T = unknown>(url: string, data?: unknown, config?: AxiosRequestConfig) {
    return apiClient.patch<unknown, ApiSuccessResponse<T>>(url, data, config);
  },

  /**
   * DELETE request
   */
  delete<T = unknown>(url: string, config?: AxiosRequestConfig) {
    return apiClient.delete<unknown, ApiSuccessResponse<T>>(url, config);
  },

  /**
   * File upload with FormData
   */
  upload<T = unknown>(url: string, formData: FormData, config?: AxiosRequestConfig) {
    return apiClient.post<unknown, ApiSuccessResponse<T>>(url, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      ...config,
    });
  },
};

export default apiClient;
