/**
 * Resilience Manager for back-pressure, rate-limiting, adaptive caching, and offline support
 * Provides robust error handling and performance optimization
 */

interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
  backoffMs: number;
}

interface CircuitBreakerConfig {
  failureThreshold: number;
  recoveryTimeout: number;
  monitoringPeriod: number;
}

interface CacheConfig {
  ttl: number; // Time to live in milliseconds
  maxSize: number; // Maximum number of items
  strategy: 'lru' | 'fifo' | 'ttl';
}

interface BackPressureConfig {
  maxQueueSize: number;
  dropThreshold: number;
  retryDelay: number;
}

class ResilienceManager {
  private rateLimiters: Map<string, RateLimiter> = new Map();
  private circuitBreakers: Map<string, CircuitBreaker> = new Map();
  private caches: Map<string, Cache> = new Map();
  private backPressureQueues: Map<string, BackPressureQueue> = new Map();
  private offlineMode = false;
  private serviceWorker: ServiceWorker | null = null;

  constructor() {
    this.initializeServiceWorker();
    this.setupOfflineDetection();
  }

  private async initializeServiceWorker(): Promise<void> {
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js');
        this.serviceWorker = registration.active;
        console.log('Service Worker registered successfully');
      } catch (error) {
        console.warn('Service Worker registration failed:', error);
      }
    }
  }

  private setupOfflineDetection(): void {
    window.addEventListener('online', () => {
      this.offlineMode = false;
      this.processOfflineQueue();
    });

    window.addEventListener('offline', () => {
      this.offlineMode = true;
    });
  }

  public createRateLimiter(key: string, config: RateLimitConfig): RateLimiter {
    const limiter = new RateLimiter(config);
    this.rateLimiters.set(key, limiter);
    return limiter;
  }

  public createCircuitBreaker(key: string, config: CircuitBreakerConfig): CircuitBreaker {
    const breaker = new CircuitBreaker(config);
    this.circuitBreakers.set(key, breaker);
    return breaker;
  }

  public createCache(key: string, config: CacheConfig): Cache {
    const cache = new Cache(config);
    this.caches.set(key, cache);
    return cache;
  }

  public createBackPressureQueue(key: string, config: BackPressureConfig): BackPressureQueue {
    const queue = new BackPressureQueue(config);
    this.backPressureQueues.set(key, queue);
    return queue;
  }

  public async executeWithResilience<T>(
    key: string,
    operation: () => Promise<T>,
    fallback?: () => T
  ): Promise<T> {
    // Check circuit breaker
    const circuitBreaker = this.circuitBreakers.get(key);
    if (circuitBreaker && !circuitBreaker.canExecute()) {
      if (fallback) {
        return fallback();
      }
      throw new Error(`Circuit breaker open for ${key}`);
    }

    // Check rate limiter
    const rateLimiter = this.rateLimiters.get(key);
    if (rateLimiter && !rateLimiter.canExecute()) {
      await this.delay(rateLimiter.getBackoffDelay());
    }

    try {
      const result = await operation();
      
      // Record success
      if (circuitBreaker) {
        circuitBreaker.recordSuccess();
      }
      
      return result;
    } catch (error) {
      // Record failure
      if (circuitBreaker) {
        circuitBreaker.recordFailure();
      }
      
      if (fallback) {
        return fallback();
      }
      
      throw error;
    }
  }

  public async getCachedOrFetch<T>(
    key: string,
    cacheKey: string,
    fetcher: () => Promise<T>,
    ttl?: number
  ): Promise<T> {
    const cache = this.caches.get(key);
    if (cache) {
      const cached = cache.get(cacheKey);
      if (cached) {
        return cached as T;
      }
    }

    const result = await this.executeWithResilience(key, fetcher);
    
    if (cache) {
      cache.set(cacheKey, result, ttl);
    }
    
    return result;
  }

  public async queueOperation<T>(
    key: string,
    operation: () => Promise<T>
  ): Promise<T> {
    const queue = this.backPressureQueues.get(key);
    if (!queue) {
      return operation();
    }

    return queue.enqueue(operation);
  }

  private async processOfflineQueue(): Promise<void> {
    // Process queued operations when coming back online
    for (const queue of this.backPressureQueues.values()) {
      await queue.processQueue();
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  public isOffline(): boolean {
    return this.offlineMode;
  }

  public getStatus(): {
    offline: boolean;
    rateLimiters: number;
    circuitBreakers: number;
    caches: number;
    queues: number;
  } {
    return {
      offline: this.offlineMode,
      rateLimiters: this.rateLimiters.size,
      circuitBreakers: this.circuitBreakers.size,
      caches: this.caches.size,
      queues: this.backPressureQueues.size
    };
  }
}

class RateLimiter {
  private requests: number[] = [];
  private config: RateLimitConfig;

  constructor(config: RateLimitConfig) {
    this.config = config;
  }

  public canExecute(): boolean {
    const now = Date.now();
    const windowStart = now - this.config.windowMs;
    
    // Remove old requests
    this.requests = this.requests.filter(time => time > windowStart);
    
    return this.requests.length < this.config.maxRequests;
  }

  public execute(): void {
    this.requests.push(Date.now());
  }

  public getBackoffDelay(): number {
    return this.config.backoffMs;
  }
}

class CircuitBreaker {
  private failures = 0;
  private lastFailureTime = 0;
  private state: 'closed' | 'open' | 'half-open' = 'closed';
  private config: CircuitBreakerConfig;

  constructor(config: CircuitBreakerConfig) {
    this.config = config;
  }

  public canExecute(): boolean {
    if (this.state === 'closed') {
      return true;
    }
    
    if (this.state === 'open') {
      if (Date.now() - this.lastFailureTime > this.config.recoveryTimeout) {
        this.state = 'half-open';
        return true;
      }
      return false;
    }
    
    // half-open state
    return true;
  }

  public recordSuccess(): void {
    this.failures = 0;
    this.state = 'closed';
  }

  public recordFailure(): void {
    this.failures++;
    this.lastFailureTime = Date.now();
    
    if (this.failures >= this.config.failureThreshold) {
      this.state = 'open';
    }
  }
}

class Cache {
  private items: Map<string, { value: any; expiry: number }> = new Map();
  private config: CacheConfig;

  constructor(config: CacheConfig) {
    this.config = config;
  }

  public get(key: string): any | null {
    const item = this.items.get(key);
    if (!item) {
      return null;
    }
    
    if (Date.now() > item.expiry) {
      this.items.delete(key);
      return null;
    }
    
    return item.value;
  }

  public set(key: string, value: any, ttl?: number): void {
    const expiry = Date.now() + (ttl || this.config.ttl);
    
    // Check cache size limit
    if (this.items.size >= this.config.maxSize) {
      this.evictItem();
    }
    
    this.items.set(key, { value, expiry });
  }

  private evictItem(): void {
    if (this.config.strategy === 'lru') {
      // Remove least recently used (simplified implementation)
      const firstKey = this.items.keys().next().value;
      if (firstKey) {
        this.items.delete(firstKey);
      }
    } else if (this.config.strategy === 'fifo') {
      // Remove first in, first out
      const firstKey = this.items.keys().next().value;
      if (firstKey) {
        this.items.delete(firstKey);
      }
    } else if (this.config.strategy === 'ttl') {
      // Remove expired items first
      const now = Date.now();
      for (const [key, item] of this.items.entries()) {
        if (now > item.expiry) {
          this.items.delete(key);
          return;
        }
      }
      // If no expired items, remove oldest
      const firstKey = this.items.keys().next().value;
      if (firstKey) {
        this.items.delete(firstKey);
      }
    }
  }

  public clear(): void {
    this.items.clear();
  }

  public size(): number {
    return this.items.size;
  }
}

class BackPressureQueue {
  private queue: Array<() => Promise<any>> = [];
  private processing = false;
  private config: BackPressureConfig;

  constructor(config: BackPressureConfig) {
    this.config = config;
  }

  public async enqueue<T>(operation: () => Promise<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      if (this.queue.length >= this.config.maxQueueSize) {
        if (this.queue.length >= this.config.dropThreshold) {
          reject(new Error('Queue overflow - dropping request'));
          return;
        }
      }
      
      this.queue.push(async () => {
        try {
          const result = await operation();
          resolve(result);
        } catch (error) {
          reject(error);
        }
      });
      
      this.processQueue();
    });
  }

  public async processQueue(): Promise<void> {
    if (this.processing || this.queue.length === 0) {
      return;
    }
    
    this.processing = true;
    
    while (this.queue.length > 0) {
      const operation = this.queue.shift();
      if (operation) {
        try {
          await operation();
        } catch (error) {
          console.error('Queue operation failed:', error);
        }
        
        // Add delay between operations
        if (this.queue.length > 0) {
          await this.delay(this.config.retryDelay);
        }
      }
    }
    
    this.processing = false;
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Global resilience manager instance
export const resilienceManager = new ResilienceManager();

// Export types and classes
export type { RateLimitConfig, CircuitBreakerConfig, CacheConfig, BackPressureConfig };
export { ResilienceManager, RateLimiter, CircuitBreaker, Cache, BackPressureQueue };

