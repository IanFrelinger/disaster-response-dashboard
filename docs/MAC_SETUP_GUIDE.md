# Mac Setup Guide - Disaster Response Dashboard

## 🚀 One-Button Setup for Mac Users

This guide will help you set up and run the Disaster Response Dashboard on your Mac with a single command.

## 📋 Prerequisites

The setup script will automatically install these prerequisites for you:
- **Homebrew** (package manager for macOS)
- **Docker Desktop** (containerization platform)
- **Node.js 18+** (JavaScript runtime)
- **Python 3.11+** (Python runtime)

## 🎯 Quick Start (One Command)

1. **Clone or download the project** to your Mac
2. **Open Terminal** and navigate to the project directory
3. **Run the setup script:**

```bash
./scripts/setup-mac.sh
```

That's it! The script will handle everything else automatically.

## 📖 What the Setup Script Does

The `setup-mac.sh` script performs these steps automatically:

### Step 1: Install Homebrew
- Checks if Homebrew is installed
- Installs Homebrew if needed
- Configures PATH for the current session

### Step 2: Install Docker Desktop
- Checks if Docker is installed
- Installs Docker Desktop via Homebrew if needed
- Prompts you to start Docker Desktop if not running
- Verifies Docker is working

### Step 3: Check Node.js
- Verifies Node.js 18+ is installed
- Updates Node.js if an older version is found
- Installs Node.js if not present

### Step 4: Check Python
- Verifies Python 3.11+ is available
- Installs Python if not present

### Step 5: Check Port Availability
- Checks if ports 3000, 5001, and 5002 are available
- Warns about potential conflicts
- Allows you to continue or stop

### Step 6: Prepare Environment
- Stops any existing containers
- Cleans up the environment

### Step 7: Start Application
- Builds and starts all Docker containers
- Waits for services to be healthy
- Verifies everything is working

## 🌐 Access Your Application

Once the setup is complete, you can access:

- **Frontend (Public View)**: http://localhost:3000
- **Backend API**: http://localhost:5001
- **Health Check**: http://localhost:5001/api/health

## 🔧 Useful Commands

After setup, you can use these commands:

```bash
# View application logs
docker-compose logs -f

# Stop all services
docker-compose down

# Restart services
docker-compose restart

# View service status
docker-compose ps

# Run tests
./scripts/test.sh

# Quick tests only
./scripts/test.sh --quick

# Stop everything
./scripts/stop.sh
```

## 🐛 Troubleshooting

### Docker Desktop Issues
If Docker Desktop isn't starting:
1. Open Docker Desktop from Applications
2. Complete the initial setup
3. Ensure you see the whale icon in the menu bar
4. Run the setup script again

### Port Conflicts
If you see port conflicts:
1. Check what's using the ports: `lsof -i :3000`
2. Stop conflicting services
3. Or let the script handle it (it will try to stop existing containers)

### Permission Issues
If you get permission errors:
```bash
# Make the script executable
chmod +x scripts/setup-mac.sh

# Run the script
./scripts/setup-mac.sh
```

### Homebrew Issues
If Homebrew installation fails:
```bash
# Install Homebrew manually
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Add to PATH (for Apple Silicon Macs)
echo 'eval "$(/opt/homebrew/bin/brew shellenv)"' >> ~/.zprofile
source ~/.zprofile

# For Intel Macs, use /usr/local/bin/brew instead
```

## 📚 Additional Resources

- **Quick Start Guide**: [docs/QUICK_START_GUIDE.md](QUICK_START_GUIDE.md)
- **Local Testing**: [docs/LOCAL_TESTING_README.md](LOCAL_TESTING_README.md)
- **Configuration**: [docs/CONFIGURATION_GUIDE.md](CONFIGURATION_GUIDE.md)
- **Project README**: [../README.md](../README.md)

## 🆘 Getting Help

If you encounter issues:

1. **Check the logs**: `docker-compose logs -f`
2. **Verify Docker is running**: `docker info`
3. **Check service status**: `docker-compose ps`
4. **Run health checks**: `curl http://localhost:5001/api/health`

## 🎉 Success!

Once everything is running, you should see:
- A success message with URLs to access
- Docker containers running (check with `docker-compose ps`)
- The web application accessible at http://localhost:3000

Happy coding! 🚀
