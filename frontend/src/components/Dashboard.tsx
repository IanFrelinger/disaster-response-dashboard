import React, { useState, useEffect } from 'react';
import HazardMap from './HazardMap';
import RiskAssessmentCard from './RiskAssessmentCard';
import HazardSummaryCard from './HazardSummaryCard';
import SafeRoutesCard from './SafeRoutesCard';
import ApiService from '../services/api';
import { HazardZone, SafeRoute, RiskAssessment, HazardSummary, EvacuationRoutesResponse } from '../types/hazard';
import { RefreshCw, Settings, Download, AlertTriangle } from 'lucide-react';
import { environment, logger } from '../config/environment';

interface DashboardData {
  hazardZones: HazardZone[];
  safeRoutes: SafeRoute[];
  riskAssessment: RiskAssessment;
  hazardSummary: HazardSummary;
  evacuationRoutes: EvacuationRoutesResponse;
}

const Dashboard: React.FC = () => {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedLocation, setSelectedLocation] = useState<[number, number]>([-122.4194, 37.7749]);
  const [mapCenter, setMapCenter] = useState<[number, number]>([-122.4194, 37.7749]);

  // Fetch data from API on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        logger.debug('Fetching dashboard data...');
        const data = await ApiService.getDashboardData();
        setDashboardData(data);
        
        logger.debug('Dashboard data loaded successfully');
      } catch (error) {
        logger.error('Failed to fetch dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleRefresh = async () => {
          try {
        setLoading(true);
        logger.debug('Refreshing dashboard data...');
        const data = await ApiService.refreshData();
        setDashboardData(data);
        
        logger.debug('Dashboard data refreshed successfully');
      } catch (error) {
        logger.error('Failed to refresh data:', error);
      } finally {
        setLoading(false);
      }
  };

  const handleLocationClick = async (lat: number, lng: number) => {
    setSelectedLocation([lng, lat]);
    setMapCenter([lng, lat]);
    
    // Fetch new risk assessment for the clicked location
    try {
      logger.debug(`Fetching risk assessment for location: ${lat}, ${lng}`);
      const newRiskAssessment = await ApiService.getRiskAssessment(lat, lng);
      if (dashboardData) {
        setDashboardData({
          ...dashboardData,
          riskAssessment: newRiskAssessment
        });
      }
      logger.debug('Risk assessment updated successfully');
    } catch (error) {
      logger.error('Failed to fetch risk assessment:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading disaster response data...</p>
        </div>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-gray-600">Failed to load dashboard data</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Disaster Response Dashboard</h1>
              <p className="text-sm text-gray-600">Real-time hazard monitoring and evacuation planning</p>
              <div className="flex items-center mt-1">
                <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-800 font-medium">
                  {environment.mode.toUpperCase()} MODE
                </span>
                {environment.useSyntheticData && (
                  <span className="text-xs px-2 py-1 rounded-full bg-yellow-100 text-yellow-800 font-medium ml-2">
                    SYNTHETIC DATA
                  </span>
                )}
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={handleRefresh}
                disabled={loading}
                className="flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </button>
              <button className="flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                <Download className="w-4 h-4 mr-2" />
                Export
              </button>
              <button className="flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Left Sidebar - Statistics Cards */}
          <div className="lg:col-span-1 space-y-6">
            <RiskAssessmentCard assessment={dashboardData.riskAssessment} />
            <HazardSummaryCard summary={dashboardData.hazardSummary} />
          </div>

          {/* Main Map Area */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="h-96">
                <HazardMap
                  hazardZones={dashboardData.hazardZones}
                  safeRoutes={dashboardData.safeRoutes}
                  onLocationClick={handleLocationClick}
                  center={mapCenter}
                  zoom={10}
                />
              </div>
            </div>
          </div>

          {/* Right Sidebar - Routes */}
          <div className="lg:col-span-1">
            <SafeRoutesCard evacuationRoutes={dashboardData.evacuationRoutes} />
          </div>
        </div>

                  {/* Bottom Section - Additional Info */}
          <div className="mt-6 grid grid-cols-1 lg:grid-cols-4 gap-6">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Data Sources</h3>
              <div className="space-y-3">
                {Object.entries(dashboardData.hazardSummary.dataSources).map(([source, count]) => (
                  <div key={source} className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">{source}</span>
                    <span className="text-sm text-gray-600">{count} hazards</span>
                  </div>
                ))}
              </div>
            </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
            <div className="space-y-3">
              <div className="flex items-center text-sm">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                <span className="text-gray-600">New hazard detected in San Francisco</span>
              </div>
              <div className="flex items-center text-sm">
                <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                <span className="text-gray-600">Route optimization completed</span>
              </div>
              <div className="flex items-center text-sm">
                <div className="w-2 h-2 bg-yellow-500 rounded-full mr-3"></div>
                <span className="text-gray-600">Risk assessment updated</span>
              </div>
            </div>
          </div>

                      <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">System Status</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Data Feed</span>
                  <span className="text-sm font-medium text-green-600">Active</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Processing</span>
                  <span className="text-sm font-medium text-green-600">Online</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Last Update</span>
                  <span className="text-sm font-medium text-gray-900">
                    {new Date().toLocaleTimeString()}
                  </span>
                </div>
              </div>
            </div>


        </div>
      </main>
    </div>
  );
};

export default Dashboard; 