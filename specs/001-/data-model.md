# Data Model: Architecture Analysis and Optimization

**Feature**: Architecture Analysis and Optimization
**Branch**: `001-`
**Date**: 2025-10-09

## Overview

This document defines the data entities and their relationships for the Architecture Analysis and Optimization system. All entities are technology-agnostic representations; implementation details (SQL schemas, TypeScript interfaces, etc.) are determined during task execution.

---

## Core Entities

### ArchitectureIssue

Represents a detected architectural problem in the codebase.

**Attributes**:

- `id`: Unique identifier
- `runId`: Reference to the analysis run that detected this issue
- `severity`: Enumeration (Critical, High, Medium, Low)
  - **Critical**: Causes system failure or data loss (e.g., empty div placeholder in routes)
  - **High**: Degrades core functionality (e.g., missing route guards, CORS misconfiguration)
  - **Medium**: Affects non-critical features (e.g., suboptimal state management)
  - **Low**: Code quality/maintainability concerns (e.g., duplicated components)
- `category`: Classification of issue type
  - Enumeration: Routing, StateManagement, MicroAppConfig, SharedComponents, Performance, Security, Documentation, ConstitutionViolation
- `component`: Affected file path or component name (e.g., `main-app/src/router/dynamic.js:42`)
- `description`: Human-readable explanation of the issue
- `potentialImpact`: Description of consequences if unaddressed
- `remediationGuidance`: Step-by-step instructions for manual fix
- `autoFixable`: Boolean indicating if automated remediation is available
- `autoFixRiskLevel`: Enumeration (None, Low, Medium, High) - risk of applying auto-fix
- `detectedAt`: Timestamp when issue was first detected
- `resolvedAt`: Timestamp when issue was resolved (null if still open)

**Relationships**:

- Belongs to one `AnalysisRun`
- May have one `AutomatedFix` (if `autoFixable` is true)

**Validation Rules**:

- `severity` must be one of the four defined levels
- `category` must be one of the defined categories
- `component` must be a valid file path within the repository
- If `autoFixable` is true, `autoFixRiskLevel` cannot be "None"
- `resolvedAt` cannot be earlier than `detectedAt`

**State Transitions**:

```
[Detected] → [Acknowledged] → [InProgress] → [Resolved]
           ↓                                      ↑
           └──────────────────────────────────────┘
                  [Ignored] (user dismisses)
```

---

### OptimizationRecommendation

Represents a suggested improvement for the codebase.

**Attributes**:

- `id`: Unique identifier
- `runId`: Reference to the analysis run that generated this recommendation
- `priority`: Enumeration (P1, P2, P3)
  - **P1**: Quick win, high impact, low effort
  - **P2**: Significant benefit, moderate effort
  - **P3**: Long-term improvement, high effort
- `title`: Short summary (e.g., "Enable Code Splitting in Agent App")
- `description`: Detailed explanation of the optimization
- `expectedBenefit`: Quantified improvement (e.g., "Reduce bundle size by 30%, improve load time by 1.2s")
- `implementationComplexity`: Enumeration (Low, Medium, High)
  - **Low**: < 4 hours, single file change
  - **Medium**: 1-2 days, multiple files
  - **High**: > 3 days, architectural change
- `effortEstimate`: Estimated hours to implement
- `implementationSteps`: Ordered list of steps to apply the optimization
- `relatedIssues`: List of `ArchitectureIssue` IDs that this recommendation addresses
- `category`: Same enumeration as `ArchitectureIssue.category`

**Relationships**:

- Belongs to one `AnalysisRun`
- May relate to multiple `ArchitectureIssue` entities
- Belongs to one `ImplementationPhase` (in roadmap)

**Validation Rules**:

- `priority` inversely correlates with `implementationComplexity` for P1 recommendations (P1 should be Low/Medium complexity)
- `effortEstimate` must align with `implementationComplexity` (Low: 1-8h, Medium: 8-16h, High: > 16h)
- `expectedBenefit` must include quantifiable metrics
- `implementationSteps` must be non-empty ordered list

---

### ComponentHealthStatus

Represents the health state of a specific architecture layer.

**Attributes**:

- `id`: Unique identifier
- `runId`: Reference to the analysis run
- `layer`: Enumeration (Routing, StateManagement, MicroApps, SharedComponents, Build, Security, Documentation)
- `status`: Enumeration (Healthy, Warning, Critical)
  - **Healthy**: All checks passed
  - **Warning**: 1+ Medium/Low issues detected
  - **Critical**: 1+ Critical/High issues detected
- `checksPerformed`: Count of total checks executed for this layer
- `checksPassed`: Count of checks that passed
- `checksFailed`: Count of checks that failed
- `detailedFindings`: Array of issue summaries with counts by severity

**Relationships**:

- Belongs to one `AnalysisRun`
- Aggregates multiple `ArchitectureIssue` entities for the layer

**Validation Rules**:

- `checksPerformed` = `checksPassed` + `checksFailed`
- `status` is derived: Critical if any Critical/High issue, Warning if any Medium/Low, Healthy if all passed
- `layer` must be one of the defined layers

