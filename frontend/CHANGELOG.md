# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Enhanced fault injection system with improved rate-limit and circuit-breaker semantics
- Public API snapshot validation using API Extractor
- ESLint deprecation plugin for catching deprecated API usage
- Comprehensive contract tests for fault injection aliases
- E2E tests for realistic protocol behavior
- Structured error objects with error codes and trace IDs
- Pairwise fault combination testing
- CI integration with comprehensive reporting

### Changed
- **BREAKING**: Renamed fault injection methods for clarity:
  - `injectRateLimit()` → `injectRateLimitExceeded()`
  - `injectCircuitBreaker()` → `injectCircuitBreakerTrigger()`

### Deprecated
- `injectRateLimit()` - Use `injectRateLimitExceeded()` instead. **Will be removed in v2.0.0**
- `injectCircuitBreaker()` - Use `injectCircuitBreakerTrigger()` instead. **Will be removed in v2.0.0**

### Removed
- None

### Fixed
- Improved fault injection type safety and interface consistency
- Enhanced error observability with structured error codes and trace IDs

## [1.0.0] - 2024-01-XX

### Added
- Initial fault injection system implementation
- Basic rate-limit and circuit-breaker fault types
- Core testing infrastructure

### Changed
- None

### Deprecated
- None

### Removed
- None

### Fixed
- None

## Deprecation Policy

This project follows a **2-major-version deprecation policy**:

1. **v1.0.0**: Methods marked as deprecated with console warnings
2. **v2.0.0**: Deprecated methods will be removed entirely
3. **Grace period**: ~12 months between deprecation and removal

### Current Deprecation Timeline

| Method | Introduced | Deprecated Since | Removal Date | Migration Path |
|--------|------------|------------------|--------------|----------------|
| `injectRateLimit()` | v1.0.0 | v1.0.0 | v2.0.0 | `injectRateLimitExceeded()` |
| `injectCircuitBreaker()` | v1.0.0 | v1.0.0 | v2.0.0 | `injectCircuitBreakerTrigger()` |

### Migration Guide

#### Before (Deprecated)
```typescript
// ❌ These methods will be removed in v2.0.0
// ❌ Console warnings will be emitted in development builds
faultInjector.api.injectRateLimit();
faultInjector.api.injectCircuitBreaker();
```

#### After (Recommended)
```typescript
// ✅ Use these methods going forward
// ✅ No warnings, fully supported
faultInjector.api.injectRateLimitExceeded();
faultInjector.integration.injectCircuitBreakerTrigger();
```

### Runtime Warnings

In development builds, deprecated methods emit a single `console.warn` message:

```typescript
// Console output in development:
// [FAULT-INJECTION] injectRateLimit is deprecated. Use injectRateLimitExceeded instead.
// [FAULT-INJECTION] injectCircuitBreaker is deprecated. Use injectCircuitBreakerTrigger instead.
```

**Note**: Warnings are only emitted once per method per session to avoid spam.

### ESLint Integration

The deprecation plugin will:
- **v1.x**: Warn on deprecated method usage
- **v2.0+**: Error on deprecated method usage (after removal)

### CI Integration

- **v1.x**: `npm run check` includes deprecation warnings
- **v2.0+**: `npm run check` will fail on deprecated usage

## Version Compatibility Matrix

| Feature | v1.0.0 | v1.x | v2.0.0 | v2.x+ |
|---------|--------|------|---------|-------|
| `injectRateLimit()` | ✅ Available | ⚠️ Deprecated | ❌ Removed | ❌ Removed |
| `injectRateLimitExceeded()` | ✅ Available | ✅ Available | ✅ Available | ✅ Available |
| `injectCircuitBreaker()` | ✅ Available | ⚠️ Deprecated | ❌ Removed | ❌ Removed |
| `injectCircuitBreakerTrigger()` | ✅ Available | ✅ Available | ✅ Available | ✅ Available |
| `hasAnyFault()` | ✅ Available | ✅ Available | ✅ Available | ✅ Available |
| Structured Errors | ✅ Available | ✅ Available | ✅ Available | ✅ Available |

## Breaking Changes Policy

### v2.0.0 Breaking Changes
- **Removal of deprecated methods**: `injectRateLimit()` and `injectCircuitBreaker()`
- **No other breaking changes planned**

### Future Breaking Changes
- **v3.0.0**: No breaking changes currently planned
- **v4.0.0**: No breaking changes currently planned

## Migration Checklist

### Before v2.0.0 Release
- [ ] Update all code to use new method names
- [ ] Remove all deprecated method calls
- [ ] Update documentation and examples
- [ ] Update third-party integrations
- [ ] Run full test suite to ensure compatibility

### After v2.0.0 Release
- [ ] Verify all deprecated methods are removed
- [ ] Update migration documentation
- [ ] Notify team and stakeholders
- [ ] Monitor for any missed usages
