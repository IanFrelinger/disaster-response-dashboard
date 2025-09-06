import { z } from 'zod';

// Environment variable schema with validation
const EnvironmentSchema = z.object({
  // Mapbox configuration
  VITE_MAPBOX_TOKEN: z.string().min(1, 'Mapbox token is required'),
  VITE_MAPBOX_STYLE_URL: z.string().url('Invalid Mapbox style URL').optional(),
  
  // API configuration
  VITE_API_BASE_URL: z.string().url('Invalid API base URL').optional(),
  VITE_API_TIMEOUT: z.coerce.number().positive('API timeout must be positive').default(30000),
  
  // Feature flags
  VITE_ENABLE_3D_TERRAIN: z.coerce.boolean().default(false),
  VITE_ENABLE_REAL_TIME_UPDATES: z.coerce.boolean().default(true),
  VITE_ENABLE_OFFLINE_MODE: z.coerce.boolean().default(false),
  
  // Performance settings
  VITE_MAX_FEATURES: z.coerce.number().positive('Max features must be positive').default(10000),
  VITE_FRAME_RATE_TARGET: z.coerce.number().positive('Frame rate target must be positive').default(60),
  
  // Development settings
  VITE_ENABLE_DEBUG_MODE: z.coerce.boolean().default(false),
  VITE_ENABLE_FAULT_INJECTION: z.coerce.boolean().default(false),
});

type Environment = z.infer<typeof EnvironmentSchema>;

// Environment configuration class with fault injection support
class EnvironmentConfig {
  private config: Environment | null = null;
  private errors: string[] = [];

  /**
   * Initialize environment configuration
   * Integrates with fault injection system for testing
   */
  initialize(): Environment {
    try {
      // Check for injected environment faults
      if (typeof window !== 'undefined' && window.__testFaults__?.config.env) {
        const fault = window.__testFaults__?.config.env;
        
        switch (fault.kind) {
          case 'missing-mapbox-token':
            // Simulate missing Mapbox token
            delete process.env['VITE_MAPBOX_TOKEN'];
            break;
            
          case 'invalid-api-endpoint':
            // Simulate invalid API endpoint
            process.env['VITE_API_BASE_URL'] = 'invalid-url';
            break;
            
          case 'config-file-corrupt':
            // Simulate corrupted configuration
            process.env['VITE_MAPBOX_TOKEN'] = '';
            process.env['VITE_API_BASE_URL'] = 'not-a-url';
            break;
            
          case 'environment-variable-missing':
            // Simulate missing environment variables
            delete process.env['VITE_MAPBOX_TOKEN'];
            delete process.env['VITE_API_BASE_URL'];
            break;
        }
      }

      // Parse and validate environment variables
      const rawConfig = {
        VITE_MAPBOX_TOKEN: process.env['VITE_MAPBOX_TOKEN'],
        VITE_MAPBOX_STYLE_URL: process.env['VITE_MAPBOX_STYLE_URL'],
        VITE_API_BASE_URL: process.env['VITE_API_BASE_URL'],
        VITE_API_TIMEOUT: process.env['VITE_API_TIMEOUT'],
        VITE_ENABLE_3D_TERRAIN: process.env['VITE_ENABLE_3D_TERRAIN'],
        VITE_ENABLE_REAL_TIME_UPDATES: process.env['VITE_ENABLE_REAL_TIME_UPDATES'],
        VITE_ENABLE_OFFLINE_MODE: process.env['VITE_ENABLE_OFFLINE_MODE'],
        VITE_MAX_FEATURES: process.env['VITE_MAX_FEATURES'],
        VITE_FRAME_RATE_TARGET: process.env['VITE_FRAME_RATE_TARGET'],
        VITE_ENABLE_DEBUG_MODE: process.env['VITE_ENABLE_DEBUG_MODE'],
        VITE_ENABLE_FAULT_INJECTION: process.env['VITE_ENABLE_FAULT_INJECTION'],
      };

      this.config = EnvironmentSchema.parse(rawConfig);
      
      // Log successful configuration
      if (process.env.NODE_ENV === 'development') {
        console.log('✅ Environment configuration loaded successfully');
      }
      
      return this.config;
      
    } catch (error) {
      // Handle configuration errors
      if (error instanceof z.ZodError) {
        this.errors = error.errors.map(err => `${err.path.join('.')}: ${err.message}`);
      } else {
        this.errors = [error instanceof Error ? error.message : 'Unknown configuration error'];
      }
      
      // Log configuration errors
      console.error('❌ Environment configuration failed:', this.errors);
      
      // In development, throw error to prevent app from running with invalid config
      if (process.env.NODE_ENV === 'development') {
        throw new Error(`Environment configuration failed:\n${this.errors.join('\n')}`);
      }
      
      // In production, provide fallback configuration
      return this.getFallbackConfig();
    }
  }

