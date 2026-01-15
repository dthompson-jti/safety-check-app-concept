---
name: audit-performance
description: Performance analysis and optimization opportunities. Use when application feels slow or before optimization work.
---

# Audit Performance

Performance analysis and recommendations.

## When to Use
- Application feels slow
- Before optimization work
- After adding heavy components

## Approach

### Step 1: Project Invariants (Required)
**Before auditing**, check `docs/knowledge-base/` for performance-specific constraints:
- Bundle size limits
- Load time requirements
- Any documented perf budgets
- Flag any violation of documented invariants as **Critical** priority.

### Step 2: Focus Areas
- **Bundle Size**: Large dependencies, unused code
- **Render Performance**: Unnecessary re-renders, heavy computations
- **Network**: Large assets, unoptimized images
- **Memory**: Memory leaks, retained references

### Step 3: Analysis
1. Check bundle analyzer output
2. Review React DevTools profiler
3. Check network waterfall
4. Audit image sizes

### Common Issues
- [ ] Large dependencies that could be replaced
- [ ] Components re-rendering unnecessarily
- [ ] Missing `useMemo`/`useCallback` for expensive operations
- [ ] Unoptimized images
- [ ] Blocking resources

### Output
Findings with specific recommendations and expected impact.
