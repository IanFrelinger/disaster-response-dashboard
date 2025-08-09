# Disaster Response Dashboard - Setup Instructions

## 🚀 Quick Setup (Recommended for Mac Users)

### Option 1: One-Button Setup (Easiest)
If you're on macOS, you can set up everything with a single command:

```bash
# 1. Clone or download the project
git clone <repository-url>
cd disaster-response-dashboard

# 2. Run the automated setup script
./scripts/setup-mac.sh
```

That's it! The script will automatically:
- Install all prerequisites (Homebrew, Docker, Node.js, Python)
- Set up the environment
- Build and start the application
- Provide you with access URLs

### Option 2: Manual Setup
If you prefer manual setup or are on a different platform, follow the steps below.

---

## 📋 Prerequisites

Before starting, ensure you have the following installed:

### Required Software
- **Docker Desktop** (with Docker Compose)
- **Node.js 18+** (for development)
- **Python 3.11+** (for development)

### How to Install Prerequisites

#### On macOS:
```bash
# Install Homebrew (if not already installed)
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Install Docker Desktop
brew install --cask docker

# Install Node.js
brew install node

# Install Python
brew install python
```

#### On Windows:
1. Download and install [Docker Desktop](https://www.docker.com/products/docker-desktop/)
2. Download and install [Node.js](https://nodejs.org/) (LTS version)
3. Download and install [Python](https://www.python.org/downloads/) (3.11+)

#### On Linux (Ubuntu/Debian):
```bash
# Install Docker
sudo apt update
sudo apt install docker.io docker-compose

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install Python
sudo apt install python3 python3-pip
```

---

## 🔧 Manual Setup Steps

### Step 1: Clone the Repository
```bash
git clone <repository-url>
cd disaster-response-dashboard
```

### Step 2: Verify Prerequisites
```bash
# Check Docker
docker --version
docker-compose --version

# Check Node.js
node --version  # Should be 18.0.0 or higher

# Check Python
python3 --version  # Should be 3.11.0 or higher
```

### Step 3: Start the Application

#### Option A: Using Docker (Recommended)
```bash
# Start all services
./scripts/start.sh

# Or manually with docker-compose
cd config/docker
docker-compose up -d
```

#### Option B: Development Mode
```bash
# Backend (Terminal 1)
cd backend
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
python run_synthetic_api.py

# Frontend (Terminal 2)
cd frontend
npm install
npm run dev
```

### Step 4: Verify Installation
Once the services are running, you should be able to access:

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5001
- **Health Check**: http://localhost:5001/api/health

---

## 🧪 Testing the Setup

### Run Automated Tests
```bash
# Quick tests
./scripts/test.sh --quick

# Full test suite
./scripts/test.sh

# Specific test categories
./scripts/test.sh smoke backend frontend
```

### Manual Verification
1. **Frontend Test**: Open http://localhost:3000 in your browser
2. **Backend Test**: Visit http://localhost:5001/api/health
3. **API Test**: Check if the API returns a healthy status

---

## 🐛 Troubleshooting

### Common Issues and Solutions

#### Docker Issues
```bash
# Check if Docker is running
docker info

# Restart Docker Desktop (macOS/Windows)
# Or restart Docker service (Linux)
sudo systemctl restart docker

# Clean up Docker resources
docker system prune -a
```

#### Port Conflicts
If you see "port already in use" errors:
```bash
# Check what's using the ports
lsof -i :3000
lsof -i :5001

# Stop conflicting services or change ports in docker-compose.yml
```

#### Build Failures
```bash
# Clean and rebuild
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

#### Permission Issues
```bash
# Make scripts executable
chmod +x scripts/*.sh

# Fix Docker permissions (Linux)
sudo usermod -aG docker $USER
```

### Getting Help
If you encounter issues:

1. **Check the logs**:
   ```bash
   docker-compose logs -f
   ```

2. **Verify service status**:
   ```bash
   docker-compose ps
   ```

3. **Run health checks**:
   ```bash
   curl http://localhost:5001/api/health
   ```

4. **Check documentation**: See `docs/` folder for detailed guides

---

## 📚 Additional Resources

### Documentation
- **Quick Start Guide**: `docs/QUICK_START_GUIDE.md`
- **Mac Setup Guide**: `docs/MAC_SETUP_GUIDE.md`
- **Local Testing**: `docs/LOCAL_TESTING_README.md`
- **Configuration**: `docs/CONFIGURATION_GUIDE.md`

### Useful Commands
```bash
# View logs
docker-compose logs -f

# Stop services
docker-compose down

# Restart services
docker-compose restart

# View service status
docker-compose ps

# Run tests
./scripts/test.sh

# Stop everything
./scripts/stop.sh
```

### Development Workflow
```bash
# Start development
./scripts/start.sh

# Make changes to code
# (Changes are automatically reflected due to volume mounts)

# Run tests
./scripts/test.sh

# Stop when done
./scripts/stop.sh
```

---

## 🎉 Success!

Once you've completed the setup, you should have:

✅ **Frontend running** at http://localhost:3000  
✅ **Backend API running** at http://localhost:5001  
✅ **Health checks passing**  
✅ **All tests passing**  

You're now ready to use the Disaster Response Dashboard! 🚀

---

## 📞 Support

If you need help:
1. Check the troubleshooting section above
2. Review the documentation in the `docs/` folder
3. Check the logs for error messages
4. Ensure all prerequisites are properly installed

Happy coding! 🎯