  /**
   * Get fallback configuration for production environments
   */
  private getFallbackConfig(): Environment {
    console.warn('⚠️ Using fallback environment configuration');
    
    return {
      VITE_MAPBOX_TOKEN: '',
      VITE_MAPBOX_STYLE_URL: undefined,
      VITE_API_BASE_URL: undefined,
      VITE_API_TIMEOUT: 30000,
      VITE_ENABLE_3D_TERRAIN: false,
      VITE_ENABLE_REAL_TIME_UPDATES: false,
      VITE_ENABLE_OFFLINE_MODE: true,
      VITE_MAX_FEATURES: 1000,
      VITE_FRAME_RATE_TARGET: 30,
      VITE_ENABLE_DEBUG_MODE: false,
      VITE_ENABLE_FAULT_INJECTION: false,
    };
  }

  /**
   * Get current configuration
   */
  get(): Environment {
    if (!this.config) {
      throw new Error('Environment configuration not initialized. Call initialize() first.');
    }
    return this.config;
  }

  /**
   * Check if configuration is valid
   */
  isValid(): boolean {
    return this.errors.length === 0 && this.config !== null;
  }

  /**
   * Get configuration errors
   */
  getErrors(): string[] {
    return [...this.errors];
  }

  /**
   * Check if specific feature is enabled
   */
  isFeatureEnabled(feature: keyof Pick<Environment, 'VITE_ENABLE_3D_TERRAIN' | 'VITE_ENABLE_REAL_TIME_UPDATES' | 'VITE_ENABLE_OFFLINE_MODE' | 'VITE_ENABLE_DEBUG_MODE' | 'VITE_ENABLE_FAULT_INJECTION'>): boolean {
    return this.get()[feature];
  }

  /**
   * Get API configuration
   */
  getApiConfig() {
    const config = this.get();
    return {
      baseUrl: config.VITE_API_BASE_URL,
      timeout: config.VITE_API_TIMEOUT,
    };
  }

  /**
   * Get Mapbox configuration
   */
  getMapboxConfig() {
    const config = this.get();
    return {
      token: config.VITE_MAPBOX_TOKEN,
      styleUrl: config.VITE_MAPBOX_STYLE_URL,
    };
  }

  /**
   * Get performance configuration
   */
  getPerformanceConfig() {
    const config = this.get();
    return {
      maxFeatures: config.VITE_MAX_FEATURES,
      frameRateTarget: config.VITE_FRAME_RATE_TARGET,
    };
  }

  /**
   * Validate specific configuration section
   */
  validateSection<T extends keyof Environment>(section: T): Environment[T] {
    const config = this.get();
    const value = config[section];
    
    // Check for injected faults
    if (typeof window !== 'undefined' && window.__testFaults__?.config.env) {
      const fault = window.__testFaults__?.config.env;
      
      if (fault.kind === 'feature-flag-mismatch') {
        // Simulate feature flag mismatch
        throw new Error(`Feature flag mismatch detected for ${section}`);
      }
    }
    
    return value;
  }

  /**
   * Reset configuration (useful for testing)
   */
  reset(): void {
    this.config = null;
    this.errors = [];
  }
}

// Create singleton instance
const environmentConfig = new EnvironmentConfig();

// Export configuration and utility functions
export { environmentConfig, EnvironmentSchema };
export type { Environment };

// Default export for easy importing
export default environmentConfig;
