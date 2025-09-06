# 🎯 **TASK PACKET FORMAT FOR CURSOR AGENT**

## **Overview**
This document defines the standard format for task packets that Cursor will use to work as an independent agent on the modular map layer system. Each task packet contains all the context, constraints, and acceptance criteria needed for autonomous implementation.

## **📋 Task Packet Structure**

### **1. Task Header**
```markdown
## TASK: [Layer Name] Implementation
**Priority**: [High/Medium/Low]
**Estimated Effort**: [1-5 points]
**Dependencies**: [List any blocking tasks]
```

### **2. Context & Requirements**
```markdown
### **Business Context**
- What problem does this layer solve?
- Who are the end users?
- What is the expected user experience?

### **Technical Requirements**
- Mapbox GL JS integration requirements
- Performance constraints (render time, memory usage)
- Accessibility requirements (ARIA, keyboard navigation)
- Browser compatibility requirements
```

### **3. Acceptance Criteria**
```markdown
### **Functional Requirements**
- [ ] Layer renders when enabled
- [ ] Layer hides when disabled
- [ ] Proper cleanup on unmount
- [ ] Error handling for Mapbox failures

### **Styling Requirements**
- [ ] Uses design tokens (CSS custom properties)
- [ ] Responsive design considerations
- [ ] Consistent with existing layer styling
- [ ] Accessibility-compliant color contrast

### **Integration Requirements**
- [ ] Works with LayerManager
- [ ] Follows established lifecycle pattern
- [ ] Proper event handling and callbacks
- [ ] State synchronization with parent
```

### **4. Test Contracts**
```markdown
### **Test Files to Create/Update**
- `src/components/maps/layers/__tests__/[LayerName].test.tsx`
- `tests/e2e/test-[layer-name]-contract.spec.ts`

### **Test Requirements**
- Unit tests for isolated layer behavior
- Integration tests with LayerManager
- E2E tests for user interactions
- Accessibility tests for ARIA compliance
```

### **5. Constraints & Budgets**
```markdown
### **Performance Budgets**
- Layer initialization: < 100ms
- Render time: < 16ms (60fps)
- Memory usage: < 50MB per layer
- Bundle size impact: < 10KB

### **Code Quality Constraints**
- TypeScript strict mode compliance
- ESLint rules compliance (including design tokens)
- No console.log statements in production
- Proper error boundaries and fallbacks
```

### **6. Implementation Guidelines**
```markdown
### **File Structure**
- Create: `src/components/maps/layers/[LayerName].tsx`
- Update: `src/components/maps/layers/LayerManager.tsx`
- Update: `src/components/maps/layers/index.ts`

### **Code Patterns**
- Follow existing layer component structure
- Use established error handling patterns
- Implement proper cleanup in useEffect
- Use React.memo for performance optimization
```

## **📝 Example Task Packet**

```markdown
## TASK: Weather Layer Implementation
**Priority**: Medium
**Estimated Effort**: 3 points
**Dependencies**: None

### **Business Context**
- Display real-time weather data on the map
- Show temperature, precipitation, and wind patterns
- Target users: Emergency responders and command center operators

### **Technical Requirements**
- Integrate with weather API (OpenWeatherMap)
- Render weather symbols and data overlays
- Support multiple weather data types (current, forecast)
- Real-time updates every 5 minutes

### **Acceptance Criteria**
- [ ] Weather layer renders when enabled
- [ ] Shows current temperature and conditions
- [ ] Updates automatically every 5 minutes
- [ ] Gracefully handles API failures
- [ ] Uses design tokens for all styling
- [ ] Proper ARIA labels for screen readers

### **Test Contracts**
- Unit tests for weather data parsing
- Integration tests with LayerManager
- E2E tests for weather display and updates
- Performance tests for update frequency

### **Constraints & Budgets**
- API calls: Max 1 per 5 minutes
- Render performance: < 16ms
- Bundle size: < 15KB
- Memory usage: < 30MB

### **Implementation Guidelines**
- Create: `src/components/maps/layers/WeatherLayer.tsx`
- Follow existing layer patterns
- Use React Query for API state management
- Implement proper error boundaries
```

## **🚀 Agent Workflow**

### **1. Task Reception**
- Cursor receives task packet
- Analyzes requirements and constraints
- Identifies dependencies and blockers

### **2. Implementation Planning**
- Creates implementation plan
- Estimates effort and identifies risks
- Plans test coverage

### **3. Development**
- Implements layer component
- Creates/updates test files
- Ensures all acceptance criteria met

### **4. Quality Gates**
- All tests must pass
- Performance budgets met
- Code quality standards maintained
- Design token compliance verified

### **5. Integration**
- Updates LayerManager
- Updates index exports
- Runs full test suite
- Creates pull request

## **🔍 Success Metrics**

### **Code Quality**
- ✅ All tests passing
- ✅ ESLint compliance (0 warnings)
- ✅ TypeScript strict mode compliance
- ✅ Design token usage verified

### **Performance**
- ✅ Performance budgets met
- ✅ Bundle size within limits
- ✅ Memory usage optimized

### **User Experience**
- ✅ Accessibility requirements met
- ✅ Responsive design implemented
- ✅ Error handling graceful
- ✅ Loading states appropriate

## **📚 Reference Materials**

- **Existing Layer Examples**: `TerrainLayer.tsx`, `BuildingsLayer.tsx`
- **Test Patterns**: `TerrainLayer.test.tsx`
- **Design Tokens**: `src/components/App.css` (CSS custom properties)
- **Layer Manager**: `src/components/maps/layers/LayerManager.tsx`
- **Type Definitions**: `src/components/maps/layers/types.ts`

---

**Note**: This task packet format ensures Cursor has all the context needed to work independently while maintaining design intent and quality standards. Each task packet becomes a contract between design (you) and implementation (Cursor).
