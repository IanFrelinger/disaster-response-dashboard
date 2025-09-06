# Agent Operating Procedure

## Overview

This document outlines the standard operating procedure for AI agents working on the Disaster Response Dashboard project. The system is designed to enable Cursor to manage development and validation while humans handle design and approval.

## Agent Workflow

### 1. Read and Understand
- **Read the design brief** and requirements thoroughly
- **Review relevant rules** in `.cursor/rules/` directory
- **Understand the system architecture** and constraints
- **Identify dependencies** and integration points

### 2. Plan Implementation
- **Break down the task** into manageable components
- **Identify required changes** across frontend, backend, and validation systems
- **Plan test coverage** for all new functionality
- **Consider performance impact** and security implications

### 3. Implement Changes
- **Follow coding standards** defined in the rules
- **Write comprehensive tests** for all new code
- **Update documentation** as needed
- **Ensure backward compatibility** for public APIs

### 4. Run Validation
Execute the complete validation suite:
```bash
make check
```

This runs:
- `make lint` - Code quality checks
- `make type` - Type checking
- `make test` - Unit and integration tests
- `make e2e` - End-to-end tests

### 5. Iterate Until Complete
- **Fix any test failures** or validation errors
- **Address performance issues** if budgets are exceeded
- **Resolve security concerns** identified in scans
- **Ensure 0% hazard intersection** in route validation

### 6. Create Pull Request
- **Open a PR** with comprehensive description
- **Include test results** and performance metrics
- **Document any breaking changes** or migration requirements
- **Provide rollback steps** if labeled as release-candidate

### 7. Post Summary
The agent **MUST** post a summary comment listing:
- Tests run and results
- Failures fixed during implementation
- Performance compliance verification
- Any remaining issues or recommendations

## Key Principles

### Safety First
- **Never compromise the 0% hazard intersection requirement**
- **Maintain performance budgets** (FE < 3s, BE < 100ms)
- **Follow security standards** strictly
- **Never modify production configs** or secrets

### Quality Assurance
- **Write tests first** (TDD approach when possible)
- **Maintain high test coverage** (>90% for critical paths)
- **Validate all changes** against acceptance gates
- **Document all modifications** thoroughly

### System Integration
- **Update validation system** when adding new features
- **Ensure LayerManager integration** for map components
- **Maintain Foundry integration** for backend functions
- **Keep API contracts stable** or version them properly

## Common Tasks

### Adding New Map Layers
1. **Create layer component** following React standards
2. **Add to LayerManager** with proper configuration
3. **Wire ValidationSystem hooks** for monitoring
4. **Write unit tests** for component behavior
5. **Write E2E tests** for user interactions
6. **Update performance budgets** if needed

### Adding New API Endpoints
1. **Define Pydantic models** for request/response
2. **Implement FastAPI endpoint** with proper validation
3. **Add integration tests** for the endpoint
4. **Update OpenAPI schema** documentation
5. **Add to validation system** monitoring
6. **Consider caching strategy** for performance

### Modifying Existing Features
1. **Maintain backward compatibility** for public APIs
2. **Update all dependent tests** and validation
3. **Verify performance budgets** are not exceeded
4. **Update documentation** to reflect changes
5. **Test rollback procedures** if significant changes

## Error Handling

### When Blocked
If the agent encounters issues that prevent completion:

1. **Document the specific problem** clearly
2. **Identify what was attempted** and why it failed
3. **Suggest alternative approaches** if possible
4. **Ask minimal, specific questions** to unblock progress
5. **Provide context** about the current state

### Common Issues and Solutions

#### Test Failures
- **Check test data** and mock configurations
- **Verify environment setup** and dependencies
- **Review test isolation** and cleanup procedures
- **Check for timing issues** in async operations

#### Performance Issues
- **Profile the specific bottleneck** using dev tools
- **Check for memory leaks** in component lifecycle
- **Optimize database queries** and caching
- **Review bundle size** and code splitting

#### Integration Problems
- **Verify API contracts** and data formats
- **Check validation system** configuration
- **Review Foundry integration** status
- **Validate environment variables** and configs

## Success Criteria

### Definition of "Done"
A task is complete when:

1. **All tests pass** (unit, integration, E2E)
2. **Performance budgets met** (load < 3s, API < 100ms)
3. **0% hazard intersection** maintained in route validation
4. **No console errors** in browser during testing
5. **No blank map renders** in Playwright tests
6. **Security standards** followed and validated
7. **Documentation updated** for all changes
8. **Validation system** monitoring new features

### Quality Gates
- **Code coverage** >90% for critical paths
- **Type safety** with strict TypeScript/Python typing
- **Performance compliance** with all budgets
- **Security validation** passed
- **Integration tests** passing
- **E2E workflows** validated

## Communication

### Minimal Questions Policy
The agent should ask questions only when:
- **Blocked by external dependencies** not under agent control
- **Unclear requirements** that could lead to incorrect implementation
- **Security concerns** that need human judgment
- **Breaking changes** that require approval

### Question Format
When asking questions, provide:
- **Specific context** about the current situation
- **What was attempted** and the result
- **Why the question is needed** to proceed
- **Suggested options** if applicable

## Continuous Improvement

### Learning from Results
- **Analyze test results** to identify patterns
- **Review performance metrics** for optimization opportunities
- **Study error logs** to prevent similar issues
- **Update procedures** based on experience

### Process Refinement
- **Document common solutions** for recurring problems
- **Improve validation procedures** based on findings
- **Enhance error handling** for better resilience
- **Optimize workflows** for efficiency

This operating procedure ensures consistent, high-quality development while maintaining the disaster response system's critical safety and performance requirements.
