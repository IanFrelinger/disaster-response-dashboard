# Geospatial Disaster Response Dashboard

A comprehensive disaster response system built on Palantir Foundry with real-time hazard monitoring, risk assessment, and safe route planning capabilities.

## 🏗️ Architecture

This project follows a pipeline architecture optimized for flexibility and reusability:

```
disaster-response-dashboard/
├── backend/
│   ├── transforms/          # Foundry Python transforms
│   │   ├── ingestion/      # Feed parsers (NOAA, NASA FIRMS, etc.)
│   │   ├── processing/     # Risk zone computation
│   │   └── routing/        # Path-finding algorithms
│   ├── compute_modules/    # Containerized compute tasks
│   └── functions/          # Foundry Functions (API endpoints)
├── frontend/
│   ├── workshop/           # Foundry Workshop configs
│   └── react-app/          # OSDK React components
├── ontology/
│   ├── schemas/            # Ontology definitions
│   └── actions/            # Action types
├── aip/
│   ├── agents/             # AIP Agent configurations
│   └── prompts/            # Route suggestion prompts
├── docker/
│   └── Dockerfile          # For compute modules
├── tests/
└── docs/
```

## 🚀 Quick Start

### Prerequisites

- Python 3.10+
- Node.js 18+
- Docker (for compute modules)
- Palantir Foundry access

### Backend Setup (PyCharm)

1. **Create virtual environment:**
   ```bash
   python -m venv venv
   source venv/bin/activate  # or venv\Scripts\activate on Windows
   ```

2. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   pip install -e .  # Install package in editable mode
   ```

3. **Configure PyCharm:**
   - Set Python interpreter to `./venv/bin/python`
   - Configure environment variables:
     - `FOUNDRY_TOKEN`: your-token
     - `FOUNDRY_URL`: your-stack-url
   - Install recommended plugins:
     - Palantir Foundry Plugin
     - Big Data Tools
     - Scientific Mode

4. **Run tests:**
   ```bash
   pytest tests/
   ```

### Frontend Setup (Cursor)

1. **Install dependencies:**
   ```bash
   cd frontend
   npm install
   ```

2. **Start development server:**
   ```bash
   npm run dev
   ```

3. **Configure environment:**
   Create `.env.local`:
   ```
   REACT_APP_MAPBOX_TOKEN=your-mapbox-token
   REACT_APP_FOUNDRY_URL=your-foundry-url
   ```

## 🔧 Core Components

### Backend Transforms

#### Ingestion (`backend/transforms/ingestion/`)
- **Wildfire Feed**: Processes NASA FIRMS MODIS data
- **Weather Data**: Integrates NOAA weather feeds
- **Infrastructure**: Loads critical infrastructure data

#### Processing (`backend/transforms/processing/`)
- **Risk Computation**: Multi-factor risk scoring
- **H3 Indexing**: Spatial indexing for efficient queries
- **Temporal Analysis**: Time-based risk assessment

#### Routing (`backend/transforms/routing/`)
- **Safe Route Calculator**: A* algorithm with hazard avoidance
- **Network Analysis**: OSM road network integration
- **Evacuation Planning**: Multi-point route optimization

### Frontend Components

#### Hazard Map (`frontend/src/components/HazardMap.tsx`)
- Real-time hazard visualization
- Interactive risk assessment
- Safe route display
- Multi-layer mapping with deck.gl

#### API Integration
- Foundry Functions integration
- Real-time data updates
- Caching with React Query

## 🐳 Docker Deployment

### Build Compute Module
```bash
docker build -f docker/Dockerfile -t disaster-response-processor .
```

### Run Container
```bash
docker run -e FOUNDRY_TOKEN=your-token disaster-response-processor
```

## 📊 Data Pipeline

1. **Ingestion**: Raw feeds from NOAA, NASA FIRMS, USGS
2. **Processing**: Risk scoring, spatial indexing, temporal analysis
3. **Routing**: Safe path computation with hazard avoidance
4. **API**: RESTful endpoints for frontend consumption
5. **Visualization**: Real-time dashboard with interactive maps

## 🧪 Testing Strategy

### Backend Tests
```bash
# Run all tests
pytest tests/

# Run specific test file
pytest tests/test_routing.py

# Run with coverage
pytest --cov=backend tests/
```

### Frontend Tests
```bash
cd frontend
npm test
```

## 🔄 Foundry Integration

### Sync Local Changes
```bash
python scripts/sync_to_foundry.py sync-transforms --env dev --repository-rid your-repo-rid
```

### List Repositories
```bash
python scripts/sync_to_foundry.py list-repositories --env dev
```

## 🛠️ Development Workflow

### 1. Local Development
- Use PyCharm for Python development with full debugging
- Use Cursor for React/TypeScript with AI assistance
- Test each component individually before integration

### 2. Pipeline Architecture
- Each transform is independent and testable
- Components can be mixed and matched across projects
- Clear separation between local development and Foundry deployment

### 3. Testing Approach
- Create test solutions for each layer/feature
- Build solutions one by one to ensure no errors
- Comprehensive unit and integration tests

## 📈 Monitoring & Logging

- **Structured Logging**: Using structlog for consistent log format
- **Metrics**: Prometheus integration for performance monitoring
- **Health Checks**: Docker health checks for compute modules

## 🔐 Security

- Non-root Docker containers
- Environment variable configuration
- Secure credential management
- Input validation and sanitization

## 🤝 Contributing

1. Follow the pipeline architecture pattern
2. Write tests for new features
3. Use structured logging
4. Document API changes
5. Test locally before pushing to Foundry

## 📚 Documentation

- [API Documentation](docs/api.md)
- [Deployment Guide](docs/deployment.md)
- [Troubleshooting](docs/troubleshooting.md)

## 🆘 Support

For issues and questions:
1. Check the troubleshooting guide
2. Review test cases for examples
3. Check Foundry documentation
4. Contact the development team

---

**Built with ❤️ for disaster response and emergency management** 