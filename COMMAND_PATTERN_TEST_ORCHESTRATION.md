# Command Pattern Test Orchestration System

## 🎯 Overview

A comprehensive command-pattern based test orchestration system for the Disaster Response Dashboard that enables pre-saved tests to be composed into scenarios and presets. The system uses Playwright for browser automation and Vitest compatibility for assertions while maintaining performance budgets and safety invariants.

## 🏗️ Architecture

### Core Components

```
frontend/src/testing/
├── commands/
│   ├── TestCommand.ts              # Core interfaces and types
│   ├── SmokeTestCommand.ts         # Basic functionality verification
│   ├── LayerInvariantCommand.ts    # Layer ordering and filter validation
│   ├── VisualSnapshotCommand.ts    # Visual regression testing
│   ├── PerfBudgetCommand.ts        # Performance budget validation
│   ├── RobustnessCommand.ts        # Error handling and graceful degradation
│   ├── RouteHazardNoIntersectCommand.ts # 0% route-hazard intersection
│   └── MacroCommand.ts             # Command composition
├── presets/
│   └── presets.ts                  # Command factory and preset definitions
├── harness/
│   └── testStyle.ts                # Test-specific map styles
├── demo/
│   └── commandPatternDemo.ts       # System demonstration
└── runCommands.ts                  # CLI runner
```

## 🚀 Features

### 1. Command Pattern Implementation

Each test is a self-contained `Command` with a `run(ctx)` method:

```typescript
interface TestCommand {
  name: string;
  run(ctx: TestContext): Promise<TestResult>;
}
```

### 2. Test Context

```typescript
interface TestContext {
  page?: Page;                    // Playwright page instance
  env: Record<string, any>;       // Environment variables
  artifactsDir: string;          // Artifacts output directory
  baseUrl: string;               // Application base URL
}
```

### 3. Test Results

```typescript
interface TestResult {
  name: string;                  // Command name
  ok: boolean;                   // Success status
  details?: string;              // Detailed results
  artifacts?: string[];          // Generated artifacts
  durationMs: number;            // Execution time
  error?: Error;                 // Error details if failed
}
```

## 🧪 Available Commands

### SmokeTestCommand
- **Purpose**: Basic functionality verification
- **Input**: `{ url: string; layerIds: string[] }`
- **Validates**: Map loads, layers exist, no console errors

### LayerInvariantCommand
- **Purpose**: Layer ordering and filter validation
- **Input**: `{ above: string; below: string }`
- **Validates**: Z-order, layer sources, critical layer visibility

### VisualSnapshotCommand
- **Purpose**: Visual regression testing
- **Input**: `{ viewportKey: string; baseline: string; threshold?: number }`
- **Validates**: Screenshot comparison with baselines

### PerfBudgetCommand
- **Purpose**: Performance budget validation
- **Input**: `{ maxMs: number }`
- **Validates**: Load time, render time, memory usage

### RobustnessCommand
- **Purpose**: Error handling and graceful degradation
- **Input**: `{ failureRate?: number; endpoints?: string[] }`
- **Validates**: Network failure handling, error UI display

### RouteHazardNoIntersectCommand
- **Purpose**: 0% route-hazard intersection verification
- **Input**: `{ fixtures?: Array<{routes, hazards}> }`
- **Validates**: Geographic intersection using bounding box checks

## 📋 Available Presets

### Basic Presets
- **smoke-min**: Basic functionality test
- **map-core**: Core map features (smoke + invariants + perf)
- **visual-reg**: Visual regression testing
- **robust**: Error handling testing
- **safe-routes**: Route safety testing

### Advanced Presets
- **full-map**: Comprehensive testing suite
- **perf-focused**: Performance-focused testing
- **visual-focused**: Multi-viewport visual testing
- **visual-multi**: Multiple viewport visual regression

## 🎮 Usage

### CLI Commands

```bash
# Run specific presets
pnpm test:compose smoke-min
pnpm test:compose map-core
pnpm test:compose full-map

# Run with custom options
pnpm test:compose --preset smoke-min --no-headless
pnpm test:compose --base-url http://localhost:3000 --verbose

# Makefile integration
make compose PRESET=smoke-min
make compose PRESET=map-core
```

### Programmatic Usage

