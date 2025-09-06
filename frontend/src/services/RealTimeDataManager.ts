import type { 
  RealTimeData, 
  WeatherData, 
  TrafficData, 
  EmergencyAlertData, 
  BuildingStatusData, 
  TerrainChangeData, 
  DataFeed,
  WebSocketMessage,
  SystemStatus,
  RealTimeConfig,
  UpdateSubscription
} from '../types/realtime';

/**
 * Real-Time Data Manager Service
 * Handles live data feeds, WebSocket connections, and real-time updates
 */
export class RealTimeDataManager {
  private websocket: WebSocket | null = null;
  private dataFeeds: Map<string, DataFeed> = new Map();
  private subscriptions: Map<string, UpdateSubscription> = new Map();
  private updateQueue: RealTimeData[] = [];
  private isConnected = false;
  private reconnectAttempts = 0;
  private heartbeatInterval: any = null;
  private updateInterval: any = null;
  private config: RealTimeConfig;
  private eventListeners: Map<string, ((data: any) => void)[]> = new Map();
  private startTime: number = Date.now();

  constructor(config: RealTimeConfig) {
    this.config = config;
    this.initializeDataFeeds();
    this.startHeartbeat();
    this.startUpdateProcessor();
  }

  /**
   * Initialize data feeds from configuration
   */
  private initializeDataFeeds(): void {
    const allFeeds = [
      ...this.config.dataFeeds.weather,
      ...this.config.dataFeeds.traffic,
      ...this.config.dataFeeds.emergency,
      ...this.config.dataFeeds.buildings,
      ...this.config.dataFeeds.terrain
    ];

    allFeeds.forEach(feed => {
      this.dataFeeds.set(feed.id, feed);
      if (feed.enabled) {
        this.startDataFeed(feed);
      }
    });
  }

  /**
   * Start a data feed
   */
  private startDataFeed(feed: DataFeed): void {
    if (feed.status === 'active') return;

    feed.status = 'active';
    feed.lastUpdate = new Date();

    // Simulate data feed updates (in production, this would connect to real APIs)
    const interval = setInterval(async () => {
      try {
        await this.updateDataFeed(feed);
      } catch (error) {
        this.handleFeedError(feed, error as Error);
      }
    }, feed.updateInterval * 1000);

    // Store interval reference for cleanup
    (feed as any).intervalId = interval;
  }

  /**
   * Update data feed with new information
   */
  private async updateDataFeed(feed: DataFeed): Promise<void> {
    try {
      let data: RealTimeData;

      switch (feed.type) {
        case 'weather':
          data = await this.fetchWeatherData(feed);
          break;
        case 'traffic':
          data = await this.fetchTrafficData(feed);
          break;
        case 'hazard':
          data = await this.fetchEmergencyData(feed);
          break;
        case 'building':
          data = await this.fetchBuildingData(feed);
          break;
        case 'terrain':
          data = await this.fetchTerrainData(feed);
          break;
        default:
          throw new Error(`Unknown feed type: ${feed.type}`);
      }

      if (data) {
        this.processRealTimeData(data);
        feed.lastUpdate = new Date();
        feed.errorCount = 0;
      }
    } catch (error) {
      console.error('Error updating data feed:', error);
    }
  }

  /**
   * Fetch weather data from feed
   */
  private async fetchWeatherData(feed: DataFeed): Promise<WeatherData> {
    // Simulate API call (replace with actual weather API integration)
    await this.simulateApiDelay();
    
    const weatherData: WeatherData = {
      id: `weather-${Date.now()}`,
      timestamp: new Date(),
      source: feed.id,
      type: 'weather',
      severity: this.getRandomSeverity(),
      location: this.getRandomLocation(),
      data: {
        temperature: Math.round(Math.random() * 40 - 10), // -10 to 30°C
        humidity: Math.round(Math.random() * 100),
        windSpeed: Math.round(Math.random() * 50),
        windDirection: Math.round(Math.random() * 360),
        precipitation: Math.round(Math.random() * 100),
        visibility: Math.round(Math.random() * 20 + 5), // 5-25 km
        conditions: this.getRandomWeatherCondition(),
        alerts: this.getRandomWeatherAlerts()
      },
      metadata: {
        confidence: 0.8 + Math.random() * 0.2,
        updateFrequency: feed.updateInterval,
        lastVerified: new Date(),
        sourceReliability: feed.metadata.reliability > 0.8 ? 'high' : 
                          feed.metadata.reliability > 0.5 ? 'medium' : 'low'
      }
    };

    return weatherData;
  }

