import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
import { environmentConfig } from '../config/environment';

// Custom error classes for better error handling
export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public code?: string,
    public response?: any
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export class NetworkError extends Error {
  constructor(message: string, public originalError?: Error) {
    super(message);
    this.name = 'NetworkError';
  }
}

export class TimeoutError extends Error {
  constructor(message: string, public timeout: number) {
    super(message);
    this.name = 'TimeoutError';
  }
}

// API client configuration
interface ApiClientConfig {
  baseURL?: string;
  timeout?: number;
  retries?: number;
  retryDelay?: number;
}

// Fault injection integration for API testing
const checkFaultInjection = (config: AxiosRequestConfig) => {
  if (typeof window === 'undefined' || !window.__testFaults__?.config.api) {
    return;
  }

  const fault = window.__testFaults__?.config.api;
  
  switch (fault.kind) {
    case 'http': {
      // Simulate HTTP error response
      const error = new ApiError(
        `HTTP ${fault.status} error`,
        fault.status,
        `HTTP_${fault.status}`
      );
      throw error;
    }
      
    case 'timeout':
      // Simulate timeout error
      throw new TimeoutError('Request timeout', config.timeout || 30000);
      
    case 'invalid-json':
      // Simulate invalid JSON response
      throw new ApiError('Invalid JSON response', 200, 'INVALID_JSON');
      
    case 'schema-mismatch':
      // Simulate schema validation error
      throw new ApiError('Schema validation failed', 200, 'SCHEMA_MISMATCH');
      
    case 'network-error':
      // Simulate network error
      throw new NetworkError('Network error occurred');
      
    case 'cors-error':
      // Simulate CORS error
      throw new ApiError('CORS error', 0, 'CORS_ERROR');
      
    case 'rate-limit-exceeded':
      // Simulate rate limiting
      throw new ApiError('Rate limit exceeded', 429, 'RATE_LIMIT_EXCEEDED');
  }
};

/**
 * API Client with fault injection support
 * 
 * This client integrates with the fault injection system to simulate
 * various API failure scenarios during testing.
 */
export class ApiClient {
  private client: AxiosInstance;
  private retries: number;
  private retryDelay: number;

