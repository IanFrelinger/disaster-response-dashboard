/**
 * Foundry Data Fusion Service
 * Integrates real-time data from multiple Foundry sources into unified frontend state
 */

import React from 'react';
import { foundrySDK, HazardZone, EmergencyUnit, EvacuationRoute, Building, Incident } from '../sdk/foundry-sdk';
import { EventEmitter } from 'events';

// Data fusion state interface
export interface FusedDataState {
  hazards: {
    active: HazardZone[];
    critical: HazardZone[];
    total: number;
    lastUpdated: Date;
  };
  units: {
    available: EmergencyUnit[];
    dispatched: EmergencyUnit[];
    total: number;
    byType: Record<string, EmergencyUnit[]>;
    lastUpdated: Date;
  };
  routes: {
    safe: EvacuationRoute[];
    compromised: EvacuationRoute[];
    total: number;
    lastUpdated: Date;
  };
  incidents: {
    active: Incident[];
    resolved: Incident[];
    total: number;
    lastUpdated: Date;
  };
  buildings: {
    atRisk: Building[];
    evacuated: Building[];
    total: number;
    lastUpdated: Date;
  };
  analytics: {
    totalAffectedPopulation: number;
    averageResponseTime: number;
    evacuationCompliance: number;
    lastUpdated: Date;
  };
}

// Real-time update types
export interface DataUpdate {
  type: 'hazard' | 'unit' | 'route' | 'incident' | 'building' | 'analytics';
  data: any;
  timestamp: Date;
  source: string;
}

// Data fusion configuration
export interface FusionConfig {
  updateInterval: number; // milliseconds
  cacheDuration: number; // milliseconds
  enableRealTime: boolean;
  enableCaching: boolean;
  enableAnalytics: boolean;
}

export class FoundryDataFusion extends EventEmitter {
  private state: FusedDataState;
  private config: FusionConfig;
  private updateTimer: NodeJS.Timeout | null = null;
  private cache: Map<string, { data: any; timestamp: Date }> = new Map();
  private subscriptions: Map<string, () => void> = new Map();

  constructor(config: FusionConfig = {
    updateInterval: 5000, // 5 seconds
    cacheDuration: 30000, // 30 seconds
    enableRealTime: true,
    enableCaching: true,
    enableAnalytics: true
  }) {
    super();
    this.config = config;
    this.state = this.initializeState();
    this.startRealTimeUpdates();
  }

  private initializeState(): FusedDataState {
    return {
      hazards: { active: [], critical: [], total: 0, lastUpdated: new Date() },
      units: { available: [], dispatched: [], total: 0, byType: {}, lastUpdated: new Date() },
      routes: { safe: [], compromised: [], total: 0, lastUpdated: new Date() },
      incidents: { active: [], resolved: [], total: 0, lastUpdated: new Date() },
      buildings: { atRisk: [], evacuated: [], total: 0, lastUpdated: new Date() },
      analytics: { totalAffectedPopulation: 0, averageResponseTime: 0, evacuationCompliance: 0, lastUpdated: new Date() }
    };
  }

  // Start real-time data subscriptions
  private startRealTimeUpdates(): void {
    if (!this.config.enableRealTime) return;

    // Subscribe to hazard zone updates
    const hazardSubscription = foundrySDK.subscribeToHazardZones((hazards) => {
      this.updateHazards(hazards);
      this.emit('dataUpdate', {
        type: 'hazard',
        data: hazards,
        timestamp: new Date(),
        source: 'foundry-realtime'
      });
    });
    this.subscriptions.set('hazards', hazardSubscription);

    // Subscribe to emergency unit updates
    const unitSubscription = foundrySDK.subscribeToEmergencyUnits((units) => {
      this.updateUnits(units);
      this.emit('dataUpdate', {
        type: 'unit',
        data: units,
        timestamp: new Date(),
        source: 'foundry-realtime'
      });
    });
    this.subscriptions.set('units', unitSubscription);

    // Start periodic analytics updates
    this.updateTimer = setInterval(() => {
      this.updateAnalytics();
    }, this.config.updateInterval);
  }

