/**
 * Error Monitoring Panel
 * Displays real-time error correlations and analysis
 */

import React, { useState, useEffect } from 'react';
import { errorCorrelationService, ErrorCorrelation, ErrorEvent } from '../services/ErrorCorrelationService';

interface ErrorMonitoringPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ErrorMonitoringPanel: React.FC<ErrorMonitoringPanelProps> = ({ isOpen, onClose }) => {
  const [correlation, setCorrelation] = useState<ErrorCorrelation | null>(null);
  const [selectedError, setSelectedError] = useState<ErrorEvent | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [filter, setFilter] = useState<{
    source?: string;
    category?: string;
    level?: string;
  }>({});

  useEffect(() => {
    if (!isOpen) return;

    const updateCorrelation = () => {
      const data = errorCorrelationService.getErrorCorrelation();
      setCorrelation(data);
    };

    updateCorrelation();

    if (autoRefresh) {
      const interval = setInterval(updateCorrelation, 2000); // Update every 2 seconds
      return () => clearInterval(interval);
    }
    
    return undefined;
  }, [isOpen, autoRefresh]);

  if (!isOpen) return null;

  const filteredErrors = (errors: ErrorEvent[]) => {
    return errors.filter(error => {
      if (filter.source && error.source !== filter.source) return false;
      if (filter.category && error.category !== filter.category) return false;
      if (filter.level && error.level !== filter.level) return false;
      return true;
    });
  };

