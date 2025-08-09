# Quick Start Guide

## 🚀 Get Running in 5 Minutes

### For Mac Users (Easiest)
```bash
# 1. Clone the project
git clone <repository-url>
cd disaster-response-dashboard

# 2. Run the setup script
./scripts/setup-mac.sh
```

**That's it!** The script handles everything automatically.

### For Other Platforms
```bash
# 1. Clone the project
git clone <repository-url>
cd disaster-response-dashboard

# 2. Start the application
./scripts/start.sh
```

## ✅ Verify It's Working

Open these URLs in your browser:
- **Frontend**: http://localhost:3000
- **Backend Health**: http://localhost:5001/api/health

## 🛠️ Common Commands

```bash
# Start the application
./scripts/start.sh

# Stop the application
./scripts/stop.sh

# View logs
docker-compose logs -f

# Run tests
./scripts/test.sh
```

## 🆘 Need Help?

- **Full Setup Guide**: See `SETUP_INSTRUCTIONS.md`
- **Mac Setup Guide**: See `docs/MAC_SETUP_GUIDE.md`
- **Troubleshooting**: Check the troubleshooting section in `SETUP_INSTRUCTIONS.md`

---

**That's all you need to get started!** 🎉