  // Update hazard data with intelligent fusion
  private updateHazards(hazards: HazardZone[]): void {
    const active = hazards.filter(h => h.riskLevel === 'high' || h.riskLevel === 'critical');
    const critical = hazards.filter(h => h.riskLevel === 'critical');

    this.state.hazards = {
      active,
      critical,
      total: hazards.length,
      lastUpdated: new Date()
    };

    // Update related analytics
    this.updateHazardAnalytics(hazards);
  }

  // Update unit data with categorization
  private updateUnits(units: EmergencyUnit[]): void {
    const available = units.filter(u => u.status === 'available');
    const dispatched = units.filter(u => u.status !== 'available');

    // Group by unit type
    const byType: Record<string, EmergencyUnit[]> = {};
    units.forEach(unit => {
      if (!byType[unit.unitType]) {
        byType[unit.unitType] = [];
      }
      byType[unit.unitType].push(unit);
    });

    this.state.units = {
      available,
      dispatched,
      total: units.length,
      byType,
      lastUpdated: new Date()
    };
  }

  // Update routes with status filtering
  private updateRoutes(routes: EvacuationRoute[]): void {
    const safe = routes.filter(r => r.status === 'safe');
    const compromised = routes.filter(r => r.status === 'compromised');

    this.state.routes = {
      safe,
      compromised,
      total: routes.length,
      lastUpdated: new Date()
    };
  }



  // Calculate analytics from fused data
  private updateAnalytics(): void {
    const totalAffectedPopulation = this.state.hazards.active.reduce(
      (sum, hazard) => sum + hazard.affectedPopulation, 0
    );

    const averageResponseTime = this.calculateAverageResponseTime();
    const evacuationCompliance = this.calculateEvacuationCompliance();

    this.state.analytics = {
      totalAffectedPopulation,
      averageResponseTime,
      evacuationCompliance,
      lastUpdated: new Date()
    };

    this.emit('analyticsUpdate', this.state.analytics);
  }

  // Calculate average response time from incidents
  private calculateAverageResponseTime(): number {
    const resolvedIncidents = this.state.incidents.resolved;
    if (resolvedIncidents.length === 0) return 0;

    const totalTime = resolvedIncidents.reduce((sum, incident) => {
      const reportedAt = new Date(incident.reportedAt);
      const resolvedAt = new Date(); // In real implementation, get actual resolved time
      return sum + (resolvedAt.getTime() - reportedAt.getTime());
    }, 0);

    return totalTime / resolvedIncidents.length / 1000 / 60; // Convert to minutes
  }

  // Calculate evacuation compliance rate
  private calculateEvacuationCompliance(): number {
    const totalBuildings = this.state.buildings.total;
    if (totalBuildings === 0) return 0;

    const evacuatedBuildings = this.state.buildings.evacuated.length;
    return (evacuatedBuildings / totalBuildings) * 100;
  }

