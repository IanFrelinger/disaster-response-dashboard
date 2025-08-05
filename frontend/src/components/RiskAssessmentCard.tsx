import React from 'react';
import { RiskAssessment } from '../types/hazard';
import { AlertTriangle, MapPin, Clock, TrendingUp } from 'lucide-react';

interface RiskAssessmentCardProps {
  assessment: RiskAssessment;
  className?: string;
}

const RiskAssessmentCard: React.FC<RiskAssessmentCardProps> = ({ assessment, className = '' }) => {
  const getRiskLevelColor = (level: string) => {
    switch (level) {
      case 'low': return 'text-green-600 bg-green-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'high': return 'text-orange-600 bg-orange-100';
      case 'critical': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getOverallRiskLevel = () => {
    if (assessment.maxRiskScore > 0.8) return 'critical';
    if (assessment.maxRiskScore > 0.6) return 'high';
    if (assessment.maxRiskScore > 0.4) return 'medium';
    return 'low';
  };

  const overallRisk = getOverallRiskLevel();

  return (
    <div className={`bg-white rounded-lg shadow-md p-6 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
          <AlertTriangle className="w-5 h-5 mr-2" />
          Risk Assessment
        </h3>
        <div className={`px-3 py-1 rounded-full text-sm font-medium ${getRiskLevelColor(overallRisk)}`}>
          {overallRisk.toUpperCase()}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="text-center">
          <div className="text-2xl font-bold text-gray-900">{assessment.totalNearbyHazards}</div>
          <div className="text-sm text-gray-600">Nearby Hazards</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-gray-900">
            {assessment.closestHazardDistanceKm ? `${assessment.closestHazardDistanceKm.toFixed(1)}km` : 'N/A'}
          </div>
          <div className="text-sm text-gray-600">Closest Hazard</div>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Average Risk Score</span>
          <div className="flex items-center">
            <TrendingUp className="w-4 h-4 mr-1 text-gray-400" />
            <span className="font-medium">{(assessment.avgRiskScore * 100).toFixed(1)}%</span>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Max Risk Score</span>
          <span className="font-medium">{(assessment.maxRiskScore * 100).toFixed(1)}%</span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Assessment Radius</span>
          <span className="font-medium">{assessment.assessmentRadiusKm}km</span>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-gray-200">
        <h4 className="text-sm font-medium text-gray-900 mb-2">Risk Level Distribution</h4>
        <div className="space-y-2">
          {Object.entries(assessment.riskLevels).map(([level, count]) => (
            <div key={level} className="flex items-center justify-between">
              <div className="flex items-center">
                <div className={`w-3 h-3 rounded-full mr-2 ${getRiskLevelColor(level).split(' ')[1]}`}></div>
                <span className="text-sm capitalize">{level}</span>
              </div>
              <span className="text-sm font-medium">{count}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="flex items-center text-sm text-gray-500">
          <MapPin className="w-4 h-4 mr-1" />
          <span>
            {assessment.location.latitude.toFixed(4)}, {assessment.location.longitude.toFixed(4)}
          </span>
        </div>
        <div className="flex items-center text-sm text-gray-500 mt-1">
          <Clock className="w-4 h-4 mr-1" />
          <span>{new Date(assessment.assessmentTimestamp).toLocaleString()}</span>
        </div>
      </div>
    </div>
  );
};

export default RiskAssessmentCard; 