# Dependency Management Standardization

This document outlines the standardized approach to managing dependencies between development and production environments.

## 🎯 Overview

We've implemented a **three-tier dependency management system** to ensure consistency, security, and optimal builds across all environments.

## 📁 File Structure

```
frontend/
├── package.json              # Main package (dev + runtime deps)
├── package.prod.json         # Production-only runtime deps
├── package.build.json        # Build-time deps (minimal set)
├── .npmrc                    # Development npm configuration
├── .npmrc.prod              # Production npm configuration
└── scripts/
    └── deps-check.js        # Dependency consistency checker
```

## 🔧 Package Files

### 1. **package.json** (Main)
- **Purpose**: Development environment with full dependency set
- **Contains**: All runtime dependencies + development tools
- **Use Case**: Local development, testing, CI/CD

### 2. **package.prod.json** (Production)
- **Purpose**: Production runtime dependencies only
- **Contains**: Minimal set needed for production
- **Use Case**: Production deployments, runtime validation

### 3. **package.build.json** (Build)
- **Purpose**: Build-time dependencies only
- **Contains**: Minimal set needed for building
- **Use Case**: Docker builds, CI/CD builds

## 🚀 Available Scripts

```bash
# Check dependency consistency
npm run deps:check

# Validate dependencies and security
npm run deps:validate

# Build for production
npm run build:prod

# Build using Docker-optimized dependencies
npm run build:docker
```

## 🔍 Dependency Consistency Checker

The `deps-check.js` script validates:

- ✅ **Runtime Dependencies**: Properly placed in main deps
- ✅ **Dev Dependencies**: Properly separated from runtime
- ✅ **Build Dependencies**: All necessary deps included
- ✅ **Production Dependencies**: Runtime deps mirrored correctly

## 🐳 Docker Integration

### **Multi-Stage Build Process**

1. **Base Stage**: Installs build dependencies only
2. **Production Stage**: Serves built static files via nginx

### **Dockerfile Optimizations**

```dockerfile
# Install build dependencies only (minimal set)
COPY package.build.json ./package.json
COPY .npmrc.prod ./.npmrc
RUN npm ci --only=production && npm cache clean --force
```

### **Benefits**
- 🚀 **Faster Builds**: Smaller dependency set
- 🐳 **Smaller Images**: No dev dependencies in final image
- 🔒 **Security**: Reduced attack surface
- 📦 **Consistency**: Same deps across all builds

## 📊 Dependency Categories

### **Runtime Dependencies** (21 packages)
- React ecosystem (react, react-dom, react-hook-form)
- UI libraries (@headlessui/react, @heroicons/react)
- Map libraries (mapbox-gl, react-map-gl, deck.gl)
- Utility libraries (axios, date-fns, zustand)

### **Development Dependencies** (38 packages)
- Testing frameworks (vitest, playwright, @testing-library/*)
- Linting tools (eslint, prettier)
- Build tools (vite, typescript, postcss)
- Type definitions (@types/*)

### **Build Dependencies** (59 packages)
- **Combined**: Runtime + Dev dependencies needed for building
- **Purpose**: Complete build environment in Docker

## 🔄 Workflow

### **Development**
```bash
# Install all dependencies
npm install

# Run tests
npm run test:simple

# Check dependency consistency
npm run deps:check
```

### **Production Build**
```bash
# Build with Docker-optimized deps
npm run build:docker

# Or standard production build
npm run build:prod
```

### **Docker Build**
```bash
# From project root
docker-compose build --no-cache --pull
```

## 🛡️ Security Features

### **NPM Configuration**
- **Legacy Peer Deps**: Handles complex dependency trees
- **Audit Level**: Moderate security scanning
- **Registry**: Official npm registry only
- **Lock Files**: Ensures consistent installs

### **Production Hardening**
- **Minimal Dependencies**: Only runtime deps in production
- **Security Updates**: Regular dependency updates
- **Vulnerability Scanning**: Automated security checks

## 📈 Performance Benefits

### **Build Performance**
- **Faster Installs**: Smaller dependency set for builds
- **Reduced Network**: Fewer packages to download
- **Cache Efficiency**: Better Docker layer caching

### **Runtime Performance**
- **Smaller Bundles**: No dev dependencies in production
- **Faster Startup**: Reduced package resolution time
- **Memory Efficiency**: Minimal runtime footprint

## 🔧 Troubleshooting

### **Common Issues**

#### **Dependency Conflicts**
```bash
# Check for conflicts
npm run deps:check

# Fix with legacy peer deps
npm install --legacy-peer-deps
```

#### **Build Failures**
```bash
# Use Docker-optimized build
npm run build:docker

# Check dependency consistency
npm run deps:check
```

#### **Version Mismatches**
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

### **Validation Commands**
```bash
# Full validation
npm run deps:validate

# Security check
npm audit --audit-level=moderate

# Type checking
npm run type-check
```

## 🚀 Best Practices

### **Adding New Dependencies**

1. **Runtime Dependencies**
   ```bash
   npm install package-name
   # Automatically added to package.json dependencies
   ```

2. **Development Dependencies**
   ```bash
   npm install --save-dev package-name
   # Automatically added to package.json devDependencies
   ```

3. **Update All Package Files**
   ```bash
   # After adding new deps, run consistency check
   npm run deps:check
   
   # Manually update package.prod.json and package.build.json if needed
   ```

### **Maintenance**

1. **Regular Updates**
   ```bash
   # Update dependencies
   npm update
   
   # Check for security issues
   npm audit
   
   # Validate consistency
   npm run deps:check
   ```

2. **Version Pinning**
   - Use exact versions for critical dependencies
   - Use caret ranges for minor updates
   - Regular security updates

## 📋 Checklist

### **Before Committing**
- [ ] `npm run deps:check` passes
- [ ] `npm run build:docker` succeeds
- [ ] All package files are updated
- [ ] No dependency conflicts

### **Before Deploying**
- [ ] `npm run deps:validate` passes
- [ ] Docker build succeeds
- [ ] Production dependencies are minimal
- [ ] Security audit passes

### **Regular Maintenance**
- [ ] Weekly dependency updates
- [ ] Monthly security audits
- [ ] Quarterly dependency reviews
- [ ] Annual major version updates

## 🔗 Related Documentation

- [Vite Build Configuration](../vite.config.ts)
- [Docker Configuration](../Dockerfile)
- [Testing Strategy](../src/testing/README.md)
- [CI/CD Pipeline](../.github/workflows/)

---

**Last Updated**: September 1, 2025  
**Maintainer**: Development Team  
**Version**: 1.0.0

