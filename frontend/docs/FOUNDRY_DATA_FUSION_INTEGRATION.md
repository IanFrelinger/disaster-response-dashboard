# 🎯 Foundry Data Fusion Integration Guide

## Overview

This document demonstrates the complete integration of Foundry data fusion into the frontend, creating a seamless, real-time experience that combines multiple data sources into unified, actionable insights.

## 🏗️ **1. Real-Time Data Flow Architecture**

### Data Sources Integration
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   NASA FIRMS    │    │  NOAA Weather   │    │   911 Calls     │
│   (Satellite)   │    │   (Forecasts)   │    │  (Emergency)    │
└─────────┬───────┘    └─────────┬───────┘    └─────────┬───────┘
          │                      │                      │
          └──────────────────────┼──────────────────────┘
                                 │
                    ┌─────────────▼─────────────┐
                    │    Foundry Ontology       │
                    │   (Data Standardization)  │
                    └─────────────┬─────────────┘
                                  │
                    ┌─────────────▼─────────────┐
                    │   Data Fusion Engine      │
                    │  (Real-time Processing)   │
                    └─────────────┬─────────────┘
                                  │
                    ┌─────────────▼─────────────┐
                    │   Frontend State Store   │
                    │   (React State Mgmt)     │
                    └─────────────┬─────────────┘
                                  │
                    ┌─────────────▼─────────────┐
                    │   UI Components          │
                    │  (Real-time Updates)     │
                    └───────────────────────────┘
```

### Key Components

#### **1.1 Data Ingestion Layer**
- **NASA FIRMS**: Satellite fire detection data
- **NOAA Weather**: Real-time weather conditions and forecasts
- **911 Calls**: Emergency incident reports
- **Emergency Units**: GPS tracking and status updates
- **Evacuation Routes**: Traffic and road condition data

#### **1.2 Foundry Ontology Layer**
```typescript
// Standardized data structures
interface HazardZone {
  h3CellId: string;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  riskScore: number;
  affectedPopulation: number;
  buildingsAtRisk: number;
  // ... additional properties
}

interface EmergencyUnit {
  unitId: string;
  callSign: string;
  unitType: 'fire_engine' | 'ambulance' | 'police';
  status: 'available' | 'dispatched' | 'en_route';
  currentLocation: string;
  // ... additional properties
}
```

#### **1.3 Data Fusion Engine**
```typescript
export class FoundryDataFusion extends EventEmitter {
  private state: FusedDataState;
  private config: FusionConfig;
  
