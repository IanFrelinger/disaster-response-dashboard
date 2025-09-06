# Error Correlation System

## Overview

The Error Correlation System provides automated cross-referencing of frontend error logs, UI errors, and backend errors to identify patterns, root causes, and correlations across the full stack. This system helps developers quickly identify and resolve issues that span multiple layers of the application.

## Features

### 🔍 **Real-time Error Monitoring**
- **Frontend Error Capture**: Automatically captures JavaScript errors, console warnings, and runtime issues
- **Backend Error Logging**: Centralized error logging with categorization and correlation
- **UI Error Detection**: Monitors user interface errors and validation failures
- **Network Error Tracking**: Captures API failures and connectivity issues

### 🔗 **Intelligent Correlation Engine**
- **Cross-stack Correlation**: Identifies related errors between frontend and backend
- **Temporal Analysis**: Finds errors that occur within specific time windows
- **Pattern Recognition**: Detects recurring error patterns and categories
- **Confidence Scoring**: Provides confidence levels for correlation accuracy

### 📊 **Comprehensive Analysis**
- **Error Categorization**: Automatically categorizes errors (ontology, type, validation, network, performance, runtime)
- **Root Cause Analysis**: Identifies potential root causes and shared dependencies
- **Recommendation Engine**: Generates actionable recommendations based on error patterns
- **Performance Impact**: Tracks performance-related errors and bottlenecks

## Architecture

### Frontend Components

#### ErrorCorrelationService
```typescript
// Real-time error capture and correlation
const errorCorrelationService = new ErrorCorrelationService();

// Log an error
errorCorrelationService.logError({
  level: 'error',
  source: 'frontend',
  category: 'validation',
  message: 'Map initialization failed',
  context: { component: 'MapContainer3D' }
});

// Get correlation analysis
const correlation = errorCorrelationService.getErrorCorrelation();
```

#### ErrorMonitoringPanel
```typescript
// Interactive error monitoring UI
<ErrorMonitoringPanel
  isOpen={showErrorMonitoring}
  onClose={() => setShowErrorMonitoring(false)}
/>
```

### Backend Components

#### Error Correlation API
```python
# RESTful API endpoints for error management
POST /api/errors          # Log new error
GET  /api/errors          # Get errors with filtering
GET  /api/errors/correlations  # Get error correlations
GET  /api/errors/summary      # Get error summary
POST /api/errors/clear        # Clear all errors
```

#### Error Correlation Service
```python
# Backend error correlation and analysis
error_service = ErrorCorrelationService()
error_id = error_service.log_error(error_data)
correlations = error_service.get_correlations()
```

### Analysis Tools

#### Automated Error Analysis Script
```bash
# Run comprehensive error correlation analysis
make analyze-errors

# Output includes:
# - Error categorization and counts
# - Cross-stack correlations
# - Pattern recognition
# - Actionable recommendations
```

## Usage

### 1. Real-time Error Monitoring

The system automatically captures errors across the application:

```typescript
// Frontend errors are automatically captured
window.addEventListener('error', (event) => {
  // Automatically logged by ErrorCorrelationService
});

// Backend errors are logged via API
fetch('/api/errors', {
  method: 'POST',
  body: JSON.stringify({
    level: 'error',
    source: 'backend',
    category: 'ontology',
    message: 'Missing Palantir Foundry dependency'
  })
});
```

### 2. Error Correlation Analysis

Run the automated analysis to get comprehensive insights:

```bash
# Analyze all errors and find correlations
make analyze-errors

# Example output:
# 📊 ERROR CORRELATION ANALYSIS SUMMARY
# =====================================
# Total Errors: 273
#   Frontend: 1
#   Backend: 272
# Critical Issues: 272
# Correlations Found: 5
# Correlation Strength: 80.0%
# Recommendations: 3
```

### 3. Interactive Error Monitoring

Access the real-time error monitoring panel:

1. **Open the Map**: Navigate to the 3D map interface
2. **Click Error Button**: Click the "🔍 Errors" button in the top-right corner
3. **View Correlations**: Explore error correlations and patterns
4. **Filter Errors**: Filter by source, category, or severity
5. **Export Data**: Export error data for further analysis

### 4. API Integration

Integrate error correlation into your development workflow:

```typescript
// Get error correlations programmatically
const response = await fetch('/api/errors/correlations');
const data = await response.json();

// Filter errors by category
const ontologyErrors = data.backend_errors.filter(
  error => error.category === 'ontology'
);

// Get error summary
const summary = await fetch('/api/errors/summary');
const summaryData = await summary.json();
```

## Error Categories

### Frontend Errors
- **Type**: TypeScript compilation errors
- **Runtime**: JavaScript execution errors
- **Validation**: Form and input validation errors
- **Network**: API request failures
- **Performance**: Slow rendering or memory issues

### Backend Errors
- **Ontology**: Palantir Foundry integration issues
- **Type**: Python type checking errors (mypy)
- **Import**: Missing dependencies or module errors
- **Validation**: Data validation and schema errors
- **Network**: External service connectivity issues
- **Performance**: Slow API responses or resource issues

## Correlation Types

