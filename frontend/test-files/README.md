# Disaster Response Dashboard - Frontend

TypeScript React frontend for the Disaster Response Dashboard system.

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Run tests
npm run test

# Run E2E tests
npm run test:e2e

# Build for production
npm run build
```

## 📁 Project Structure

- `src/components/` - Reusable UI components
- `src/pages/` - Main page components
- `src/hooks/` - Custom React hooks
- `src/services/` - API integration
- `src/stores/` - State management
- `src/types/` - TypeScript type definitions
- `tests/` - Test files

## 🧪 Testing

- **Unit Tests**: `npm run test`
- **Coverage**: `npm run test:coverage`
- **E2E Tests**: `npm run test:e2e`

## 🎨 Design System

Built with Tailwind CSS and custom design tokens for:
- Colors (primary, danger, warning, success)
- Typography
- Spacing
- Animations

## 🔗 API Integration

Connects to the backend API at `http://localhost:5001` with:
- Real-time data updates
- Error handling
- Loading states
- Type-safe API calls

## 📱 Responsive Design

- Mobile-first approach
- Touch-optimized for field operations
- Accessibility compliant
- Cross-browser compatible

## 🚀 Development Workflow

### Phase 1: Foundation ✅
- [x] Project structure set up
- [x] Core components created
- [x] API integration working
- [x] Basic tests passing
- [x] Development server running

### Phase 2: Public View (In Progress)
- [ ] StatusCard component
- [ ] LocationChecker component
- [ ] ActionChecklist component
- [ ] PublicView page implementation
- [ ] 100% test coverage for public view

### Phase 3: Field View (Planned)
- [ ] TacticalMap component
- [ ] NavigationPanel component
- [ ] QuickActions component
- [ ] Mobile optimization
- [ ] GPS integration

### Phase 4: Command View (Planned)
- [ ] MetricsGrid component
- [ ] ResourceTable component
- [ ] Real-time analytics
- [ ] Role-based access

## 🎯 Current Status

The frontend is now set up with:
- ✅ Vite + React + TypeScript
- ✅ Tailwind CSS with custom design system
- ✅ React Router for navigation
- ✅ Zustand for state management
- ✅ Axios for API integration
- ✅ Vitest + React Testing Library for testing
- ✅ Playwright for E2E testing
- ✅ ESLint + Prettier for code quality
- ✅ Basic component library (Button)
- ✅ Placeholder pages for all three views

## 🔧 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run test` - Run unit tests
- `npm run test:coverage` - Run tests with coverage
- `npm run test:e2e` - Run E2E tests
- `npm run lint` - Check for linting issues
- `npm run lint:fix` - Fix linting issues
- `npm run format` - Format code with Prettier
- `npm run type-check` - Run TypeScript type checking

## 📊 Test Coverage Target

- **Unit Tests**: 100% coverage target
- **Integration Tests**: 90% coverage target
- **E2E Tests**: Critical paths only
- **Smoke Tests**: All critical features

## 🚀 Next Steps

1. **Implement Public View components**
2. **Add comprehensive tests**
3. **Implement Field View with mobile optimization**
4. **Implement Command View with real-time features**
5. **Add smoke testing and performance optimization**

## 📚 Documentation

- [Development Plan](../FRONTEND_DEVELOPMENT_PLAN.md)
- [Smoke Testing Plan](../SMOKE_TESTING_PLAN.md)
- [Quick Start Guide](../QUICK_START_GUIDE.md)
- [API Documentation](../backend/README.md)
