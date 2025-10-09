# Historical Data API Contract

**Service**: analysis-service
**Base URL**: `http://localhost:8080/api/v1`
**Authentication**: Bearer token (JWT from main app)

## Endpoints

### 1. Get Trend Data

**Endpoint**: `GET /history/trends`

**Description**: Retrieve aggregated historical data for trend visualization

**Request Headers**:

```
Authorization: Bearer <jwt_token>
```

**Query Parameters**:

- `metric` (required): Metric to visualize
  - Values: `issues`, `severity`, `category`, `health_score`
- `period` (optional): Time period for trends
  - Values: `7d`, `14d`, `30d`, `90d`, `all`
  - Default: `30d`
- `groupBy` (optional): Aggregation interval
  - Values: `day`, `week`, `month`
  - Default: `day` (for periods ≤ 30d), `week` (for > 30d)

**Success Response - Issues Trend** (200 OK):

```json
{
  "metric": "issues",
  "period": "30d",
  "groupBy": "day",
  "data": [
    {
      "timestamp": "2025-09-10T00:00:00Z",
      "runId": "uuid-1",
      "totalIssues": 18,
      "criticalCount": 3,
      "highCount": 6,
      "mediumCount": 7,
      "lowCount": 2
    },
    {
      "timestamp": "2025-09-11T00:00:00Z",
      "runId": "uuid-2",
      "totalIssues": 17,
      "criticalCount": 3,
      "highCount": 5,
      "mediumCount": 7,
      "lowCount": 2
    }
    // ... more data points
  ],
  "summary": {
    "dataPoints": 30,
    "trend": "improving",
    "changePercent": -16.7,
    "firstRun": "2025-09-10T00:00:00Z",
    "lastRun": "2025-10-09T10:35:00Z"
  }
}
```

**Success Response - Health Score Trend** (200 OK):

```json
{
  "metric": "health_score",
  "period": "30d",
  "groupBy": "day",
  "data": [
    {
      "timestamp": "2025-09-10T00:00:00Z",
      "runId": "uuid-1",
      "healthScoreAverage": 82,
      "layers": {
        "routing": 80,
        "stateManagement": 85,
        "microApps": 90,
        "sharedComponents": 78,
        "build": 88,
        "security": 75,
        "documentation": 82
      }
    }
    // ... more data points
  ],
  "summary": {
    "dataPoints": 30,
    "trend": "improving",
    "changePercent": 6.1,
    "currentScore": 87,
    "previousScore": 82
  }
}
```

**Error Responses**:

- **400 Bad Request**: Invalid metric or period
- **401 Unauthorized**: Missing or invalid authentication token

---

### 2. Compare Analysis Runs

**Endpoint**: `GET /history/compare`

**Description**: Compare two analysis runs to identify changes

**Request Headers**:

```
Authorization: Bearer <jwt_token>
```

**Query Parameters**:

- `baseRunId` (required): UUID of the baseline run
- `compareRunId` (required): UUID of the run to compare against baseline
- `include` (optional): Comma-separated comparison sections
  - Values: `issues`, `recommendations`, `health`, `all`
  - Default: `all`

**Success Response** (200 OK):

