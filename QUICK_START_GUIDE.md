# Quick Start Guide: TypeScript Frontend Implementation

## 🚀 Get Started in 5 Minutes

### 1. Prerequisites
```bash
# Ensure you have Node.js 18+ installed
node --version  # Should be 18.0.0 or higher
npm --version   # Should be 8.0.0 or higher
```

### 2. Run the Setup Script
```bash
# Make sure you're in the project root
cd /Users/ianfrelinger/PycharmProjects/disaster-response-dashboard

# Run the automated setup script
./scripts/setup-frontend.sh
```

### 3. Start Development
```bash
# Navigate to frontend directory
cd frontend

# Install dependencies (if not already done by script)
npm install

# Start development server
npm run dev
```

### 4. Verify Setup
- Open http://localhost:3000 in your browser
- You should see placeholder pages for all three views
- Backend API should be accessible at http://localhost:5001

## 📋 Development Workflow

### Phase 1: Foundation (Week 1)
```bash
# 1. Set up project structure (✅ Done by script)
# 2. Create core components
cd frontend/src/components/common
# Create: Button.tsx, Card.tsx, Input.tsx, etc.

# 3. Set up API integration
cd frontend/src/services
# Verify: api.ts is properly configured

# 4. Create basic tests
cd frontend/tests/unit
# Create tests for each component
```

### Phase 2: Public View (Week 2)
```bash
# 1. Create public view components
cd frontend/src/components/public
# Create: StatusCard.tsx, LocationChecker.tsx, ActionChecklist.tsx

# 2. Implement PublicView page
cd frontend/src/pages
# Create: PublicView.tsx

# 3. Add tests
cd frontend/tests/unit
# Create: StatusCard.test.tsx, LocationChecker.test.tsx

# 4. Run tests
npm run test
```

### Phase 3: Field View (Week 3)
```bash
# 1. Create field view components
cd frontend/src/components/field
# Create: TacticalMap.tsx, NavigationPanel.tsx, QuickActions.tsx

# 2. Implement FieldView page
cd frontend/src/pages
# Create: FieldView.tsx

# 3. Add mobile-specific features
# GPS integration, offline capability, touch optimization
```

### Phase 4: Command View (Week 4)
```bash
# 1. Create command view components
cd frontend/src/components/command
# Create: MetricsGrid.tsx, TacticalMap.tsx, ResourceTable.tsx

# 2. Implement CommandView page
cd frontend/src/pages
# Create: CommandView.tsx

# 3. Add real-time features
# WebSocket integration, live updates, role-based access
```

## 🧪 Testing Strategy

### Unit Tests (100% Coverage Target)
```bash
# Run unit tests
npm run test

# Run with coverage
npm run test:coverage

# Watch mode for development
npm run test -- --watch
```

### E2E Tests
```bash
# Install Playwright browsers
npx playwright install

# Run E2E tests
npm run test:e2e

# Run specific test file
npx playwright test tests/e2e/public-view.spec.ts
```

### Smoke Tests
```bash
# Run smoke tests
npm run test:smoke

# Run performance tests
npm run test:performance
```

## 📊 Code Quality

### Linting and Formatting
```bash
# Check for linting issues
npm run lint

# Fix linting issues automatically
npm run lint:fix

# Format code
npm run format

# Type checking
npm run type-check
```

### Pre-commit Hooks
```bash
# Install husky for git hooks
npm install -D husky lint-staged

# Add to package.json
{
  "husky": {
    "hooks": {
      "pre-commit": "lint-staged"
    }
  },
  "lint-staged": {
    "*.{ts,tsx}": [
      "eslint --fix",
      "prettier --write"
    ]
  }
}
```

## 🔗 API Integration

### Backend Connection
```bash
# Ensure backend is running
docker-compose up -d backend

# Test API connection
curl http://localhost:5001/api/health

# Frontend will proxy API calls to backend
# Configured in vite.config.ts
```

### Environment Variables
```bash
# Create .env file in frontend directory
VITE_API_BASE_URL=http://localhost:5001
VITE_ENVIRONMENT_MODE=development
```

## 📱 Responsive Design

### Mobile-First Approach
```css
/* Tailwind responsive classes */
<div className="w-full md:w-1/2 lg:w-1/3">
  <!-- Content that adapts to screen size -->
</div>
```

### Touch Optimization
```css
/* Large touch targets for mobile */
<button className="min-h-[44px] min-w-[44px]">
  <!-- Touch-friendly button -->
</button>
```

## 🚀 Deployment

### Development
```bash
# Start development server
npm run dev

# Access at http://localhost:3000
```

### Staging
```bash
# Build for staging
npm run build:staging

# Preview build
npm run preview
```

### Production
```bash
# Build for production
npm run build

# Deploy to CDN/static hosting
# Configure environment variables for production API
```

## 🔧 Troubleshooting

### Common Issues

#### 1. Import Path Issues
```typescript
// Use absolute imports with @ alias
import { Button } from '@/components/common/Button'
// Instead of relative imports
import { Button } from '../../../components/common/Button'
```

#### 2. TypeScript Errors
```bash
# Run type checking
npm run type-check

# Check for missing types
npm install -D @types/package-name
```

#### 3. Test Failures
```bash
# Clear test cache
npm run test -- --clearCache

# Run tests in verbose mode
npm run test -- --verbose
```

#### 4. Build Issues
```bash
# Clear build cache
rm -rf node_modules/.vite

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

## 📚 Resources

### Documentation
- [Development Plan](./FRONTEND_DEVELOPMENT_PLAN.md)
- [Smoke Testing Plan](./SMOKE_TESTING_PLAN.md)
- [API Documentation](./backend/README.md)

### External Resources
- [React Documentation](https://react.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Vitest Testing](https://vitest.dev/)
- [Playwright Testing](https://playwright.dev/)

## 🎯 Success Checklist

### Week 1 Goals
- [ ] Project structure set up
- [ ] Core components created
- [ ] API integration working
- [ ] Basic tests passing
- [ ] Development server running

### Week 2 Goals
- [ ] Public view implemented
- [ ] 100% test coverage for public view
- [ ] Responsive design working
- [ ] API integration tested

### Week 3 Goals
- [ ] Field view implemented
- [ ] Mobile optimization complete
- [ ] Offline capability working
- [ ] GPS integration tested

### Week 4 Goals
- [ ] Command view implemented
- [ ] Real-time features working
- [ ] Role-based access implemented
- [ ] Performance optimized

### Final Goals
- [ ] All views implemented
- [ ] 100% test coverage achieved
- [ ] Smoke tests passing
- [ ] Production deployment ready

## 🚀 Next Steps

1. **Run the setup script**: `./scripts/setup-frontend.sh`
2. **Start development**: `cd frontend && npm run dev`
3. **Begin with Public View**: Follow the development plan
4. **Write tests as you go**: Maintain 100% coverage
5. **Run smoke tests regularly**: Ensure production readiness

This quick start guide will get you up and running with the TypeScript frontend in minutes, with a clear path to achieving 100% test coverage and comprehensive smoke testing.