**Derived Properties**:

- `healthScore`: Percentage = (`checksPassed` / `checksPerformed`) * 100
- `trendDirection`: Enum (Improving, Stable, Declining) - requires comparison with previous run

---

### ImplementationPhase

Represents a grouping of related optimizations in a roadmap.

**Attributes**:

- `id`: Unique identifier
- `runId`: Reference to the analysis run that generated the roadmap
- `phaseNumber`: Ordinal (1, 2, 3...)
- `phaseName`: Human-readable name (e.g., "Quick Wins", "Core Optimizations", "Long-term Improvements")
- `estimatedDuration`: Total effort in hours for all recommendations in this phase
- `requiredResources`: Description of team members/skills needed
- `dependencies`: List of other `ImplementationPhase` IDs that must complete first
- `riskAssessment`: Description of potential risks if this phase fails
- `rollbackStrategy`: Description of how to revert changes if issues arise

**Relationships**:

- Belongs to one `AnalysisRun`
- Contains multiple `OptimizationRecommendation` entities
- May depend on other `ImplementationPhase` entities (prerequisite phases)

**Validation Rules**:

- `phaseNumber` must be sequential (1, 2, 3...) within a run
- `dependencies` cannot form cycles (no circular dependencies)
- `estimatedDuration` should be sum of `effortEstimate` for contained recommendations
- Phase 1 cannot have dependencies (starting phase)

---

### AnalysisRun

Represents a single execution of the architecture analysis.

**Attributes**:

- `id`: Unique identifier
- `timestamp`: When the analysis was started
- `completedAt`: When the analysis finished (null if still running)
- `duration`: Execution time in milliseconds
- `status`: Enumeration (Running, Completed, Failed)
- `totalIssues`: Count of all issues detected
- `criticalCount`: Count of critical issues
- `highCount`: Count of high severity issues
- `mediumCount`: Count of medium severity issues
- `lowCount`: Count of low severity issues
- `totalRecommendations`: Count of optimization recommendations generated
- `analysisVersion`: Semantic version of the analysis engine (for tracking rule changes)
- `repositoryCommit`: Git commit SHA of the analyzed codebase
- `errorMessage`: Error details if status is Failed

**Relationships**:

- Contains multiple `ArchitectureIssue` entities
- Contains multiple `OptimizationRecommendation` entities
- Contains multiple `ComponentHealthStatus` entities
- Contains multiple `ImplementationPhase` entities

**Validation Rules**:

- `completedAt` cannot be earlier than `timestamp`
- `duration` should match (`completedAt` - `timestamp`) in milliseconds
- Issue counts must sum: `totalIssues` = `criticalCount` + `highCount` + `mediumCount` + `lowCount`
- `status` is "Completed" only if `completedAt` is not null and `errorMessage` is null
- `repositoryCommit` must be a valid Git SHA (40-character hex string)

**Derived Properties**:

- `issuesByCategory`: Aggregation of issues grouped by category
- `trendsComparedToPrevious`: Comparison with previous `AnalysisRun` (e.g., "+5 issues", "-3 critical")

---

### AnalysisHistoryRecord

Represents a lightweight snapshot for trend visualization (denormalized for performance).

**Attributes**:

- `id`: Same as `AnalysisRun.id` (one-to-one relationship)
- `timestamp`: Same as `AnalysisRun.timestamp`
- `duration`: Same as `AnalysisRun.duration`
- `totalIssues`: Same as `AnalysisRun.totalIssues`
- `criticalCount`: Same as `AnalysisRun.criticalCount`
- `highCount`: Same as `AnalysisRun.highCount`
- `mediumCount`: Same as `AnalysisRun.mediumCount`
- `lowCount`: Same as `AnalysisRun.lowCount`
- `healthScoreAverage`: Average health score across all layers

**Rationale**: Denormalized entity optimized for time-series queries. Avoids expensive joins when rendering trend charts.

**Relationships**:

- One-to-one with `AnalysisRun`

---

### AutomatedFix

Represents a safe, auto-applicable code change for a detected issue.

**Attributes**:

- `id`: Unique identifier
- `issueId`: Reference to the `ArchitectureIssue` this fix addresses
- `fixType`: Enumeration (ConfigurationUpdate, ImportPathCorrection, FormatFix, GuardAddition, CORSEnablement)
- `proposedChanges`: Array of file modifications
  - Each modification contains: `filePath`, `oldContent`, `newContent`, `diffPreview`
- `affectedFiles`: List of file paths that will be modified
- `riskLevel`: Same as `ArchitectureIssue.autoFixRiskLevel`
- `requiresApproval`: Boolean (always true for this system - user approval mandatory)
- `appliedAt`: Timestamp when fix was applied (null if not yet applied)
- `approvedBy`: User identifier who approved the fix
- `rollbackAvailable`: Boolean indicating if changes can be reverted

**Relationships**:

- Belongs to one `ArchitectureIssue`

**Validation Rules**:

