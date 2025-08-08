# Configuration Guide - Disaster Response Dashboard

This guide explains how to configure API keys and environment variables for the Disaster Response Dashboard.

## 🚀 Quick Setup

### Option 1: Automated Setup (Recommended)

Run the automated setup script:

```bash
./scripts/setup-config.sh
```

This script will:
- Create configuration files from templates
- Prompt for your API keys
- Validate the configuration
- Provide next steps

### Option 2: Manual Setup

Follow the steps below to manually configure your environment.

## 📁 Configuration Files

The system uses two main configuration files:

- **Backend**: `backend/.env` (created from `backend/config.env.example`)
- **Frontend**: `frontend/.env.local` (created from `frontend/config.env.example`)

## 🔑 Required API Keys

### 1. Mapbox Access Token
**Purpose**: Interactive mapping and geospatial visualization
**Required**: ✅ Yes
**Get it**: [Mapbox Account](https://account.mapbox.com/access-tokens/)

```bash
# Backend
MAPBOX_ACCESS_TOKEN=your-mapbox-access-token

# Frontend  
VITE_MAPBOX_ACCESS_TOKEN=your-mapbox-access-token
```

### 2. NASA FIRMS API Key
**Purpose**: Satellite fire detection data
**Required**: ✅ Yes
**Get it**: [NASA FIRMS](https://firms.modaps.eosdis.nasa.gov/api/)

```bash
# Backend
NASA_FIRMS_API_KEY=your-nasa-firms-api-key

# Frontend
VITE_NASA_FIRMS_API_KEY=your-nasa-firms-api-key
```

### 3. NOAA Weather API Key
**Purpose**: Weather data for hazard prediction
**Required**: ✅ Yes
**Get it**: [NOAA Weather API](https://www.weather.gov/documentation/services-web-api)

```bash
# Backend
NOAA_API_KEY=your-noaa-api-key

# Frontend
VITE_NOAA_API_KEY=your-noaa-api-key
```

## 🔑 Optional API Keys

### 4. Emergency 911 API
**Purpose**: Real-time emergency incident data
**Required**: ❌ No (uses mock data if not provided)
**Get it**: Contact your local emergency services

```bash
# Backend
EMERGENCY_911_API_KEY=your-911-api-key

# Frontend
VITE_EMERGENCY_API_KEY=your-911-api-key
```

### 5. FEMA API
**Purpose**: Federal emergency management data
**Required**: ❌ No (uses mock data if not provided)
**Get it**: [FEMA API](https://www.fema.gov/about/openfema/api)

```bash
# Backend
FEMA_API_KEY=your-fema-api-key
```

### 6. Twilio (SMS Alerts)
**Purpose**: Send emergency SMS notifications
**Required**: ❌ No (uses mock data if not provided)
**Get it**: [Twilio Console](https://console.twilio.com/)

```bash
# Backend
TWILIO_ACCOUNT_SID=your-twilio-account-sid
TWILIO_AUTH_TOKEN=your-twilio-auth-token
TWILIO_PHONE_NUMBER=+1234567890

# Frontend
VITE_TWILIO_ACCOUNT_SID=your-twilio-account-sid
VITE_TWILIO_AUTH_TOKEN=your-twilio-auth-token
VITE_TWILIO_PHONE_NUMBER=+1234567890
```

### 7. SendGrid (Email Alerts)
**Purpose**: Send emergency email notifications
**Required**: ❌ No (uses mock data if not provided)
**Get it**: [SendGrid](https://app.sendgrid.com/)

```bash
# Backend
SENDGRID_API_KEY=your-sendgrid-api-key
SENDGRID_FROM_EMAIL=alerts@disaster-response.gov

# Frontend
VITE_SENDGRID_API_KEY=your-sendgrid-api-key
VITE_SENDGRID_FROM_EMAIL=alerts@disaster-response.gov
```

## 🗄️ Database Configuration

### PostgreSQL
**Purpose**: Store hazard data, routes, and user information
**Default**: Uses local PostgreSQL instance

```bash
# Backend
DATABASE_URL=postgresql://username:password@localhost:5432/disaster_response
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_DB=disaster_response
POSTGRES_USER=postgres
POSTGRES_PASSWORD=your-database-password
```

### Redis
**Purpose**: Caching and real-time updates
**Default**: Uses local Redis instance

```bash
# Backend
REDIS_URL=redis://localhost:6379
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=your-redis-password
```

## 🔐 Security Configuration

### Secret Keys
**Purpose**: JWT tokens, session encryption, data protection

```bash
# Backend
SECRET_KEY=your-secret-key-here-change-in-production
JWT_SECRET_KEY=your-jwt-secret-key
ENCRYPTION_KEY=your-32-character-encryption-key
DATA_ENCRYPTION_KEY=your-data-encryption-key

# Frontend
VITE_JWT_SECRET=your-jwt-secret-key
```

**Generate secure keys**:
```bash
# Generate secret key
openssl rand -hex 32

# Generate encryption key
openssl rand -base64 32
```

## 🏗️ Foundry Configuration

### Palantir Foundry
**Purpose**: Data orchestration and pipeline management
**Required**: ✅ Yes (for production)

```bash
# Backend
FOUNDRY_URL=https://your-foundry-instance.palantirfoundry.com
FOUNDRY_USERNAME=your-foundry-username
FOUNDRY_PASSWORD=your-foundry-password
FOUNDRY_TOKEN=your-foundry-token
```

## 📊 Monitoring & Analytics

### Sentry (Error Tracking)
**Purpose**: Monitor application errors and performance
**Required**: ❌ No

```bash
# Backend
SENTRY_DSN=your-sentry-dsn
SENTRY_ENVIRONMENT=development

# Frontend
VITE_SENTRY_DSN=your-sentry-dsn
VITE_SENTRY_ENVIRONMENT=development
```

### Google Analytics
**Purpose**: Track user behavior and system usage
**Required**: ❌ No

```bash
# Frontend
VITE_GA_TRACKING_ID=your-google-analytics-tracking-id
VITE_GA_ENABLED=true
```

## 🔧 Development Configuration

### Feature Flags
Control which features are enabled:

```bash
# Frontend
VITE_ENABLE_VOICE_COMMANDS=true
VITE_ENABLE_OFFLINE_MODE=true
VITE_ENABLE_PUSH_NOTIFICATIONS=true
VITE_ENABLE_FAMILY_TRACKING=true
VITE_ENABLE_MULTI_LANGUAGE=true
```

### Debug Settings
Enable debugging and development features:

```bash
# Backend
DEBUG_MODE=true
LOG_REQUESTS=true
ENABLE_CORS=true
USE_MOCK_DATA=true

# Frontend
VITE_DEBUG_MODE=true
VITE_USE_MOCK_DATA=true
```

## 🌍 Environment-Specific Configuration

### Development
```bash
# Backend
FLASK_ENV=development
FLASK_DEBUG=true

# Frontend
VITE_APP_ENV=development
VITE_API_BASE_URL=http://localhost:5001
```

### Staging
```bash
# Backend
FLASK_ENV=staging
FLASK_DEBUG=false

# Frontend
VITE_APP_ENV=staging
VITE_API_BASE_URL=https://staging-api.disaster-response.gov
```

### Production
```bash
# Backend
FLASK_ENV=production
FLASK_DEBUG=false

# Frontend
VITE_APP_ENV=production
VITE_API_BASE_URL=https://api.disaster-response.gov
```

## 🔍 Configuration Validation

### Backend Validation
```bash
cd backend
python -c "from config import validate_configuration; validate_configuration()"
```

### Frontend Validation
```bash
cd frontend
npm run type-check
```

## 🚨 Security Best Practices

### 1. Never Commit Secrets
- Add `.env` and `.env.local` to `.gitignore`
- Use environment variables in production
- Rotate API keys regularly

### 2. Use Strong Passwords
- Generate random passwords for databases
- Use different passwords for each service
- Store passwords securely (password managers)

### 3. Enable HTTPS
- Use SSL certificates in production
- Configure secure headers
- Enable HSTS

### 4. Monitor Access
- Log API key usage
- Set up alerts for unusual activity
- Regular security audits

## 📋 Configuration Checklist

- [ ] Mapbox Access Token
- [ ] NASA FIRMS API Key
- [ ] NOAA Weather API Key
- [ ] PostgreSQL Database
- [ ] Redis Cache
- [ ] Secret Keys (generated)
- [ ] Foundry Configuration
- [ ] Feature Flags (configured)
- [ ] Environment Variables (set)
- [ ] Security Settings (enabled)

## 🆘 Troubleshooting

### Common Issues

1. **"Missing API Key" errors**
   - Check that API keys are correctly set in `.env` files
   - Verify API key permissions and quotas
   - Test API keys manually

2. **Database connection errors**
   - Verify PostgreSQL is running
   - Check database credentials
   - Ensure database exists

3. **Map not loading**
   - Verify Mapbox token is valid
   - Check network connectivity
   - Review browser console for errors

4. **Configuration not loading**
   - Restart the application after changing config
   - Check file permissions
   - Verify environment variable names

### Getting Help

- Check the logs: `docker-compose logs`
- Validate configuration: Run validation commands above
- Review documentation: `COMPREHENSIVE_README.md`
- Test individual components: Run unit tests

## 📞 Support

For configuration issues:
- Review this guide thoroughly
- Check the troubleshooting section
- Consult the comprehensive README
- Contact the development team

---

**Remember**: Keep your API keys secure and never share them publicly! 🔒
