"""
Risk processor compute module for containerized execution.
Processes hazard data and computes risk assessments.
"""

import structlog
import pandas as pd
import geopandas as gpd
from datetime import datetime
import json
import sys
import os

logger = structlog.get_logger(__name__)


class RiskProcessor:
    """Processes hazard data and computes comprehensive risk assessments."""
    
    def __init__(self, config_path=None):
        self.config = self._load_config(config_path)
        logger.info("Risk processor initialized", config_loaded=bool(self.config))
    
    def _load_config(self, config_path):
        """Load configuration from file or environment."""
        if config_path and os.path.exists(config_path):
            with open(config_path, 'r') as f:
                return json.load(f)
        else:
            # Default configuration
            return {
                'risk_thresholds': {
                    'low': 0.25,
                    'medium': 0.5,
                    'high': 0.75,
                    'critical': 1.0
                },
                'processing_window_days': 7,
                'output_format': 'geojson'
            }
    
    def process_hazard_data(self, input_data):
        """Process hazard data and compute risk metrics."""
        try:
            # Convert to GeoDataFrame if needed
            if isinstance(input_data, pd.DataFrame):
                gdf = gpd.GeoDataFrame(input_data)
            else:
                gdf = input_data
            
            # Compute additional risk factors
            gdf = self._compute_risk_factors(gdf)
            
            # Apply risk thresholds
            gdf = self._apply_risk_thresholds(gdf)
            
            # Generate risk summary
            summary = self._generate_risk_summary(gdf)
            
            logger.info("Risk processing completed", 
                       records_processed=len(gdf),
                       risk_summary=summary)
            
            return gdf, summary
            
        except Exception as e:
            logger.error("Error processing hazard data", error=str(e))
            raise
    
    def _compute_risk_factors(self, gdf):
        """Compute additional risk factors based on environmental conditions."""
        
        # Add temporal risk factor
        if 'acq_date' in gdf.columns:
            gdf['temporal_risk'] = self._compute_temporal_risk(gdf['acq_date'])
        
        # Add spatial risk factor (proximity to critical infrastructure)
        gdf['spatial_risk'] = self._compute_spatial_risk(gdf)
        
        # Add weather risk factor (if weather data available)
        gdf['weather_risk'] = self._compute_weather_risk(gdf)
        
        return gdf
    
    def _compute_temporal_risk(self, dates):
        """Compute risk based on time since detection."""
        now = datetime.now()
        days_old = (now - pd.to_datetime(dates)).dt.days
        # Newer events get higher risk scores
        return (7 - days_old) / 7.0
    
    def _compute_spatial_risk(self, gdf):
        """Compute risk based on spatial proximity to critical areas."""
        # Placeholder - would integrate with infrastructure data
        return 0.5  # Default medium risk
    
    def _compute_weather_risk(self, gdf):
        """Compute risk based on weather conditions."""
        # Placeholder - would integrate with weather data
        return 0.3  # Default low-medium risk
    
    def _apply_risk_thresholds(self, gdf):
        """Apply risk thresholds and categorize risk levels."""
        # Combine all risk factors
        gdf['combined_risk'] = (
            gdf.get('risk_score', 0) * 0.4 +
            gdf.get('temporal_risk', 0) * 0.3 +
            gdf.get('spatial_risk', 0) * 0.2 +
            gdf.get('weather_risk', 0) * 0.1
        )
        
        # Categorize risk levels
        thresholds = self.config['risk_thresholds']
        gdf['risk_level'] = pd.cut(
            gdf['combined_risk'],
            bins=[0, thresholds['low'], thresholds['medium'], 
                  thresholds['high'], thresholds['critical']],
            labels=['low', 'medium', 'high', 'critical']
        )
        
        return gdf
    
    def _generate_risk_summary(self, gdf):
        """Generate summary statistics for risk assessment."""
        summary = {
            'total_hazards': len(gdf),
            'risk_distribution': gdf['risk_level'].value_counts().to_dict(),
            'avg_risk_score': gdf['combined_risk'].mean(),
            'max_risk_score': gdf['combined_risk'].max(),
            'processing_timestamp': datetime.now().isoformat()
        }
        return summary


def main():
    """Main entry point for containerized execution."""
    logger.info("Starting risk processor")
    
    try:
        # Initialize processor
        processor = RiskProcessor()
        
        # Read input from stdin or file
        if len(sys.argv) > 1:
            input_file = sys.argv[1]
            with open(input_file, 'r') as f:
                input_data = json.load(f)
        else:
            # Read from stdin
            input_data = json.load(sys.stdin)
        
        # Process data
        processed_data, summary = processor.process_hazard_data(input_data)
        
        # Output results
        output = {
            'processed_data': processed_data.to_dict('records'),
            'summary': summary
        }
        
        print(json.dumps(output, indent=2))
        logger.info("Risk processor completed successfully")
        
    except Exception as e:
        logger.error("Risk processor failed", error=str(e))
        sys.exit(1)


if __name__ == "__main__":
    main() 