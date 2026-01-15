---
name: plan-architecture
description: Create technical architecture specification with data models, component hierarchy, and risk analysis. Use after PRD approval for large features.
---

# Plan Architecture

Create a technical architecture specification.

## When to Use
- After PRD approval for large features
- Complex technical decisions
- Cross-cutting system changes

## Artifacts
- `implementation_plan.md` artifact
- `task.md` updated via `task_boundary`

## Approach

### Phase 1: Requirement Mapping
- Map PRD requirements to architectural components
- Verify constraints (existing patterns, dependencies)

### Phase 2: Options Evaluation
Generate **3-4 architectural options**.

Consult expert frameworks:
- **SOLID Principles**: Component design
- **CAP Theorem**: Data consistency (if applicable)
- **OWASP Top 10**: Security considerations

Use Socratic Debate for evaluation.

### Phase 3: Detailed Specification

#### Data Flow Diagram
Show how data moves through the system.

#### Data Model
Define types, interfaces, atoms/state.

#### Component Hierarchy
```
ParentComponent
├── ChildA
│   └── GrandchildA1
└── ChildB
```

#### State Management
Define atoms, derived state, effects.

#### File Manifest
| Status | File | Changes |
|--------|------|---------|
| [NEW] | `src/components/Feature.tsx` | New component |
| [MODIFY] | `src/atoms/index.ts` | Add new atom |

### Phase 4: Risk Analysis
Reflexion as "Chaotic Junior Developer":
- Attack Vector 1: How could this fail under rapid state changes?
- Attack Vector 2: What breaks if API returns malformed data?
- Attack Vector 3: Race conditions?

### Phase 5: Phased Implementation
Break into atomic, verifiable phases.

## Constraints
- No code generation — architecture only
- No one-off patterns — leverage existing documented patterns
- Request user approval before BUILD phase
