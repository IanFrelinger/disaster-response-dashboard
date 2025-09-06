# Pull Request Template

## Description
Brief description of changes and motivation for this pull request.

## Type of Change
- [ ] Bug fix (non-breaking change which fixes an issue)
- [ ] New feature (non-breaking change which adds functionality)
- [ ] Breaking change (fix or feature that would cause existing functionality to not work as expected)
- [ ] Documentation update
- [ ] Performance improvement
- [ ] Security enhancement
- [ ] Code refactoring
- [ ] Test improvements

## Related Issues
Closes #(issue number)
Relates to #(issue number)

## Testing
- [ ] Unit tests pass
- [ ] Integration tests pass
- [ ] E2E tests pass
- [ ] Performance tests meet budgets
- [ ] Manual testing completed
- [ ] Cross-browser testing completed (if applicable)

## Performance Impact
- [ ] No performance impact
- [ ] Performance improvement (specify metrics below)
- [ ] Performance regression (explain mitigation below)

### Performance Metrics
- Frontend load time: ___ seconds (target: < 3s)
- Backend response time: ___ ms (target: < 100ms)
- Validation time: ___ ms (target: ~8ms)
- Layer render time: ___ ms (target: 1-5ms)

## Security Review
- [ ] No security implications
- [ ] Security enhancement (describe below)
- [ ] Potential security impact (explain mitigation below)

### Security Considerations
- [ ] No hardcoded secrets or sensitive data
- [ ] Input validation implemented for all user inputs
- [ ] Error messages don't expose internal details
- [ ] Logging doesn't include sensitive information
- [ ] Synthetic test data used (no real coordinates)
- [ ] External API calls properly mocked in tests

## Route Safety Validation
- [ ] 0% hazard intersection maintained in all test routes
- [ ] Route calculation algorithm validated
- [ ] Safety scoring system working correctly
- [ ] Hazard avoidance logic tested

## Code Quality
- [ ] Code follows project style guidelines
- [ ] TypeScript/Python type hints added where needed
- [ ] Code is properly documented
- [ ] No console errors in browser
- [ ] No linting errors
- [ ] No type checking errors

## Integration
- [ ] LayerManager updated (if adding/modifying map layers)
- [ ] ValidationSystem hooks wired (if adding new features)
- [ ] Foundry integration maintained (if backend changes)
- [ ] API contracts remain stable or properly versioned
- [ ] Database migrations included (if schema changes)

## Documentation
- [ ] Code comments added for complex logic
- [ ] README updated (if needed)
- [ ] API documentation updated (if endpoints changed)
- [ ] CHANGELOG.md updated (if release-candidate)
- [ ] Architecture documentation updated (if significant changes)

## Checklist
- [ ] Self-review completed
- [ ] All tests pass locally
- [ ] Performance budgets met
- [ ] Security requirements satisfied
- [ ] Documentation updated
- [ ] Breaking changes documented
- [ ] Migration scripts provided (if database changes)
- [ ] Rollback plan documented (if release-candidate)

## Breaking Changes
If this PR contains breaking changes, describe them here:

### Migration Required
- [ ] Database schema changes
- [ ] API contract changes
- [ ] Configuration changes
- [ ] Environment variable changes

### Migration Steps
```bash
# Add specific migration commands here
```

### Rollback Steps
```bash
# Add specific rollback commands here
```

## Screenshots/Videos
If applicable, add screenshots or videos to help explain your changes.

## Additional Notes
Any additional information that reviewers should know about this PR.

---

## Automated Validation Results

### Test Results
- [ ] Frontend unit tests: ___/___ passing
- [ ] Backend integration tests: ___/___ passing
- [ ] E2E tests: ___/___ passing
- [ ] Performance tests: ___/___ passing

### Validation System Results
- [ ] Layer validation: All layers rendering correctly
- [ ] Cross-system validation: Frontend-backend consistency confirmed
- [ ] Route safety validation: 0% hazard intersection confirmed
- [ ] Performance validation: All budgets met

### Security Scan Results
- [ ] No hardcoded secrets detected
- [ ] No security vulnerabilities found
- [ ] Input validation working correctly
- [ ] Error handling secure

## Reviewer Checklist
- [ ] Code quality and style
- [ ] Test coverage and quality
- [ ] Performance impact assessment
- [ ] Security implications review
- [ ] Documentation completeness
- [ ] Breaking changes evaluation
- [ ] Migration plan review (if applicable)

---

**Note:** This PR template ensures comprehensive review of all changes while maintaining the disaster response system's critical safety, performance, and security requirements.
