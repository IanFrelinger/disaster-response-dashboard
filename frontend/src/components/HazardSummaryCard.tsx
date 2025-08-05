import React from 'react';
import { HazardSummary } from '../types/hazard';
import { BarChart3, Database, Clock, Map } from 'lucide-react';

interface HazardSummaryCardProps {
  summary: HazardSummary;
  className?: string;
}

const HazardSummaryCard: React.FC<HazardSummaryCardProps> = ({ summary, className = '' }) => {
  const getRiskLevelColor = (level: string) => {
    switch (level) {
      case 'low': return 'bg-green-500';
      case 'medium': return 'bg-yellow-500';
      case 'high': return 'bg-orange-500';
      case 'critical': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getDataSourceColor = (source: string) => {
    switch (source) {
      case 'FIRMS': return 'bg-blue-500';
      case 'NOAA': return 'bg-purple-500';
      case 'USGS': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const totalHazards = Object.values(summary.riskDistribution).reduce((sum, count) => sum + count, 0);

  return (
    <div className={`bg-white rounded-lg shadow-md p-6 ${className}`}>
      <div className="flex items-center mb-4">
        <BarChart3 className="w-5 h-5 mr-2 text-gray-600" />
        <h3 className="text-lg font-semibold text-gray-900">Hazard Summary</h3>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="text-center">
          <div className="text-3xl font-bold text-gray-900">{summary.totalHazards}</div>
          <div className="text-sm text-gray-600">Total Hazards</div>
        </div>
        <div className="text-center">
          <div className="text-3xl font-bold text-gray-900">{Object.keys(summary.dataSources).length}</div>
          <div className="text-sm text-gray-600">Data Sources</div>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <h4 className="text-sm font-medium text-gray-900 mb-2">Risk Level Distribution</h4>
          <div className="space-y-2">
            {Object.entries(summary.riskDistribution).map(([level, count]) => {
              const percentage = totalHazards > 0 ? (count / totalHazards) * 100 : 0;
              return (
                <div key={level} className="flex items-center">
                  <div className="flex items-center w-20">
                    <div className={`w-3 h-3 rounded-full mr-2 ${getRiskLevelColor(level)}`}></div>
                    <span className="text-sm capitalize">{level}</span>
                  </div>
                  <div className="flex-1 mx-2">
                    <div className="bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${getRiskLevelColor(level)}`}
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </div>
                  <span className="text-sm font-medium w-8 text-right">{count}</span>
                </div>
              );
            })}
          </div>
        </div>

        <div>
          <h4 className="text-sm font-medium text-gray-900 mb-2 flex items-center">
            <Database className="w-4 h-4 mr-1" />
            Data Sources
          </h4>
          <div className="space-y-2">
            {Object.entries(summary.dataSources).map(([source, count]) => (
              <div key={source} className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className={`w-3 h-3 rounded-full mr-2 ${getDataSourceColor(source)}`}></div>
                  <span className="text-sm">{source}</span>
                </div>
                <span className="text-sm font-medium">{count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="flex items-center text-sm text-gray-500">
          <Clock className="w-4 h-4 mr-1" />
          <span>Last Updated: {summary.lastUpdated ? new Date(summary.lastUpdated).toLocaleString() : 'N/A'}</span>
        </div>
        {summary.bbox && (
          <div className="flex items-center text-sm text-gray-500 mt-1">
            <Map className="w-4 h-4 mr-1" />
            <span>
              Bounds: [{summary.bbox[0].toFixed(2)}, {summary.bbox[1].toFixed(2)}] to [{summary.bbox[2].toFixed(2)}, {summary.bbox[3].toFixed(2)}]
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default HazardSummaryCard; 