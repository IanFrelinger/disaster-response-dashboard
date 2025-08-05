# Data Validation Guide

This guide explains the data validation system that ensures synthetic data looks realistic and professional for the disaster response dashboard.

## 🎯 **Overview**

The validation system automatically checks synthetic data for:
- **Geographic realism** - Ensures data is within expected bounds
- **Statistical consistency** - Validates relationships between data points
- **Temporal coherence** - Checks timestamps and data freshness
- **Cross-validation** - Ensures different data types are consistent with each other

## 🔍 **Validation Rules**

### **Geographic Constraints**
- **Bounds**: San Francisco Bay Area (37.4°N to 38.2°N, 122.8°W to 121.8°W)
- **Hazard Zones**: Must be within geographic bounds
- **Routes**: Origins and destinations must be within bounds
- **Risk Assessments**: Location must be within bounds

### **Hazard Zone Validation**
- **Count**: 5-50 hazard zones
- **Risk Scores**: 0.1-1.0 (realistic range)
- **Confidence**: 50-100% (reasonable confidence levels)
- **Brightness**: 200-600 (for high/critical risk zones)
- **Data Sources**: Must be FIRMS, NOAA, or USGS
- **Timestamps**: Should be recent (within 48 hours)

### **Route Validation**
- **Count**: 3-20 routes
- **Distance**: 0.5-50km (realistic evacuation distances)
- **Time**: 1-120 minutes (reasonable travel times)
- **Time/Distance Ratio**: 1-10 minutes per km
- **Safe Route Percentage**: 30-90% (realistic safety rates)

### **Risk Assessment Validation**
- **Nearby Hazards**: 0-15 hazards within radius
- **Risk Scores**: 0.0-1.0 (valid probability range)
- **Assessment Radius**: 5-25km (reasonable analysis area)
- **Closest Hazard Distance**: 0.1-20km

### **Summary Validation**
- **Total Hazards**: 10-100 (realistic total count)
- **Data Sources**: 2-5 different sources
- **Consistency**: Distribution totals must match hazard counts

## 🛠️ **How It Works**

### **1. Automatic Validation**
```typescript
// Data is automatically validated when generated
const data = SyntheticDataGenerator.generateDashboardData();
// Validation happens internally and logs results
```

### **2. Manual Validation**
```typescript
import { validateData, logValidationResults } from '../utils/dataValidation';

const validationResult = validateData(dashboardData);
logValidationResults(validationResult, 'Custom Validation');
```

### **3. Custom Rules**
```typescript
import { DataValidator, ValidationRules } from '../utils/dataValidation';

const customRules: ValidationRules = {
  geographicBounds: {
    minLat: 37.0,
    maxLat: 38.5,
    minLng: -123.0,
    maxLng: -121.0,
  },
  // ... other custom rules
};

const validator = new DataValidator(customRules);
const result = validator.validateDashboardData(data);
```

## 📊 **Validation Results**

### **Result Types**
- **✅ Valid**: Data passes all checks
- **⚠️ Warnings**: Data has unusual but acceptable values
- **❌ Errors**: Data has invalid values that should be fixed

### **Example Validation Output**
```
[DEMO] Data Validation - Validation passed
[DEMO] Data Validation - Warnings: [
  "Hazard 3: Unusual confidence 45% (should be between 50 and 100)",
  "Route 2: Unusual time/distance ratio 12.5 min/km"
]
```

## 🎨 **UI Integration**

### **Validation Status Component**
The dashboard includes a `DataValidationStatus` component that shows:
- **Status Icon**: Green check, yellow warning, or red error
- **Summary Text**: "Validation Passed" or "Validation Failed (X issues)"
- **Expandable Details**: Click to see specific errors and warnings
- **Color Coding**: Green for success, yellow for warnings, red for errors

### **Visual Indicators**
- **Green Border**: All validations passed
- **Yellow Border**: Warnings present
- **Red Border**: Errors detected
- **Expandable List**: Detailed issue breakdown

## 🔧 **Configuration**

### **Environment-Specific Validation**
```typescript
// Demo mode: Strict validation
const demoRules = {
  ...DEFAULT_VALIDATION_RULES,
  hazardZones: {
    ...DEFAULT_VALIDATION_RULES.hazardZones,
    minCount: 10, // More strict for demos
    maxCount: 30,
  }
};

// Debug mode: Relaxed validation
const debugRules = {
  ...DEFAULT_VALIDATION_RULES,
  hazardZones: {
    ...DEFAULT_VALIDATION_RULES.hazardZones,
    minCount: 1, // Allow fewer hazards for testing
    maxCount: 100,
  }
};
```

### **Scenario-Specific Rules**
```typescript
// Wildfire scenario: More critical hazards
const wildfireRules = {
  ...DEFAULT_VALIDATION_RULES,
  hazardZones: {
    ...DEFAULT_VALIDATION_RULES.hazardZones,
    maxCount: 40, // Allow more hazards
  }
};
```

## 🚨 **Common Issues & Solutions**

### **1. Geographic Bounds Violations**
**Issue**: Data points outside San Francisco Bay Area
**Solution**: Check coordinate generation in synthetic data

### **2. Inconsistent Counts**
**Issue**: Summary total doesn't match actual hazard count
**Solution**: Ensure summary generation uses actual data

### **3. Unrealistic Values**
**Issue**: Risk scores outside 0-1 range
**Solution**: Validate random number generation

### **4. Temporal Issues**
**Issue**: Data appears too old
**Solution**: Check timestamp generation logic

## 📈 **Performance Considerations**

### **Validation Overhead**
- **Lightweight**: Validation adds minimal performance impact
- **Async**: Validation runs in background
- **Caching**: Results cached to avoid re-validation

### **Optimization Tips**
```typescript
// Only validate in development/demo modes
if (environment.mode === 'demo' || environment.mode === 'debug') {
  const validation = validateData(data);
  logValidationResults(validation);
}

// Skip validation for production performance
if (environment.mode === 'production') {
  // Skip validation
}
```

## 🧪 **Testing Validation**

### **Test Different Scenarios**
```typescript
// Test with valid data
const validData = generateValidTestData();
const result = validateData(validData);
console.log('Valid data result:', result.isValid); // Should be true

// Test with invalid data
const invalidData = generateInvalidTestData();
const result2 = validateData(invalidData);
console.log('Invalid data result:', result2.isValid); // Should be false
```

### **Test Custom Rules**
```typescript
const customValidator = new DataValidator(customRules);
const result = customValidator.validateDashboardData(testData);
```

## 🔮 **Future Enhancements**

### **Planned Features**
1. **Machine Learning Validation**: Use ML to detect unrealistic patterns
2. **Historical Data Comparison**: Compare against real historical data
3. **Real-time Validation**: Validate data as it's generated
4. **User Feedback Integration**: Learn from user corrections

### **Advanced Validation**
```typescript
// Future: ML-based validation
const mlValidator = new MLDataValidator({
  modelPath: '/models/validation-model.json',
  confidenceThreshold: 0.8,
  historicalData: historicalHazardData
});

const result = mlValidator.validate(data);
```

## 📚 **Best Practices**

### **1. Regular Validation**
- Validate data after each generation
- Log validation results for debugging
- Monitor validation failure rates

### **2. User Experience**
- Show validation status in UI
- Provide clear error messages
- Allow users to regenerate invalid data

### **3. Performance**
- Cache validation results
- Skip validation in production
- Use async validation for large datasets

### **4. Maintenance**
- Update validation rules as requirements change
- Monitor false positive/negative rates
- Document rule changes

This validation system ensures that synthetic data always looks professional and realistic, providing a better user experience for demos and presentations. 