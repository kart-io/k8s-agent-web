# Analysis API Contract

**Service**: analysis-service
**Base URL**: `http://localhost:8080/api/v1`
**Authentication**: Bearer token (JWT from main app)

## Endpoints

### 1. Start Analysis

**Endpoint**: `POST /analysis/start`

**Description**: Initiates architecture analysis of the K8s Agent Web codebase

**Request Headers**:

```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

**Request Body**:

```json
{
  "repositoryPath": "/absolute/path/to/k8s-agent-web",
  "options": {
    "analyzers": ["routing", "state", "micro-app", "shared", "performance", "security", "documentation"],
    "skipCache": false,
    "includeHistorical": true
  }
}
```

**Field Descriptions**:

- `repositoryPath` (required): Absolute path to repository root
- `options.analyzers` (optional): Array of analyzer types to run (default: all)
- `options.skipCache` (optional): Force re-analysis ignoring cached AST (default: false)
- `options.includeHistorical` (optional): Include trend comparison with previous runs (default: true)

**Success Response** (202 Accepted):

```json
{
  "runId": "uuid-string",
  "status": "running",
  "startedAt": "2025-10-09T10:30:00Z",
  "estimatedDuration": 300000,
  "message": "Analysis started successfully"
}
```

**Error Responses**:

- **400 Bad Request**: Invalid repository path or options
- **401 Unauthorized**: Missing or invalid authentication token
- **409 Conflict**: Analysis already running for this repository
- **500 Internal Server Error**: Analysis engine failure

---

### 2. Get Analysis Status

**Endpoint**: `GET /analysis/:runId/status`

**Description**: Check progress of a running analysis

**Request Headers**:

```
Authorization: Bearer <jwt_token>
```

**Success Response** (200 OK):

```json
{
  "runId": "uuid-string",
  "status": "running",
  "progress": {
    "current": 4,
    "total": 7,
    "currentAnalyzer": "SharedComponentAnalyzer",
    "percentComplete": 57
  },
  "startedAt": "2025-10-09T10:30:00Z",
  "elapsedTime": 120000
}
```

**Completed Analysis Response** (200 OK):

```json
{
  "runId": "uuid-string",
  "status": "completed",
  "completedAt": "2025-10-09T10:35:00Z",
  "duration": 300000,
  "results": {
    "totalIssues": 15,
    "criticalCount": 2,
    "highCount": 5,
    "mediumCount": 6,
    "lowCount": 2,
    "totalRecommendations": 8
  }
}
```

**Error Responses**:

- **404 Not Found**: Run ID does not exist
- **401 Unauthorized**: Missing or invalid authentication token

---

### 3. Get Analysis Results

**Endpoint**: `GET /analysis/:runId/results`

**Description**: Retrieve full analysis results including issues, recommendations, and health status

**Request Headers**:

```
Authorization: Bearer <jwt_token>
```

**Query Parameters**:

- `include` (optional): Comma-separated list of sections to include
  - Values: `issues`, `recommendations`, `health`, `roadmap`
  - Default: all sections
- `severityFilter` (optional): Comma-separated severity levels (critical, high, medium, low)
- `categoryFilter` (optional): Comma-separated categories

**Success Response** (200 OK):

```json
{
  "runId": "uuid-string",
  "timestamp": "2025-10-09T10:30:00Z",
  "completedAt": "2025-10-09T10:35:00Z",
  "duration": 300000,
  "repositoryCommit": "abc123def456",
  "analysisVersion": "1.0.0",
  "issues": [
    {
      "id": "issue-1",
      "severity": "critical",
      "category": "routing",
      "component": "main-app/src/router/dynamic.js:42",
      "description": "Empty div placeholder used instead of MicroAppContainer",
      "potentialImpact": "Causes blank pages when navigating to child routes",
      "remediationGuidance": "Replace `{ render: () => h('div') }` with `MicroAppContainer`",
      "autoFixable": true,
      "autoFixRiskLevel": "low",
      "detectedAt": "2025-10-09T10:32:15Z"
    }
  ],
  "recommendations": [
    {
      "id": "rec-1",
      "priority": "p1",
      "title": "Enable Code Splitting in Agent App",
      "description": "Agent app bundle size is 850KB. Code splitting would reduce initial load.",
      "expectedBenefit": "Reduce bundle size by 40%, improve load time by 1.5s",
      "implementationComplexity": "low",
      "effortEstimate": 4,
      "implementationSteps": [
        "Add dynamic imports for heavy components",
        "Configure Vite rollupOptions for manual chunks",
        "Test lazy-loaded routes"
      ],
      "relatedIssues": ["issue-5", "issue-12"],
      "category": "performance"
    }
  ],
  "healthStatus": [
    {
      "layer": "routing",
      "status": "critical",
      "checksPerformed": 12,
      "checksPassed": 10,
      "checksFailed": 2,
      "healthScore": 83,
      "detailedFindings": {
        "critical": 1,
        "high": 1,
        "medium": 0,
        "low": 0
      }
    }
  ],
  "roadmap": [
    {
      "phaseNumber": 1,
      "phaseName": "Critical Fixes",
      "estimatedDuration": 12,
      "recommendationIds": ["rec-1", "rec-3"],
      "dependencies": [],
      "riskAssessment": "Low risk - isolated changes",
      "rollbackStrategy": "Git revert commits"
    }
  ]
}
```

**Error Responses**:

- **404 Not Found**: Run ID does not exist
- **401 Unauthorized**: Missing or invalid authentication token
- **410 Gone**: Analysis results expired (older than retention period)

---

### 4. Get Analysis History

**Endpoint**: `GET /analysis/history`

**Description**: Retrieve list of historical analysis runs for trend visualization

**Request Headers**:

```
Authorization: Bearer <jwt_token>
```

**Query Parameters**:

- `limit` (optional): Maximum number of runs to return (default: 10, max: 100)
- `offset` (optional): Pagination offset (default: 0)
- `since` (optional): ISO 8601 timestamp - only return runs after this date

**Success Response** (200 OK):

```json
{
  "runs": [
    {
      "id": "uuid-1",
      "timestamp": "2025-10-09T10:30:00Z",
      "duration": 300000,
      "totalIssues": 15,
      "criticalCount": 2,
      "highCount": 5,
      "mediumCount": 6,
      "lowCount": 2,
      "healthScoreAverage": 87,
      "repositoryCommit": "abc123"
    },
    {
      "id": "uuid-2",
      "timestamp": "2025-10-08T14:20:00Z",
      "duration": 285000,
      "totalIssues": 18,
      "criticalCount": 3,
      "highCount": 6,
      "mediumCount": 7,
      "lowCount": 2,
      "healthScoreAverage": 82,
      "repositoryCommit": "def456"
    }
  ],
  "pagination": {
    "total": 45,
    "limit": 10,
    "offset": 0,
    "hasMore": true
  }
}
```

**Error Responses**:

- **401 Unauthorized**: Missing or invalid authentication token
- **400 Bad Request**: Invalid query parameters

---

### 5. Delete Analysis Run

**Endpoint**: `DELETE /analysis/:runId`

**Description**: Delete a specific analysis run and all related data

**Request Headers**:

```
Authorization: Bearer <jwt_token>
```

**Success Response** (204 No Content): Empty response body

**Error Responses**:

- **404 Not Found**: Run ID does not exist
- **401 Unauthorized**: Missing or invalid authentication token
- **403 Forbidden**: User not authorized to delete this run

---

## Data Types

### AnalysisStatus Enum

- `running` - Analysis in progress
- `completed` - Analysis finished successfully
- `failed` - Analysis encountered fatal error

### Severity Enum

- `critical` - Causes system failure or data loss
- `high` - Degrades core functionality
- `medium` - Affects non-critical features
- `low` - Code quality/maintainability concerns

### Category Enum

- `routing` - Routing configuration issues
- `state` - State management problems
- `micro-app` - Micro-app configuration issues
- `shared` - Shared component library issues
- `performance` - Bundle size, loading performance
- `security` - Security vulnerabilities
- `documentation` - Documentation gaps/inconsistencies
- `constitution` - Constitution principle violations

### HealthStatus Enum

- `healthy` - All checks passed
- `warning` - 1+ Medium/Low issues
- `critical` - 1+ Critical/High issues

---

## Error Response Format

All error responses follow this structure:

```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error description",
    "details": {
      "field": "Additional context if applicable"
    }
  }
}
```

**Common Error Codes**:

- `INVALID_REPOSITORY_PATH` - Repository path does not exist or is not readable
- `ANALYSIS_ALREADY_RUNNING` - Cannot start new analysis while one is running
- `ANALYSIS_ENGINE_FAILURE` - Internal error during analysis
- `ANALYSIS_NOT_FOUND` - Requested run ID does not exist
- `UNAUTHORIZED` - Missing or invalid authentication
- `FORBIDDEN` - User lacks permission for this operation

---

## Rate Limiting

- **Analysis Start**: 1 request per 5 minutes per repository
- **Status Check**: 60 requests per minute
- **Results Fetch**: 10 requests per minute
- **History**: 30 requests per minute

**Rate Limit Headers** (included in all responses):

```
X-RateLimit-Limit: 60
X-RateLimit-Remaining: 59
X-RateLimit-Reset: 1696849200
```

---

## Webhooks (Future Enhancement)

**Not implemented in initial version**. Future webhook support for analysis completion notifications.

```json
{
  "url": "https://your-service/webhook",
  "events": ["analysis.completed", "analysis.failed"],
  "secret": "webhook-signing-secret"
}
```

---

## Notes

- All timestamps are UTC in ISO 8601 format
- Authentication tokens expire after 24 hours
- Analysis results retained for 90 days
- Maximum repository size: 500MB
- Maximum analysis duration: 10 minutes (hard timeout)