```json
{
  "baseRun": {
    "id": "uuid-1",
    "timestamp": "2025-10-08T14:20:00Z",
    "totalIssues": 18,
    "repositoryCommit": "def456"
  },
  "compareRun": {
    "id": "uuid-2",
    "timestamp": "2025-10-09T10:35:00Z",
    "totalIssues": 15,
    "repositoryCommit": "abc123"
  },
  "comparison": {
    "issues": {
      "new": [
        {
          "id": "issue-10",
          "severity": "medium",
          "category": "performance",
          "component": "agent-app/src/views/EventList.vue",
          "description": "Large component without lazy loading"
        }
      ],
      "resolved": [
        {
          "id": "issue-2",
          "severity": "critical",
          "category": "routing",
          "component": "main-app/src/router/dynamic.js:42",
          "description": "Empty div placeholder used",
          "resolution": "Fixed in commit abc123"
        }
      ],
      "unchanged": [
        {
          "id": "issue-5",
          "severity": "medium",
          "category": "state",
          "component": "main-app/src/store/user.js",
          "description": "Direct state mutation detected"
        }
      ],
      "summary": {
        "totalNew": 1,
        "totalResolved": 4,
        "totalUnchanged": 13,
        "netChange": -3
      }
    },
    "healthScores": {
      "routing": {
        "base": 80,
        "compare": 92,
        "change": +12,
        "trend": "improved"
      },
      "stateManagement": {
        "base": 85,
        "compare": 85,
        "change": 0,
        "trend": "stable"
      }
      // ... other layers
    },
    "recommendations": {
      "new": [
        {
          "id": "rec-5",
          "priority": "p2",
          "title": "Add lazy loading to EventList component"
        }
      ],
      "completed": [
        {
          "id": "rec-1",
          "priority": "p1",
          "title": "Fix MicroAppContainer usage",
          "completedIn": "abc123"
        }
      ],
      "summary": {
        "totalNew": 1,
        "totalCompleted": 2,
        "netChange": -1
      }
    }
  }
}
```

**Error Responses**:

- **404 Not Found**: One or both run IDs do not exist
- **400 Bad Request**: Invalid run IDs or missing parameters
- **401 Unauthorized**: Missing or invalid authentication token

---

### 3. Get Issue Timeline

**Endpoint**: `GET /history/issues/:issueSignature/timeline`

**Description**: Track a specific issue across multiple analysis runs

**Request Headers**:

```
Authorization: Bearer <jwt_token>
```

**Path Parameters**:

- `issueSignature`: Hash signature identifying the issue (generated from category + component + description pattern)

**Success Response** (200 OK):

```json
{
  "issueSignature": "hash-abc123",
  "issuePattern": {
    "category": "routing",
    "component": "main-app/src/router/dynamic.js",
    "descriptionPattern": "Empty div placeholder*"
  },
  "timeline": [
    {
      "runId": "uuid-5",
      "timestamp": "2025-10-05T09:00:00Z",
      "status": "detected",
      "severity": "critical",
      "issueId": "issue-2a"
    },
    {
      "runId": "uuid-6",
      "timestamp": "2025-10-06T10:15:00Z",
      "status": "detected",
      "severity": "critical",
      "issueId": "issue-2b"
    },
    {
      "runId": "uuid-7",
      "timestamp": "2025-10-09T10:35:00Z",
      "status": "resolved",
      "severity": null,
      "issueId": null,
      "resolution": "Fixed in commit abc123"
    }
  ],
  "summary": {
    "firstDetected": "2025-10-05T09:00:00Z",
    "lastDetected": "2025-10-06T10:15:00Z",
    "resolved": "2025-10-09T10:35:00Z",
    "daysOpen": 4,
    "occurrences": 2
  }
}
```

**Error Responses**:

- **404 Not Found**: Issue signature not found in history
- **401 Unauthorized**: Missing or invalid authentication token

---

### 4. Export Historical Data

**Endpoint**: `GET /history/export`

**Description**: Export historical data in various formats for external analysis

**Request Headers**:

```
Authorization: Bearer <jwt_token>
```

**Query Parameters**:

- `format` (required): Export format
  - Values: `json`, `csv`, `xlsx`
- `period` (optional): Time period
  - Values: `7d`, `14d`, `30d`, `90d`, `all`
  - Default: `all`
- `include` (optional): Data sections to include
  - Values: `runs`, `issues`, `recommendations`, `trends`
  - Default: `runs,issues,recommendations`

**Success Response** (200 OK):

**Headers**:

```
Content-Type: application/json (or text/csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet)
Content-Disposition: attachment; filename="analysis-history-2025-10-09.json"
```

**Body** (JSON format):

