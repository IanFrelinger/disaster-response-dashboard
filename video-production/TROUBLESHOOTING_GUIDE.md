# Capture System Troubleshooting Guide

## Quick Start

1. **Run the debug script first:**
   ```bash
   npm run debug-captures
   ```

2. **Check the output for specific error messages**

3. **Follow the solutions below based on the errors you see**

## Common Issues and Solutions

### 1. FFmpeg Not Found

**Error:** `FFmpeg not available - video operations will be limited`

**Solution:**
```bash
# macOS
brew install ffmpeg

# Ubuntu/Debian
sudo apt-get update
sudo apt-get install ffmpeg

# Windows
# Download from https://ffmpeg.org/download.html
```

**Verify installation:**
```bash
ffmpeg -version
```

### 2. Missing Dependencies

**Error:** `node_modules not found - run npm install first`

**Solution:**
```bash
cd video-production
npm install
```

**If that fails:**
```bash
rm -rf node_modules package-lock.json
npm install
```

### 3. Browser Initialization Failures

**Error:** `Browser initialization failed`

**Solutions:**

**A. Check Playwright installation:**
```bash
npx playwright install chromium
```

**B. Check system permissions:**
```bash
# macOS - check if you need to allow browser access
# Go to System Preferences > Security & Privacy > Privacy > Accessibility
# Add Terminal/iTerm to the list
```

**C. Try different browser arguments:**
```typescript
// In the script, modify browser launch options
this.browser = await chromium.launch({
  headless: false,
  args: [
    '--no-sandbox',
    '--disable-setuid-sandbox',
    '--disable-dev-shm-usage'
  ]
});
```

### 4. Video Recording Issues

**Error:** `Video recording not available`

**Solutions:**

**A. Check browser context configuration:**
```typescript
this.context = await this.browser.newContext({
  viewport: { width: 1920, height: 1080 },
  recordVideo: {
    dir: this.capturesDir,
    size: { width: 1920, height: 1080 }
  }
});
```

**B. Ensure captures directory exists:**
```bash
mkdir -p video-production/captures
```

**C. Check disk space:**
```bash
df -h
```

### 5. File Path Issues

**Error:** `File path contains invalid characters`

**Solutions:**

**A. Check for spaces in file paths:**
```typescript
// Use path.join() for cross-platform compatibility
const outputPath = path.join(this.capturesDir, fileName);
```

**B. Escape special characters in shell commands:**
```typescript
const escapedPath = filePath.replace(/"/g, '\\"');
```

### 6. Memory Issues

**Error:** `JavaScript heap out of memory`

**Solution:**
```bash
# Increase Node.js memory limit
export NODE_OPTIONS="--max-old-space-size=4096"
npm run enhanced-frontend-captures
```

### 7. Timeout Issues

**Error:** `Operation timed out after Xms`

**Solutions:**

**A. Increase timeout values in the script:**
```typescript
private globalTimeout: number = 600000; // 10 minutes
private stepTimeout: number = 120000;   // 2 minutes
private contentTimeout: number = 20000; // 20 seconds
```

**B. Check system performance:**
```bash
# Monitor CPU and memory usage
top
htop
```

### 8. Permission Issues

**Error:** `Permission denied` or `EACCES`

**Solutions:**

**A. Check file permissions:**
```bash
ls -la video-production/captures/
chmod 755 video-production/captures/
```

**B. Check if running as correct user:**
```bash
whoami
# Ensure you own the project directory
```

## Step-by-Step Debugging

### Phase 1: Environment Check
```bash
# 1. Check Node.js version
node --version  # Should be 18+

# 2. Check working directory
pwd  # Should be in video-production

# 3. Check dependencies
ls -la node_modules/
```

### Phase 2: Dependencies Check
```bash
# 1. Check FFmpeg
ffmpeg -version

# 2. Check Playwright
npx playwright --version

# 3. Check npm packages
npm list --depth=0
```

### Phase 3: Browser Test
```bash
# 1. Run minimal browser test
npm run debug-captures

# 2. Check for specific error messages
# 3. Verify browser launches and closes properly
```

### Phase 4: Video Recording Test
```bash
# 1. Check if video files are created
ls -la captures/*.webm

# 2. Check file sizes
du -h captures/*.webm

# 3. Verify video files are not empty
```

## Advanced Debugging

### Enable Verbose Logging
```typescript
// Add to your script
process.env.DEBUG = 'playwright:*';
```

### Check Browser Logs
```typescript
// Add to browser context creation
this.context = await this.browser.newContext({
  viewport: { width: 1920, height: 1080 },
  recordVideo: {
    dir: this.capturesDir,
    size: { width: 1920, height: 1080 }
  },
  logger: {
    isEnabled: (name, severity) => true,
    log: (name, severity, message, args) => console.log(`${name} ${message}`)
  }
});
```

### Monitor System Resources
```bash
# Monitor CPU, memory, and disk usage during execution
top -p $(pgrep -f "ts-node")
iostat 1
iotop
```

## Recovery Strategies

### 1. Browser Recovery
- Close and recreate browser context
- Restart browser process
- Clear browser cache and cookies

### 2. File System Recovery
- Check disk space
- Verify file permissions
- Clean up temporary files

### 3. Process Recovery
- Kill hanging processes
- Restart the script
- Check for zombie processes

## Getting Help

If you're still experiencing issues:

1. **Run the debug script and share the output**
2. **Check the error logs in the captures directory**
3. **Verify your system meets the requirements**
4. **Try running with a minimal configuration first**

## System Requirements

- **Node.js:** 18.0.0 or higher
- **Operating System:** macOS 10.15+, Ubuntu 18.04+, Windows 10+
- **Memory:** 4GB RAM minimum, 8GB recommended
- **Disk Space:** 2GB free space minimum
- **FFmpeg:** 4.0 or higher (optional but recommended)
