# 🍎 Simplified Disaster Response Dashboard

A professional, Apple-inspired disaster response dashboard built as a take-home project demonstrating clean architecture and modern design principles.

## 🎯 **Project Overview**

This simplified version focuses on **5 core composable components** that work together to create a professional disaster response system:

1. **Core Data Layer** - Single API endpoint serving all disaster data
2. **Map Component** - Configurable map with layer toggles
3. **Data Display Components** - Reusable metrics, alerts, and resource tables
4. **View Components** - Three main views using shared components
5. **State Management** - Simple, centralized state management

## 🚀 **Quick Start**

### **Prerequisites**
- Python 3.8+
- Node.js 16+
- npm

### **Run the Demo**
```bash
# Make the script executable (first time only)
chmod +x scripts/run-simplified-demo.sh

# Start the demo
./scripts/run-simplified-demo.sh
```

The demo will automatically:
- Install dependencies
- Start the backend API server
- Start the frontend development server
- Open the application in your browser

### **Manual Start**
```bash
# Backend
cd backend
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install flask flask-cors
python simple_api.py

# Frontend (in new terminal)
cd frontend
npm install
npm run dev
```

## 📱 **Available Views**

### **Public View** (`/public`)
- Emergency information for the general public
- Real-time hazard alerts
- Safety guidelines and emergency contacts
- Interactive map with hazard zones

### **Field View** (`/field`)
- Tactical information for emergency responders
- Resource management and status updates
- Quick action buttons for common operations
- Detailed hazard and route information

### **Command View** (`/command`)
- Comprehensive command center dashboard
- Resource coordination and deployment
- Emergency response timeline
- Advanced metrics and analytics

## 🏗️ **Architecture**

### **Backend**
- **Single API endpoint** (`/api/disaster-data`) serving all data
- **Mock data** for realistic disaster scenarios
- **Simple Flask server** with CORS support
- **Health check and update endpoints** for demo functionality

### **Frontend**
- **Apple-inspired design system** with consistent typography, colors, and spacing
- **Composable components** that can be mixed and matched
- **TypeScript** for type safety
- **React with Vite** for fast development
- **Zustand** for simple state management

### **Key Components**
- `DisasterMap` - Interactive map with configurable layers
- `MetricsGrid` - Key statistics display
- `AlertBanner` - Emergency notifications
- `ResourceTable` - Emergency resource management
- `Button`, `Card`, `Badge` - Reusable UI components

## 🎨 **Design System**

### **Apple Design Principles**
- **Clarity** - Clean, uncluttered interfaces
- **Deference** - Content is primary, UI supports content
- **Depth** - Subtle shadows and layering
- **Simplicity** - Minimal design with maximum functionality

### **Visual Elements**
- **Typography** - SF Pro-like fonts with consistent scale
- **Colors** - Apple's color palette with semantic meanings
- **Spacing** - 8px grid system for consistency
- **Shadows** - Subtle, layered shadows for depth
- **Animations** - Smooth, purposeful transitions

## 🔧 **API Endpoints**

### **Main Data Endpoint**
```http
GET /api/disaster-data
```
Returns all disaster response data including hazards, routes, resources, metrics, and alerts.

### **Health Check**
```http
GET /api/health
```
Returns server health status.

### **Resource Status Update**
```http
POST /api/update-resource-status
Content-Type: application/json

{
  "resource_id": "resource-1",
  "status": "deployed"
}
```

### **Add Alert**
```http
POST /api/add-alert
Content-Type: application/json

{
  "type": "warning",
  "title": "New Hazard Detected",
  "message": "Wildfire spreading rapidly",
  "severity": "high"
}
```

## 💡 **Features for Interview**

### **Technical Excellence**
- **Clean Architecture** - Separation of concerns with composable components
- **Type Safety** - Full TypeScript implementation
- **Modern Stack** - React, Vite, Zustand, Flask
- **Responsive Design** - Works on all device sizes

### **Professional Presentation**
- **Apple-Quality Design** - Following Apple's design principles
- **Realistic Functionality** - Working disaster response scenarios
- **Interactive Elements** - Map controls, resource management, alerts
- **Smooth Animations** - Professional user experience

### **Demonstrable Skills**
- **Component Design** - Reusable, configurable components
- **State Management** - Clean, predictable state handling
- **API Design** - Simple, RESTful endpoints
- **UI/UX Design** - Professional, accessible interfaces

## 🎯 **Demo Scenarios**

### **Scenario 1: Wildfire Response**
1. Show active wildfire hazard on map
2. Demonstrate resource deployment
3. Display evacuation routes
4. Show real-time metrics updates

### **Scenario 2: Multi-Hazard Assessment**
1. Toggle different map layers
2. Show multiple hazard types
3. Demonstrate resource coordination
4. Display comprehensive metrics

### **Scenario 3: Emergency Coordination**
1. Add new alerts from command center
2. Update resource statuses
3. Show response timeline
4. Demonstrate cross-view functionality

## 📊 **Project Structure**

```
disaster-response-dashboard/
├── backend/
│   └── simple_api.py          # Main API endpoint
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── common/        # Shared data components
│   │   │   └── ui/           # Reusable UI components
│   │   ├── pages/            # Main view components
│   │   ├── stores/           # State management
│   │   └── styles/           # Apple design system
│   └── package.json
├── scripts/
│   └── run-simplified-demo.sh # Demo startup script
└── docs/
    └── SIMPLIFIED_DEVELOPMENT_PLAN.md
```

## 🚀 **Next Steps**

This simplified version provides a solid foundation that can be extended with:

- **Real data integration** - Connect to actual disaster APIs
- **Advanced mapping** - Add more sophisticated map features
- **User authentication** - Role-based access control
- **Real-time updates** - WebSocket integration
- **Mobile app** - React Native version
- **Advanced analytics** - Machine learning predictions

## 📝 **Development Notes**

- **Built for interviews** - Demonstrates professional development practices
- **Apple-inspired design** - Shows attention to design quality
- **Composable architecture** - Easy to extend and modify
- **Realistic scenarios** - Based on actual disaster response needs
- **Clean code** - Well-documented and maintainable

---

**Ready for your interview presentation!** 🎉
