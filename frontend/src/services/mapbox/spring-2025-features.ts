/**
 * Mapbox Spring 2025 Features Integration
 * 
 * Evaluates and integrates new Mapbox features announced for Spring 2025:
 * - Geofencing API
 * - MTS (Mapbox Tiling Service) Incremental Updates
 * - Zone Avoidance
 * - Animated 3D Weather Effects
 * - Voice Feedback Agent
 */

export interface GeofenceConfig {
  id: string;
  name: string;
  geometry: any;
  properties: {
    type: 'evacuation_zone' | 'hazard_area' | 'safe_zone' | 'restricted_area';
    priority: number;
    description: string;
    effectiveDate: Date;
    expiryDate?: Date;
  };
}

export interface GeofenceEvent {
  type: 'enter' | 'exit' | 'inside' | 'outside';
  geofenceId: string;
  timestamp: Date;
  location: {
    latitude: number;
    longitude: number;
    accuracy: number;
  };
  userId?: string;
  unitId?: string;
}

export interface MTSUpdateConfig {
  layerId: string;
  updateType: 'incremental' | 'full';
  lastUpdate: Date;
  updateFrequency: number; // minutes
  priority: 'high' | 'medium' | 'low';
}

export interface ZoneAvoidanceConfig {
  avoidZones: string[];
  avoidTypes: ('hazard' | 'restricted' | 'evacuation')[];
  bufferDistance: number; // meters
  priority: 'safety' | 'efficiency' | 'balanced';
}

export interface WeatherEffectConfig {
  effectType: 'rain' | 'snow' | 'fog' | 'smoke' | 'dust';
  intensity: number; // 0-1
  animationSpeed: number; // 0-1
  opacity: number; // 0-1
  windDirection: number; // degrees
  windSpeed: number; // m/s
}

export interface VoiceFeedbackConfig {
  enabled: boolean;
  language: string;
  voiceType: 'male' | 'female' | 'neutral';
  speechRate: number; // 0.1-2.0
  volume: number; // 0-1
  announcements: {
    geofenceEnter: boolean;
    geofenceExit: boolean;
    routeUpdate: boolean;
    hazardAlert: boolean;
    systemStatus: boolean;
  };
}

export class MapboxSpring2025Features {
  private static geofences: Map<string, GeofenceConfig> = new Map();
  private static mtsConfigs: Map<string, MTSUpdateConfig> = new Map();
  private static zoneAvoidance: ZoneAvoidanceConfig | null = null;
  private static weatherEffects: WeatherEffectConfig | null = null;
  private static voiceFeedback: VoiceFeedbackConfig | null = null;

  /**
   * Initialize Spring 2025 features
   */
  static async initialize(): Promise<void> {
    console.log('Initializing Mapbox Spring 2025 features...');
    
    try {
      await this.initializeGeofencing();
      await this.initializeMTSUpdates();
      await this.initializeZoneAvoidance();
      await this.initializeWeatherEffects();
      await this.initializeVoiceFeedback();
      
      console.log('✅ Mapbox Spring 2025 features initialized successfully');
    } catch (error) {
      console.error('❌ Failed to initialize Mapbox Spring 2025 features:', error);
    }
  }

  /**
   * Initialize Geofencing API
   */
  private static async initializeGeofencing(): Promise<void> {
    console.log('Setting up Geofencing API...');
    
    // Check if geofencing is supported
    if (!this.isGeofencingSupported()) {
      console.warn('Geofencing API not supported in this environment');
      return;
    }

    // Set up geofence monitoring
    this.setupGeofenceMonitoring();
    
    // Load existing geofences
    await this.loadGeofences();
    
    console.log('✅ Geofencing API initialized');
  }

  /**
   * Check if geofencing is supported
   */
  private static isGeofencingSupported(): boolean {
    // Check for geolocation API and other required features
    return 'geolocation' in navigator && 
           'serviceWorker' in navigator &&
           'Notification' in window;
  }

