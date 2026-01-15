---
name: audit-docs
description: Documentation drift detection and knowledge-base hygiene. Use to ensure docs match implementation.
---

# Audit Docs

Documentation drift detection and hygiene.

## When to Use
- After major implementation changes
- Periodic knowledge-base maintenance
- Before releases

## Approach

### Step 1: Project Invariants (Required)
**Before auditing**, review `docs/knowledge-base/` structure:
- Understand existing SPEC-*, RULES-*, STRATEGY-* files
- Flag any documentation that contradicts current implementation as **Critical**.

### Step 2: Drift Check
- Protocol vs Codebase: Do rules match implementation?
- Spec vs Implementation: Do specs describe current behavior?
- Strategy vs Spec: Are strategies reflected in specs?

### Step 3: Consistency Check
- Cross-references valid
- Terminology consistent
- No duplication

### Step 4: Protocol Hygiene
- Rule relevance: Any obsolete rules?
- Missing rules: Any patterns not documented?

### Step 5: Archival Sweep
- Move completed docs to `docs/archive/`
- Clean `docs/` root of stale files

### Output
Audit report with drift findings, consistency issues, archival candidates.
