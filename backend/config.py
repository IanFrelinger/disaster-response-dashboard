"""
Configuration Management for Disaster Response Dashboard Backend
Handles environment variables, API keys, and application settings.
"""

import os
from typing import Optional
from pathlib import Path
import structlog
from dotenv import load_dotenv

logger = structlog.get_logger(__name__)

# Load environment variables from .env file
env_path = Path(__file__).parent / '.env'
if env_path.exists():
    load_dotenv(env_path)
else:
    logger.warning("No .env file found. Using system environment variables.")


class Config:
    """Application configuration management."""
    
    # =============================================================================
    # CORE APPLICATION SETTINGS
    # =============================================================================
    
    @property
    def FLASK_ENV(self) -> str:
        return os.getenv('FLASK_ENV', 'development')
    
    @property
    def FLASK_DEBUG(self) -> bool:
        return os.getenv('FLASK_DEBUG', 'true').lower() == 'true'
    
    @property
    def SECRET_KEY(self) -> str:
        key = os.getenv('SECRET_KEY')
        if not key or key == 'your-secret-key-here-change-in-production':
            logger.warning("Using default secret key. Change this in production!")
            return 'dev-secret-key-change-in-production'
        return key
    
    @property
    def LOG_LEVEL(self) -> str:
        return os.getenv('LOG_LEVEL', 'INFO')
    
    # =============================================================================
    # DATABASE CONFIGURATION
    # =============================================================================
    
    @property
    def DATABASE_URL(self) -> str:
        return os.getenv('DATABASE_URL', 'postgresql://postgres:password@localhost:5432/disaster_response')
    
    @property
    def POSTGRES_HOST(self) -> str:
        return os.getenv('POSTGRES_HOST', 'localhost')
    
    @property
    def POSTGRES_PORT(self) -> int:
        return int(os.getenv('POSTGRES_PORT', '5432'))
    
    @property
    def POSTGRES_DB(self) -> str:
        return os.getenv('POSTGRES_DB', 'disaster_response')
    
    @property
    def POSTGRES_USER(self) -> str:
        return os.getenv('POSTGRES_USER', 'postgres')
    
    @property
    def POSTGRES_PASSWORD(self) -> str:
        return os.getenv('POSTGRES_PASSWORD', 'password')
    
    # =============================================================================
    # REDIS CONFIGURATION
    # =============================================================================
    
    @property
    def REDIS_URL(self) -> str:
        return os.getenv('REDIS_URL', 'redis://localhost:6379')
    
    @property
    def REDIS_HOST(self) -> str:
        return os.getenv('REDIS_HOST', 'localhost')
    
    @property
    def REDIS_PORT(self) -> int:
        return int(os.getenv('REDIS_PORT', '6379'))
    
    @property
    def REDIS_PASSWORD(self) -> Optional[str]:
        return os.getenv('REDIS_PASSWORD')
    
    # =============================================================================
    # FOUNDRY CONFIGURATION
    # =============================================================================
    
    @property
    def FOUNDRY_URL(self) -> str:
        return os.getenv('FOUNDRY_URL', 'https://your-foundry-instance.palantirfoundry.com')
    
    @property
    def FOUNDRY_USERNAME(self) -> str:
        return os.getenv('FOUNDRY_USERNAME', '')
    
    @property
    def FOUNDRY_PASSWORD(self) -> str:
        return os.getenv('FOUNDRY_PASSWORD', '')
    
    @property
    def FOUNDRY_TOKEN(self) -> str:
        return os.getenv('FOUNDRY_TOKEN', '')
    
    # =============================================================================
    # EXTERNAL API KEYS
    # =============================================================================
    
    @property
    def NASA_FIRMS_API_KEY(self) -> str:
        return os.getenv('NASA_FIRMS_API_KEY', '')
    
    @property
    def NASA_FIRMS_BASE_URL(self) -> str:
        return os.getenv('NASA_FIRMS_BASE_URL', 'https://firms.modaps.eosdis.nasa.gov/api')
    
    @property
    def NOAA_API_KEY(self) -> str:
        return os.getenv('NOAA_API_KEY', '')
    
    @property
    def NOAA_BASE_URL(self) -> str:
        return os.getenv('NOAA_BASE_URL', 'https://api.weather.gov')
    
    @property
    def MAPBOX_ACCESS_TOKEN(self) -> str:
        return os.getenv('MAPBOX_ACCESS_TOKEN', '')
    
    @property
    def MAPBOX_STYLE_URL(self) -> str:
        return os.getenv('MAPBOX_STYLE_URL', 'mapbox://styles/mapbox/dark-v11')
    
    @property
    def OSM_BASE_URL(self) -> str:
        return os.getenv('OSM_BASE_URL', 'https://api.openstreetmap.org')
    
    # =============================================================================
    # EMERGENCY SERVICES INTEGRATION
    # =============================================================================
    
    @property
    def EMERGENCY_911_API_KEY(self) -> str:
        return os.getenv('EMERGENCY_911_API_KEY', '')
    
    @property
    def EMERGENCY_911_BASE_URL(self) -> str:
        return os.getenv('EMERGENCY_911_BASE_URL', 'https://api.911.gov')
    
    @property
    def FEMA_API_KEY(self) -> str:
        return os.getenv('FEMA_API_KEY', '')
    
    @property
    def FEMA_BASE_URL(self) -> str:
        return os.getenv('FEMA_BASE_URL', 'https://api.fema.gov')
    
    @property
    def NWS_API_KEY(self) -> str:
        return os.getenv('NWS_API_KEY', '')
    
    @property
    def NWS_BASE_URL(self) -> str:
        return os.getenv('NWS_BASE_URL', 'https://api.weather.gov')
    
    # =============================================================================
    # COMMUNICATION SERVICES
    # =============================================================================
    
    @property
    def TWILIO_ACCOUNT_SID(self) -> str:
        return os.getenv('TWILIO_ACCOUNT_SID', '')
    
    @property
    def TWILIO_AUTH_TOKEN(self) -> str:
        return os.getenv('TWILIO_AUTH_TOKEN', '')
    
    @property
    def TWILIO_PHONE_NUMBER(self) -> str:
        return os.getenv('TWILIO_PHONE_NUMBER', '')
    
    @property
    def SENDGRID_API_KEY(self) -> str:
        return os.getenv('SENDGRID_API_KEY', '')
    
    @property
    def SENDGRID_FROM_EMAIL(self) -> str:
        return os.getenv('SENDGRID_FROM_EMAIL', 'alerts@disaster-response.gov')
    
    # =============================================================================
    # MACHINE LEARNING & AI SERVICES
    # =============================================================================
    
    @property
    def GOOGLE_CLOUD_PROJECT_ID(self) -> str:
        return os.getenv('GOOGLE_CLOUD_PROJECT_ID', '')
    
    @property
    def GOOGLE_CLOUD_CREDENTIALS_FILE(self) -> str:
        return os.getenv('GOOGLE_CLOUD_CREDENTIALS_FILE', '')
    
    @property
    def AWS_ACCESS_KEY_ID(self) -> str:
        return os.getenv('AWS_ACCESS_KEY_ID', '')
    
    @property
    def AWS_SECRET_ACCESS_KEY(self) -> str:
        return os.getenv('AWS_SECRET_ACCESS_KEY', '')
    
    @property
    def AWS_REGION(self) -> str:
        return os.getenv('AWS_REGION', 'us-west-2')
    
    # =============================================================================
    # MONITORING & ANALYTICS
    # =============================================================================
    
    @property
    def PROMETHEUS_ENABLED(self) -> bool:
        return os.getenv('PROMETHEUS_ENABLED', 'true').lower() == 'true'
    
    @property
    def PROMETHEUS_PORT(self) -> int:
        return int(os.getenv('PROMETHEUS_PORT', '9090'))
    
    @property
    def SENTRY_DSN(self) -> str:
        return os.getenv('SENTRY_DSN', '')
    
    @property
    def SENTRY_ENVIRONMENT(self) -> str:
        return os.getenv('SENTRY_ENVIRONMENT', 'development')
    
    # =============================================================================
    # SECURITY & ENCRYPTION
    # =============================================================================
    
    @property
    def JWT_SECRET_KEY(self) -> str:
        return os.getenv('JWT_SECRET_KEY', self.SECRET_KEY)
    
    @property
    def JWT_ACCESS_TOKEN_EXPIRES(self) -> int:
        return int(os.getenv('JWT_ACCESS_TOKEN_EXPIRES', '3600'))
    
    @property
    def JWT_REFRESH_TOKEN_EXPIRES(self) -> int:
        return int(os.getenv('JWT_REFRESH_TOKEN_EXPIRES', '86400'))
    
    @property
    def ENCRYPTION_KEY(self) -> str:
        return os.getenv('ENCRYPTION_KEY', 'your-32-character-encryption-key')
    
    @property
    def DATA_ENCRYPTION_KEY(self) -> str:
        return os.getenv('DATA_ENCRYPTION_KEY', 'your-data-encryption-key')
    
    # =============================================================================
    # DEVELOPMENT SETTINGS
    # =============================================================================
    
    @property
    def DEBUG_MODE(self) -> bool:
        return os.getenv('DEBUG_MODE', 'true').lower() == 'true'
    
    @property
    def LOG_REQUESTS(self) -> bool:
        return os.getenv('LOG_REQUESTS', 'true').lower() == 'true'
    
    @property
    def ENABLE_CORS(self) -> bool:
        return os.getenv('ENABLE_CORS', 'true').lower() == 'true'
    
    @property
    def USE_MOCK_DATA(self) -> bool:
        return os.getenv('USE_MOCK_DATA', 'true').lower() == 'true'
    
    @property
    def MOCK_DATA_PATH(self) -> str:
        return os.getenv('MOCK_DATA_PATH', './mock_data/')
    
    # =============================================================================
    # VALIDATION METHODS
    # =============================================================================
    
    def validate_required_keys(self) -> list[str]:
        """Validate that required API keys are present."""
        missing_keys = []
        
        # Check for required API keys
        required_keys = [
            ('NASA_FIRMS_API_KEY', self.NASA_FIRMS_API_KEY),
            ('NOAA_API_KEY', self.NOAA_API_KEY),
            ('MAPBOX_ACCESS_TOKEN', self.MAPBOX_ACCESS_TOKEN),
        ]
        
        for key_name, key_value in required_keys:
            if not key_value:
                missing_keys.append(key_name)
        
        if missing_keys:
            logger.warning(f"Missing required API keys: {', '.join(missing_keys)}")
        
        return missing_keys
    
    def get_api_config(self) -> dict:
        """Get API configuration for external services."""
        return {
            'nasa_firms': {
                'api_key': self.NASA_FIRMS_API_KEY,
                'base_url': self.NASA_FIRMS_BASE_URL,
            },
            'noaa': {
                'api_key': self.NOAA_API_KEY,
                'base_url': self.NOAA_BASE_URL,
            },
            'mapbox': {
                'access_token': self.MAPBOX_ACCESS_TOKEN,
                'style_url': self.MAPBOX_STYLE_URL,
            },
            'emergency_911': {
                'api_key': self.EMERGENCY_911_API_KEY,
                'base_url': self.EMERGENCY_911_BASE_URL,
            },
            'fema': {
                'api_key': self.FEMA_API_KEY,
                'base_url': self.FEMA_BASE_URL,
            },
            'nws': {
                'api_key': self.NWS_API_KEY,
                'base_url': self.NWS_BASE_URL,
            },
        }
    
    def get_database_config(self) -> dict:
        """Get database configuration."""
        return {
            'url': self.DATABASE_URL,
            'host': self.POSTGRES_HOST,
            'port': self.POSTGRES_PORT,
            'database': self.POSTGRES_DB,
            'username': self.POSTGRES_USER,
            'password': self.POSTGRES_PASSWORD,
        }
    
    def get_redis_config(self) -> dict:
        """Get Redis configuration."""
        return {
            'url': self.REDIS_URL,
            'host': self.REDIS_HOST,
            'port': self.REDIS_PORT,
            'password': self.REDIS_PASSWORD,
        }
    
    def get_foundry_config(self) -> dict:
        """Get Foundry configuration."""
        return {
            'url': self.FOUNDRY_URL,
            'username': self.FOUNDRY_USERNAME,
            'password': self.FOUNDRY_PASSWORD,
            'token': self.FOUNDRY_TOKEN,
        }


# Global configuration instance
config = Config()


def get_config() -> Config:
    """Get the global configuration instance."""
    return config


def validate_configuration() -> bool:
    """Validate the configuration and log any issues."""
    missing_keys = config.validate_required_keys()
    
    if missing_keys:
        logger.error(f"Configuration validation failed. Missing keys: {missing_keys}")
        return False
    
    logger.info("Configuration validation passed")
    return True


if __name__ == "__main__":
    # Test configuration loading
    print("Configuration Test:")
    print(f"Flask Environment: {config.FLASK_ENV}")
    print(f"Database URL: {config.DATABASE_URL}")
    print(f"NASA FIRMS API Key: {'Set' if config.NASA_FIRMS_API_KEY else 'Not Set'}")
    print(f"Mapbox Token: {'Set' if config.MAPBOX_ACCESS_TOKEN else 'Not Set'}")
    
    validate_configuration()
