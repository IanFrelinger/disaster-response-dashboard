# Migration Guide: Frontend to Backend Synthetic Data

This guide explains the migration of synthetic data generation from the frontend to the backend, creating a proper separation of concerns.

## 🎯 **Migration Overview**

### **Before Migration**
- Synthetic data was generated in the frontend using TypeScript
- Frontend was responsible for both data generation and display
- No proper API layer existed

### **After Migration**
- Synthetic data is generated in the backend using Python
- Frontend is purely responsible for display and user interaction
- Proper REST API endpoints serve data to the frontend
- Better separation of concerns and scalability

## 🏗️ **Architecture Changes**

### **Backend (New)**
```
backend/
├── utils/
│   └── synthetic_data.py          # Python synthetic data generator
├── functions/
│   └── synthetic_api.py           # Flask API endpoints
└── run_synthetic_api.py           # API server startup script
```

### **Frontend (Updated)**
```
frontend/
├── src/
│   ├── services/
│   │   └── api.ts                 # API service (replaces synthetic data)
│   ├── components/
│   │   ├── Dashboard.tsx          # Updated to use API calls
│   │   ├── HazardMap.tsx          # No changes
│   │   ├── RiskAssessmentCard.tsx # No changes
│   │   ├── HazardSummaryCard.tsx  # No changes
│   │   └── SafeRoutesCard.tsx     # No changes
│   └── types/
│       └── hazard.ts              # No changes
```

## 🚀 **Setup Instructions**

### **1. Backend Setup**

```bash
# Navigate to backend directory
cd backend

# Install Python dependencies
pip install -r ../requirements.txt

# Start the synthetic data API server
python run_synthetic_api.py
```

The API server will start on `http://localhost:5000`

### **2. Frontend Setup**

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start the development server
npm run dev
```

The frontend will start on `http://localhost:5173`

### **3. Environment Configuration**

Create a `.env` file in the frontend directory:

```bash
# Frontend environment variables
VITE_API_BASE_URL=http://localhost:5000/api
VITE_MAPBOX_TOKEN=your_mapbox_token_here  # Optional
```

## 📡 **API Endpoints**

The backend provides the following REST API endpoints:

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/dashboard` | GET | Complete dashboard data |
| `/api/hazards` | GET | Hazard zones data |
| `/api/routes` | GET | Safe evacuation routes |
| `/api/risk-assessment` | GET | Risk assessment for location |
| `/api/hazard-summary` | GET | Hazard summary statistics |
| `/api/evacuation-routes` | GET | Evacuation routes response |
| `/api/scenario/<type>` | GET | Scenario-specific data |
| `/api/refresh` | POST | Refresh cached data |
| `/api/health` | GET | Health check |
| `/api/info` | GET | API information |

### **Query Parameters**

- `count`: Number of items to generate (for hazards and routes)
- `lat`: Latitude for risk assessment
- `lng`: Longitude for risk assessment
- `scenario_type`: Scenario type (wildfire, earthquake, flood, normal)

## 🔄 **Data Flow**

### **Before Migration**
```
Frontend → SyntheticDataGenerator → Components
```

### **After Migration**
```
Frontend → ApiService → Backend API → SyntheticDataGenerator → JSON Response → Components
```

## 🛠️ **Key Changes Made**

### **1. Backend Synthetic Data Generator**

- **File**: `backend/utils/synthetic_data.py`
- **Features**:
  - Python dataclasses for type safety
  - JSON serialization methods
  - Same data generation logic as TypeScript version
  - Geographic bounds and realistic data

### **2. Flask API Server**

- **File**: `backend/functions/synthetic_api.py`
- **Features**:
  - RESTful API endpoints
  - CORS support for frontend integration
  - Error handling and response formatting
  - Data caching (5-minute cache)
  - Health checks and API information

### **3. Frontend API Service**

- **File**: `frontend/src/services/api.ts`
- **Features**:
  - TypeScript API client
  - Error handling and loading states
  - Custom React hooks for data fetching
  - Environment variable configuration

### **4. Updated Dashboard Component**

- **File**: `frontend/src/components/Dashboard.tsx`
- **Changes**:
  - Replaced synthetic data generation with API calls
  - Added proper error handling
  - Async/await for data fetching
  - Loading states maintained

## 🧪 **Testing the Migration**

### **1. Test Backend API**

```bash
# Health check
curl http://localhost:5000/api/health

# Get dashboard data
curl http://localhost:5000/api/dashboard

# Get API info
curl http://localhost:5000/api/info
```

### **2. Test Frontend Integration**

1. Open `http://localhost:5173` in your browser
2. Check browser console for any errors
3. Verify that data loads correctly
4. Test the refresh button
5. Test clicking on the map to update risk assessment

### **3. Test Different Scenarios**

```bash
# Test wildfire scenario
curl http://localhost:5000/api/scenario/wildfire

# Test earthquake scenario
curl http://localhost:5000/api/scenario/earthquake

# Test flood scenario
curl http://localhost:5000/api/scenario/flood
```

## 🔧 **Troubleshooting**

### **Common Issues**

1. **CORS Errors**
   - Ensure the backend is running on `http://localhost:5000`
   - Check that CORS is properly configured in the Flask app

2. **API Connection Errors**
   - Verify the API base URL in frontend environment variables
   - Check that the backend server is running
   - Look for network errors in browser console

3. **Data Not Loading**
   - Check backend logs for errors
   - Verify API endpoints are responding correctly
   - Check frontend console for JavaScript errors

4. **Type Errors**
   - Ensure TypeScript types match the API response format
   - Check that all imports are correct

### **Debug Commands**

```bash
# Check if backend is running
curl http://localhost:5000/api/health

# Check API info
curl http://localhost:5000/api/info

# Test specific endpoint
curl http://localhost:5000/api/hazards?count=5
```

## 📈 **Benefits of Migration**

1. **Separation of Concerns**: Frontend focuses on UI, backend handles data
2. **Scalability**: Backend can be scaled independently
3. **Caching**: Server-side caching improves performance
4. **Real API**: Frontend now uses real API patterns
5. **Testing**: Easier to test API endpoints independently
6. **Production Ready**: Structure supports real data integration

## 🔮 **Next Steps**

1. **Add Authentication**: Implement user authentication for the API
2. **Database Integration**: Replace synthetic data with real database queries
3. **Real-time Updates**: Add WebSocket support for live data
4. **API Documentation**: Add OpenAPI/Swagger documentation
5. **Monitoring**: Add logging and monitoring to the API
6. **Deployment**: Deploy both frontend and backend to production

## 📚 **Additional Resources**

- [Flask Documentation](https://flask.palletsprojects.com/)
- [React Query for API State Management](https://tanstack.com/query)
- [TypeScript API Client Patterns](https://www.typescriptlang.org/docs/)
- [CORS Configuration](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS)

The migration successfully separates data generation from presentation, creating a more maintainable and scalable architecture. 