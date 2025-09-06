/**
 * Privacy Protection Service
 * 
 * Handles data anonymization, location privacy, and GDPR compliance
 * for the Disaster Response Dashboard.
 */

export interface PrivacySettings {
  anonymizeLocations: boolean;
  locationPrecision: 'exact' | 'neighborhood' | 'city' | 'county' | 'state';
  dataRetentionDays: number;
  allowAnalytics: boolean;
  allowCookies: boolean;
  allowLocationTracking: boolean;
}

export interface AnonymizedLocation {
  latitude: number;
  longitude: number;
  precision: string;
  originalPrecision?: number;
}

export interface PrivacyAuditLog {
  timestamp: Date;
  action: string;
  dataType: string;
  anonymized: boolean;
  userId?: string;
  details: Record<string, any>;
}

export class PrivacyService {
  private static readonly PRIVACY_SETTINGS_KEY = 'disaster_response_privacy_settings';
  private static readonly AUDIT_LOG_KEY = 'disaster_response_privacy_audit';
  
  private static privacySettings: PrivacySettings = {
    anonymizeLocations: true,
    locationPrecision: 'neighborhood',
    dataRetentionDays: 30,
    allowAnalytics: false,
    allowCookies: false,
    allowLocationTracking: false
  };

  private static auditLog: PrivacyAuditLog[] = [];

  /**
   * Initialize privacy service
   */
  static initialize(): void {
    this.loadPrivacySettings();
    this.loadAuditLog();
    this.cleanupExpiredData();
  }

  /**
   * Get current privacy settings
   */
  static getPrivacySettings(): PrivacySettings {
    return { ...this.privacySettings };
  }

  /**
   * Update privacy settings
   */
  static updatePrivacySettings(settings: Partial<PrivacySettings>): void {
    this.privacySettings = { ...this.privacySettings, ...settings };
    this.savePrivacySettings();
    this.logAuditEvent('privacy_settings_updated', 'settings', false, { settings });
  }

  /**
   * Anonymize location data
   */
  static anonymizeLocation(
    latitude: number, 
    longitude: number, 
    precision?: string
  ): AnonymizedLocation {
    const currentPrecision = precision || this.privacySettings.locationPrecision;
    
    if (!this.privacySettings.anonymizeLocations) {
      return {
        latitude,
        longitude,
        precision: 'exact',
        originalPrecision: 0
      };
    }

    const anonymized = this.applyLocationPrecision(latitude, longitude, currentPrecision);
    
    this.logAuditEvent('location_anonymized', 'location', true, {
      original: { latitude, longitude },
      anonymized,
      precision: currentPrecision
    });

    return anonymized;
  }

  /**
   * Apply location precision based on privacy settings
   */
  private static applyLocationPrecision(
    latitude: number, 
    longitude: number, 
    precision: string
  ): AnonymizedLocation {
    const precisionLevels = {
      exact: 0.0001,      // ~11 meters
      neighborhood: 0.001, // ~111 meters
      city: 0.01,         // ~1.1 km
      county: 0.1,        // ~11 km
      state: 1.0          // ~111 km
    };

    const precisionValue = precisionLevels[precision as keyof typeof precisionLevels] || 0.001;
    
    // Round coordinates to reduce precision
    const roundedLat = Math.round(latitude / precisionValue) * precisionValue;
    const roundedLng = Math.round(longitude / precisionValue) * precisionValue;

    return {
      latitude: roundedLat,
      longitude: roundedLng,
      precision,
      originalPrecision: precisionValue
    };
  }

  /**
   * Anonymize personal data
   */
  static anonymizePersonalData(data: Record<string, any>): Record<string, any> {
    const anonymized = { ...data };
    
    // Remove or hash personal identifiers
    const personalFields = ['email', 'phone', 'ssn', 'driverLicense', 'passport'];
    
    personalFields.forEach(field => {
      if (anonymized[field]) {
        anonymized[field] = this.hashValue(anonymized[field]);
      }
    });

    // Anonymize names (keep first letter, replace rest with asterisks)
    if (anonymized.firstName) {
      anonymized.firstName = this.anonymizeName(anonymized.firstName);
    }
    if (anonymized.lastName) {
      anonymized.lastName = this.anonymizeName(anonymized.lastName);
    }

    this.logAuditEvent('personal_data_anonymized', 'personal', true, {
      fields: personalFields,
      hasAnonymizedFields: personalFields.some(field => anonymized[field])
    });

    return anonymized;
  }

  /**
   * Anonymize name (keep first letter, replace rest)
   */
  private static anonymizeName(name: string): string {
    if (name.length <= 1) return name;
    return name[0] + '*'.repeat(name.length - 1);
  }

  /**
   * Hash sensitive value
   */
  private static hashValue(value: string): string {
    // Simple hash for demo - in production, use proper cryptographic hashing
    let hash = 0;
    for (let i = 0; i < value.length; i++) {
      const char = value.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return `hash_${Math.abs(hash).toString(16)}`;
  }

  /**
   * Check if data should be retained
   */
  static shouldRetainData(timestamp: Date): boolean {
    const retentionDays = this.privacySettings.dataRetentionDays;
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - retentionDays);
    
    return timestamp >= cutoffDate;
  }

  /**
   * Clean up expired data
   */
  static cleanupExpiredData(): void {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - this.privacySettings.dataRetentionDays);
    
