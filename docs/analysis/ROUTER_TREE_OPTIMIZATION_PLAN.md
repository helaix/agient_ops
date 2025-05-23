# Router Tree Optimization Plan

## Objective
Apply the minimal router approach used for START_HERE to the entire documentation tree, reducing redundancy and improving navigation efficiency.

## Current State Analysis
- **Total files**: 77 markdown files in docs/
- **Total size**: ~795KB of documentation
- **Structure**: Deep nested hierarchy with potential redundancy
- **Challenge**: Maintain functionality while dramatically reducing cognitive load

## Optimization Strategy

### Phase 1: Analysis and Categorization
1. **Audit all documentation files** for:
   - Content overlap and redundancy
   - Essential vs. reference information
   - Router vs. detailed documentation potential

2. **Categorize files** into:
   - **Core Routers**: High-level navigation and decision trees
   - **Essential References**: Must-have detailed documentation
   - **Redundant Content**: Information duplicated elsewhere
   - **Archive Candidates**: Outdated or rarely used content

### Phase 2: Router Architecture Design
1. **Create hierarchical router system**:
   - Top-level: START_HERE (already optimized)
   - Mid-level: Domain-specific routers (Linear, Agent Collaboration, etc.)
   - Bottom-level: Specialized implementation guides

2. **Design routing patterns**:
   - Consistent navigation structure
   - Clear decision trees
   - Minimal cognitive load per router

### Phase 3: Content Consolidation
1. **Merge redundant content** into single authoritative sources
2. **Extract essential information** for routers
3. **Archive or remove** outdated content
4. **Standardize formatting** across all routers

### Phase 4: Implementation
1. **Transform high-traffic files** to minimal routers first
2. **Consolidate related content** into comprehensive guides
3. **Update all cross-references** to new structure
4. **Validate routing paths** work correctly

## Success Metrics
- **Size Reduction**: Target 60-80% reduction in total documentation size
- **Navigation Efficiency**: <3 clicks to reach any detailed information
- **Maintenance Burden**: Reduced update overhead
- **User Experience**: Faster task completion times

## Files to Prioritize
1. `docs/reference/linear_workflows_reference.md` - High traffic, router candidate
2. `docs/reference/communication_delegation_sops.md` - Complex, needs simplification
3. `docs/reference/self_improvement/` - Deep hierarchy, consolidation opportunity
4. Workflow pattern files - Potential for router-based organization

## Implementation Guidelines
- Preserve all information in git history
- Maintain backward compatibility through redirects/links
- Use consistent router format established by START_HERE
- Test routing paths before finalizing changes
- Document all architectural decisions

## Child Agent Instructions
1. Start with analysis phase - audit and categorize all files
2. Create detailed optimization plan for each category
3. Implement changes incrementally with validation
4. Update cross-references and maintain link integrity
5. Document the new architecture and routing patterns