  /**
   * Fetch traffic data from feed
   */
  private async fetchTrafficData(feed: DataFeed): Promise<TrafficData> {
    await this.simulateApiDelay();
    
    const trafficData: TrafficData = {
      id: `traffic-${Date.now()}`,
      timestamp: new Date(),
      source: feed.id,
      type: 'traffic',
      severity: this.getRandomSeverity(),
      location: this.getRandomLocation(),
      data: {
        congestionLevel: this.getRandomCongestionLevel(),
        averageSpeed: Math.round(Math.random() * 80 + 20), // 20-100 km/h
        incidentType: this.getRandomIncidentType(),
        incidentDescription: this.getRandomIncidentDescription(),
        affectedLanes: Math.round(Math.random() * 4) + 1,
        estimatedDelay: Math.round(Math.random() * 30),
        detourAvailable: Math.random() > 0.3
      },
      metadata: {
        confidence: 0.7 + Math.random() * 0.3,
        updateFrequency: feed.updateInterval,
        lastVerified: new Date(),
        sourceReliability: feed.metadata.reliability > 0.8 ? 'high' : 
                          feed.metadata.reliability > 0.5 ? 'medium' : 'low'
      }
    };

    return trafficData;
  }

  /**
   * Fetch emergency alert data from feed
   */
  private async fetchEmergencyData(feed: DataFeed): Promise<EmergencyAlertData> {
    await this.simulateApiDelay();
    
    const emergencyData: EmergencyAlertData = {
      id: `emergency-${Date.now()}`,
      timestamp: new Date(),
      source: feed.id,
      type: 'hazard',
      severity: this.getRandomSeverity(),
      location: this.getRandomLocation(),
      data: {
        alertType: this.getRandomAlertType(),
        description: this.getRandomEmergencyDescription(),
        affectedArea: Math.random() * 10 + 0.1, // 0.1-10 km²
        populationAtRisk: Math.round(Math.random() * 1000 + 100),
        evacuationRequired: Math.random() > 0.5,
        emergencyContacts: ['911', 'fire-dept', 'police-dept'],
        responseUnits: this.getRandomResponseUnits(),
        estimatedResponseTime: Math.round(Math.random() * 20 + 5) // 5-25 minutes
      },
      metadata: {
        confidence: 0.9 + Math.random() * 0.1, // High confidence for emergencies
        updateFrequency: feed.updateInterval,
        lastVerified: new Date(),
        sourceReliability: 'high'
      }
    };

    return emergencyData;
  }

  /**
   * Fetch building status data from feed
   */
  private async fetchBuildingData(feed: DataFeed): Promise<BuildingStatusData> {
    await this.simulateApiDelay();
    
    const buildingData: BuildingStatusData = {
      id: `building-${Date.now()}`,
      timestamp: new Date(),
      source: feed.id,
      type: 'building',
      severity: this.getRandomSeverity(),
      location: this.getRandomLocation(),
      data: {
        buildingId: `building-${Math.round(Math.random() * 1000)}`,
        occupancy: Math.round(Math.random() * 500),
        maxCapacity: 500,
        evacuationStatus: this.getRandomEvacuationStatus(),
        damageLevel: this.getRandomDamageLevel(),
        accessStatus: this.getRandomAccessStatus(),
        lastInspection: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000), // Within 30 days
        nextInspection: new Date(Date.now() + Math.random() * 30 * 24 * 60 * 60 * 1000), // Within 30 days
        criticalSystems: {
          fireSuppression: this.getRandomSystemStatus(),
          electrical: this.getRandomSystemStatus(),
          hvac: this.getRandomSystemStatus(),
          communications: this.getRandomSystemStatus()
        }
      },
      metadata: {
        confidence: 0.8 + Math.random() * 0.2,
        updateFrequency: feed.updateInterval,
        lastVerified: new Date(),
        sourceReliability: feed.metadata.reliability > 0.8 ? 'high' : 
                          feed.metadata.reliability > 0.5 ? 'medium' : 'low'
      }
    };