    // Clean up audit log
    this.auditLog = this.auditLog.filter(log => log.timestamp >= cutoffDate);
    this.saveAuditLog();
    
    // Clean up other stored data
    this.cleanupLocalStorage();
    
    this.logAuditEvent('data_cleanup', 'system', false, {
      cutoffDate: cutoffDate.toISOString(),
      retentionDays: this.privacySettings.dataRetentionDays
    });
  }

  /**
   * Clean up local storage
   */
  private static cleanupLocalStorage(): void {
    const keysToCheck = [
      'disaster_response_',
      'mapbox_',
      'analytics_'
    ];

    Object.keys(localStorage).forEach(key => {
      if (keysToCheck.some(prefix => key.startsWith(prefix))) {
        try {
          const data = JSON.parse(localStorage.getItem(key) || '{}');
          if (data.timestamp && !this.shouldRetainData(new Date(data.timestamp))) {
            localStorage.removeItem(key);
          }
        } catch {
          // If parsing fails, remove the item
          localStorage.removeItem(key);
        }
      }
    });
  }

  /**
   * Log privacy audit event
   */
  private static logAuditEvent(
    action: string,
    dataType: string,
    anonymized: boolean,
    details: Record<string, any>
  ): void {
    const auditEntry: PrivacyAuditLog = {
      timestamp: new Date(),
      action,
      dataType,
      anonymized,
      userId: this.getCurrentUserId(),
      details
    };

    this.auditLog.push(auditEntry);
    this.saveAuditLog();
  }

  /**
   * Get current user ID (if available)
   */
  private static getCurrentUserId(): string | undefined {
    try {
      const userData = localStorage.getItem('disaster_response_user');
      if (userData) {
        const user = JSON.parse(userData);
        return user.id;
      }
    } catch {
      // Ignore parsing errors
    }
    return undefined;
  }

  /**
   * Get privacy audit log
   */
  static getAuditLog(): PrivacyAuditLog[] {
    return [...this.auditLog];
  }

  /**
   * Export user data (GDPR compliance)
   */
  static exportUserData(userId: string): Record<string, any> {
    const userData: Record<string, any> = {
      userId,
      exportDate: new Date().toISOString(),
      privacySettings: this.privacySettings,
      auditLog: this.auditLog.filter(log => log.userId === userId)
    };

    this.logAuditEvent('data_export', 'personal', false, { userId });
    return userData;
  }

  /**
   * Delete user data (GDPR compliance)
   */
  static deleteUserData(userId: string): void {
    // Remove user-specific data from audit log
    this.auditLog = this.auditLog.filter(log => log.userId !== userId);
    this.saveAuditLog();

    // Remove user-specific local storage
    Object.keys(localStorage).forEach(key => {
      if (key.includes(userId)) {
        localStorage.removeItem(key);
      }
    });

    this.logAuditEvent('data_deletion', 'personal', false, { userId });
  }

  /**
   * Check if analytics are allowed
   */
  static canUseAnalytics(): boolean {
    return this.privacySettings.allowAnalytics;
  }

  /**
   * Check if cookies are allowed
   */
  static canUseCookies(): boolean {
    return this.privacySettings.allowCookies;
  }

  /**
   * Check if location tracking is allowed
   */
  static canTrackLocation(): boolean {
    return this.privacySettings.allowLocationTracking;
  }

  /**
   * Load privacy settings from storage
   */
  private static loadPrivacySettings(): void {
    try {
      const stored = localStorage.getItem(this.PRIVACY_SETTINGS_KEY);
      if (stored) {
        this.privacySettings = { ...this.privacySettings, ...JSON.parse(stored) };
      }
    } catch {
      // Use default settings if loading fails
    }
  }

  /**
   * Save privacy settings to storage
   */
  private static savePrivacySettings(): void {
    try {
      localStorage.setItem(this.PRIVACY_SETTINGS_KEY, JSON.stringify(this.privacySettings));
    } catch (error) {
      console.error('Failed to save privacy settings:', error);
    }
  }

  /**
   * Load audit log from storage
   */
  private static loadAuditLog(): void {
    try {
      const stored = localStorage.getItem(this.AUDIT_LOG_KEY);
      if (stored) {
        this.auditLog = JSON.parse(stored).map((log: any) => ({
          ...log,
          timestamp: new Date(log.timestamp)
        }));
      }
    } catch {
      // Start with empty audit log if loading fails
      this.auditLog = [];
    }
  }

  /**
   * Save audit log to storage
   */
  private static saveAuditLog(): void {
    try {
      localStorage.setItem(this.AUDIT_LOG_KEY, JSON.stringify(this.auditLog));
    } catch (error) {
      console.error('Failed to save audit log:', error);
    }
  }

  /**
   * Get privacy compliance report
   */
  static getComplianceReport(): Record<string, any> {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    
    const recentAuditLog = this.auditLog.filter(log => log.timestamp >= thirtyDaysAgo);
    
    return {
      reportDate: now.toISOString(),
      privacySettings: this.privacySettings,
      dataRetentionCompliance: this.privacySettings.dataRetentionDays <= 30,
      anonymizationEnabled: this.privacySettings.anonymizeLocations,
      auditEventsLast30Days: recentAuditLog.length,
      dataExports: recentAuditLog.filter(log => log.action === 'data_export').length,
      dataDeletions: recentAuditLog.filter(log => log.action === 'data_deletion').length,
      anonymizedDataPoints: recentAuditLog.filter(log => log.anonymized).length
    };
  }
}