  // Update hazard-specific analytics
  private updateHazardAnalytics(hazards: HazardZone[]): void {
    // Calculate risk distribution
    const riskDistribution = hazards.reduce((acc, hazard) => {
      acc[hazard.riskLevel] = (acc[hazard.riskLevel] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    this.emit('hazardAnalytics', {
      riskDistribution,
      totalHazards: hazards.length,
      criticalHazards: hazards.filter(h => h.riskLevel === 'critical').length
    });
  }

  // Public API: Get current fused state
  public getState(): FusedDataState {
    return { ...this.state };
  }

  // Public API: Get specific data with caching
  public async getHazards(filters?: any): Promise<HazardZone[]> {
    const cacheKey = `hazards-${JSON.stringify(filters)}`;
    
    if (this.config.enableCaching && this.isCacheValid(cacheKey)) {
      return this.cache.get(cacheKey)!.data;
    }

    const hazards = await foundrySDK.getHazardZones(filters);
    
    if (this.config.enableCaching) {
      this.cache.set(cacheKey, { data: hazards, timestamp: new Date() });
    }

    return hazards;
  }

  // Public API: Get units with caching
  public async getUnits(filters?: any): Promise<EmergencyUnit[]> {
    const cacheKey = `units-${JSON.stringify(filters)}`;
    
    if (this.config.enableCaching && this.isCacheValid(cacheKey)) {
      return this.cache.get(cacheKey)!.data;
    }

    const units = await foundrySDK.getEmergencyUnits(filters);
    
    if (this.config.enableCaching) {
      this.cache.set(cacheKey, { data: units, timestamp: new Date() });
    }

    return units;
  }

  // Public API: Get routes with caching
  public async getRoutes(filters?: any): Promise<EvacuationRoute[]> {
    const cacheKey = `routes-${JSON.stringify(filters)}`;
    
    if (this.config.enableCaching && this.isCacheValid(cacheKey)) {
      return this.cache.get(cacheKey)!.data;
    }

    const routes = await foundrySDK.getEvacuationRoutes(filters);
    
    if (this.config.enableCaching) {
      this.cache.set(cacheKey, { data: routes, timestamp: new Date() });
    }

    return routes;
  }

  // Public API: Check cache validity
  private isCacheValid(key: string): boolean {
    const cached = this.cache.get(key);
    if (!cached) return false;

    const age = Date.now() - cached.timestamp.getTime();
    return age < this.config.cacheDuration;
  }

  // Public API: Clear cache
  public clearCache(): void {
    this.cache.clear();
  }

  // Public API: Refresh all data
  public async refreshAll(): Promise<void> {
    try {
      const [hazards, units, routes] = await Promise.all([
        foundrySDK.getHazardZones(),
        foundrySDK.getEmergencyUnits(),
        foundrySDK.getEvacuationRoutes()
      ]);

      this.updateHazards(hazards);
      this.updateUnits(units);
      this.updateRoutes(routes);
      this.updateAnalytics();

      this.emit('dataRefresh', this.state);
    } catch (error) {
      this.emit('error', error);
    }
  }

  // Public API: Subscribe to specific data updates
  public subscribeToUpdates(callback: (update: DataUpdate) => void): () => void {
    this.on('dataUpdate', callback);
    return () => this.off('dataUpdate', callback);
  }

  // Public API: Subscribe to analytics updates
  public subscribeToAnalytics(callback: (analytics: any) => void): () => void {
    this.on('analyticsUpdate', callback);
    return () => this.off('analyticsUpdate', callback);
  }

  // Public API: Subscribe to hazard analytics
  public subscribeToHazardAnalytics(callback: (analytics: any) => void): () => void {
    this.on('hazardAnalytics', callback);
    return () => this.off('hazardAnalytics', callback);
  }

  // Public API: Cleanup
  public destroy(): void {
    if (this.updateTimer) {
      clearInterval(this.updateTimer);
    }

    this.subscriptions.forEach(unsubscribe => unsubscribe());
    this.subscriptions.clear();
    this.cache.clear();
    this.removeAllListeners();
  }
}

// Global data fusion instance
export const dataFusion = new FoundryDataFusion();

// React hooks for data fusion
export function useDataFusion() {
  const [state, setState] = React.useState<FusedDataState>(dataFusion.getState());

  React.useEffect(() => {
    const unsubscribe = dataFusion.subscribeToUpdates(() => {
      setState(dataFusion.getState());
    });

    return unsubscribe;
  }, []);

  return state;
}

export function useDataFusionAnalytics() {
  const [analytics, setAnalytics] = React.useState(dataFusion.getState().analytics);

  React.useEffect(() => {
    const unsubscribe = dataFusion.subscribeToAnalytics(setAnalytics);
    return unsubscribe;
  }, []);

  return analytics;
}

export function useDataFusionHazardAnalytics() {
  const [hazardAnalytics, setHazardAnalytics] = React.useState<any>(null);

  React.useEffect(() => {
    const unsubscribe = dataFusion.subscribeToHazardAnalytics(setHazardAnalytics);
    return unsubscribe;
  }, []);

  return hazardAnalytics;
}
