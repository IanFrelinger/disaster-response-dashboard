import { HazardZone, SafeRoute, RiskAssessment, HazardSummary, EvacuationRoutesResponse } from '../types/hazard';
import { logger } from '../config/environment';

// Validation rules and constraints for realistic data
export interface ValidationRules {
  // Geographic constraints
  geographicBounds: {
    minLat: number;
    maxLat: number;
    minLng: number;
    maxLng: number;
  };
  
  // Hazard zone constraints
  hazardZones: {
    minCount: number;
    maxCount: number;
    minRiskScore: number;
    maxRiskScore: number;
    minConfidence: number;
    maxConfidence: number;
    minBrightness: number;
    maxBrightness: number;
  };
  
  // Route constraints
  routes: {
    minCount: number;
    maxCount: number;
    minDistance: number;
    maxDistance: number;
    minTime: number;
    maxTime: number;
  };
  
  // Risk assessment constraints
  riskAssessment: {
    minNearbyHazards: number;
    maxNearbyHazards: number;
    minRiskScore: number;
    maxRiskScore: number;
    minDistance: number;
    maxDistance: number;
  };
  
  // Summary constraints
  summary: {
    minTotalHazards: number;
    maxTotalHazards: number;
    minDataSources: number;
    maxDataSources: number;
  };
}

// Default validation rules for San Francisco Bay Area
export const DEFAULT_VALIDATION_RULES: ValidationRules = {
  geographicBounds: {
    minLat: 37.4,
    maxLat: 38.2,
    minLng: -122.8,
    maxLng: -121.8,
  },
  hazardZones: {
    minCount: 5,
    maxCount: 50,
    minRiskScore: 0.1,
    maxRiskScore: 1.0,
    minConfidence: 50,
    maxConfidence: 100,
    minBrightness: 200,
    maxBrightness: 600,
  },
  routes: {
    minCount: 3,
    maxCount: 20,
    minDistance: 0.5,
    maxDistance: 50,
    minTime: 1,
    maxTime: 120,
  },
  riskAssessment: {
    minNearbyHazards: 0,
    maxNearbyHazards: 15,
    minRiskScore: 0.0,
    maxRiskScore: 1.0,
    minDistance: 0.1,
    maxDistance: 20,
  },
  summary: {
    minTotalHazards: 10,
    maxTotalHazards: 100,
    minDataSources: 2,
    maxDataSources: 5,
  },
};

// Validation result interface
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  suggestions: string[];
}

// Data validation class
export class DataValidator {
  private rules: ValidationRules;

  constructor(rules: ValidationRules = DEFAULT_VALIDATION_RULES) {
    this.rules = rules;
  }

  // Validate complete dashboard data
  validateDashboardData(data: any): ValidationResult {
    const result: ValidationResult = {
      isValid: true,
      errors: [],
      warnings: [],
      suggestions: [],
    };

    // Validate each component
    if (data.hazardZones) {
      const hazardResult = this.validateHazardZones(data.hazardZones);
      this.mergeResults(result, hazardResult);
    }

    if (data.safeRoutes) {
      const routeResult = this.validateSafeRoutes(data.safeRoutes);
      this.mergeResults(result, routeResult);
    }

    if (data.riskAssessment) {
      const riskResult = this.validateRiskAssessment(data.riskAssessment);
      this.mergeResults(result, riskResult);
    }

    if (data.hazardSummary) {
      const summaryResult = this.validateHazardSummary(data.hazardSummary);
      this.mergeResults(result, summaryResult);
    }

    if (data.evacuationRoutes) {
      const evacuationResult = this.validateEvacuationRoutes(data.evacuationRoutes);
      this.mergeResults(result, evacuationResult);
    }

    // Cross-validation checks
    this.validateDataConsistency(data, result);

    return result;
  }