```typescript
import { presetManager } from './presets/presets';

// Get a preset
const preset = presetManager.getPreset('smoke-min');

// Run the preset
const result = await preset.run(testContext);

// Create custom commands
const customCommand = new SmokeTestCommand({
  url: 'http://localhost:3000',
  layerIds: ['terrain', 'buildings']
});

// Compose into macro command
const macroCommand = new MacroCommand('custom', [customCommand]);
```

## 🔧 Test Harness Features

### MapContainer3D Integration

The MapContainer3D component includes test harness features:

```typescript
// Test mode detection
const urlParams = new URLSearchParams(window.location.search);
const isTestMode = urlParams.get('test') === 'true';

// Test viewport support
const testViewport = urlParams.get('testViewport');
if (testViewport && CAMERA_PRESETS[testViewport]) {
  // Apply camera preset
}

// Test style support
const testStyle = urlParams.get('testStyle') === 'true';
if (testStyle) {
  // Use simplified style for visual testing
}

// Window exposure for tests
if (isTestMode) {
  (window as any).__map = mapInstance;
  (window as any).__mapTestHarness = {
    setCamera: (preset) => { /* ... */ },
    getCamera: () => { /* ... */ },
    waitForTiles: () => { /* ... */ },
    isStyleLoaded: () => { /* ... */ },
    areTilesLoaded: () => { /* ... */ }
  };
}
```

### Camera Presets

Predefined camera positions for consistent testing:

```typescript
const CAMERA_PRESETS = {
  'dcDowntown': { center: [-77.0369, 38.9072], zoom: 12 },
  'dcWide': { center: [-77.0369, 38.9072], zoom: 8 },
  'california': { center: [-119.4179, 36.7783], zoom: 6 },
  'florida': { center: [-81.5158, 27.6648], zoom: 7 }
};
```

## 📊 Performance Budgets

The system enforces strict performance budgets:

- **Frontend Load Time**: < 3 seconds
- **Layer Render Time**: 1-5ms per layer
- **Memory Usage**: < 100MB
- **Route-Hazard Intersection**: 0% (safety invariant)

## 🔄 CI/CD Integration

### GitHub Actions

```yaml
name: Command Pattern Tests
on: [push, pull_request]

jobs:
  test-commands:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
      - run: |
          cd frontend
          pnpm install
          pnpm build
          pnpm preview --port 3000 &
          sleep 10
          pnpm test:compose smoke-min
```

### Makefile Integration

```makefile
compose: ## Run composed test commands
	@echo "🧪 Running composed test commands..."
	cd frontend && pnpm test:compose -- $(PRESET)
	@echo "✅ Composed test commands complete"
```

## 🎯 Benefits

### 1. **Composability**
- Commands can be mixed and matched
- Presets provide common test scenarios
- Easy to create custom test suites

### 2. **Maintainability**
- Each command is self-contained
- Clear separation of concerns
- Easy to add new commands

### 3. **Flexibility**
- CLI and programmatic usage
- Customizable parameters
- Multiple execution environments

### 4. **Reliability**
- Comprehensive error handling
- Detailed logging and artifacts
- Performance monitoring

### 5. **Integration**
- Works with existing Playwright tests
- Compatible with Vitest assertions
- CI/CD pipeline ready

## 🚀 Getting Started

1. **Install dependencies**:
   ```bash
   cd frontend
   pnpm install
   ```

2. **Start the application**:
   ```bash
   pnpm dev
   ```

3. **Run a simple test**:
   ```bash
   pnpm test:compose smoke-min
   ```

4. **Run comprehensive tests**:
   ```bash
   pnpm test:compose full-map
   ```

5. **Use Makefile**:
   ```bash
   make compose PRESET=map-core
   ```

## 📈 Future Enhancements

- **Turf.js Integration**: Precise geometric intersection checking
- **Visual Diff Engine**: Advanced screenshot comparison
- **Performance Profiling**: Detailed performance metrics
- **Test Data Management**: Fixture and mock data handling
- **Parallel Execution**: Multi-browser test execution
- **Custom Assertions**: Domain-specific validation logic

## 🎉 Conclusion

The Command Pattern Test Orchestration System provides a robust, flexible, and maintainable approach to testing the Disaster Response Dashboard. It enables comprehensive validation while maintaining performance budgets and safety invariants, making it an essential tool for ensuring the reliability of critical disaster response systems.