  /**
   * Setup geofence monitoring
   */
  private static setupGeofenceMonitoring(): void {
    if (!navigator.geolocation) return;

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        this.checkGeofences({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy
        });
      },
      (error) => {
        console.error('Geolocation error:', error);
      },
      {
        enableHighAccuracy: true,
        maximumAge: 30000,
        timeout: 10000
      }
    );

    // Store watch ID for cleanup
    (window as any).geofenceWatchId = watchId;
  }

  /**
   * Check current location against geofences
   */
  private static checkGeofences(location: { latitude: number; longitude: number; accuracy: number }): void {
    const point = [location.longitude, location.latitude];
    
    this.geofences.forEach((geofence, geofenceId) => {
      const isInside = this.isPointInPolygon(point, geofence.geometry.coordinates[0] || []);
      
      // Check for geofence events
      this.handleGeofenceEvent(geofenceId, isInside, location);
    });
  }

  /**
   * Check if point is inside polygon
   */
  private static isPointInPolygon(point: number[], polygon: number[][]): boolean {
    const [x, y] = point;
    if (x === undefined || y === undefined) return false;
    
    let inside = false;
    
    for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
      const [xi, yi] = polygon[i] || [0, 0];
      const [xj, yj] = polygon[j] || [0, 0];
      
      if (xi !== undefined && yi !== undefined && xj !== undefined && yj !== undefined) {
        if (((yi > y) !== (yj > y)) && (x < (xj - xi) * (y - yi) / (yj - yi) + xi)) {
          inside = !inside;
        }
      }
    }
    
    return inside;
  }

  /**
   * Handle geofence events
   */
  private static handleGeofenceEvent(
    geofenceId: string,
    isInside: boolean,
    location: { latitude: number; longitude: number; accuracy: number }
  ): void {
    const geofence = this.geofences.get(geofenceId);
    if (!geofence) return;

    const event: GeofenceEvent = {
      type: isInside ? 'enter' : 'exit',
      geofenceId,
      timestamp: new Date(),
      location,
      userId: this.getCurrentUserId(),
      unitId: this.getCurrentUnitId()
    };

    // Send event to backend
    this.sendGeofenceEvent(event);

    // Trigger voice feedback if enabled
    if (this.voiceFeedback?.enabled && this.voiceFeedback.announcements.geofenceEnter) {
      this.announceGeofenceEvent(event, geofence);
    }

    // Show notification
    this.showGeofenceNotification(event, geofence);
  }

  /**
   * Initialize MTS Incremental Updates
   */
  private static async initializeMTSUpdates(): Promise<void> {
    console.log('Setting up MTS Incremental Updates...');
    
    // Configure MTS updates for different layers
    this.mtsConfigs.set('hazards', {
      layerId: 'hazards',
      updateType: 'incremental',
      lastUpdate: new Date(),
      updateFrequency: 5, // 5 minutes
      priority: 'high'
    });

    this.mtsConfigs.set('units', {
      layerId: 'units',
      updateType: 'incremental',
      lastUpdate: new Date(),
      updateFrequency: 1, // 1 minute
      priority: 'high'
    });

    this.mtsConfigs.set('routes', {
      layerId: 'routes',
      updateType: 'incremental',
      lastUpdate: new Date(),
      updateFrequency: 10, // 10 minutes
      priority: 'medium'
    });

    // Start update scheduler
    this.startMTSUpdateScheduler();
    
    console.log('✅ MTS Incremental Updates initialized');
  }

  /**
   * Start MTS update scheduler
   */
  private static startMTSUpdateScheduler(): void {
    setInterval(() => {
      this.checkForMTSUpdates();
    }, 60000); // Check every minute
  }

  /**
   * Check for MTS updates
   */
  private static async checkForMTSUpdates(): Promise<void> {
    for (const [layerId, config] of this.mtsConfigs) {
      const timeSinceLastUpdate = Date.now() - config.lastUpdate.getTime();
      const updateInterval = config.updateFrequency * 60 * 1000; // Convert to milliseconds
      
      if (timeSinceLastUpdate >= updateInterval) {
        await this.performMTSUpdate(layerId, config);
      }
    }
  }

  /**
   * Perform MTS update
   */
  private static async performMTSUpdate(layerId: string, config: MTSUpdateConfig): Promise<void> {
    try {
      console.log(`Updating MTS layer: ${layerId}`);
      
      // In production, this would call the MTS API
      const response = await fetch(`/api/mts/update/${layerId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          updateType: config.updateType,
          lastUpdate: config.lastUpdate.toISOString()
        })
      });

      if (response.ok) {
        config.lastUpdate = new Date();
        console.log(`✅ MTS layer ${layerId} updated successfully`);
      } else {
        console.error(`❌ Failed to update MTS layer ${layerId}`);
      }
    } catch (error) {
      console.error(`Error updating MTS layer ${layerId}:`, error);
    }
  }

  /**
   * Initialize Zone Avoidance
   */
  private static async initializeZoneAvoidance(): Promise<void> {
    console.log('Setting up Zone Avoidance...');
    
    this.zoneAvoidance = {
      avoidZones: [],
      avoidTypes: ['hazard', 'restricted', 'evacuation'],
      bufferDistance: 100, // 100 meters
      priority: 'safety'
    };

    // Load avoidance zones
    await this.loadAvoidanceZones();
    
    console.log('✅ Zone Avoidance initialized');
  }

  /**
   * Initialize Weather Effects
   */
  private static async initializeWeatherEffects(): Promise<void> {
    console.log('Setting up Animated 3D Weather Effects...');
    
    this.weatherEffects = {
      effectType: 'rain',
      intensity: 0.5,
      animationSpeed: 0.7,
      opacity: 0.6,
      windDirection: 45,
      windSpeed: 5
    };

    // Load weather data
    await this.loadWeatherData();
    
    console.log('✅ Weather Effects initialized');
  }

  /**
   * Initialize Voice Feedback
   */
  private static async initializeVoiceFeedback(): Promise<void> {
    console.log('Setting up Voice Feedback Agent...');
    
    this.voiceFeedback = {
      enabled: true,
      language: 'en-US',
      voiceType: 'neutral',
      speechRate: 1.0,
      volume: 0.8,
      announcements: {
        geofenceEnter: true,
        geofenceExit: true,
        routeUpdate: true,
        hazardAlert: true,
        systemStatus: false
      }
    };

    // Initialize speech synthesis
    this.initializeSpeechSynthesis();
    
    console.log('✅ Voice Feedback initialized');
  }

  /**
   * Initialize speech synthesis
   */
  private static initializeSpeechSynthesis(): void {
    if ('speechSynthesis' in window) {
      // Set up voice preferences
      const voices = speechSynthesis.getVoices();
      const preferredVoice = voices.find(voice => 
        voice.lang.startsWith(this.voiceFeedback?.language || 'en')
      );
      
      if (preferredVoice) {
        (window as any).preferredVoice = preferredVoice;
      }
    }
  }

  /**
   * Add geofence
   */
  static addGeofence(geofence: GeofenceConfig): void {
    this.geofences.set(geofence.id, geofence);
    console.log(`Added geofence: ${geofence.name}`);
  }

  /**
   * Remove geofence
   */
  static removeGeofence(geofenceId: string): void {
    this.geofences.delete(geofenceId);
    console.log(`Removed geofence: ${geofenceId}`);
  }

  /**
   * Update weather effects
   */
  static updateWeatherEffects(config: Partial<WeatherEffectConfig>): void {
    if (this.weatherEffects) {
      this.weatherEffects = { ...this.weatherEffects, ...config };
      this.applyWeatherEffects();
    }
  }

  /**
   * Apply weather effects to map
   */
  private static applyWeatherEffects(): void {
    if (!this.weatherEffects) return;

    // In production, this would integrate with Mapbox GL JS
    console.log('Applying weather effects:', this.weatherEffects);
  }

  /**
   * Announce geofence event
   */
  private static announceGeofenceEvent(event: GeofenceEvent, geofence: GeofenceConfig): void {
    if (!this.voiceFeedback?.enabled) return;

    const message = this.generateGeofenceMessage(event, geofence);
    this.speak(message);
  }

  /**
   * Generate geofence message
   */
  private static generateGeofenceMessage(event: GeofenceEvent, geofence: GeofenceConfig): string {
    const action = event.type === 'enter' ? 'entered' : 'exited';
    const zoneType = geofence.properties.type.replace('_', ' ');
    
    return `You have ${action} the ${zoneType}: ${geofence.name}`;
  }

  /**
   * Speak text using speech synthesis
   */
  private static speak(text: string): void {
    if (!('speechSynthesis' in window)) return;

    const utterance = new SpeechSynthesisUtterance(text);
    
    if ((window as any).preferredVoice) {
      utterance.voice = (window as any).preferredVoice;
    }
    
    utterance.rate = this.voiceFeedback?.speechRate || 1.0;
    utterance.volume = this.voiceFeedback?.volume || 0.8;
    
    speechSynthesis.speak(utterance);
  }

  /**
   * Show geofence notification
   */
  private static showGeofenceNotification(event: GeofenceEvent, geofence: GeofenceConfig): void {
    if (!('Notification' in window)) return;

    if (Notification.permission === 'granted') {
      new Notification(`Geofence ${event.type}`, {
        body: `${geofence.name} - ${geofence.properties.description}`,
        icon: '/icons/geofence.png'
      });
    }
  }

  /**
   * Send geofence event to backend
   */
  private static async sendGeofenceEvent(event: GeofenceEvent): Promise<void> {
    try {
      await fetch('/api/geofence/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(event)
      });
    } catch (error) {
      console.error('Failed to send geofence event:', error);
    }
  }

  /**
   * Load geofences from backend
   */
  private static async loadGeofences(): Promise<void> {
    try {
      const response = await fetch('/api/geofence/list');
      const geofences = await response.json();
      
      geofences.forEach((geofence: GeofenceConfig) => {
        this.geofences.set(geofence.id, geofence);
      });
    } catch (error) {
      console.error('Failed to load geofences:', error);
    }
  }

  /**
   * Load avoidance zones
   */
  private static async loadAvoidanceZones(): Promise<void> {
    try {
      const response = await fetch('/api/zones/avoidance');
      const zones = await response.json();
      
      if (this.zoneAvoidance) {
        this.zoneAvoidance.avoidZones = zones;
      }
    } catch (error) {
      console.error('Failed to load avoidance zones:', error);
    }
  }

  /**
   * Load weather data
   */
  private static async loadWeatherData(): Promise<void> {
    try {
      const response = await fetch('/api/weather/current');
      const weather = await response.json();
      
      if (this.weatherEffects) {
        this.weatherEffects.effectType = weather.condition;
        this.weatherEffects.intensity = weather.intensity;
        this.weatherEffects.windDirection = weather.windDirection;
        this.weatherEffects.windSpeed = weather.windSpeed;
      }
    } catch (error) {
      console.error('Failed to load weather data:', error);
    }
  }

  /**
   * Get current user ID
   */
  private static getCurrentUserId(): string | undefined {
    // In production, this would get from auth service
    return 'user-123';
  }

  /**
   * Get current unit ID
   */
  private static getCurrentUnitId(): string | undefined {
    // In production, this would get from unit tracking
    return 'unit-456';
  }

  /**
   * Get feature status
   */
  static getFeatureStatus(): Record<string, boolean> {
    return {
      geofencing: this.geofences.size > 0,
      mtsUpdates: this.mtsConfigs.size > 0,
      zoneAvoidance: this.zoneAvoidance !== null,
      weatherEffects: this.weatherEffects !== null,
      voiceFeedback: this.voiceFeedback?.enabled || false
    };
  }

  /**
   * Cleanup resources
   */
  static cleanup(): void {
    // Stop geolocation watching
    if ((window as any).geofenceWatchId) {
      navigator.geolocation.clearWatch((window as any).geofenceWatchId);
    }

    // Stop speech synthesis
    if ('speechSynthesis' in window) {
      speechSynthesis.cancel();
    }

    // Clear data
    this.geofences.clear();
    this.mtsConfigs.clear();
    this.zoneAvoidance = null;
    this.weatherEffects = null;
    this.voiceFeedback = null;
  }
}