  // Validate hazard zones
  validateHazardZones(hazardZones: HazardZone[]): ValidationResult {
    const result: ValidationResult = {
      isValid: true,
      errors: [],
      warnings: [],
      suggestions: [],
    };

    const { minCount, maxCount, minRiskScore, maxRiskScore, minConfidence, maxConfidence, minBrightness, maxBrightness } = this.rules.hazardZones;

    // Check count
    if (hazardZones.length < minCount) {
      result.errors.push(`Too few hazard zones: ${hazardZones.length} (minimum: ${minCount})`);
      result.isValid = false;
    } else if (hazardZones.length > maxCount) {
      result.warnings.push(`Many hazard zones: ${hazardZones.length} (maximum: ${maxCount})`);
    }

    // Validate each hazard zone
    hazardZones.forEach((zone, index) => {
      // Check risk score
      if (zone.riskScore < minRiskScore || zone.riskScore > maxRiskScore) {
        result.errors.push(`Hazard ${index + 1}: Invalid risk score ${zone.riskScore} (should be between ${minRiskScore} and ${maxRiskScore})`);
        result.isValid = false;
      }

      // Check confidence
      if (zone.confidence && (zone.confidence < minConfidence || zone.confidence > maxConfidence)) {
        result.warnings.push(`Hazard ${index + 1}: Unusual confidence ${zone.confidence}% (should be between ${minConfidence} and ${maxConfidence})`);
      }

      // Check brightness for high-risk zones
      if (zone.brightness && (zone.riskLevel === 'high' || zone.riskLevel === 'critical')) {
        if (zone.brightness < minBrightness || zone.brightness > maxBrightness) {
          result.warnings.push(`Hazard ${index + 1}: Unusual brightness ${zone.brightness} for ${zone.riskLevel} risk (should be between ${minBrightness} and ${maxBrightness})`);
        }
      }

      // Check geographic bounds
      const coords = this.extractCoordinates(zone.geometry);
      if (!this.isWithinBounds(coords)) {
        result.errors.push(`Hazard ${index + 1}: Outside geographic bounds`);
        result.isValid = false;
      }

      // Check data source
      if (!['FIRMS', 'NOAA', 'USGS'].includes(zone.dataSource)) {
        result.warnings.push(`Hazard ${index + 1}: Unknown data source: ${zone.dataSource}`);
      }

      // Check timestamps
      const lastUpdated = new Date(zone.lastUpdated);
      const now = new Date();
      const hoursDiff = (now.getTime() - lastUpdated.getTime()) / (1000 * 60 * 60);
      
      if (hoursDiff > 48) {
        result.warnings.push(`Hazard ${index + 1}: Data is ${Math.round(hoursDiff)} hours old`);
      }
    });

    // Check risk level distribution
    const riskDistribution = this.getRiskDistribution(hazardZones);
    this.validateRiskDistribution(riskDistribution, result);

    return result;
  }

  // Validate safe routes
  validateSafeRoutes(routes: SafeRoute[]): ValidationResult {
    const result: ValidationResult = {
      isValid: true,
      errors: [],
      warnings: [],
      suggestions: [],
    };

    const { minCount, maxCount, minDistance, maxDistance, minTime, maxTime } = this.rules.routes;

    // Check count
    if (routes.length < minCount) {
      result.errors.push(`Too few routes: ${routes.length} (minimum: ${minCount})`);
      result.isValid = false;
    } else if (routes.length > maxCount) {
      result.warnings.push(`Many routes: ${routes.length} (maximum: ${maxCount})`);
    }

    // Validate each route
    routes.forEach((route, index) => {
      // Check distance
      if (route.distance < minDistance || route.distance > maxDistance) {
        result.warnings.push(`Route ${index + 1}: Unusual distance ${route.distance.toFixed(1)}km (should be between ${minDistance} and ${maxDistance}km)`);
      }

      // Check estimated time
      if (route.estimatedTime < minTime || route.estimatedTime > maxTime) {
        result.warnings.push(`Route ${index + 1}: Unusual time ${route.estimatedTime.toFixed(1)}min (should be between ${minTime} and ${maxTime}min)`);
      }

      // Check time/distance ratio (should be reasonable)
      const timePerKm = route.estimatedTime / route.distance;
      if (timePerKm < 1 || timePerKm > 10) {
        result.warnings.push(`Route ${index + 1}: Unusual time/distance ratio ${timePerKm.toFixed(1)} min/km`);
      }

      // Check geographic bounds
      if (!this.isWithinBounds([route.origin, route.destination])) {
        result.errors.push(`Route ${index + 1}: Origin or destination outside geographic bounds`);
        result.isValid = false;
      }
    });

    // Check safe route percentage
    const safeRoutes = routes.filter(r => r.hazardAvoided);
    const safePercentage = (safeRoutes.length / routes.length) * 100;
    
    if (safePercentage < 30) {
      result.warnings.push(`Low percentage of safe routes: ${safePercentage.toFixed(1)}%`);
    } else if (safePercentage > 90) {
      result.warnings.push(`Very high percentage of safe routes: ${safePercentage.toFixed(1)}%`);
    }

    return result;
  }

