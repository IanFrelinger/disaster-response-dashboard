# TypeScript Configuration & CI Pipeline Guide

This document explains the TypeScript configuration structure and CI pipeline setup for the Disaster Response Dashboard frontend.

## 📁 TypeScript Configuration Files

### 1. `tsconfig.json` (Base Configuration)
- **Purpose**: Base TypeScript configuration with strict settings
- **Usage**: Development, IDE support, and comprehensive type checking
- **Key Settings**: Strict mode, no unused variables, exact optional properties

### 2. `tsconfig.build.json` (Build Configuration)
- **Purpose**: Production build compilation
- **Usage**: CI builds, production deployments
- **Key Features**:
  - Extends base config
  - Enables output compilation (`noEmit: false`)
  - Excludes test files and testing directories
  - Targets only source code needed for production

### 3. `tsconfig.tests.json` (Test Configuration)
- **Purpose**: Test file type checking
- **Usage**: CI test validation, development test type checking
- **Key Features**:
  - Includes Vitest globals (`describe`, `it`, `vi`, etc.)
  - Includes Vite client types
  - Targets only test files
  - Non-blocking in CI until all test type errors are resolved

## 🚀 Package.json Scripts

```json
{
  "scripts": {
    "build": "tsc -p tsconfig.build.json && vite build",
    "typecheck": "tsc -p tsconfig.json --noEmit",
    "typecheck:build": "tsc -p tsconfig.build.json --noEmit",
    "typecheck:tests": "tsc -p tsconfig.tests.json --noEmit"
  }
}
```

- **`npm run build`**: Compiles production build (excludes tests)
- **`npm run typecheck`**: Full type checking (includes tests)
- **`npm run typecheck:build`**: Build surface type checking only
- **`npm run typecheck:tests`**: Test files type checking only

## 🔄 CI Pipeline Workflow

### Job Order (Fail-Fast Strategy)

1. **Type Check Build Surface** (`typecheck:build`)
   - Validates production code types
   - Must pass for CI to continue
   - Excludes test files

2. **Render Gauntlet**
   - Component rendering tests
   - Critical path validation

3. **Route Sweeper**
   - End-to-end route testing
   - Browser-based validation

4. **Concurrency & Resilience**
   - Circuit breaker tests
   - Advanced error handling

5. **Integration & 3D Tests**
   - Complex subsystem validation
   - 3D terrain integration

6. **Cross-Browser Compatibility**
   - Multi-browser testing
   - Platform-specific validation

7. **Performance & Accessibility**
   - Quality gates
   - Performance budgets

8. **Build Validation**
   - Production build verification
   - Test type checking (non-blocking)

### Test Type Checking Strategy

- **Phase 1**: Test type checking runs with `continue-on-error: true`
- **Phase 2**: Gradually fix test type errors
- **Phase 3**: Remove `continue-on-error` once all errors are resolved

## 🛠️ Environment Variable Handling

### In Source Code
Use Vite's environment variables:
```typescript
// ✅ Correct for Vite
if (import.meta.env.DEV) { /* development code */ }
if (import.meta.env.MODE === 'development') { /* mode-specific code */ }
```

### In Tests
Use the ambient type shim in `src/testing/types/env.d.ts`:
```typescript
// ✅ Available in tests
if (process.env.NODE_ENV === 'test') { /* test-specific code */ }
```

## 🔧 Development Workflow

### Local Development
1. Run `npm run typecheck` to check all types
2. Fix any type errors in source code
3. Test with `npm run test:unit`

### Before Committing
1. Run `npm run typecheck:build` to ensure build surface is clean
2. Run `npm run lint` for code quality
3. Run `npm run test:unit` for unit tests

### CI Integration
- Build surface type checking is enforced
- Test type checking is monitored but non-blocking
- Gradual improvement of test type safety

## 🚨 Troubleshooting

### Build Failing in CI
1. Check `npm run typecheck:build` locally
2. Ensure all source files have proper types
3. Verify no test files are imported in production code

### Test Type Errors
1. Run `npm run typecheck:tests` locally
2. Check for missing type definitions
3. Verify test environment setup
4. Use ambient type shims for external dependencies

### Environment Variable Issues
1. Use `import.meta.env` for Vite contexts
2. Use `process.env` only in tests with proper type shims
3. Check `src/testing/types/env.d.ts` for test environment types

## 📈 Next Steps

1. **Immediate**: CI pipeline should now pass with build-only type checking
2. **Short-term**: Fix test type errors gradually
3. **Long-term**: Enable strict test type checking in CI
4. **Ongoing**: Maintain type safety across all code changes

## 🔗 Related Files

- `tsconfig.json` - Base configuration
- `tsconfig.build.json` - Build configuration
- `tsconfig.tests.json` - Test configuration
- `src/testing/types/env.d.ts` - Test environment types
- `.github/workflows/ci.yml` - Main CI pipeline
- `frontend/.github/workflows/ci-gates.yml` - Frontend CI gates
