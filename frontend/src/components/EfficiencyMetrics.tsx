import React, { useState } from 'react';
import type { EfficiencyMetrics as EfficiencyMetricsType } from '../types/emergency-response';
import './EfficiencyMetrics.css';

interface EfficiencyMetricsProps {
  metrics: EfficiencyMetricsType;
  onMetricsUpdate?: (metrics: EfficiencyMetricsType) => void;
  className?: string;
}

export const EfficiencyMetrics: React.FC<EfficiencyMetricsProps> = ({
  metrics,
  className = ''
}) => {
  const [viewMode, setViewMode] = useState<'overview' | 'detailed' | 'projections'>('overview');

  const formatTime = (minutes: number): string => {
    if (minutes < 60) {
      return `${minutes} min`;
    } else if (minutes < 1440) {
      const hours = Math.floor(minutes / 60);
      const mins = minutes % 60;
      return `${hours}h ${mins}m`;
    } else {
      const days = Math.floor(minutes / 1440);
      const hours = Math.floor((minutes % 1440) / 60);
      return `${days}d ${hours}h`;
    }
  };

  const formatPercentage = (value: number): string => {
    return `${value}%`;
  };

  const formatCurrency = (value: string): string => {
    return value;
  };

  const getImprovementColor = (improvement: number): string => {
    if (improvement >= 50) return 'var(--ios-green)';
    if (improvement >= 25) return 'var(--ios-orange)';
    if (improvement >= 10) return 'var(--ios-yellow)';
    return 'var(--ios-red)';
  };

  const getConfidenceColor = (confidence: number): string => {
    if (confidence >= 0.9) return 'var(--ios-green)';
    if (confidence >= 0.7) return 'var(--ios-orange)';
    if (confidence >= 0.5) return 'var(--ios-yellow)';
    return 'var(--ios-red)';
  };

  const getConfidenceLabel = (confidence: number): string => {
    if (confidence >= 0.9) return 'Very High';
    if (confidence >= 0.7) return 'High';
    if (confidence >= 0.5) return 'Medium';
    return 'Low';
  };

  const calculateTotalLivesSaved = (): number => {
    return metrics.outcomeProjection.livesSaved.estimate;
  };

  const calculateTotalValue = (): string => {
    return metrics.outcomeProjection.propertySaved.estimate;
  };

  const calculateTotalEfficiencyGain = (): number => {
    const decisionSpeed = ((metrics.decisionSpeed.before - metrics.decisionSpeed.after) / metrics.decisionSpeed.before) * 100;
    const resourceUtil = metrics.resourceUtilization.freed;
    const responseTime = metrics.responseTime.improvement;
    
    return Math.round((decisionSpeed + resourceUtil + responseTime) / 3);
  };

  return (
    <div className={`efficiency-metrics ${className}`} style={{
      padding: '20px',
      backgroundColor: '#f5f5f7',
      borderRadius: '12px',
      minHeight: '600px',
      margin: '0',
      boxSizing: 'border-box'
    }}>
      {/* Enhanced Header */}
      <div className="ios-card" style={{ margin: '0 0 var(--ios-spacing-lg) 0' }}>
        <div className="ios-container" style={{ padding: 0 }}>
          <div className="ios-flex-between">
            <div>
              <h1 className="ios-headline" style={{ color: 'var(--ios-blue)', margin: 0, marginBottom: 'var(--ios-spacing-xs)' }}>
                Efficiency Metrics Dashboard
              </h1>
              <p className="ios-caption" style={{ margin: 0 }}>
                How saved time equals saved lives - Real impact measurement
              </p>
            </div>
            
            <div className="ios-flex" style={{ gap: 'var(--ios-spacing-md)' }}>
              <button 
                className={`ios-button ${viewMode === 'overview' ? 'primary' : 'secondary'} small`}
                onClick={() => setViewMode('overview')}
              >
                Overview
              </button>
              <button 
                className={`ios-button ${viewMode === 'detailed' ? 'primary' : 'secondary'} small`}
                onClick={() => setViewMode('detailed')}
              >
                Detailed
              </button>
              <button 
                className={`ios-button ${viewMode === 'projections' ? 'primary' : 'secondary'} small`}
                onClick={() => setViewMode('projections')}
              >
                Projections
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Overview Mode */}
      {viewMode === 'overview' && (
        <div className="metrics-overview">
          {/* Summary Cards */}
          <div className="summary-cards">
            <div className="summary-card lives-saved">
              <div className="card-icon">💚</div>
              <div className="card-content">
                <div className="card-value">{calculateTotalLivesSaved()}</div>
                <div className="card-label">Lives Saved</div>
                <div className="card-subtitle">Through improved efficiency</div>
              </div>
            </div>
            
            <div className="summary-card time-saved">
              <div className="card-icon">⏰</div>
              <div className="card-content">
                <div className="card-value">{formatTime(metrics.decisionSpeed.saved)}</div>
                <div className="card-label">Time Saved</div>
                <div className="card-subtitle">Per decision cycle</div>
              </div>
            </div>
            
            <div className="summary-card efficiency-gain">
              <div className="card-icon">📈</div>
              <div className="card-content">
                <div className="card-value">{calculateTotalEfficiencyGain()}%</div>
                <div className="card-label">Efficiency Gain</div>
                <div className="card-subtitle">Overall improvement</div>
              </div>
            </div>
            
            <div className="summary-card property-value">
              <div className="card-icon">💰</div>
              <div className="card-content">
                <div className="card-value">{calculateTotalValue()}</div>
                <div className="card-label">Property Saved</div>
                <div className="card-subtitle">Estimated value</div>
              </div>
            </div>
          </div>

          {/* Key Metrics */}
          <div className="key-metrics">
            <div className="ios-card">
              <div className="ios-container">
                <h4>Key Performance Improvements</h4>
                
                <div className="metrics-grid">
                  <div className="metric-card decision-speed">
                    <div className="metric-header">
                      <span className="metric-icon">⚡</span>
                      <span className="metric-title">Decision Speed</span>
                    </div>
                    
                    <div className="metric-comparison">
                      <div className="comparison-before">
                        <span className="comparison-label">Before:</span>
                        <span className="comparison-value">{formatTime(metrics.decisionSpeed.before)}</span>
                      </div>
                      <div className="comparison-arrow">→</div>
                      <div className="comparison-after">
                        <span className="comparison-label">After:</span>
                        <span className="comparison-value">{formatTime(metrics.decisionSpeed.after)}</span>
                      </div>
                    </div>
                    
                    <div className="metric-savings">
                      <span className="savings-label">Saved:</span>
                      <span className="savings-value">{formatTime(metrics.decisionSpeed.saved)}</span>
                    </div>
                    
                    <div className="metric-impact">
                      <span className="impact-label">Impact:</span>
                      <span className="impact-value">{metrics.decisionSpeed.impact}</span>
                    </div>
                  </div>

                  <div className="metric-card resource-utilization">
                    <div className="metric-header">
                      <span className="metric-icon">🔧</span>
                      <span className="metric-title">Resource Utilization</span>
                    </div>
                    
                    <div className="metric-comparison">
                      <div className="comparison-before">
                        <span className="comparison-label">Before:</span>
                        <span className="comparison-value">{formatPercentage(metrics.resourceUtilization.before)}</span>
                      </div>
                      <div className="comparison-arrow">→</div>
                      <div className="comparison-after">
                        <span className="comparison-label">After:</span>
                        <span className="comparison-value">{formatPercentage(metrics.resourceUtilization.after)}</span>
                      </div>
                    </div>
                    
                    <div className="metric-savings">
                      <span className="savings-label">Freed:</span>
                      <span className="savings-value">{formatPercentage(metrics.resourceUtilization.freed)}</span>
                    </div>
                    
                    <div className="metric-impact">
                      <span className="impact-label">Impact:</span>
                      <span className="impact-value">{metrics.resourceUtilization.impact}</span>
                    </div>
                  </div>

                  <div className="metric-card response-time">
                    <div className="metric-header">
                      <span className="metric-icon">Alert</span>
                      <span className="metric-title">Response Time</span>
                    </div>
                    
                    <div className="metric-comparison">
                      <div className="comparison-before">
                        <span className="comparison-label">Before:</span>
                        <span className="comparison-value">{formatTime(metrics.responseTime.before)}</span>
                      </div>
                      <div className="comparison-arrow">→</div>
                      <div className="comparison-after">
                        <span className="comparison-label">After:</span>
                        <span className="comparison-value">{formatTime(metrics.responseTime.after)}</span>
                      </div>
                    </div>
                    
                    <div className="metric-improvement">
                      <span className="improvement-label">Improvement:</span>
                      <span 
                        className="improvement-value"
                        style={{ color: getImprovementColor(metrics.responseTime.improvement) }}
                      >
                        {formatPercentage(metrics.responseTime.improvement)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Detailed Mode */}
      {viewMode === 'detailed' && (
        <div className="metrics-detailed">
          <div className="ios-card">
            <div className="ios-container">
              <h4>📋 Detailed Metrics Analysis</h4>
              
              <div className="detailed-metrics">
                <div className="detailed-metric">
                  <h5>Decision Speed Analysis</h5>
                  <div className="metric-breakdown">
                    <div className="breakdown-item">
                      <span className="breakdown-label">Average Decision Time (Before):</span>
                      <span className="breakdown-value">{formatTime(metrics.decisionSpeed.before)}</span>
                    </div>
                    <div className="breakdown-item">
                      <span className="breakdown-label">Average Decision Time (After):</span>
                      <span className="breakdown-value">{formatTime(metrics.decisionSpeed.after)}</span>
                    </div>
                    <div className="breakdown-item">
                      <span className="breakdown-label">Time Saved per Decision:</span>
                      <span className="breakdown-value saved">{formatTime(metrics.decisionSpeed.saved)}</span>
                    </div>
                    <div className="breakdown-item">
                      <span className="breakdown-label">Percentage Improvement:</span>
                      <span className="breakdown-value improvement">
                        {Math.round(((metrics.decisionSpeed.before - metrics.decisionSpeed.after) / metrics.decisionSpeed.before) * 100)}%
                      </span>
                    </div>
                    <div className="breakdown-item">
                      <span className="breakdown-label">Impact on Operations:</span>
                      <span className="breakdown-value impact">{metrics.decisionSpeed.impact}</span>
                    </div>
                  </div>
                </div>

                <div className="detailed-metric">
                  <h5>Resource Utilization Analysis</h5>
                  <div className="metric-breakdown">
                    <div className="breakdown-item">
                      <span className="breakdown-label">Efficiency Before:</span>
                      <span className="breakdown-value">{formatPercentage(metrics.resourceUtilization.before)}</span>
                    </div>
                    <div className="breakdown-item">
                      <span className="breakdown-label">Efficiency After:</span>
                      <span className="breakdown-value">{formatPercentage(metrics.resourceUtilization.after)}</span>
                    </div>
                    <div className="breakdown-item">
                      <span className="breakdown-label">Capacity Freed:</span>
                      <span className="breakdown-value freed">{formatPercentage(metrics.resourceUtilization.freed)}</span>
                    </div>
                    <div className="breakdown-item">
                      <span className="breakdown-label">Operational Impact:</span>
                      <span className="breakdown-value impact">{metrics.resourceUtilization.impact}</span>
                    </div>
                  </div>
                </div>

                <div className="detailed-metric">
                  <h5>Response Time Analysis</h5>
                  <div className="metric-breakdown">
                    <div className="breakdown-item">
                      <span className="breakdown-label">Average Response Time (Before):</span>
                      <span className="breakdown-value">{formatTime(metrics.responseTime.before)}</span>
                    </div>
                    <div className="breakdown-item">
                      <span className="breakdown-label">Average Response Time (After):</span>
                      <span className="breakdown-value">{formatTime(metrics.responseTime.after)}</span>
                    </div>
                    <div className="breakdown-item">
                      <span className="breakdown-label">Improvement:</span>
                      <span 
                        className="breakdown-value improvement"
                        style={{ color: getImprovementColor(metrics.responseTime.improvement) }}
                      >
                        {formatPercentage(metrics.responseTime.improvement)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Projections Mode */}
      {viewMode === 'projections' && (
        <div className="metrics-projections">
          <div className="ios-card">
            <div className="ios-container">
              <h4>🎯 Outcome Projections</h4>
              
              <div className="projections-grid">
                <div className="projection-card lives-saved">
                  <div className="projection-header">
                    <span className="projection-icon">💚</span>
                    <span className="projection-title">Lives Saved</span>
                  </div>
                  
                  <div className="projection-main">
                    <div className="projection-estimate">
                      {metrics.outcomeProjection.livesSaved.estimate}
                    </div>
                    <div className="projection-confidence">
                      <span className="confidence-label">Confidence:</span>
                      <span 
                        className="confidence-value"
                        style={{ color: getConfidenceColor(metrics.outcomeProjection.livesSaved.confidence) }}
                      >
                        {getConfidenceLabel(metrics.outcomeProjection.livesSaved.confidence)} ({Math.round(metrics.outcomeProjection.livesSaved.confidence * 100)}%)
                      </span>
                    </div>
                  </div>
                  
                  <div className="projection-description">
                    Estimated lives saved through improved emergency response efficiency
                  </div>
                </div>

                <div className="projection-card injuries-reduced">
                  <div className="projection-header">
                    <span className="projection-icon">🩹</span>
                    <span className="projection-title">Injuries Reduced</span>
                  </div>
                  
                  <div className="projection-main">
                    <div className="projection-estimate">
                      {metrics.outcomeProjection.injuriesReduced.estimate}
                    </div>
                    <div className="projection-confidence">
                      <span className="confidence-label">Confidence:</span>
                      <span 
                        className="confidence-value"
                        style={{ color: getConfidenceColor(metrics.outcomeProjection.injuriesReduced.confidence) }}
                      >
                        {getConfidenceLabel(metrics.outcomeProjection.injuriesReduced.confidence)} ({Math.round(metrics.outcomeProjection.injuriesReduced.confidence * 100)}%)
                      </span>
                    </div>
                  </div>
                  
                  <div className="projection-description">
                    Estimated reduction in injuries through faster response times
                  </div>
                </div>

                <div className="projection-card property-saved">
                  <div className="projection-header">
                    <span className="projection-icon">💰</span>
                    <span className="projection-title">Property Saved</span>
                  </div>
                  
                  <div className="projection-main">
                    <div className="projection-estimate">
                      {formatCurrency(metrics.outcomeProjection.propertySaved.estimate)}
                    </div>
                    <div className="projection-confidence">
                      <span className="confidence-label">Confidence:</span>
                      <span 
                        className="confidence-value"
                        style={{ color: getConfidenceColor(metrics.outcomeProjection.propertySaved.confidence) }}
                      >
                        {getConfidenceLabel(metrics.outcomeProjection.propertySaved.confidence)} ({Math.round(metrics.outcomeProjection.propertySaved.confidence * 100)}%)
                      </span>
                    </div>
                  </div>
                  
                  <div className="projection-description">
                    Estimated property value saved through improved disaster response
                  </div>
                </div>
              </div>

              {/* Impact Summary */}
              <div className="impact-summary">
                <h5>Overall Impact Summary</h5>
                <div className="impact-stats">
                  <div className="impact-stat">
                    <span className="stat-label">Total Lives Impacted:</span>
                    <span className="stat-value">
                      {metrics.outcomeProjection.livesSaved.estimate + metrics.outcomeProjection.injuriesReduced.estimate}
                    </span>
                  </div>
                  <div className="impact-stat">
                    <span className="stat-label">Economic Value:</span>
                    <span className="stat-value">
                      {formatCurrency(metrics.outcomeProjection.propertySaved.estimate)}
                    </span>
                  </div>
                  <div className="impact-stat">
                    <span className="stat-label">Efficiency Gain:</span>
                    <span className="stat-value">
                      {calculateTotalEfficiencyGain()}%
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Real-Time Updates */}
      <div className="real-time-updates">
        <div className="ios-card">
          <div className="ios-container">
            <h4>🔄 Real-Time Updates</h4>
            <div className="update-status">
              <div className="status-indicator">
                <span className="status-dot active"></span>
                <span className="status-text">Live metrics updating every 30 seconds</span>
              </div>
              <div className="last-update">
                Last updated: {new Date().toLocaleTimeString()}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