    return buildingData;
  }

  /**
   * Fetch terrain change data from feed
   */
  private async fetchTerrainData(feed: DataFeed): Promise<TerrainChangeData> {
    await this.simulateApiDelay();
    
    const terrainData: TerrainChangeData = {
      id: `terrain-${Date.now()}`,
      timestamp: new Date(),
      source: feed.id,
      type: 'terrain',
      severity: this.getRandomSeverity(),
      location: this.getRandomLocation(),
      data: {
        changeType: this.getRandomTerrainChangeType(),
        affectedArea: Math.random() * 5 + 0.1, // 0.1-5 km²
        elevationChange: Math.random() * 10 - 5, // -5 to +5 meters
        slopeChange: Math.random() * 20 - 10, // -10 to +10 percentage
        accessibilityImpact: this.getRandomAccessibilityImpact(),
        estimatedDuration: Math.round(Math.random() * 48 + 1), // 1-48 hours
        monitoringRequired: Math.random() > 0.3
      },
      metadata: {
        confidence: 0.7 + Math.random() * 0.3,
        updateFrequency: feed.updateInterval,
        lastVerified: new Date(),
        sourceReliability: feed.metadata.reliability > 0.8 ? 'high' : 
                          feed.metadata.reliability > 0.5 ? 'medium' : 'low'
      }
    };

    return terrainData;
  }

  /**
   * Process real-time data and trigger updates
   */
  private processRealTimeData(data: RealTimeData): void {
    // Add to update queue
    this.updateQueue.push(data);
    
    // Limit queue size
    if (this.updateQueue.length > this.config.performance.updateQueueSize) {
      this.updateQueue.shift();
    }

    // Emit event for this data type
    this.emit(`data:${data.type}`, data);
    this.emit('data:update', data);

    // Send via WebSocket if connected
    if (this.isConnected && this.websocket) {
      this.sendWebSocketMessage({
        type: 'data_update',
        timestamp: new Date(),
        data,
        sequence: Date.now()
      });
    }

    // Notify relevant subscriptions
    this.notifySubscriptions(data);
  }

  /**
   * Notify subscriptions about new data
   */
  private notifySubscriptions(data: RealTimeData): void {
    this.subscriptions.forEach(subscription => {
      if (!subscription.active) return;
      
      // Check if subscription matches this data type
      if (!subscription.dataTypes.includes(data.type)) return;
      
      // Check severity filter
      if (subscription.severity && !subscription.severity.includes(data.severity)) return;
      
      // Check location filter
      if (subscription.locations && !this.isLocationInBounds(data.location, subscription.locations)) return;
      
      // Notify subscription
      try {
        subscription.callback(data);
        subscription.lastUsed = new Date();
      } catch (error) {
        console.error('Error in subscription callback:', error);
      }
    });
  }

  /**
   * Check if location is within bounds
   */
  private isLocationInBounds(location: [number, number], bounds: [number, number][]): boolean {
    if (bounds.length === 0) return true;
    
    // Simple bounding box check (in production, use proper geometric algorithms)
    const [lng, lat] = location;
    const lngs = bounds.map(b => b[0]);
    const lats = bounds.map(b => b[1]);
    
    const minLng = Math.min(...lngs);
    const maxLng = Math.max(...lngs);
    const minLat = Math.min(...lats);
    const maxLat = Math.max(...lats);
    
    return lng >= minLng && lng <= maxLng && lat >= minLat && lat <= maxLat;
  }

  /**
   * Connect to WebSocket server
   */
  async connect(): Promise<void> {
    if (this.isConnected) return;

    try {
      this.websocket = new WebSocket(this.config.websocket.url);
      
      this.websocket.onopen = () => {
        this.isConnected = true;
        this.reconnectAttempts = 0;
        this.emit('websocket:connected', { status: 'connected' });
        console.log('WebSocket connected');
      };

      this.websocket.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data);
          this.handleWebSocketMessage(message);
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      this.websocket.onclose = () => {
        this.isConnected = false;
        this.emit('websocket:disconnected', { status: 'disconnected' });
        console.log('WebSocket disconnected');
        this.scheduleReconnect();
      };

      this.websocket.onerror = (error) => {
        console.error('WebSocket error:', error);
        this.emit('websocket:error', error);
      };

    } catch (error) {
      console.error('Failed to connect to WebSocket:', error);
      this.scheduleReconnect();
    }
  }

  /**
   * Disconnect from WebSocket server
   */
  disconnect(): void {
    if (this.websocket) {
      this.websocket.close();
      this.websocket = null;
    }
    this.isConnected = false;
  }

  /**
   * Send message via WebSocket
   */
  private sendWebSocketMessage(message: WebSocketMessage): void {
    if (this.websocket && this.isConnected) {
      try {
        this.websocket.send(JSON.stringify(message));
      } catch (error) {
        console.error('Failed to send WebSocket message:', error);
      }
    }
  }

  /**
   * Handle incoming WebSocket message
   */
  private handleWebSocketMessage(message: WebSocketMessage): void {
    switch (message.type) {
      case 'data_update':
        this.processRealTimeData(message.data as RealTimeData);
        break;
      case 'system_status':
        this.emit('system:status', message.data);
        break;
      case 'error':
        this.emit('system:error', message.data);
        break;
      case 'heartbeat':
        this.emit('system:heartbeat', message.data);
        break;
      default:
        console.warn('Unknown WebSocket message type:', message.type);
    }
  }

  /**
   * Schedule reconnection attempt
   */
  private scheduleReconnect(): void {
    if (this.reconnectAttempts >= this.config.websocket.maxReconnectAttempts) {
      console.error('Max reconnection attempts reached');
      this.emit('websocket:max_reconnect_reached', { attempts: this.reconnectAttempts });
      return;
    }

    setTimeout(() => {
      this.reconnectAttempts++;
      this.connect();
    }, this.config.websocket.reconnectInterval);
  }

  /**
   * Start heartbeat to keep connection alive
   */
  private startHeartbeat(): void {
    this.heartbeatInterval = setInterval(() => {
      if (this.isConnected && this.websocket) {
        this.sendWebSocketMessage({
          type: 'heartbeat',
          timestamp: new Date(),
          data: {
            clientId: `client-${Date.now()}`,
            timestamp: new Date(),
            status: 'connected'
          },
          sequence: Date.now()
        });
      }
    }, this.config.websocket.heartbeatInterval);
  }

  /**
   * Start update processor for queued updates
   */
  private startUpdateProcessor(): void {
    this.updateInterval = setInterval(() => {
      if (this.updateQueue.length > 0) {
        const updates = this.updateQueue.splice(0, this.config.performance.maxConcurrentUpdates);
        updates.forEach(update => {
          this.emit('update:processed', update);
        });
      }
    }, 1000); // Process updates every second
  }

  /**
   * Subscribe to real-time updates
   */
  subscribe(subscription: Omit<UpdateSubscription, 'id' | 'createdAt' | 'lastUsed'>): string {
    const id = `sub-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const fullSubscription: UpdateSubscription = {
      ...subscription,
      id,
      createdAt: new Date(),
      lastUsed: new Date()
    };

    this.subscriptions.set(id, fullSubscription);
    return id;
  }

  /**
   * Unsubscribe from updates
   */
  unsubscribe(subscriptionId: string): boolean {
    return this.subscriptions.delete(subscriptionId);
  }

  /**
   * Get current system status
   */
  getSystemStatus(): SystemStatus {
    const activeFeeds = Array.from(this.dataFeeds.values()).filter(feed => feed.status === 'active');
    
    // System is healthy if data feeds are working, regardless of WebSocket connection
    const systemHealthy = activeFeeds.length > 0 && activeFeeds.every(feed => feed.status === 'active');
    
    return {
      status: systemHealthy ? 'healthy' : 'degraded',
      uptime: Date.now() - this.startTime,
      activeConnections: this.subscriptions.size,
      dataFeeds: activeFeeds,
      lastHealthCheck: new Date(),
      performance: {
        averageResponseTime: 100, // Placeholder
        errorRate: 0.05, // Placeholder
        throughput: this.updateQueue.length
      }
    };
  }

  /**
   * Get data feed status
   */
  getDataFeedStatus(): DataFeed[] {
    return Array.from(this.dataFeeds.values());
  }

  /**
   * Enable/disable data feed
   */
  setDataFeedStatus(feedId: string, enabled: boolean): boolean {
    const feed = this.dataFeeds.get(feedId);
    if (!feed) return false;

    if (enabled && !feed.enabled) {
      feed.enabled = true;
      this.startDataFeed(feed);
    } else if (!enabled && feed.enabled) {
      feed.enabled = false;
      feed.status = 'disabled';
      if ((feed as any).intervalId) {
        clearInterval((feed as any).intervalId);
        delete (feed as any).intervalId;
      }
    }

    return true;
  }

  /**
   * Add event listener
   */
  on(event: string, callback: (data: any) => void): void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, []);
    }
    this.eventListeners.get(event)!.push(callback);
  }

  /**
   * Remove event listener
   */
  off(event: string, callback: (data: any) => void): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      const index = listeners.indexOf(callback);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    }
  }

  /**
   * Emit event
   */
  private emit(event: string, data: any): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      listeners.forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error('Error in event listener:', error);
        }
      });
    }
  }

  /**
   * Handle feed errors
   */
  private handleFeedError(feed: DataFeed, error: Error): void {
    feed.errorCount++;
    feed.lastError = error.message;
    feed.status = feed.errorCount > 3 ? 'error' : 'active';
    
    this.emit('feed:error', { feed, error });
    
    if (feed.status === 'error') {
      console.error(`Data feed ${feed.name} failed after ${feed.errorCount} errors:`, error);
    }
  }

  /**
   * Test method: Manually trigger data generation for testing
   */
  async generateTestData(feedId: string): Promise<boolean> {
    const feed = this.dataFeeds.get(feedId);
    if (!feed) return false;

    try {
      await this.updateDataFeed(feed);
      return true;
    } catch (error) {
      console.error(`Error generating test data for ${feedId}:`, error);
      return false;
    }
  }

  /**
   * Simulate API delay for testing
   */
  private async simulateApiDelay(): Promise<void> {
    const delay = Math.random() * 100 + 50; // 50-150ms
    await new Promise(resolve => setTimeout(resolve, delay));
  }

  /**
   * Utility methods for generating random test data
   */
  private getRandomSeverity(): RealTimeData['severity'] {
    const severities: RealTimeData['severity'][] = ['low', 'medium', 'high', 'critical'];
    return severities[Math.floor(Math.random() * severities.length)] || 'medium';
  }

  private getRandomLocation(): [number, number] {
    // San Francisco area coordinates
    return [
      -122.4194 + (Math.random() - 0.5) * 0.1, // Longitude
      37.7749 + (Math.random() - 0.5) * 0.1   // Latitude
    ];
  }

  private getRandomWeatherCondition(): WeatherData['data']['conditions'] {
    const conditions: WeatherData['data']['conditions'][] = ['clear', 'rain', 'snow', 'fog', 'storm'];
    return conditions[Math.floor(Math.random() * conditions.length)] || 'clear';
  }

  private getRandomWeatherAlerts(): string[] {
    const alerts = ['flood_warning', 'high_wind', 'extreme_cold', 'heat_warning'];
    return Math.random() > 0.7 ? [alerts[Math.floor(Math.random() * alerts.length)] || 'flood_warning'] : [];
  }

  private getRandomCongestionLevel(): TrafficData['data']['congestionLevel'] {
    const levels: TrafficData['data']['congestionLevel'][] = ['clear', 'moderate', 'heavy', 'congested'];
    return levels[Math.floor(Math.random() * levels.length)] || 'clear';
  }

  private getRandomIncidentType(): TrafficData['data']['incidentType'] {
    const types: TrafficData['data']['incidentType'][] = ['accident', 'construction', 'road_closure', 'weather', 'none'];
    return types[Math.floor(Math.random() * types.length)] || 'none';
  }

  private getRandomIncidentDescription(): string {
    const descriptions = [
      'Multi-vehicle collision',
      'Road construction work',
      'Weather-related closure',
      'Emergency maintenance'
    ];
    return descriptions[Math.floor(Math.random() * descriptions.length)] || 'Emergency maintenance';
  }

  private getRandomAlertType(): EmergencyAlertData['data']['alertType'] {
    const types: EmergencyAlertData['data']['alertType'][] = ['fire', 'flood', 'chemical', 'structural', 'medical', 'security'];
    return types[Math.floor(Math.random() * types.length)] || 'fire';
  }

  private getRandomEmergencyDescription(): string {
    const descriptions = [
      'Active fire in downtown area',
      'Flash flood warning',
      'Chemical spill detected',
      'Structural damage reported',
      'Medical emergency',
      'Security incident'
    ];
    return descriptions[Math.floor(Math.random() * descriptions.length)] || 'Emergency incident';
  }

  private getRandomResponseUnits(): string[] {
    const units = ['fire_truck', 'ambulance', 'police_car', 'hazmat_team'];
    const count = Math.floor(Math.random() * 3) + 1;
    const selected: string[] = [];
    while (selected.length < count) {
      const unit = units[Math.floor(Math.random() * units.length)] || 'fire_truck';
      if (!selected.includes(unit)) {
        selected.push(unit);
      }
    }
    return selected;
  }

  private getRandomEvacuationStatus(): BuildingStatusData['data']['evacuationStatus'] {
    const statuses: BuildingStatusData['data']['evacuationStatus'][] = ['normal', 'partial', 'full', 'completed'];
    return statuses[Math.floor(Math.random() * statuses.length)] || 'normal';
  }

  private getRandomDamageLevel(): BuildingStatusData['data']['damageLevel'] {
    const levels: BuildingStatusData['data']['damageLevel'][] = ['none', 'minor', 'moderate', 'severe', 'destroyed'];
    return levels[Math.floor(Math.random() * levels.length)] || 'none';
  }

  private getRandomAccessStatus(): BuildingStatusData['data']['accessStatus'] {
    const statuses: BuildingStatusData['data']['accessStatus'][] = ['open', 'restricted', 'closed', 'emergency_only'];
    return statuses[Math.floor(Math.random() * statuses.length)] || 'open';
  }

  private getRandomSystemStatus(): BuildingStatusData['data']['criticalSystems']['fireSuppression'] {
    const statuses: BuildingStatusData['data']['criticalSystems']['fireSuppression'][] = ['operational', 'maintenance', 'failed'];
    return statuses[Math.floor(Math.random() * statuses.length)] || 'operational';
  }

  private getRandomTerrainChangeType(): TerrainChangeData['data']['changeType'] {
    const types: TerrainChangeData['data']['changeType'][] = ['flooding', 'landslide', 'erosion', 'sinkhole', 'vegetation'];
    return types[Math.floor(Math.random() * types.length)] || 'flooding';
  }

  private getRandomAccessibilityImpact(): TerrainChangeData['data']['accessibilityImpact'] {
    const impacts: TerrainChangeData['data']['accessibilityImpact'][] = ['none', 'minor', 'moderate', 'severe'];
    return impacts[Math.floor(Math.random() * impacts.length)] || 'none';
  }

  /**
   * Cleanup resources
   */
  destroy(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
    }
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
    }
    
    // Clear all data feed intervals
    this.dataFeeds.forEach(feed => {
      if ((feed as any).intervalId) {
        clearInterval((feed as any).intervalId);
      }
    });
    
    this.disconnect();
    this.subscriptions.clear();
    this.updateQueue = [];
    this.eventListeners.clear();
  }
}
