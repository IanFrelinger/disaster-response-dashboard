# Tools Directory

This directory contains various tools and utilities for testing, validation, monitoring, and deployment of the Disaster Response Dashboard.

## 📁 Directory Structure

### 🔍 **validation/**
Contains tools for validating tile integration and system components:
- `test_tile_integration.py` - Comprehensive tile integration testing
- `validate_tile_integration.py` - Advanced tile validation with detailed reporting
- `tile_integration_validation.json` - Tile integration test results
- `validation_report_advanced.json` - Detailed validation reports

### 🧪 **testing/**
Contains testing tools and scripts:
- `container_smoke_test.py` - Container health and functionality testing
- `smoke_test.py` - Basic system smoke testing
- `spa_smoke_test.py` - Single Page Application testing
- `integration_test.py` - End-to-end integration testing
- `run_tests.py` - Test runner and orchestration
- Various test result JSON files

### ⚡ **performance/**
Contains performance monitoring and testing tools:
- `quick_performance_test.py` - Quick performance benchmarks
- `performance_monitor.py` - Continuous performance monitoring

### 📊 **monitoring/**
Contains monitoring and logging tools:
- `visual_verification.py` - Visual verification of system components
- `tile_monitor_history.json` - Tile monitoring history
- `tile_monitor.log` - Tile monitoring logs

### 🚀 **deployment/**
Contains deployment and management scripts:
- `run-demo-with-tiles.sh` - Start complete demo with tile system
- `stop-demo-with-tiles.sh` - Stop demo environment
- `run-demo.sh` - Start basic demo
- `stop-demo.sh` - Stop basic demo
- `start-dashboard.sh` - Start dashboard services
- `deploy-demo.sh` - Deploy demo environment
- `test-api.sh` - API testing script

## 🎯 **Usage Examples**

### Run Tile Integration Tests
```bash
cd tools/validation
python test_tile_integration.py
```

### Start Demo with Tiles
```bash
cd tools/deployment
./run-demo-with-tiles.sh
```

### Run Performance Tests
```bash
cd tools/performance
python quick_performance_test.py
```

### Monitor System Health
```bash
cd tools/monitoring
python visual_verification.py
```

## 📋 **Tool Categories**

### **Validation Tools**
- Tile server connectivity
- Map layer availability
- Data integrity checks
- Configuration validation

### **Testing Tools**
- Smoke tests for all components
- Integration testing
- Container health checks
- API endpoint testing

### **Performance Tools**
- Response time measurements
- Resource usage monitoring
- Load testing capabilities
- Performance benchmarking

### **Monitoring Tools**
- System health monitoring
- Log analysis
- Visual verification
- Continuous monitoring

### **Deployment Tools**
- Environment setup
- Service orchestration
- Health checks
- Cleanup procedures

## 🔧 **Configuration**

Most tools use configuration from the main project:
- Environment variables from `.env` files
- Docker Compose configurations in `config/docker/`
- API endpoints and service URLs

## 📊 **Output and Reports**

Tools generate various output formats:
- **JSON Reports**: Detailed test results and metrics
- **Console Output**: Real-time status and progress
- **Log Files**: Persistent logging for analysis
- **Exit Codes**: Standard exit codes for automation

## 🚨 **Troubleshooting**

### Common Issues
1. **Path Issues**: Ensure you're running tools from the correct directory
2. **Dependencies**: Install required Python packages (`pip install -r requirements.txt`)
3. **Permissions**: Make sure deployment scripts are executable (`chmod +x *.sh`)
4. **Network**: Verify services are accessible on expected ports

### Getting Help
- Check individual tool documentation
- Review generated reports and logs
- Use `--help` flags for command-line options
- Consult the main project README for system overview