  const getErrorIcon = (level: string) => {
    switch (level) {
      case 'error': return '🔴';
      case 'warning': return '🟡';
      case 'info': return '🔵';
      default: return '⚪';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'ontology': return 'bg-purple-100 text-purple-800';
      case 'type': return 'bg-blue-100 text-blue-800';
      case 'validation': return 'bg-yellow-100 text-yellow-800';
      case 'network': return 'bg-red-100 text-red-800';
      case 'performance': return 'bg-green-100 text-green-800';
      case 'runtime': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString();
  };

  const exportData = () => {
    const data = errorCorrelationService.exportErrorData();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `error-correlation-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-xl w-11/12 h-5/6 max-w-7xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-xl font-bold">Error Correlation Monitor</h2>
          <div className="flex items-center space-x-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={autoRefresh}
                onChange={(e) => setAutoRefresh(e.target.checked)}
                className="mr-2"
              />
              Auto-refresh
            </label>
            <button
              onClick={exportData}
              className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Export
            </button>
            <button
              onClick={onClose}
              className="px-3 py-1 bg-gray-500 text-white rounded hover:bg-gray-600"
            >
              Close
            </button>
          </div>
        </div>

        <div className="flex-1 flex overflow-hidden">
          {/* Sidebar - Error List */}
          <div className="w-1/3 border-r flex flex-col">
            <div className="p-4 border-b">
              <h3 className="font-semibold mb-2">Filters</h3>
              <div className="space-y-2">
                <select
                  value={filter.source || ''}
                  onChange={(e) => setFilter({ ...filter, source: e.target.value || undefined })}
                  className="w-full p-1 border rounded"
                >
                  <option value="">All Sources</option>
                  <option value="frontend">Frontend</option>
                  <option value="backend">Backend</option>
                  <option value="ui">UI</option>
                  <option value="network">Network</option>
                </select>
                <select
                  value={filter.category || ''}
                  onChange={(e) => setFilter({ ...filter, category: e.target.value || undefined })}
                  className="w-full p-1 border rounded"
                >
                  <option value="">All Categories</option>
                  <option value="ontology">Ontology</option>
                  <option value="type">Type</option>
                  <option value="validation">Validation</option>
                  <option value="network">Network</option>
                  <option value="performance">Performance</option>
                  <option value="runtime">Runtime</option>
                </select>
                <select
                  value={filter.level || ''}
                  onChange={(e) => setFilter({ ...filter, level: e.target.value || undefined })}
                  className="w-full p-1 border rounded"
                >
                  <option value="">All Levels</option>
                  <option value="error">Error</option>
                  <option value="warning">Warning</option>
                  <option value="info">Info</option>
                </select>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto">
              <h3 className="font-semibold p-4 border-b">Recent Errors</h3>
              {correlation && (
                <div className="space-y-2 p-2">
                  {filteredErrors([
                    ...correlation.frontendErrors,
                    ...correlation.backendErrors,
                    ...correlation.uiErrors,
                    ...correlation.networkErrors
                  ])
                    .sort((a, b) => b.timestamp - a.timestamp)
                    .map((error) => (
                      <div
                        key={error.id}
                        onClick={() => setSelectedError(error)}
                        className={`p-3 rounded cursor-pointer border ${
                          selectedError?.id === error.id
                            ? 'bg-blue-100 border-blue-300'
                            : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">
                            {getErrorIcon(error.level)} {error.source}
                          </span>
                          <span className="text-xs text-gray-500">
                            {formatTimestamp(error.timestamp)}
                          </span>
                        </div>
                        <div className="mt-1">
                          <span className={`px-2 py-1 rounded text-xs ${getCategoryColor(error.category)}`}>
                            {error.category}
                          </span>
                        </div>
                        <div className="mt-2 text-sm text-gray-700 truncate">
                          {error.message}
                        </div>
                        {error.relatedErrors && error.relatedErrors.length > 0 && (
                          <div className="mt-1 text-xs text-blue-600">
                            {error.relatedErrors.length} related error(s)
                          </div>
                        )}
                      </div>
                    ))}
                </div>
              )}
            </div>
          </div>

          {/* Main Content - Error Details and Correlations */}
          <div className="flex-1 flex flex-col">
            {selectedError ? (
              <>
                {/* Error Details */}
                <div className="p-4 border-b">
                  <h3 className="font-semibold mb-2">Error Details</h3>
                  <div className="space-y-2">
                    <div>
                      <span className="font-medium">ID:</span> {selectedError.id}
                    </div>
                    <div>
                      <span className="font-medium">Message:</span> {selectedError.message}
                    </div>
                    <div>
                      <span className="font-medium">Source:</span> {selectedError.source}
                    </div>
                    <div>
                      <span className="font-medium">Category:</span> {selectedError.category}
                    </div>
                    <div>
                      <span className="font-medium">Level:</span> {selectedError.level}
                    </div>
                    <div>
                      <span className="font-medium">Timestamp:</span> {formatTimestamp(selectedError.timestamp)}
                    </div>
                    {selectedError.stack && (
                      <div>
                        <span className="font-medium">Stack:</span>
                        <pre className="mt-1 p-2 bg-gray-100 rounded text-xs overflow-x-auto">
                          {selectedError.stack}
                        </pre>
                      </div>
                    )}
                    {selectedError.context && Object.keys(selectedError.context).length > 0 && (
                      <div>
                        <span className="font-medium">Context:</span>
                        <pre className="mt-1 p-2 bg-gray-100 rounded text-xs overflow-x-auto">
                          {JSON.stringify(selectedError.context, null, 2)}
                        </pre>
                      </div>
                    )}
                  </div>
                </div>

                {/* Related Errors */}
                {selectedError.relatedErrors && selectedError.relatedErrors.length > 0 && (
                  <div className="p-4 border-b">
                    <h3 className="font-semibold mb-2">Related Errors</h3>
                    <div className="space-y-2">
                      {selectedError.relatedErrors.map((relatedId) => {
                        const relatedError = [
                          ...correlation!.frontendErrors,
                          ...correlation!.backendErrors,
                          ...correlation!.uiErrors,
                          ...correlation!.networkErrors
                        ].find(e => e.id === relatedId);
                        
                        if (!relatedError) return null;
                        
                        return (
                          <div
                            key={relatedId}
                            onClick={() => setSelectedError(relatedError)}
                            className="p-2 bg-gray-50 rounded cursor-pointer hover:bg-gray-100"
                          >
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-medium">
                                {getErrorIcon(relatedError.level)} {relatedError.source}
                              </span>
                              <span className="text-xs text-gray-500">
                                {formatTimestamp(relatedError.timestamp)}
                              </span>
                            </div>
                            <div className="mt-1 text-sm text-gray-700 truncate">
                              {relatedError.message}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="p-4">
                <p className="text-gray-500">Select an error to view details</p>
              </div>
            )}

            {/* Correlations */}
            {correlation && correlation.correlations.length > 0 && (
              <div className="p-4 border-t">
                <h3 className="font-semibold mb-2">Error Correlations</h3>
                <div className="space-y-2">
                  {correlation.correlations.map((corr, index) => (
                    <div key={index} className="p-3 bg-yellow-50 rounded border">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{corr.description}</span>
                        <span className="text-sm text-gray-500">
                          Confidence: {Math.round(corr.confidence * 100)}%
                        </span>
                      </div>
                      <div className="mt-1 text-sm text-gray-600">
                        Type: {corr.type} | Errors: {corr.errors.length}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Summary */}
            {correlation && (
              <div className="p-4 border-t bg-gray-50">
                <h3 className="font-semibold mb-2">Summary</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Total Errors:</span> {correlation.summary.totalErrors}
                  </div>
                  <div>
                    <span className="font-medium">Critical Errors:</span> {correlation.summary.criticalErrors}
                  </div>
                  <div>
                    <span className="font-medium">Resolved Errors:</span> {correlation.summary.resolvedErrors}
                  </div>
                  <div>
                    <span className="font-medium">Patterns:</span> {correlation.summary.patterns.length}
                  </div>
                </div>
                
                {correlation.summary.recommendations.length > 0 && (
                  <div className="mt-4">
                    <h4 className="font-medium mb-2">Recommendations:</h4>
                    <ul className="space-y-1 text-sm">
                      {correlation.summary.recommendations.map((rec, index) => (
                        <li key={index} className="flex items-start">
                          <span className="mr-2">•</span>
                          <span>{rec}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
