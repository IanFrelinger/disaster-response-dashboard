# LayerTogglePanel Test Suite

This directory contains a refactored test suite for the `LayerTogglePanel` component that allows you to run tests à la carte to reduce test runtime.

## 🏗️ Architecture

The test suite is built using a class-based approach with inheritance:

```
LayerTogglePanelTestBase (abstract base class)
├── LayerTogglePanelRenderTests
├── LayerTogglePanelInteractionTests
├── LayerTogglePanelAccessibilityTests
├── LayerTogglePanelStylingTests
└── LayerTogglePanelTestSuite (composer)
    └── EnhancedLayerTogglePanelTestSuite (with configuration)
```

## 📁 Files

- **`LayerTogglePanel.test.base.ts`** - Abstract base class with common test utilities
- **`LayerTogglePanel.render.test.ts`** - Rendering and structure tests
- **`LayerTogglePanel.interaction.test.ts`** - User interaction and event tests
- **`LayerTogglePanel.accessibility.test.ts`** - Accessibility and keyboard tests
- **`LayerTogglePanel.styling.test.ts`** - Design tokens and CSS tests
- **`LayerTogglePanel.test.suite.ts`** - Basic test suite composer
- **`LayerTogglePanel.test.enhanced.ts`** - Enhanced suite with configuration
- **`LayerTogglePanel.test.config.ts`** - Test configuration definitions
- **`LayerTogglePanel.test.usage.ts`** - Usage examples
- **`LayerTogglePanel.test.main.ts`** - Main test runner

## 🚀 Quick Start

### Run All Tests
```typescript
import { LayerTogglePanelTestSuite } from './LayerTogglePanel.test.suite';

const testSuite = new LayerTogglePanelTestSuite();
testSuite.runAllTests();
```

### Run Specific Test Categories
```typescript
// Run only rendering tests
testSuite.runRenderTests();

// Run only interaction tests
testSuite.runInteractionTests();

// Run only accessibility tests
testSuite.runAccessibilityTests();

// Run only styling tests
testSuite.runStylingTests();
```

## ⚡ Predefined Configurations

### Fast Tests (Development Mode)
```typescript
import EnhancedLayerTogglePanelTestSuite from './LayerTogglePanel.test.enhanced';

const testSuite = new EnhancedLayerTogglePanelTestSuite();
testSuite.runDevMode(); // Runs render + styling tests (~0.5-1s)
```

### Critical Tests (Accessibility Mode)
```typescript
testSuite.runAccessibilityMode(); // Runs render + accessibility tests (~1-1.5s)
```

### Comprehensive Tests (Feature Mode)
```typescript
testSuite.runFeatureMode(); // Runs render + interaction + accessibility tests (~1.5-2.5s)
```

### All Tests (CI Mode)
```typescript
testSuite.runCIMode(); // Runs all tests (~2-3s)
```

## 🎯 Custom Test Combinations

```typescript
// Run custom combination
testSuite.runCustomTestTypes(['render', 'interaction']);

// Or use the configuration system
testSuite.runWithConfiguration('comprehensive');
```

## 📊 Available Configurations

| Configuration | Test Types | Estimated Time | Use Case |
|---------------|------------|----------------|----------|
| `fast` | render + styling | ~0.5-1s | Quick feedback, pre-commit |
| `critical` | render + accessibility | ~1-1.5s | Accessibility compliance |
| `comprehensive` | render + interaction + accessibility | ~1.5-2.5s | Feature testing |
| `all` | render + interaction + accessibility + styling | ~2-3s | Full regression, CI/CD |
| `render` | render only | ~0.3-0.5s | Component structure |
| `interaction` | interaction only | ~0.8-1.2s | User interactions |
| `accessibility` | accessibility only | ~0.3-0.5s | Accessibility compliance |
| `styling` | styling only | ~0.2-0.3s | Design system |

## 🔧 Configuration Management

### List All Configurations
```typescript
testSuite.listConfigurations();
```

### Get Configuration Info
```typescript
testSuite.getConfigurationInfo('fast');
```

### Set Configuration
```typescript
testSuite.setConfiguration('critical');
testSuite.runCurrentConfiguration();
```

## 📈 Performance Benchmarking

```typescript
// Run performance benchmark
await testSuite.runPerformanceBenchmark();
```

This will run all configurations and measure execution time, helping you choose the best configuration for your needs.

## 🎨 Test Categories

### Render Tests
- Component rendering
- Basic structure
- Props handling
- Default states

### Interaction Tests
- Click events
- Keyboard events
- State changes
- Event callbacks

### Accessibility Tests
- ARIA attributes
- Keyboard navigation
- Screen reader support
- Focus management

### Styling Tests
- Design tokens
- CSS properties
- Component classes
- Visual consistency

## 🚦 Migration from Old Tests

The old `LayerTogglePanel.test.tsx` file has been refactored into this new system. All existing test functionality is preserved, but now organized into logical categories that can be run independently.

## 💡 Best Practices

1. **Development**: Use `fast` configuration for quick feedback
2. **Pre-commit**: Use `critical` configuration for essential checks
3. **Feature Testing**: Use `comprehensive` configuration for thorough validation
4. **CI/CD**: Use `all` configuration for complete regression testing
5. **Custom Needs**: Use `runCustomTestTypes()` for specific requirements

## 🔍 Troubleshooting

### Tests Not Running
- Ensure you're calling the appropriate `run*` method
- Check that the test suite instance is created correctly
- Verify that the component and mocks are properly imported

### Performance Issues
- Use the performance benchmark to identify slow test categories
- Consider running only essential tests during development
- Use `fast` configuration for quick iterations

### Configuration Errors
- Use `validateTestConfiguration()` to check configuration validity
- Use `listConfigurations()` to see available options
- Check the configuration interface for valid test types

## 📝 Example Usage Patterns

### Development Workflow
```typescript
// Quick feedback during development
testSuite.runDevMode();

// When working on interactions
testSuite.runCustomTestTypes(['render', 'interaction']);

// Before committing
testSuite.runAccessibilityMode();
```

### CI/CD Pipeline
```typescript
// Run all tests in CI
testSuite.runCIMode();

// Or run comprehensive tests for feature branches
testSuite.runFeatureMode();
```

### Custom Testing
```typescript
// Test only what you need
testSuite.runCustomTestTypes(['render', 'styling']);

// Switch configurations dynamically
testSuite.setConfiguration('fast');
testSuite.runCurrentConfiguration();
```

This refactored test suite provides flexibility and performance while maintaining all existing test coverage. Choose the configuration that best fits your current testing needs!
