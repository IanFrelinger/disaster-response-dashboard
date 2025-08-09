# Disaster Response Dashboard

A comprehensive disaster response management system with 3D terrain visualization, real-time hazard monitoring, and automated testing capabilities.

## 🚀 Quick Start

### Prerequisites
- Docker and Docker Compose
- Node.js 18+ (for development)
- Python 3.11+ (for development)

### 1. Start the Application
```bash
# Start all services
./scripts/start.sh

# Or use the deployment script with testing
./scripts/deploy.sh
```

### 2. Access the Application
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5001
- **Health Check**: http://localhost:5001/api/health

### 3. Run Tests
```bash
# Quick tests
./scripts/test.sh --quick

# Full test suite
./scripts/test.sh
```

## 📁 Project Structure

```
disaster-response-dashboard/
├── backend/                 # Python Flask API
│   ├── tests/              # Backend test suites
│   ├── Dockerfile          # Production container
│   └── Dockerfile.test     # Testing container
├── frontend/               # React TypeScript app
│   ├── tests/              # Frontend test suites
│   ├── Dockerfile          # Production container
│   └── Dockerfile.test     # Testing container
├── scripts/                # Automation scripts
│   ├── test.sh            # Main testing script (symlink)
│   ├── deploy.sh          # Main deployment script (symlink)
│   ├── start.sh           # Start services (symlink)
│   ├── stop.sh            # Stop services (symlink)
│   ├── testing/           # Testing scripts
│   ├── deployment/        # Deployment scripts
│   └── legacy/            # Legacy scripts
├── docs/                   # Documentation
│   ├── LOCAL_TESTING_README.md
│   ├── AUTOMATED_TESTING_GUIDE.md
│   ├── reports/           # Test and deployment reports
│   ├── summaries/         # Project summaries
│   └── legacy/            # Legacy documentation
├── config/                # Configuration files
│   └── docker/           # Docker Compose configs
├── data/                  # Static data files
├── tiles/                 # Map tile data
└── tools/                 # Development tools
```

## 🧪 Testing

### Automated Testing Suite
The project includes comprehensive automated testing to prevent blank pages and errors:

```bash
# Run all tests
./scripts/test.sh

# Quick tests only
./scripts/test.sh --quick

# Specific test categories
./scripts/test.sh smoke backend frontend
```

### Test Categories
- **Smoke Tests**: Basic connectivity and health checks
- **Backend Tests**: API integration and unit tests
- **Frontend Tests**: UI functionality and content validation
- **Integration Tests**: Frontend-backend communication
- **Performance Tests**: Response time and load testing
- **Security Tests**: Vulnerability scanning
- **Accessibility Tests**: WCAG compliance
- **Visual Tests**: UI element validation

## 🚀 Deployment

### Local Deployment
```bash
# Deploy with comprehensive testing
./scripts/deploy.sh

# Deploy with quick tests only
./scripts/deploy.sh --quick-tests

# Deploy without tests (development only)
./scripts/deploy.sh --skip-tests
```

### Production Deployment
The deployment process includes:
1. Pre-deployment testing
2. Service deployment
3. Health verification
4. Post-deployment validation
5. Report generation

## 📊 Monitoring

### Health Checks
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5001/api/health

### Performance Metrics
- Frontend load time: < 5 seconds
- API response time: < 2 seconds
- Error rate: < 1%

### Logs
```bash
# View all logs
docker-compose -f config/docker/docker-compose.yml logs -f

# View specific service logs
docker-compose -f config/docker/docker-compose.yml logs -f backend
docker-compose -f config/docker/docker-compose.yml logs -f frontend
```

## 🔧 Development

### Backend Development
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
python run_synthetic_api.py
```

### Frontend Development
```bash
cd frontend
npm install
npm run dev
```

### Running Tests During Development
```bash
# Backend tests
cd backend && python -m pytest tests/ -v

# Frontend tests
cd frontend && npm run test

# Integration tests
./scripts/test.sh integration
```

## 📚 Documentation

- **[Local Testing Guide](docs/LOCAL_TESTING_README.md)**: Complete guide to local testing
- **[Automated Testing Guide](docs/AUTOMATED_TESTING_GUIDE.md)**: Comprehensive testing documentation
- **[Quick Start Guide](docs/QUICK_START_GUIDE.md)**: Getting started quickly
- **[Configuration Guide](docs/CONFIGURATION_GUIDE.md)**: System configuration
- **[Business Value](docs/BUSINESS_VALUE.md)**: Project business case

## 🛠️ Scripts Reference

### Main Scripts (in scripts/ directory)
- `test.sh` → `testing/local-testing-suite.sh` - Comprehensive testing
- `deploy.sh` → `deployment/local-deploy.sh` - Local deployment
- `start.sh` → `deployment/start-containerized.sh` - Start services
- `stop.sh` → `deployment/stop-containerized.sh` - Stop services

### Testing Scripts
- `testing/local-testing-suite.sh` - Main testing suite
- `testing/run-containerized-tests.sh` - Container-based testing

### Deployment Scripts
- `deployment/local-deploy.sh` - Local deployment with testing
- `deployment/ci-cd-pipeline.sh` - CI/CD pipeline script
- `deployment/start-containerized.sh` - Start containerized services
- `deployment/stop-containerized.sh` - Stop containerized services

## 🚨 Troubleshooting

### Common Issues

#### Services Not Starting
```bash
# Check Docker status
docker info

# Check container logs
docker-compose -f config/docker/docker-compose.yml logs

# Restart services
./scripts/stop.sh && ./scripts/start.sh
```

#### Tests Failing
```bash
# Check service health
curl http://localhost:5001/api/health
curl http://localhost:3000

# Run specific test categories
./scripts/test.sh smoke
```

#### Performance Issues
```bash
# Check resource usage
docker stats

# Monitor logs
docker-compose -f config/docker/docker-compose.yml logs -f
```

## 📈 Features

### Core Features
- **3D Terrain Visualization**: Interactive 3D maps with Mapbox
- **Real-time Hazard Monitoring**: Live disaster data integration
- **Route Optimization**: Safe route calculation
- **Johnny Ive Design**: Minimalist, clean UI design
- **Responsive Design**: Mobile-first approach
- **Accessibility**: WCAG compliant

### Technical Features
- **Automated Testing**: Comprehensive test suite
- **Containerized Deployment**: Docker-based deployment
- **Health Monitoring**: Real-time service health checks
- **Performance Optimization**: Fast response times
- **Security**: Vulnerability scanning and protection
- **Documentation**: Comprehensive guides and reports

## 🤝 Contributing

1. **Run tests before making changes**: `./scripts/test.sh`
2. **Follow the testing guidelines**: See [Local Testing Guide](docs/LOCAL_TESTING_README.md)
3. **Update documentation**: Keep docs current with changes
4. **Test your changes**: Ensure all tests pass before submitting

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

**Built with confidence** - Comprehensive automated testing ensures you never walk into blank pages or errors upon deployment! 🚀
