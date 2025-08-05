import React, { useState } from 'react';
import { ValidationResult } from '../utils/dataValidation';
import { CheckCircle, AlertTriangle, XCircle, Info, ChevronDown, ChevronUp } from 'lucide-react';

interface DataValidationStatusProps {
  validationResult: ValidationResult | null;
  className?: string;
}

const DataValidationStatus: React.FC<DataValidationStatusProps> = ({ validationResult, className = '' }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!validationResult) {
    return null;
  }

  const { isValid, errors = [], warnings = [], suggestions = [] } = validationResult;
  const hasIssues = errors.length > 0 || warnings.length > 0;
  const totalIssues = errors.length + warnings.length;

  const getStatusIcon = () => {
    if (errors.length > 0) {
      return <XCircle className="w-4 h-4 text-red-500" />;
    } else if (warnings.length > 0) {
      return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
    } else {
      return <CheckCircle className="w-4 h-4 text-green-500" />;
    }
  };

  const getStatusText = () => {
    if (errors.length > 0) {
      return `Validation Failed (${totalIssues} issues)`;
    } else if (warnings.length > 0) {
      return `Validation Passed with Warnings (${warnings.length} warnings)`;
    } else {
      return 'Validation Passed';
    }
  };

  const getStatusColor = () => {
    if (errors.length > 0) {
      return 'border-red-200 bg-red-50';
    } else if (warnings.length > 0) {
      return 'border-yellow-200 bg-yellow-50';
    } else {
      return 'border-green-200 bg-green-50';
    }
  };

  return (
    <div className={`border rounded-lg p-3 ${getStatusColor()} ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          {getStatusIcon()}
          <span className="text-sm font-medium text-gray-900">
            Data Quality Check
          </span>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-xs text-gray-600">
            {getStatusText()}
          </span>
          {hasIssues && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-gray-400 hover:text-gray-600"
            >
              {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          )}
        </div>
      </div>

      {isExpanded && hasIssues && (
        <div className="mt-3 space-y-2">
          {errors.length > 0 && (
            <div>
              <div className="flex items-center space-x-1 mb-1">
                <XCircle className="w-3 h-3 text-red-500" />
                <span className="text-xs font-medium text-red-700">Errors ({errors.length})</span>
              </div>
              <ul className="text-xs text-red-600 space-y-1 ml-4">
                {errors.map((error, index) => (
                  <li key={index} className="list-disc">
                    {error}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {warnings.length > 0 && (
            <div>
              <div className="flex items-center space-x-1 mb-1">
                <AlertTriangle className="w-3 h-3 text-yellow-500" />
                <span className="text-xs font-medium text-yellow-700">Warnings ({warnings.length})</span>
              </div>
              <ul className="text-xs text-yellow-600 space-y-1 ml-4">
                {warnings.map((warning, index) => (
                  <li key={index} className="list-disc">
                    {warning}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {suggestions.length > 0 && (
            <div>
              <div className="flex items-center space-x-1 mb-1">
                <Info className="w-3 h-3 text-blue-500" />
                <span className="text-xs font-medium text-blue-700">Suggestions ({suggestions.length})</span>
              </div>
              <ul className="text-xs text-blue-600 space-y-1 ml-4">
                {suggestions.map((suggestion, index) => (
                  <li key={index} className="list-disc">
                    {suggestion}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {!hasIssues && (
        <div className="mt-2 text-xs text-green-600 flex items-center space-x-1">
          <CheckCircle className="w-3 h-3" />
          <span>All data quality checks passed</span>
        </div>
      )}
    </div>
  );
};

export default DataValidationStatus; 