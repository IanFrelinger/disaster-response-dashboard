# Disaster Response Dashboard

A comprehensive emergency response system with real-time monitoring, public information, and field operations management.

## 🚀 **Current Status: Phase 2 Complete**

### ✅ **What's Working**
- **Frontend**: TypeScript React application with full Public View
- **Backend**: Python Flask API with synthetic data generation
- **Testing**: 100% test coverage for implemented components
- **Docker**: Containerized deployment ready

### 🎯 **Features Implemented**

#### **Public View (Complete)**
- Emergency status display with real-time updates
- Location-based risk assessment
- Interactive preparedness checklist
- Family member tracking
- Emergency resource access

#### **Backend API**
- Health monitoring endpoints
- Synthetic hazard data generation
- Risk assessment calculations
- Safe route recommendations

## 🏗️ **Project Structure**

```
disaster-response-dashboard/
├── frontend/                 # TypeScript React application
│   ├── src/
│   │   ├── components/       # Reusable UI components
│   │   ├── pages/           # Main application views
│   │   ├── services/        # API integration
│   │   ├── stores/          # State management
│   │   └── types/           # TypeScript definitions
│   └── tests/               # Unit and integration tests
├── backend/                  # Python Flask API
│   ├── functions/           # API endpoints
│   ├── utils/               # Utility functions
│   └── transforms/          # Data processing
├── docs/                    # Documentation
│   ├── plans/              # Development plans
│   ├── summaries/          # Phase summaries
│   ├── deployment/         # Deployment guides
│   └── reference/          # HTML reference files
├── scripts/                 # Automation scripts
└── tests/                   # Backend tests
```

## 🚀 **Quick Start**

### **Prerequisites**
- Node.js 18+ and npm
- Python 3.8+ and pip
- Docker and Docker Compose

### **Development Setup**

1. **Clone and Setup**
   ```bash
   git clone <repository-url>
   cd disaster-response-dashboard
   ```

2. **Start Backend**
   ```bash
   docker-compose up -d backend
   ```

3. **Start Frontend**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

4. **Access Application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5001

### **Testing**

```bash
# Frontend tests
cd frontend
npm run test

# Backend tests
python -m pytest tests/

# Run all tests
python run_tests.py
```

## 📊 **Current Test Coverage**

- **Frontend**: 30/30 tests passing (100% coverage)
- **Backend**: API endpoints fully tested
- **Integration**: End-to-end testing ready

## 🎯 **Development Phases**

### ✅ **Phase 1: Foundation** (Complete)
- TypeScript React setup with Vite
- Tailwind CSS styling system
- Zustand state management
- Comprehensive testing framework

### ✅ **Phase 2: Public View** (Complete)
- Emergency status display
- Location-based risk assessment
- Interactive preparedness checklist
- Family member tracking
- Emergency resource access

### 🚧 **Phase 3: Field View** (Next)
- Mobile-first design
- GPS integration
- Real-time navigation
- Offline capability

### 📋 **Phase 4: Command View** (Planned)
- Real-time analytics dashboard
- Resource management
- Role-based access control
- Advanced reporting

### 🧪 **Phase 5: Integration** (Planned)
- End-to-end testing
- Performance optimization
- Production deployment
- Smoke testing

## 🔧 **Available Commands**

### **Frontend**
```bash
cd frontend
npm run dev          # Start development server
npm run build        # Build for production
npm run test         # Run unit tests
npm run test:coverage # Run tests with coverage
npm run lint         # Check code quality
npm run format       # Format code
```

### **Backend**
```bash
# Start with Docker
docker-compose up -d backend

# Run tests
python -m pytest tests/

# Manual start
cd backend
python -m flask run --port=5001
```

### **Project**
```bash
# Run all tests
python run_tests.py

# Start demo environment
./run-demo.sh

# Stop demo environment
./stop-demo.sh
```

## 📚 **Documentation**

- **Development Plans**: `docs/plans/`
- **Phase Summaries**: `docs/summaries/`
- **Deployment Guides**: `docs/deployment/`
- **Reference Files**: `docs/reference/`

## 🏗️ **Architecture**

### **Frontend Architecture**
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite for fast development
- **Styling**: Tailwind CSS with custom design system
- **State Management**: Zustand for global state
- **Testing**: Vitest + React Testing Library
- **Routing**: React Router for navigation

### **Backend Architecture**
- **Framework**: Flask with Python
- **Data**: Synthetic data generation for testing
- **API**: RESTful endpoints with JSON responses
- **Testing**: Pytest with comprehensive coverage
- **Deployment**: Docker containerization

## 🤝 **Contributing**

1. Follow the established testing patterns
2. Maintain 100% test coverage for new features
3. Use TypeScript for all frontend code
4. Follow the component architecture patterns
5. Update documentation for new features

## 📄 **License**

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 **Support**

For questions or issues:
1. Check the documentation in `docs/`
2. Review test files for usage examples
3. Check the current status in `docs/summaries/`

---

**Current Phase**: Phase 2 Complete - Ready for Phase 3: Field View Implementation 