  constructor(config: ApiClientConfig = {}) {
    const env = environmentConfig.get();
    
    this.client = axios.create({
      baseURL: config.baseURL || env.VITE_API_BASE_URL,
      timeout: config.timeout || env.VITE_API_TIMEOUT,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.retries = config.retries || 3;
    this.retryDelay = config.retryDelay || 1000;

    // Setup request interceptors
    this.setupRequestInterceptors();
    
    // Setup response interceptors
    this.setupResponseInterceptors();
  }

  /**
   * Setup request interceptors for fault injection
   */
  private setupRequestInterceptors() {
    this.client.interceptors.request.use(
      (config) => {
        // Check for fault injection before making request
        checkFaultInjection(config);
        
        // Add request ID for tracking
        (config as any).metadata = { 
          startTime: Date.now(),
          requestId: Math.random().toString(36).substr(2, 9)
        };
        
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );
  }

  /**
   * Setup response interceptors for error handling
   */
  private setupResponseInterceptors() {
    this.client.interceptors.response.use(
      (response: AxiosResponse) => {
        // Log successful responses in development
        if (process.env.NODE_ENV === 'development') {
          const duration = Date.now() - ((response.config as any).metadata?.startTime || 0);
          console.log(`✅ API ${response.config.method?.toUpperCase()} ${response.config.url} - ${response.status} (${duration}ms)`);
        }
        
        return response;
      },
      async (error: AxiosError) => {
        const config = error.config;
        const requestId = (config as any)?.metadata?.requestId;
        
        // Log error details
        if (process.env.NODE_ENV === 'development') {
          const duration = (config as any)?.metadata?.startTime ? Date.now() - (config as any).metadata.startTime : 0;
          console.error(`❌ API ${config?.method?.toUpperCase()} ${config?.url} - ${error.response?.status || 'NETWORK'} (${duration}ms)`, error.message);
        }

        // Handle specific error types
        if (error.code === 'ECONNABORTED') {
          throw new TimeoutError('Request timeout', config?.timeout || 30000);
        }

        if (!error.response) {
          throw new NetworkError('Network error occurred', error);
        }

        // Handle HTTP errors
        const status = error.response.status;
        const message = (error.response.data as any)?.message || (error as any).message;
        const code = (error.response.data as any)?.code || `HTTP_${status}`;

        throw new ApiError(message, status, code, error.response.data);
      }
    );
  }

  /**
   * Make HTTP request with retry logic
   */
  private async makeRequest<T>(
    config: AxiosRequestConfig,
    retryCount: number = 0
  ): Promise<T> {
    try {
      const response = await this.client.request(config);
      return response.data;
    } catch (error) {
      // Check if we should retry
      if (this.shouldRetry(error, retryCount)) {
        const delay = this.retryDelay * Math.pow(2, retryCount);
        
        if (process.env.NODE_ENV === 'development') {
          console.log(`🔄 Retrying request (${retryCount + 1}/${this.retries}) in ${delay}ms`);
        }
        
        await this.sleep(delay);
        return this.makeRequest(config, retryCount + 1);
      }
      
      throw error;
    }
  }

  /**
   * Determine if request should be retried
   */
  private shouldRetry(error: any, retryCount: number): boolean {
    // Don't retry if we've exceeded retry limit
    if (retryCount >= this.retries) {
      return false;
    }

    // Don't retry client errors (4xx) except 408, 429
    if (error instanceof ApiError && error.status >= 400 && error.status < 500) {
      return error.status === 408 || error.status === 429;
    }

    // Retry network errors and timeouts
    if (error instanceof NetworkError || error instanceof TimeoutError) {
      return true;
    }

    // Retry server errors (5xx)
    if (error instanceof ApiError && error.status >= 500) {
      return true;
    }

    return false;
  }

  /**
   * Sleep utility for retry delays
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * GET request
   */
  async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    return this.makeRequest<T>({ ...config, method: 'GET', url });
  }

  /**
   * POST request
   */
  async post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    return this.makeRequest<T>({ ...config, method: 'POST', url, data });
  }

  /**
   * PUT request
   */
  async put<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    return this.makeRequest<T>({ ...config, method: 'PUT', url, data });
  }

  /**
   * DELETE request
   */
  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    return this.makeRequest<T>({ ...config, method: 'DELETE', url });
  }

  /**
   * PATCH request
   */
  async patch<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    return this.makeRequest<T>({ ...config, method: 'PATCH', url, data });
  }

  /**
   * Upload file
   */
  async upload<T>(url: string, file: File, config?: AxiosRequestConfig): Promise<T> {
    const formData = new FormData();
    formData.append('file', file);
    
    return this.makeRequest<T>({
      ...config,
      method: 'POST',
      url,
      data: formData,
      headers: {
        ...config?.headers,
        'Content-Type': 'multipart/form-data',
      },
    });
  }

  /**
   * Download file
   */
  async download(url: string, filename?: string, config?: AxiosRequestConfig): Promise<void> {
    const response = await this.client.request({
      ...config,
      method: 'GET',
      url,
      responseType: 'blob',
    });

    const blob = new Blob([response.data]);
    const downloadUrl = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = filename || 'download';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(downloadUrl);
  }

  /**
   * Health check
   */
  async healthCheck(): Promise<boolean> {
    try {
      await this.get('/health');
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Get request statistics
   */
  getStats() {
    return {
      retries: this.retries,
      retryDelay: this.retryDelay,
      baseURL: this.client.defaults.baseURL,
      timeout: this.client.defaults.timeout,
    };
  }

  /**
   * Update configuration
   */
  updateConfig(config: Partial<ApiClientConfig>) {
    if (config.baseURL) {
      this.client.defaults.baseURL = config.baseURL;
    }
    if (config.timeout) {
      this.client.defaults.timeout = config.timeout;
    }
    if (config.retries !== undefined) {
      this.retries = config.retries;
    }
    if (config.retryDelay !== undefined) {
      this.retryDelay = config.retryDelay;
    }
  }
}

// Create default API client instance
export const apiClient = new ApiClient();

// Export for use in components
export default apiClient;