### 1. **Causal Correlations**
- Direct cause-and-effect relationships
- High confidence (80-100%)
- Example: Frontend API error caused by backend service failure

### 2. **Temporal Correlations**
- Errors occurring within short time windows
- Medium confidence (60-80%)
- Example: Multiple errors during application startup

### 3. **Contextual Correlations**
- Errors sharing similar context or categories
- Medium confidence (50-70%)
- Example: Multiple ontology-related errors across stacks

### 4. **Pattern Correlations**
- Recurring error patterns
- Variable confidence (40-90%)
- Example: Repeated validation errors in similar components

## Recommendations

The system generates actionable recommendations based on error patterns:

### High Priority
- **Implement Palantir Foundry Integration**: For ontology-related errors
- **Investigate Cross-Stack Correlations**: For shared root causes
- **Fix Critical Type Errors**: For blocking compilation issues

### Medium Priority
- **Improve Type Safety**: Add missing type annotations
- **Resolve Import Dependencies**: Install missing packages
- **Optimize Performance**: Address performance bottlenecks

### Low Priority
- **Enhance Error Handling**: Improve error recovery
- **Update Documentation**: Document error patterns
- **Add Monitoring**: Implement additional monitoring

## Configuration

### Frontend Configuration
```typescript
// ErrorCorrelationService configuration
const errorService = new ErrorCorrelationService();

// Custom error handlers
window.addEventListener('error', (event) => {
  errorService.logError({
    level: 'error',
    source: 'frontend',
    category: 'runtime',
    message: event.message,
    context: { filename: event.filename, lineno: event.lineno }
  });
});
```

### Backend Configuration
```python
# Error correlation service configuration
error_service = ErrorCorrelationService()

# Custom error logging
try:
    # Your code here
    pass
except Exception as e:
    error_service.log_error({
        'level': 'error',
        'source': 'backend',
        'category': 'runtime',
        'message': str(e),
        'context': {'function': 'your_function', 'line': 123}
    })
```

## Integration with CI/CD

### Makefile Targets
```makefile
# Analyze errors as part of validation
validate: lint type test e2e analyze-errors

# Quick error analysis
analyze-errors:
	@echo "🔍 Analyzing error correlations..."
	node scripts/analyze-error-correlations.js
	@echo "✅ Error correlation analysis complete"
```

### GitHub Actions Integration
```yaml
- name: Analyze Error Correlations
  run: make analyze-errors
  if: always()  # Run even if other steps fail
```

## Best Practices

### 1. **Error Logging**
- Log errors with sufficient context
- Use consistent error categories
- Include relevant metadata
- Avoid logging sensitive information

### 2. **Correlation Analysis**
- Run analysis regularly during development
- Investigate high-confidence correlations first
- Use recommendations as guidance, not absolute rules
- Track resolution of identified issues

### 3. **Monitoring**
- Monitor error trends over time
- Set up alerts for critical error patterns
- Review correlations before major releases
- Document resolved error patterns

### 4. **Performance**
- Limit error storage to recent errors (1 hour default)
- Use efficient correlation algorithms
- Cache frequently accessed data
- Clean up old error data regularly

## Troubleshooting

### Common Issues

#### Frontend Errors Not Captured
- Check if ErrorCorrelationService is initialized
- Verify error handlers are properly attached
- Check browser console for service errors

#### Backend API Not Responding
- Ensure error correlation API is enabled
- Check CORS configuration
- Verify API endpoints are accessible

#### Analysis Script Fails
- Check Node.js version compatibility
- Verify all dependencies are installed
- Check file permissions for script execution

#### No Correlations Found
- Ensure sufficient error data is available
- Check correlation confidence thresholds
- Verify error categorization is working

### Debug Mode

Enable debug logging for troubleshooting:

```typescript
// Frontend debug mode
(window as any).errorCorrelationService = errorCorrelationService;
console.log('Error correlation service:', errorCorrelationService);

// Backend debug mode
import logging
logging.basicConfig(level=logging.DEBUG)
```

## Future Enhancements

### Planned Features
- **Machine Learning Integration**: AI-powered error pattern recognition
- **Predictive Analysis**: Predict potential errors before they occur
- **Integration with External Tools**: Connect with monitoring services
- **Advanced Visualization**: Interactive error correlation graphs
- **Automated Fixes**: Suggest and apply automatic fixes for common errors

### Extensibility
- **Custom Error Handlers**: Add application-specific error handling
- **Plugin System**: Extend functionality with custom plugins
- **API Extensions**: Add custom correlation algorithms
- **Export Formats**: Support additional data export formats

## Conclusion

The Error Correlation System provides a comprehensive solution for identifying, analyzing, and resolving errors across the full stack. By automatically correlating frontend, backend, and UI errors, developers can quickly identify root causes and implement effective solutions.

The system is designed to be:
- **Automated**: Minimal manual intervention required
- **Intelligent**: Smart correlation and recommendation algorithms
- **Comprehensive**: Covers all layers of the application
- **Actionable**: Provides clear recommendations for resolution
- **Scalable**: Handles large volumes of error data efficiently

Use this system to improve code quality, reduce debugging time, and enhance overall application reliability.