  // Validate risk assessment
  validateRiskAssessment(assessment: RiskAssessment): ValidationResult {
    const result: ValidationResult = {
      isValid: true,
      errors: [],
      warnings: [],
      suggestions: [],
    };

    const { minNearbyHazards, maxNearbyHazards, minRiskScore, maxRiskScore, minDistance, maxDistance } = this.rules.riskAssessment;

    // Check nearby hazards count
    if (assessment.totalNearbyHazards < minNearbyHazards || assessment.totalNearbyHazards > maxNearbyHazards) {
      result.warnings.push(`Unusual nearby hazards count: ${assessment.totalNearbyHazards} (should be between ${minNearbyHazards} and ${maxNearbyHazards})`);
    }

    // Check risk scores
    if (assessment.avgRiskScore < minRiskScore || assessment.avgRiskScore > maxRiskScore) {
      result.warnings.push(`Unusual average risk score: ${assessment.avgRiskScore.toFixed(3)} (should be between ${minRiskScore} and ${maxRiskScore})`);
    }

    if (assessment.maxRiskScore < minRiskScore || assessment.maxRiskScore > maxRiskScore) {
      result.warnings.push(`Unusual max risk score: ${assessment.maxRiskScore.toFixed(3)} (should be between ${minRiskScore} and ${maxRiskScore})`);
    }

    // Check closest hazard distance
    if (assessment.closestHazardDistanceKm !== null) {
      if (assessment.closestHazardDistanceKm < minDistance || assessment.closestHazardDistanceKm > maxDistance) {
        result.warnings.push(`Unusual closest hazard distance: ${assessment.closestHazardDistanceKm.toFixed(1)}km (should be between ${minDistance} and ${maxDistance}km)`);
      }
    }

    // Check assessment radius
    if (assessment.assessmentRadiusKm < 5 || assessment.assessmentRadiusKm > 25) {
      result.warnings.push(`Unusual assessment radius: ${assessment.assessmentRadiusKm}km (should be between 5 and 25km)`);
    }

    // Check location bounds
    if (!this.isWithinBounds([[assessment.location.longitude, assessment.location.latitude]])) {
      result.errors.push(`Assessment location outside geographic bounds`);
      result.isValid = false;
    }

    return result;
  }

  // Validate hazard summary
  validateHazardSummary(summary: HazardSummary): ValidationResult {
    const result: ValidationResult = {
      isValid: true,
      errors: [],
      warnings: [],
      suggestions: [],
    };

    const { minTotalHazards, maxTotalHazards, minDataSources, maxDataSources } = this.rules.summary;

    // Check total hazards
    if (summary.totalHazards < minTotalHazards || summary.totalHazards > maxTotalHazards) {
      result.warnings.push(`Unusual total hazards: ${summary.totalHazards} (should be between ${minTotalHazards} and ${maxTotalHazards})`);
    }

    // Check data sources
    const dataSourceCount = Object.keys(summary.dataSources).length;
    if (dataSourceCount < minDataSources || dataSourceCount > maxDataSources) {
      result.warnings.push(`Unusual number of data sources: ${dataSourceCount} (should be between ${minDataSources} and ${maxDataSources})`);
    }

    // Check risk distribution
    const totalFromDistribution = Object.values(summary.riskDistribution).reduce((sum, count) => sum + count, 0);
    if (totalFromDistribution !== summary.totalHazards) {
      result.errors.push(`Risk distribution total (${totalFromDistribution}) doesn't match total hazards (${summary.totalHazards})`);
      result.isValid = false;
    }

    // Check data source distribution
    const totalFromSources = Object.values(summary.dataSources).reduce((sum, count) => sum + count, 0);
    if (totalFromSources !== summary.totalHazards) {
      result.warnings.push(`Data source total (${totalFromSources}) doesn't match total hazards (${summary.totalHazards})`);
    }

    return result;
  }