```json
{
  "exportMetadata": {
    "generatedAt": "2025-10-09T12:00:00Z",
    "period": "30d",
    "totalRuns": 30,
    "format": "json",
    "version": "1.0.0"
  },
  "runs": [
    {
      "id": "uuid-1",
      "timestamp": "2025-09-10T00:00:00Z",
      "duration": 300000,
      "totalIssues": 18,
      "repositoryCommit": "abc123"
      // ... full run data
    }
    // ... more runs
  ],
  "issues": [
    {
      "runId": "uuid-1",
      "issueId": "issue-1",
      "severity": "critical",
      "category": "routing",
      // ... full issue data
    }
    // ... more issues
  ]
}
```

**Error Responses**:

- **400 Bad Request**: Invalid format or parameters
- **401 Unauthorized**: Missing or invalid authentication token
- **413 Payload Too Large**: Export size exceeds limit (> 100MB)

---

### 5. Delete Old History

**Endpoint**: `DELETE /history/cleanup`

**Description**: Remove historical records older than specified retention period

**Request Headers**:

```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

**Request Body**:

```json
{
  "retentionDays": 90,
  "dryRun": false
}
```

**Field Descriptions**:

- `retentionDays` (required): Keep records newer than this many days
- `dryRun` (optional): If true, return what would be deleted without deleting (default: false)

**Success Response** (200 OK):

```json
{
  "deleted": {
    "runs": 15,
    "issues": 247,
    "recommendations": 98,
    "fixes": 32
  },
  "retained": {
    "runs": 85,
    "oldestRun": "2025-07-10T08:00:00Z"
  },
  "dryRun": false,
  "completedAt": "2025-10-09T12:05:00Z"
}
```

**Error Responses**:

- **400 Bad Request**: Invalid retention period (must be ≥ 7 days)
- **401 Unauthorized**: Missing or invalid authentication token
- **403 Forbidden**: User lacks admin privileges

---

## Trend Analysis Algorithms

### Trend Direction Calculation

```
trend = (latest_value - earliest_value) / earliest_value * 100

if abs(trend) < 5%:
  direction = "stable"
elif trend > 0:
  direction = "improving" (for health scores) or "worsening" (for issue counts)
else:
  direction = "worsening" (for health scores) or "improving" (for issue counts)
```

### Issue Signature Generation

```
signature = SHA256(
  category +
  component_path +
  normalized_description_pattern
)
```

**Example**:

```
Input:
  category: "routing"
  component: "main-app/src/router/dynamic.js:42"
  description: "Empty div placeholder used instead of MicroAppContainer"

Normalized Pattern:
  "Empty div placeholder*"

Signature:
  SHA256("routing|main-app/src/router/dynamic.js|Empty div placeholder*")
  = "abc123def456..."
```

---

## Caching Strategy

- **Trend Data**: Cached for 5 minutes
- **Comparison Results**: Cached for 10 minutes
- **Issue Timeline**: Cached for 15 minutes (infrequently changes)
- **Export Data**: Not cached (on-demand generation)

**Cache Invalidation**: Automatically cleared when new analysis run completes

---

## Data Retention Policy

- **Default Retention**: 90 days
- **Minimum Retention**: 7 days (cannot delete more recent data)
- **Critical Runs**: Flagged runs (e.g., baseline, release snapshots) exempt from auto-cleanup
- **Export Before Delete**: Recommend exporting before cleanup

---

## Performance Considerations

- **Maximum Trend Data Points**: 365 (1 year of daily data)
- **Comparison Limit**: Cannot compare runs > 180 days apart
- **Export Size Limit**: 100MB compressed
- **Concurrent Trend Queries**: Rate limited to 10/minute per user

---

## Notes

- All timestamps in UTC ISO 8601 format
- Trend calculations require minimum 3 data points
- Issue signatures remain stable across runs for tracking
- Export formats preserve full precision (no data loss)
- Historical data automatically archived after retention period
