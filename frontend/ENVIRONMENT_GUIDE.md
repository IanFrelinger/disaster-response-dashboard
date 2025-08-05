# Environment Configuration Guide

This guide explains how to use the different environment modes for the Disaster Response Dashboard.

## 🎯 **Environment Modes**

The application supports three distinct environment modes:

### **1. Demo Mode** 🎪
- **Purpose**: Demonstration and testing without backend dependencies
- **Data Source**: Synthetic data generated in the frontend
- **Logging**: Full logging enabled
- **Use Case**: Presentations, demos, offline development

### **2. Debug Mode** 🐛
- **Purpose**: Development and debugging with backend integration
- **Data Source**: Backend API (with fallback to synthetic data)
- **Logging**: Full logging and debug information
- **Use Case**: Development, testing, debugging

### **3. Production Mode** 🚀
- **Purpose**: Production deployment with real data
- **Data Source**: Production backend API
- **Logging**: Minimal logging for performance
- **Use Case**: Live production environment

## 🚀 **Quick Start**

### **Demo Mode (Recommended for first-time users)**
```bash
cd frontend
npm run dev:demo
```

### **Debug Mode (For development with backend)**
```bash
# Start backend first
cd backend
python run_synthetic_api.py

# Then start frontend
cd frontend
npm run dev:debug
```

### **Production Mode (For production deployment)**
```bash
cd frontend
npm run dev:production
```

## ⚙️ **Environment Configuration**

### **Environment Files**

The application uses different environment files for each mode:

- `env.demo` - Demo mode configuration
- `env.debug` - Debug mode configuration  
- `env.production` - Production mode configuration

### **Configuration Variables**

| Variable | Description | Demo | Debug | Production |
|----------|-------------|------|-------|------------|
| `VITE_ENVIRONMENT_MODE` | Current environment mode | `demo` | `debug` | `production` |
| `VITE_DEMO_API_BASE_URL` | Demo API endpoint | `http://localhost:5000/api` | - | - |
| `VITE_DEBUG_API_BASE_URL` | Debug API endpoint | - | `http://localhost:5000/api` | - |
| `VITE_PRODUCTION_API_BASE_URL` | Production API endpoint | - | - | `https://api.disaster-response.com/api` |
| `VITE_MAPBOX_TOKEN` | Mapbox access token | Optional | Optional | Required |

## 🔧 **Custom Configuration**

### **Creating Custom Environment**

1. **Copy an existing environment file:**
   ```bash
   cp env.demo env.custom
   ```

2. **Edit the configuration:**
   ```bash
   # Edit env.custom
   VITE_ENVIRONMENT_MODE=custom
   VITE_CUSTOM_API_BASE_URL=http://your-api.com/api
   VITE_MAPBOX_TOKEN=your_token
   ```

3. **Add a script to package.json:**
   ```json
   {
     "scripts": {
       "dev:custom": "cp env.custom .env && vite"
     }
   }
   ```

4. **Run with custom configuration:**
   ```bash
   npm run dev:custom
   ```

### **Environment-Specific Features**

#### **Demo Mode Features**
- ✅ Synthetic data generation
- ✅ No backend dependency
- ✅ Full logging
- ✅ Offline capability
- ✅ Fast startup

#### **Debug Mode Features**
- ✅ Backend API integration
- ✅ Fallback to synthetic data
- ✅ Full debug logging
- ✅ Error tracking
- ✅ Development tools

#### **Production Mode Features**
- ✅ Production API integration
- ✅ Minimal logging
- ✅ Performance optimized
- ✅ Error handling
- ✅ Security features

## 🧪 **Testing Different Modes**

### **1. Test Demo Mode**
```bash
npm run dev:demo
```
- Verify synthetic data loads
- Check environment badges in UI
- Test offline functionality

### **2. Test Debug Mode**
```bash
# Terminal 1: Start backend
cd backend
python run_synthetic_api.py

# Terminal 2: Start frontend
cd frontend
npm run dev:debug
```
- Verify API connection
- Check debug logging
- Test fallback to synthetic data

### **3. Test Production Mode**
```bash
npm run dev:production
```
- Verify production API connection
- Check minimal logging
- Test error handling

## 🔍 **Environment Indicators**

The dashboard displays environment information in the header:

- **Mode Badge**: Shows current environment mode (DEMO/DEBUG/PRODUCTION)
- **Synthetic Data Badge**: Shows when using synthetic data
- **Console Logging**: Environment-specific logging with prefixes

### **Console Logging Examples**

```javascript
// Demo Mode
[DEMO] Environment initialized: { mode: 'demo', useSyntheticData: true }
[DEMO] Generating 20 hazard zones

// Debug Mode  
[DEBUG] Making API request to: http://localhost:5000/api/dashboard
[DEBUG] Dashboard data loaded successfully

// Production Mode
[PRODUCTION] Making API request to: https://api.disaster-response.com/api/dashboard
```

## 🚨 **Troubleshooting**

### **Common Issues**

1. **Environment not switching**
   - Check that the correct environment file is copied to `.env`
   - Restart the development server
   - Clear browser cache

2. **API connection errors**
   - Verify backend is running (for debug mode)
   - Check API base URL configuration
   - Test API endpoints directly

3. **Synthetic data not working**
   - Check environment mode is set to 'demo'
   - Verify synthetic data generator is imported
   - Check browser console for errors

### **Debug Commands**

```bash
# Check current environment
echo $VITE_ENVIRONMENT_MODE

# Test API endpoints
curl http://localhost:5000/api/health

# Check environment file
cat .env

# Clear environment and restart
rm .env && npm run dev:demo
```

## 📦 **Build Commands**

### **Build for Different Environments**

```bash
# Build for demo
npm run build:demo

# Build for debug
npm run build:debug

# Build for production
npm run build:production
```

### **Deployment Considerations**

- **Demo**: Can be deployed as static files
- **Debug**: Requires backend API
- **Production**: Requires production API and proper configuration

## 🔄 **Environment Switching**

### **During Development**

You can switch environments without restarting:

1. **Stop the development server** (Ctrl+C)
2. **Run the new environment command:**
   ```bash
   npm run dev:demo    # Switch to demo
   npm run dev:debug   # Switch to debug
   npm run dev:production  # Switch to production
   ```

### **Runtime Environment Detection**

The application automatically detects the environment mode and adjusts behavior:

- **Data Source**: API vs Synthetic
- **Logging Level**: Full vs Minimal
- **Error Handling**: Development vs Production
- **Performance**: Debug vs Optimized

## 📚 **Best Practices**

1. **Use Demo Mode** for:
   - Initial setup and testing
   - Offline development
   - Presentations and demos

2. **Use Debug Mode** for:
   - Development with backend
   - Testing API integration
   - Debugging issues

3. **Use Production Mode** for:
   - Production deployment
   - Performance testing
   - User acceptance testing

4. **Environment Variables**:
   - Never commit sensitive tokens
   - Use different tokens for different environments
   - Document all required variables

This multi-environment setup provides flexibility for different use cases while maintaining a consistent development experience. 