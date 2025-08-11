# Setup Checklist

## ✅ Prerequisites Check

- [ ] **Docker Desktop** installed and running
- [ ] **Node.js 18+** installed (`node --version`)
- [ ] **Python 3.11+** installed (`python3 --version`)
- [ ] **Git** installed for cloning the repository

## 🚀 Setup Steps

### Step 1: Get the Code
- [ ] Clone the repository: `git clone <repository-url>`
- [ ] Navigate to project: `cd disaster-response-dashboard`

### Step 2: Choose Your Setup Method

#### Option A: Mac Users (Recommended)
- [ ] Run automated setup: `./scripts/setup-mac.sh`
- [ ] Wait for script to complete (5-10 minutes)
- [ ] **Skip to Step 4**

#### Option B: Manual Setup
- [ ] Make scripts executable: `chmod +x scripts/*.sh`
- [ ] Start the application: `./scripts/start.sh`
- [ ] Wait for containers to build and start

### Step 3: Verify Prerequisites (Manual Setup Only)
- [ ] Docker is running: `docker info`
- [ ] Docker Compose available: `docker-compose --version`
- [ ] Node.js version check: `node --version` (should be 18+)
- [ ] Python version check: `python3 --version` (should be 3.11+)

### Step 4: Verify Application is Running
- [ ] **Frontend accessible**: http://localhost:3000
- [ ] **Backend API accessible**: http://localhost:5001
- [ ] **Health check passing**: http://localhost:5001/api/health
- [ ] **Docker containers healthy**: `docker-compose ps`

## 🧪 Testing

- [ ] **Run quick tests**: `./scripts/test.sh --quick`
- [ ] **Frontend loads** without errors
- [ ] **Backend API responds** correctly
- [ ] **All health checks pass**

## 🎯 Success Criteria

When setup is complete, you should have:

✅ **Frontend running** at http://localhost:3000  
✅ **Backend API running** at http://localhost:5001  
✅ **Health checks passing**  
✅ **Docker containers healthy**  
✅ **All tests passing**  

## 🐛 Troubleshooting Checklist

If something isn't working:

- [ ] **Docker running**: `docker info`
- [ ] **Ports available**: `lsof -i :3000` and `lsof -i :5001`
- [ ] **Scripts executable**: `ls -la scripts/`
- [ ] **Logs checked**: `docker-compose logs -f`
- [ ] **Containers status**: `docker-compose ps`
- [ ] **Health check**: `curl http://localhost:5001/api/health`

## 📚 Next Steps

Once setup is complete:

- [ ] **Read the documentation**: Check `docs/` folder
- [ ] **Explore the application**: Navigate through the UI
- [ ] **Run full test suite**: `./scripts/test.sh`
- [ ] **Review configuration**: Check `config/` folder
- [ ] **Start development**: Make changes and see them reflected

---

## 🎉 Setup Complete!

If you've checked all the boxes above, congratulations! You're ready to use the Disaster Response Dashboard.

**Access your application:**
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5001
- **Health Check**: http://localhost:5001/api/health

**Useful commands:**
- Start: `./scripts/start.sh`
- Stop: `./scripts/stop.sh`
- Tests: `./scripts/test.sh`
- Logs: `docker-compose logs -f`

Happy coding! 🚀