  // Validate evacuation routes
  validateEvacuationRoutes(evacuation: EvacuationRoutesResponse): ValidationResult {
    const result: ValidationResult = {
      isValid: true,
      errors: [],
      warnings: [],
      suggestions: [],
    };

    // Check route count consistency
    if (evacuation.routes.length !== evacuation.availableRoutes) {
      result.warnings.push(`Route count mismatch: ${evacuation.routes.length} routes vs ${evacuation.availableRoutes} available`);
    }

    // Check hazard count
    if (evacuation.hazardCount < 0 || evacuation.hazardCount > 100) {
      result.warnings.push(`Unusual hazard count: ${evacuation.hazardCount}`);
    }

    // Validate individual routes
    const routeResult = this.validateSafeRoutes(evacuation.routes);
    this.mergeResults(result, routeResult);

    return result;
  }

  // Cross-validation checks
  private validateDataConsistency(data: any, result: ValidationResult): void {
    // Check if hazard counts are consistent
    if (data.hazardSummary && data.hazardZones) {
      if (data.hazardSummary.totalHazards !== data.hazardZones.length) {
        result.warnings.push(`Hazard count mismatch: summary shows ${data.hazardSummary.totalHazards}, but ${data.hazardZones.length} zones exist`);
      }
    }

    // Check if risk assessment location is reasonable
    if (data.riskAssessment && data.hazardZones) {
      const assessmentLocation = data.riskAssessment.location;
      const nearbyHazards = data.hazardZones.filter((zone: HazardZone) => {
        const coords = this.extractCoordinates(zone.geometry);
        const distance = this.calculateDistance(
          assessmentLocation.latitude,
          assessmentLocation.longitude,
          coords[0][1],
          coords[0][0]
        );
        return distance <= data.riskAssessment.assessmentRadiusKm;
      });

      if (nearbyHazards.length !== data.riskAssessment.totalNearbyHazards) {
        result.warnings.push(`Nearby hazards count mismatch: assessment shows ${data.riskAssessment.totalNearbyHazards}, but ${nearbyHazards.length} zones are within radius`);
      }
    }
  }

  // Helper methods
  private extractCoordinates(geometry: any): number[][] {
    if (geometry.type === 'Polygon' && geometry.coordinates && geometry.coordinates[0]) {
      return geometry.coordinates[0];
    }
    return [];
  }

  private isWithinBounds(coordinates: number[][]): boolean {
    return coordinates.every(coord => {
      const [lng, lat] = coord;
      return lat >= this.rules.geographicBounds.minLat &&
             lat <= this.rules.geographicBounds.maxLat &&
             lng >= this.rules.geographicBounds.minLng &&
             lng <= this.rules.geographicBounds.maxLng;
    });
  }

  private getRiskDistribution(hazardZones: HazardZone[]): Record<string, number> {
    const distribution: Record<string, number> = { low: 0, medium: 0, high: 0, critical: 0 };
    hazardZones.forEach(zone => {
      distribution[zone.riskLevel]++;
    });
    return distribution;
  }

  private validateRiskDistribution(distribution: Record<string, number>, result: ValidationResult): void {
    const total = Object.values(distribution).reduce((sum, count) => sum + count, 0);
    
    // Check for reasonable distribution
    const criticalPercentage = (distribution.critical / total) * 100;
    const highPercentage = (distribution.high / total) * 100;
    
    if (criticalPercentage > 30) {
      result.warnings.push(`High percentage of critical hazards: ${criticalPercentage.toFixed(1)}%`);
    }
    
    if (highPercentage > 50) {
      result.warnings.push(`High percentage of high/critical hazards: ${(criticalPercentage + highPercentage).toFixed(1)}%`);
    }
  }

  private calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private mergeResults(target: ValidationResult, source: ValidationResult): void {
    target.isValid = target.isValid && source.isValid;
    target.errors.push(...source.errors);
    target.warnings.push(...source.warnings);
    target.suggestions.push(...source.suggestions);
  }
}

// Convenience function for quick validation
export function validateData(data: any, rules?: ValidationRules): ValidationResult {
  const validator = new DataValidator(rules);
  return validator.validateDashboardData(data);
}

// Log validation results
export function logValidationResults(result: ValidationResult, context: string = 'Data Validation'): void {
  if (result.errors.length > 0) {
    logger.error(`${context} - Errors:`, result.errors);
  }
  
  if (result.warnings.length > 0) {
    logger.warn(`${context} - Warnings:`, result.warnings);
  }
  
  if (result.suggestions.length > 0) {
    logger.log(`${context} - Suggestions:`, result.suggestions);
  }
  
  if (result.isValid) {
    logger.log(`${context} - Validation passed`);
  } else {
    logger.error(`${context} - Validation failed`);
  }
} 