  // Real-time subscriptions
  private startRealTimeUpdates(): void {
    // Subscribe to hazard zone updates
    const hazardSubscription = foundrySDK.subscribeToHazardZones((hazards) => {
      this.updateHazards(hazards);
      this.emit('dataUpdate', { type: 'hazard', data: hazards });
    });
    
    // Subscribe to emergency unit updates
    const unitSubscription = foundrySDK.subscribeToEmergencyUnits((units) => {
      this.updateUnits(units);
      this.emit('dataUpdate', { type: 'unit', data: units });
    });
  }
}
```

## 🎛️ **2. Enhanced Command Center with Data Fusion**

### **2.1 Real-Time Dashboard Integration**

The Command Center Dashboard integrates all data fusion capabilities:

```typescript
export const CommandCenterDashboard: React.FC = () => {
  // Data fusion hooks for real-time updates
  const fusedData = useDataFusion();
  const analytics = useDataFusionAnalytics();
  const hazardAnalytics = useDataFusionHazardAnalytics();

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(handleRefresh, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="h-screen bg-gray-50 flex flex-col">
      {/* Header with real-time status */}
      <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Shield className="w-8 h-8 text-blue-600" />
            <h1 className="text-2xl font-bold text-gray-900">Command Center</h1>
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <Clock className="w-4 h-4" />
              <span>Last updated: {lastRefresh.toLocaleTimeString()}</span>
            </div>
          </div>
          
          {/* Real-time controls */}
          <div className="flex items-center space-x-4">
            <button onClick={handleRefresh} disabled={isRefreshing}>
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main content with fused data */}
      <main className="flex-1 flex">
        {/* Left Panel - Key Metrics */}
        <div className="w-80 bg-white border-r border-gray-200 p-6">
          {/* Critical Alerts */}
          {fusedData.hazards.critical.length > 0 && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-red-500" />
              <h3 className="font-semibold text-red-800">Critical Alerts</h3>
              <p className="text-red-700 text-sm">
                {fusedData.hazards.critical.length} critical hazards detected
              </p>
            </div>
          )}

          {/* Hazard Summary */}
          <div className="mb-6">
            <h3 className="font-medium text-gray-900 mb-3">Hazard Summary</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-sm font-medium">Active Hazards</span>
                <span className="text-lg font-bold text-gray-900">
                  {fusedData.hazards.total}
                </span>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                <span className="text-sm font-medium">Critical</span>
                <span className="text-lg font-bold text-red-600">
                  {fusedData.hazards.critical.length}
                </span>
              </div>
            </div>
          </div>

          {/* Resource Summary */}
          <div className="mb-6">
            <h3 className="font-medium text-gray-900 mb-3">Resource Summary</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                <span className="text-sm font-medium">Available Units</span>
                <span className="text-lg font-bold text-blue-600">
                  {fusedData.units.available.length}
                </span>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-sm font-medium">Deployed</span>
                <span className="text-lg font-bold text-gray-900">
                  {fusedData.units.dispatched.length}
                </span>
              </div>
            </div>
          </div>

          {/* Analytics Summary */}
          <div className="mb-6">
            <h3 className="font-medium text-gray-900 mb-3">Analytics</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <span className="text-sm font-medium">Affected Population</span>
                <span className="text-lg font-bold text-green-600">
                  {analytics.totalAffectedPopulation.toLocaleString()}
                </span>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                <span className="text-sm font-medium">Evacuation Compliance</span>
                <span className="text-lg font-bold text-purple-600">
                  {analytics.evacuationCompliance.toFixed(1)}%
                </span>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-indigo-50 rounded-lg">
                <span className="text-sm font-medium">Avg Response Time</span>
                <span className="text-lg font-bold text-indigo-600">
                  {analytics.averageResponseTime.toFixed(1)}m
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Center Panel - Main Content */}
        <div className="flex-1 flex flex-col">
          <AnimatePresence mode="wait">
            {selectedView === 'map' && (
              <motion.div key="map" className="flex-1">
                <FoundryHazardMap
                  showUnits={true}
                  showRoutes={true}
                  onHazardClick={(hazard) => console.log('Hazard clicked:', hazard)}
                  onUnitClick={(unit) => console.log('Unit clicked:', unit)}
                />
              </motion.div>
            )}

            {selectedView === 'analytics' && (
              <motion.div key="analytics" className="flex-1 p-6">
                <AnalyticsView 
                  analytics={analytics} 
                  hazardAnalytics={hazardAnalytics}
                  fusedData={fusedData}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Right Panel - Data Fusion Status */}
        <div className="w-80 bg-white border-l border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Data Fusion Status</h2>
          
          {/* System Health */}
          <div className="mb-6">
            <h3 className="font-medium text-gray-900 mb-3">System Health</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <span className="text-sm font-medium">Foundry Connection</span>
                <span className="text-sm text-green-600 font-medium">Connected</span>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <span className="text-sm font-medium">Real-time Updates</span>
                <span className="text-sm text-green-600 font-medium">Active</span>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                <span className="text-sm font-medium">Analytics Engine</span>
                <span className="text-sm text-blue-600 font-medium">Running</span>
              </div>
            </div>
          </div>

          {/* Data Sources */}
          <div className="mb-6">
            <h3 className="font-medium text-gray-900 mb-3">Data Sources</h3>
            <div className="space-y-2">
              {[
                { name: 'NASA FIRMS', status: 'active', icon: '🛰️' },
                { name: 'NOAA Weather', status: 'active', icon: '🌤️' },
                { name: '911 Calls', status: 'active', icon: '📞' },
                { name: 'Emergency Units', status: 'active', icon: '🚒' },
                { name: 'Evacuation Routes', status: 'active', icon: '🛣️' }
              ].map((source) => (
                <div key={source.name} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <div className="flex items-center space-x-2">
                    <span>{source.icon}</span>
                    <span className="text-sm font-medium">{source.name}</span>
                  </div>
                  <span className="text-xs text-green-600 font-medium">{source.status}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Updates */}
          <div>
            <h3 className="font-medium text-gray-900 mb-3">Recent Updates</h3>
            <div className="space-y-2">
              <div className="p-3 bg-blue-50 rounded-lg">
                <div className="flex items-center space-x-2 mb-1">
                  <Fire className="w-4 h-4 text-blue-500" />
                  <span className="text-sm font-medium">New hazard detected</span>
                </div>
                <p className="text-xs text-gray-600">Critical fire in Zone A-7</p>
                <p className="text-xs text-gray-500">2 minutes ago</p>
              </div>
              
              <div className="p-3 bg-green-50 rounded-lg">
                <div className="flex items-center space-x-2 mb-1">
                  <Shield className="w-4 h-4 text-green-500" />
                  <span className="text-sm font-medium">Unit dispatched</span>
                </div>
                <p className="text-xs text-gray-600">Engine 7 → Incident B-12</p>
                <p className="text-xs text-gray-500">5 minutes ago</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
```

## 📊 **3. Real-Time Data Visualization Component**

### **3.1 Live Metrics Dashboard**

The `RealTimeDataVisualization` component provides:

- **Live/Pause Controls**: Toggle real-time updates
- **Trend Analysis**: Calculate and display trends over time
- **Configurable Metrics**: Show/hide different metric categories
- **Historical Data**: Track changes over time
- **Interactive Charts**: Visual representation of data

```typescript
export const RealTimeDataVisualization: React.FC<RealTimeDataVisualizationProps> = ({
  showLiveUpdates = true,
  updateInterval = 5000
}) => {
  const [isLive, setIsLive] = useState(showLiveUpdates);
  const [selectedTimeframe, setSelectedTimeframe] = useState<'1h' | '6h' | '24h'>('1h');
  const [visibleMetrics, setVisibleMetrics] = useState<Set<string>>(new Set(['hazards', 'units', 'analytics']));
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  // Data fusion hooks
  const fusedData = useDataFusion();
  const analytics = useDataFusionAnalytics();
  const hazardAnalytics = useDataFusionHazardAnalytics();

  // Historical data for trends
  const [historicalData, setHistoricalData] = useState<any[]>([]);

  // Handle live updates
  useEffect(() => {
    if (!isLive) return;

    const interval = setInterval(() => {
      setLastUpdate(new Date());
      // Add to historical data for trend analysis
      setHistoricalData(prev => [
        ...prev.slice(-50), // Keep last 50 data points
        {
          timestamp: new Date(),
          hazards: fusedData.hazards.total,
          criticalHazards: fusedData.hazards.critical.length,
          availableUnits: fusedData.units.available.length,
          affectedPopulation: analytics.totalAffectedPopulation,
          responseTime: analytics.averageResponseTime,
          compliance: analytics.evacuationCompliance
        }
      ]);
    }, updateInterval);

    return () => clearInterval(interval);
  }, [isLive, updateInterval, fusedData, analytics]);

  // Calculate trends
  const trends = useMemo(() => {
    if (historicalData.length < 2) return {};

    const recent = historicalData.slice(-10);
    const previous = historicalData.slice(-20, -10);

    const calculateTrend = (key: string) => {
      const recentAvg = recent.reduce((sum, d) => sum + d[key], 0) / recent.length;
      const previousAvg = previous.reduce((sum, d) => sum + d[key], 0) / previous.length;
      const change = ((recentAvg - previousAvg) / previousAvg) * 100;
      return { change, direction: change > 0 ? 'up' : 'down' };
    };

    return {
      hazards: calculateTrend('hazards'),
      criticalHazards: calculateTrend('criticalHazards'),
      availableUnits: calculateTrend('availableUnits'),
      affectedPopulation: calculateTrend('affectedPopulation'),
      responseTime: calculateTrend('responseTime'),
      compliance: calculateTrend('compliance')
    };
  }, [historicalData]);

  return (
    <div className="bg-white rounded-lg shadow-lg border border-gray-200">
      {/* Header with controls */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Zap className="w-6 h-6 text-blue-600" />
            <h2 className="text-xl font-bold text-gray-900">Real-Time Data Fusion</h2>
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${isLive ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`}></div>
              <span className="text-sm text-gray-600">{isLive ? 'Live' : 'Paused'}</span>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {/* Timeframe Selector */}
            <div className="flex items-center space-x-1 bg-gray-100 rounded-lg p-1">
              {(['1h', '6h', '24h'] as const).map((timeframe) => (
                <button
                  key={timeframe}
                  onClick={() => setSelectedTimeframe(timeframe)}
                  className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
                    selectedTimeframe === timeframe
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {timeframe}
                </button>
              ))}
            </div>

            {/* Live Toggle */}
            <button
              onClick={() => setIsLive(!isLive)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                isLive
                  ? 'bg-red-100 text-red-700 hover:bg-red-200'
                  : 'bg-green-100 text-green-700 hover:bg-green-200'
              }`}
            >
              {isLive ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              <span className="text-sm font-medium">{isLive ? 'Pause' : 'Live'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Hazard Metrics */}
          {visibleMetrics.has('hazards') && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gradient-to-br from-red-50 to-red-100 p-6 rounded-lg border border-red-200"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <Fire className="w-5 h-5 text-red-600" />
                  <h3 className="font-semibold text-red-800">Hazard Zones</h3>
                </div>
                <button onClick={() => toggleMetric('hazards')}>
                  <EyeOff className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-red-700">Total Active</span>
                  <span className="text-2xl font-bold text-red-800">
                    {fusedData.hazards.total}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-red-700">Critical</span>
                  <div className="flex items-center space-x-2">
                    <span className="text-xl font-bold text-red-800">
                      {fusedData.hazards.critical.length}
                    </span>
                    {trends.criticalHazards && (
                      <div className="flex items-center space-x-1">
                        {React.createElement(getTrendDisplay(trends.criticalHazards).icon, {
                          className: `w-4 h-4 ${getTrendDisplay(trends.criticalHazards).color}`
                        })}
                        <span className={`text-xs ${getTrendDisplay(trends.criticalHazards).color}`}>
                          {Math.abs(trends.criticalHazards.change).toFixed(1)}%
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Unit Metrics */}
          {visibleMetrics.has('units') && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-lg border border-blue-200"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <Users className="w-5 h-5 text-blue-600" />
                  <h3 className="font-semibold text-blue-800">Emergency Units</h3>
                </div>
                <button onClick={() => toggleMetric('units')}>
                  <EyeOff className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-blue-700">Available</span>
                  <div className="flex items-center space-x-2">
                    <span className="text-2xl font-bold text-blue-800">
                      {fusedData.units.available.length}
                    </span>
                    {trends.availableUnits && (
                      <div className="flex items-center space-x-1">
                        {React.createElement(getTrendDisplay(trends.availableUnits).icon, {
                          className: `w-4 h-4 ${getTrendDisplay(trends.availableUnits).color}`
                        })}
                        <span className={`text-xs ${getTrendDisplay(trends.availableUnits).color}`}>
                          {Math.abs(trends.availableUnits.change).toFixed(1)}%
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-blue-700">Deployed</span>
                  <span className="text-lg font-semibold text-blue-700">
                    {fusedData.units.dispatched.length}
                  </span>
                </div>
              </div>
            </motion.div>
          )}

          {/* Analytics Metrics */}
          {visibleMetrics.has('analytics') && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-lg border border-green-200"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <BarChart3 className="w-5 h-5 text-green-600" />
                  <h3 className="font-semibold text-green-800">Analytics</h3>
                </div>
                <button onClick={() => toggleMetric('analytics')}>
                  <EyeOff className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-green-700">Affected Population</span>
                  <div className="flex items-center space-x-2">
                    <span className="text-lg font-bold text-green-800">
                      {analytics.totalAffectedPopulation.toLocaleString()}
                    </span>
                    {trends.affectedPopulation && (
                      <div className="flex items-center space-x-1">
                        {React.createElement(getTrendDisplay(trends.affectedPopulation).icon, {
                          className: `w-4 h-4 ${getTrendDisplay(trends.affectedPopulation).color}`
                        })}
                        <span className={`text-xs ${getTrendDisplay(trends.affectedPopulation).color}`}>
                          {Math.abs(trends.affectedPopulation.change).toFixed(1)}%
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-green-700">Response Time</span>
                  <div className="flex items-center space-x-2">
                    <span className="text-lg font-bold text-green-800">
                      {analytics.averageResponseTime.toFixed(1)}m
                    </span>
                    {trends.responseTime && (
                      <div className="flex items-center space-x-1">
                        {React.createElement(getTrendDisplay(trends.responseTime).icon, {
                          className: `w-4 h-4 ${getTrendDisplay(trends.responseTime).color}`
                        })}
                        <span className={`text-xs ${getTrendDisplay(trends.responseTime).color}`}>
                          {Math.abs(trends.responseTime.change).toFixed(1)}%
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-green-700">Compliance</span>
                  <div className="flex items-center space-x-2">
                    <span className="text-lg font-bold text-green-800">
                      {analytics.evacuationCompliance.toFixed(1)}%
                    </span>
                    {trends.compliance && (
                      <div className="flex items-center space-x-1">
                        {React.createElement(getTrendDisplay(trends.compliance).icon, {
                          className: `w-4 h-4 ${getTrendDisplay(trends.compliance).color}`
                        })}
                        <span className={`text-xs ${getTrendDisplay(trends.compliance).color}`}>
                          {Math.abs(trends.compliance.change).toFixed(1)}%
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </div>

        {/* Hidden Metrics Toggle */}
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h4 className="text-sm font-medium text-gray-700 mb-3">Toggle Metrics</h4>
          <div className="flex flex-wrap gap-2">
            {[
              { key: 'hazards', label: 'Hazards', icon: Fire },
              { key: 'units', label: 'Units', icon: Users },
              { key: 'analytics', label: 'Analytics', icon: BarChart3 },
              { key: 'routes', label: 'Routes', icon: MapPin },
              { key: 'incidents', label: 'Incidents', icon: AlertTriangle },
              { key: 'buildings', label: 'Buildings', icon: MapPin }
            ].map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => toggleMetric(key)}
                className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  visibleMetrics.has(key)
                    ? 'bg-blue-100 text-blue-700'
                    : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{label}</span>
                {visibleMetrics.has(key) ? (
                  <Eye className="w-4 h-4" />
                ) : (
                  <EyeOff className="w-4 h-4" />
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Hazard Analytics Chart */}
      {hazardAnalytics && (
        <div className="p-6 border-t border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Hazard Risk Distribution</h3>
          <div className="grid grid-cols-4 gap-4">
            {Object.entries(hazardAnalytics.riskDistribution || {}).map(([level, count]) => (
              <div key={level} className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-gray-900 mb-1">{count as number}</div>
                <div className="text-sm text-gray-600 capitalize">{level}</div>
                <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ 
                      width: `${((count as number) / hazardAnalytics.totalHazards) * 100}%` 
                    }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
```

## 🔧 **4. Implementation Details**

### **4.1 Data Fusion Service Configuration**

```typescript
// Configuration options
export interface FusionConfig {
  updateInterval: number; // milliseconds
  cacheDuration: number; // milliseconds
  enableRealTime: boolean;
  enableCaching: boolean;
  enableAnalytics: boolean;
}

// Default configuration
const defaultConfig: FusionConfig = {
  updateInterval: 5000, // 5 seconds
  cacheDuration: 30000, // 30 seconds
  enableRealTime: true,
  enableCaching: true,
  enableAnalytics: true
};
```

### **4.2 React Hooks for Data Fusion**

```typescript
// Hook for accessing fused data
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

// Hook for analytics data
export function useDataFusionAnalytics() {
  const [analytics, setAnalytics] = React.useState(dataFusion.getState().analytics);

  React.useEffect(() => {
    const unsubscribe = dataFusion.subscribeToAnalytics(setAnalytics);
    return unsubscribe;
  }, []);

  return analytics;
}

// Hook for hazard analytics
export function useDataFusionHazardAnalytics() {
  const [hazardAnalytics, setHazardAnalytics] = React.useState<any>(null);

  React.useEffect(() => {
    const unsubscribe = dataFusion.subscribeToHazardAnalytics(setHazardAnalytics);
    return unsubscribe;
  }, []);

  return hazardAnalytics;
}
```

### **4.3 Real-Time Event Handling**

```typescript
// Event types for real-time updates
export interface DataUpdate {
  type: 'hazard' | 'unit' | 'route' | 'incident' | 'building' | 'analytics';
  data: any;
  timestamp: Date;
  source: string;
}

// Subscribe to updates
dataFusion.subscribeToUpdates((update: DataUpdate) => {
  console.log('Data update received:', update);
  
  switch (update.type) {
    case 'hazard':
      // Handle hazard updates
      break;
    case 'unit':
      // Handle unit updates
      break;
    case 'analytics':
      // Handle analytics updates
      break;
  }
});
```

## 🚀 **5. Usage Examples**

### **5.1 Basic Integration**

```typescript
import { useDataFusion, useDataFusionAnalytics } from '../services/foundryDataFusion';

function MyComponent() {
  const fusedData = useDataFusion();
  const analytics = useDataFusionAnalytics();

  return (
    <div>
      <h2>Active Hazards: {fusedData.hazards.total}</h2>
      <h3>Affected Population: {analytics.totalAffectedPopulation.toLocaleString()}</h3>
    </div>
  );
}
```

### **5.2 Advanced Integration with Real-Time Visualization**

```typescript
import { RealTimeDataVisualization } from '../components/command/RealTimeDataVisualization';

function Dashboard() {
  return (
    <div className="p-6">
      <RealTimeDataVisualization
        showLiveUpdates={true}
        updateInterval={3000}
        className="mb-6"
      />
      
      {/* Other dashboard components */}
    </div>
  );
}
```

### **5.3 Custom Data Fusion Configuration**

```typescript
import { FoundryDataFusion } from '../services/foundryDataFusion';

// Create custom data fusion instance
const customDataFusion = new FoundryDataFusion({
  updateInterval: 2000, // 2 seconds
  cacheDuration: 15000, // 15 seconds
  enableRealTime: true,
  enableCaching: true,
  enableAnalytics: true
});

// Use custom instance
customDataFusion.subscribeToUpdates((update) => {
  console.log('Custom update:', update);
});
```

## 📈 **6. Performance Considerations**

### **6.1 Caching Strategy**

- **Data Caching**: Cache API responses for 30 seconds by default
- **Analytics Caching**: Cache computed analytics for 5 minutes
- **Historical Data**: Keep last 50 data points for trend analysis

### **6.2 Update Frequency**

- **Real-time Updates**: Every 5 seconds for critical data
- **Analytics Updates**: Every 30 seconds for computed metrics
- **Manual Refresh**: On-demand data refresh

### **6.3 Memory Management**

- **Event Cleanup**: Properly unsubscribe from events
- **Historical Data Limits**: Limit historical data to prevent memory leaks
- **Component Cleanup**: Clean up subscriptions on component unmount

## 🔒 **7. Security Considerations**

### **7.1 Data Validation**

- **Input Validation**: Validate all incoming data from Foundry
- **Type Safety**: Use TypeScript for compile-time type checking
- **Error Handling**: Graceful handling of malformed data

### **7.2 Authentication**

- **Token Management**: Secure storage and rotation of auth tokens
- **API Security**: HTTPS for all API communications
- **Access Control**: Role-based access to sensitive data

## 🧪 **8. Testing Strategy**

### **8.1 Unit Tests**

```typescript
// Test data fusion service
describe('FoundryDataFusion', () => {
  it('should initialize with default state', () => {
    const fusion = new FoundryDataFusion();
    const state = fusion.getState();
    
    expect(state.hazards.total).toBe(0);
    expect(state.units.total).toBe(0);
    expect(state.analytics.totalAffectedPopulation).toBe(0);
  });

  it('should emit updates when data changes', () => {
    const fusion = new FoundryDataFusion();
    const mockCallback = jest.fn();
    
    fusion.subscribeToUpdates(mockCallback);
    fusion.updateHazards([mockHazardZone]);
    
    expect(mockCallback).toHaveBeenCalledWith({
      type: 'hazard',
      data: [mockHazardZone],
      timestamp: expect.any(Date),
      source: 'foundry-realtime'
    });
  });
});
```

### **8.2 Integration Tests**

```typescript
// Test component integration
describe('RealTimeDataVisualization', () => {
  it('should display live data updates', () => {
    render(<RealTimeDataVisualization showLiveUpdates={true} />);
    
    // Wait for data to load
    waitFor(() => {
      expect(screen.getByText(/Active Hazards/)).toBeInTheDocument();
    });
  });

  it('should toggle live updates', () => {
    render(<RealTimeDataVisualization showLiveUpdates={true} />);
    
    const liveButton = screen.getByText(/Live/);
    fireEvent.click(liveButton);
    
    expect(screen.getByText(/Paused/)).toBeInTheDocument();
  });
});
```

## 📚 **9. Conclusion**

The Foundry data fusion integration provides a comprehensive, real-time solution for disaster response management. Key benefits include:

- **Real-time Updates**: Live data from multiple sources
- **Unified Interface**: Single source of truth for all data
- **Intelligent Analytics**: Automated calculation of key metrics
- **Flexible Configuration**: Customizable update intervals and caching
- **Performance Optimized**: Efficient data handling and memory management
- **Type Safe**: Full TypeScript support with compile-time validation

This integration creates a seamless experience where commanders can make informed decisions based on real-time, fused data from multiple sources, all presented in an intuitive, interactive interface.
