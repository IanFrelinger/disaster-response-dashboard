# 🏔️ 3D Terrain Visualization Dashboard

A focused, single-purpose 3D terrain visualization tool with real Mapbox heightmap tiles and building extrusions for disaster response scenarios.

## 🚀 Features

- **Real 3D Terrain**: Authentic elevation data from Mapbox heightmap tiles
- **3D Building Extrusions**: Real building footprints with height data
- **Interactive Controls**: Style switching, layer toggles, and 3D navigation
- **Foundry Data Integration**: Real-time hazard zones, emergency units, and evacuation routes
- **Smooth 3D Navigation**: Zoom, pan, and rotate with proper 3D perspective
- **Robust Error Handling**: Prevents white screen issues and provides recovery mechanisms

## 🏗️ Architecture

```
disaster-response-dashboard/
├── frontend/                 # React + TypeScript application
│   ├── src/
│   │   ├── App.tsx          # Main application with single route
│   │   ├── pages/
│   │   │   └── Mapbox3DBuildingsDemo.tsx  # 3D terrain page
│   │   ├── components/
│   │   │   └── tacmap/
│   │   │       └── Mapbox3DTerrain.tsx    # 3D terrain component
│   │   ├── services/        # API and data services
│   │   ├── sdk/            # Foundry SDK
│   │   └── types/          # TypeScript types
│   └── test-files/         # Test scripts and results
├── backend/                 # Python API services
├── docs/                   # Documentation
├── data/                   # GeoJSON data files
├── tiles/                  # Map tiles
└── scripts/                # Utility scripts
```

## 🛠️ Quick Start

### Prerequisites
- Node.js 18+ and npm
- Python 3.8+ (for backend)
- Mapbox API key

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

The application will be available at http://localhost:3000/

### Backend Setup (Optional)
```bash
cd backend
pip install -r requirements.txt
python simple_api.py
```

## 🎯 Usage

1. **Navigate to the Application**: Visit http://localhost:3000/
2. **Explore 3D Terrain**: Use mouse to zoom, pan, and rotate
3. **Toggle Layers**: Use the control panel to show/hide different layers
4. **Switch Map Styles**: Choose between different visual themes
5. **Interact with Data**: Click on hazards, units, and routes for details

## 🗺️ Map Features

- **3D Terrain**: Real elevation data with hillshading
- **3D Buildings**: Extruded building footprints with color coding
- **Hazard Zones**: Interactive hazard markers with risk levels
- **Emergency Units**: Available emergency response units
- **Evacuation Routes**: Safe evacuation paths with status

## 🔧 Configuration

### Environment Variables
Create a `.env` file in the frontend directory:
```env
VITE_MAPBOX_TOKEN=your_mapbox_token_here
```

### Map Styles
- **Dark**: Default dark theme
- **Satellite**: Aerial imagery
- **Streets**: Standard street map

## 📚 Documentation

- [Development Documentation](./docs/development/)
- [API Documentation](./docs/)
- [Configuration Guide](./docs/CONFIGURATION_GUIDE.md)

## 🧪 Testing

Test files are located in `frontend/test-files/`:
- Playwright tests for end-to-end validation
- Smoke tests for functionality verification
- Visual regression tests

## 🚀 Deployment

### Docker
```bash
docker-compose up
```

### Production Build
```bash
cd frontend
npm run build
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For issues and questions:
1. Check the [documentation](./docs/)
2. Review [development notes](./docs/development/)
3. Open an issue on GitHub

---

**Built with React, TypeScript, Mapbox GL JS, and Foundry Data Fusion**
