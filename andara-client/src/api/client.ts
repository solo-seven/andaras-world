import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';

// Support both VITE_API_URL (new) and VITE_API_BASE_URL (legacy) for backward compatibility
const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  import.meta.env.VITE_API_BASE_URL ||
  '/api/v1';
const API_TIMEOUT = 10000; // 10 seconds

class ApiClient {
  private client: AxiosInstance;
  private retryConfig = {
    maxRetries: 3,
    initialDelay: 1000,
  };

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      timeout: API_TIMEOUT,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    // Request interceptor
    this.client.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => {
        // Add authentication token if available (placeholder for future)
        const token = localStorage.getItem('authToken');
        if (token && config.headers) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor with error handling
    this.client.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        const originalRequest = error.config as InternalAxiosRequestConfig & {
          _retry?: boolean;
        };

        // Don't retry if already retried or if it's not a network error
        // Check for null/undefined first to prevent TypeError
        if (
          !originalRequest ||
          originalRequest._retry ||
          !this.isRetryableError(error)
        ) {
          return Promise.reject(this.transformError(error));
        }

        originalRequest._retry = true;

        // Retry with exponential backoff
        return this.retryRequest(originalRequest);
      }
    );
  }

  private isRetryableError(error: AxiosError): boolean {
    // Retry on network errors or 5xx errors
    if (!error.response) {
      return true; // Network error
    }
    const status = error.response.status;
    return status >= 500 && status < 600;
  }

  private async retryRequest(
    config: InternalAxiosRequestConfig & { _retry?: boolean }
  ): Promise<any> {
    let delay = this.retryConfig.initialDelay;
    // Initialize with a default error to ensure we always have a valid error to reject
    // This handles the edge case where maxRetries is 0 or the loop never executes
    let lastError: AxiosError | unknown = new Error('Request failed after retries');

    for (let attempt = 0; attempt < this.retryConfig.maxRetries; attempt++) {
      try {
        await new Promise((resolve) => setTimeout(resolve, delay));
        return await this.client.request(config);
      } catch (error) {
        lastError = error;

        // Check if error is already transformed (from interceptor)
        // Transformed errors have { message, status, data } but no response property
        const isTransformedError =
          error &&
          typeof error === 'object' &&
          'message' in error &&
          'status' in error &&
          !('response' in error);

        // If error is already transformed, don't retry
        if (isTransformedError) {
          break;
        }

        // Check if this is actually an AxiosError before checking retryability
        // Non-AxiosErrors (TypeError, JSON parsing errors, etc.) should not be retried
        // AxiosError instances have both 'isAxiosError' and 'config' properties
        const isAxiosError =
          error &&
          typeof error === 'object' &&
          ('isAxiosError' in error || 'config' in error);
        if (!isAxiosError) {
          // Non-AxiosError (client-side error, parsing error, etc.) - don't retry
          break;
        }

        // Only check retryability for AxiosError instances
        const axiosError = error as AxiosError;
        if (!this.isRetryableError(axiosError)) {
          break; // Don't retry non-retryable errors
        }
        delay *= 2; // Exponential backoff
      }
    }

    // Transform error if it's still an AxiosError, otherwise return as-is (already transformed)
    if (lastError && typeof lastError === 'object' && 'response' in lastError) {
      return Promise.reject(this.transformError(lastError as AxiosError));
    }
    return Promise.reject(lastError);
  }

  private transformError(error: AxiosError) {
    const responseData = error.response?.data as { message?: string } | undefined;
    return {
      message:
        responseData?.message ||
        error.message ||
        'An unexpected error occurred',
      status: error.response?.status,
      data: error.response?.data,
    };
  }

  get instance(): AxiosInstance {
    return this.client;
  }

  // Proxy methods to ensure interceptors and retry logic are used
  post<T = any>(url: string, data?: any, config?: any) {
    return this.client.post<T>(url, data, config);
  }

  get<T = any>(url: string, config?: any) {
    return this.client.get<T>(url, config);
  }

  put<T = any>(url: string, data?: any, config?: any) {
    return this.client.put<T>(url, data, config);
  }

  delete<T = any>(url: string, config?: any) {
    return this.client.delete<T>(url, config);
  }

  patch<T = any>(url: string, data?: any, config?: any) {
    return this.client.patch<T>(url, data, config);
  }

  request<T = any>(config: any) {
    return this.client.request<T>(config);
  }
}

export const apiClient = new ApiClient();
// Export the ApiClient wrapper instead of the raw instance
// This ensures all interceptors and retry logic are used
export default apiClient;


