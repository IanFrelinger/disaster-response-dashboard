/**
 * Tests for DataValidationStatus component
 */

import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, fireEvent } from '@testing-library/react';
import { render } from '../test-utils';
import DataValidationStatus from '../../components/DataValidationStatus';

describe('DataValidationStatus', () => {
  const defaultProps = {
    validationResult: {
      isValid: true,
      errors: [],
      warnings: [],
      suggestions: [],
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders the data validation status component', () => {
      render(<DataValidationStatus {...defaultProps} />);
      
      expect(screen.getByText('Data Quality Check')).toBeInTheDocument();
    });

    it('displays validation passed status when no issues', () => {
      render(<DataValidationStatus {...defaultProps} />);
      
      expect(screen.getByText('Validation Passed')).toBeInTheDocument();
      expect(screen.getByText('All data quality checks passed')).toBeInTheDocument();
    });

    it('displays validation failed status when there are errors', () => {
      const propsWithErrors = {
        validationResult: {
          isValid: false,
          errors: ['Invalid data format'],
          warnings: [],
          suggestions: [],
        },
      };

      render(<DataValidationStatus {...propsWithErrors} />);
      
      expect(screen.getByText('Validation Failed (1 issues)')).toBeInTheDocument();
    });

    it('displays validation passed with warnings when there are warnings', () => {
      const propsWithWarnings = {
        validationResult: {
          isValid: true,
          errors: [],
          warnings: ['Low confidence score'],
          suggestions: [],
        },
      };

      render(<DataValidationStatus {...propsWithWarnings} />);
      
      expect(screen.getByText('Validation Passed with Warnings (1 warnings)')).toBeInTheDocument();
    });

    it('renders nothing when validationResult is null', () => {
      const { container } = render(<DataValidationStatus validationResult={null} />);
      
      expect(container.firstChild).toBeNull();
    });
  });

  describe('Interaction', () => {
    it('expands and collapses when expand button is clicked', () => {
      const propsWithIssues = {
        validationResult: {
          isValid: false,
          errors: ['Invalid data format'],
          warnings: ['Low confidence score'],
          suggestions: [],
        },
      };

      render(<DataValidationStatus {...propsWithIssues} />);
      
      // Initially should not show details
      expect(screen.queryByText('Errors (1)')).not.toBeInTheDocument();
      
      // Click expand button (it's the chevron down icon)
      const expandButton = screen.getByRole('button');
      fireEvent.click(expandButton);
      
      // Should now show details
      expect(screen.getByText('Errors (1)')).toBeInTheDocument();
      expect(screen.getByText('Warnings (1)')).toBeInTheDocument();
      expect(screen.getByText('Invalid data format')).toBeInTheDocument();
      expect(screen.getByText('Low confidence score')).toBeInTheDocument();
      
      // Click again to collapse
      fireEvent.click(expandButton);
      
      // Should hide details again
      expect(screen.queryByText('Errors (1)')).not.toBeInTheDocument();
    });

    it('does not show expand button when there are no issues', () => {
      render(<DataValidationStatus {...defaultProps} />);
      
      expect(screen.queryByRole('button')).not.toBeInTheDocument();
    });
  });

  describe('Error Display', () => {
    it('displays multiple errors correctly', () => {
      const propsWithMultipleErrors = {
        validationResult: {
          isValid: false,
          errors: ['Error 1', 'Error 2', 'Error 3'],
          warnings: [],
          suggestions: [],
        },
      };

      render(<DataValidationStatus {...propsWithMultipleErrors} />);
      
      const expandButton = screen.getByRole('button');
      fireEvent.click(expandButton);
      
      expect(screen.getByText('Errors (3)')).toBeInTheDocument();
      expect(screen.getByText('Error 1')).toBeInTheDocument();
      expect(screen.getByText('Error 2')).toBeInTheDocument();
      expect(screen.getByText('Error 3')).toBeInTheDocument();
    });
  });

  describe('Warning Display', () => {
    it('displays multiple warnings correctly', () => {
      const propsWithMultipleWarnings = {
        validationResult: {
          isValid: true,
          errors: [],
          warnings: ['Warning 1', 'Warning 2'],
          suggestions: [],
        },
      };

      render(<DataValidationStatus {...propsWithMultipleWarnings} />);
      
      const expandButton = screen.getByRole('button');
      fireEvent.click(expandButton);
      
      expect(screen.getByText('Warnings (2)')).toBeInTheDocument();
      expect(screen.getByText('Warning 1')).toBeInTheDocument();
      expect(screen.getByText('Warning 2')).toBeInTheDocument();
    });
  });

  describe('Suggestions Display', () => {
    it('displays suggestions correctly', () => {
      const propsWithSuggestions = {
        validationResult: {
          isValid: true,
          errors: [],
          warnings: [],
          suggestions: ['Consider updating data', 'Add more validation'],
        },
      };

      render(<DataValidationStatus {...propsWithSuggestions} />);
      
      // When there are only suggestions (no errors/warnings), suggestions are not shown
      // Only the success message is displayed
      expect(screen.getByText('All data quality checks passed')).toBeInTheDocument();
      // Suggestions are not displayed when there are no errors/warnings
    });
  });

  describe('Visual Design', () => {
    it('applies custom className when provided', () => {
      render(<DataValidationStatus {...defaultProps} className="custom-class" />);
      
      const container = screen.getByText('Data Quality Check').closest('div')?.parentElement?.parentElement;
      expect(container).toHaveClass('custom-class');
    });

    it('applies correct styling for different states', () => {
      // Test valid state
      const { rerender } = render(<DataValidationStatus {...defaultProps} />);
      let container = screen.getByText('Data Quality Check').closest('div')?.parentElement?.parentElement;
      expect(container).toHaveClass('border-green-200', 'bg-green-50');
      
      // Test error state
      const propsWithErrors = {
        validationResult: {
          isValid: false,
          errors: ['Error'],
          warnings: [],
          suggestions: [],
        },
      };
      rerender(<DataValidationStatus {...propsWithErrors} />);
      container = screen.getByText('Data Quality Check').closest('div')?.parentElement?.parentElement;
      expect(container).toHaveClass('border-red-200', 'bg-red-50');
      
      // Test warning state
      const propsWithWarnings = {
        validationResult: {
          isValid: true,
          errors: [],
          warnings: ['Warning'],
          suggestions: [],
        },
      };
      rerender(<DataValidationStatus {...propsWithWarnings} />);
      container = screen.getByText('Data Quality Check').closest('div')?.parentElement?.parentElement;
      expect(container).toHaveClass('border-yellow-200', 'bg-yellow-50');
    });
  });

  describe('Edge Cases', () => {
    it('handles empty validation result gracefully', () => {
      const emptyResult = {
        validationResult: {
          isValid: true,
          errors: [],
          warnings: [],
          suggestions: [],
        },
      };

      render(<DataValidationStatus {...emptyResult} />);
      
      expect(screen.getByText('Validation Passed')).toBeInTheDocument();
      expect(screen.getByText('All data quality checks passed')).toBeInTheDocument();
    });

    it('handles very long error messages', () => {
      const longError = 'This is a very long error message that might cause layout issues if not handled properly by the component';
      const propsWithLongError = {
        validationResult: {
          isValid: false,
          errors: [longError],
          warnings: [],
          suggestions: [],
        },
      };

      render(<DataValidationStatus {...propsWithLongError} />);
      
      const expandButton = screen.getByRole('button');
      fireEvent.click(expandButton);
      
      expect(screen.getByText(longError)).toBeInTheDocument();
    });
  });
}); 