- `proposedChanges` must be non-empty
- `affectedFiles` must match file paths in `proposedChanges`
- `appliedAt` can only be set if `approvedBy` is not null
- `riskLevel` must match associated `ArchitectureIssue.autoFixRiskLevel`

**State Transitions**:

```
[Proposed] → [Approved] → [Applied] → [Verified]
           ↓                           ↑
           └────────────────────[Failed] (rollback available)
```

---

### AnalysisDashboard (UI State)

Represents the current state of the dashboard interface (not persisted, managed in Pinia store).

**Attributes**:

- `currentRunId`: ID of the analysis run being viewed
- `filters`: Active filters
  - `severities`: Array of selected severity levels
  - `categories`: Array of selected categories
  - `components`: Array of selected component paths
- `viewMode`: Enumeration (IssueList, RecommendationList, HistoryTrends, Roadmap)
- `sortBy`: Field to sort by (severity, category, detectedAt)
- `sortOrder`: Enumeration (Ascending, Descending)
- `selectedIssueId`: ID of issue in drill-down view (null if not viewing details)

**Note**: This entity is client-side only, managed in Pinia store, not persisted in database.

---

## Entity Relationships Diagram

```
AnalysisRun
├── 1..N → ArchitectureIssue
│           ├── 0..1 → AutomatedFix
│           └── belongsToCategory
├── 1..N → OptimizationRecommendation
│           ├── relatesTo 0..N → ArchitectureIssue
│           └── belongsTo → ImplementationPhase
├── 1..N → ComponentHealthStatus
│           └── aggregates → ArchitectureIssue (by layer)
├── 1..N → ImplementationPhase
│           ├── contains 1..N → OptimizationRecommendation
│           └── dependsOn 0..N → ImplementationPhase
└── 1..1 → AnalysisHistoryRecord
```

---

## Data Integrity Constraints

### Referential Integrity

- Deleting an `AnalysisRun` cascades to delete all related entities (issues, recommendations, phases, history)
- Deleting an `ArchitectureIssue` cascades to delete its `AutomatedFix` (if exists)
- Deleting an `ImplementationPhase` nullifies references in dependent phases (breaks dependency chain)

### Business Rules

1. **Severity Consistency**: If an `ArchitectureIssue` has severity Critical/High, the containing `ComponentHealthStatus` layer must have status Critical.

2. **Auto-Fix Approval**: An `AutomatedFix` cannot transition to "Applied" state without `approvedBy` being set.

3. **Phase Ordering**: `ImplementationPhase` must be executed in `phaseNumber` order. A phase cannot start until all dependent phases are completed.

4. **Historical Trend Minimum**: At least 3 `AnalysisHistoryRecord` entries required to display meaningful trends (as per SC-009).

5. **Deterministic Output**: Running analysis on the same `repositoryCommit` must produce identical `ArchitectureIssue` and `OptimizationRecommendation` sets (same IDs, same descriptions).

---

## Data Access Patterns

### Dashboard Queries

1. **Load Issues for Run**:
   - Filter by `runId`, `severity`, `category`
   - Sort by `severity` DESC, `detectedAt` DESC
   - Paginate (50 per page)

2. **Load History Trends**:
   - Select `AnalysisHistoryRecord` for last 10 runs
   - Order by `timestamp` ASC
   - Group issue counts by `category` for stacked chart

3. **Load Recommendations**:
   - Filter by `runId`, `priority`
   - Include `relatedIssues` count
   - Sort by `priority` ASC, `effortEstimate` ASC

### Analysis Engine Writes

1. **Create Analysis Run**:
   - Insert `AnalysisRun` with status "Running"
   - Commit transaction to get `runId`
   - Use `runId` for all subsequent inserts

2. **Bulk Insert Issues**:
   - Batch insert all `ArchitectureIssue` records
   - Create `AutomatedFix` for issues with `autoFixable=true`
   - Update `AnalysisRun.totalIssues` and severity counts

3. **Generate Health Status**:
   - Aggregate `ArchitectureIssue` by `layer`
   - Calculate `checksPassed` / `checksFailed` per layer
   - Insert `ComponentHealthStatus` records

---

## Evolution & Versioning

### Schema Migrations

When adding new analysis rules or modifying entity structure:

1. Increment `analysisVersion` in new runs
2. Add migration scripts for backward compatibility
3. Document breaking changes in `research.md`

### Historical Data Compatibility

- Old analysis runs remain queryable even after schema changes
- New fields default to null for historical data
- Dashboard gracefully handles missing fields in old runs

---

## Implementation Notes

- **Storage Technology**: SQLite for backend, IndexedDB for dashboard cache (as per research.md)
- **Serialization**: JSON for complex fields (`proposedChanges`, `implementationSteps`)
- **Indexing**: Create indexes on `runId`, `severity`, `category`, `timestamp` for query performance
- **Caching**: Dashboard caches current run in IndexedDB for offline viewing

This data model provides a complete, normalized representation of all entities required for the Architecture Analysis and Optimization system. Implementation teams should translate this into appropriate schemas (SQL DDL, TypeScript interfaces, Pinia store structures) during task execution.
