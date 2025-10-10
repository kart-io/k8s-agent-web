# Quickstart Guide: Architecture Analysis and Optimization

**Feature**: Architecture Analysis and Optimization
**Branch**: `001-`
**Last Updated**: 2025-10-09

## Overview

This guide helps development team members set up and use the Architecture Analysis and Optimization system. The system provides automated codebase analysis, issue detection, optimization recommendations, and automated remediation for the K8s Agent Web application.

---

## Prerequisites

Before starting, ensure you have:

- ✅ Node.js 18+ and pnpm installed
- ✅ Git with write access to the k8s-agent-web repository
- ✅ K8s Agent Web repository cloned locally
- ✅ All existing micro-apps functional (`make dev` works)
- ✅ Familiarity with Vue 3, Vite, and the Wujie micro-frontend architecture

---

## Quick Start (5 Minutes)

### Step 1: Start All Services

```bash
cd k8s-agent-web

# Start all apps including analysis dashboard
make dev

# Or if you prefer manual start:
./dev.sh
```

**Expected Output**:

```
✓ main-app running on http://localhost:3000
✓ dashboard-app running on http://localhost:3001
✓ agent-app running on http://localhost:3002
✓ cluster-app running on http://localhost:3003
✓ monitor-app running on http://localhost:3004
✓ system-app running on http://localhost:3005
✓ image-build-app running on http://localhost:3006
✓ analysis-app running on http://localhost:3007
✓ analysis-service running on http://localhost:8080
```

### Step 2: Access Analysis Dashboard

1. Open browser: http://localhost:3000
2. Login with credentials: `admin / admin123`
3. Navigate to **Analysis** in the sidebar menu
4. Click **"Run Analysis"** button

### Step 3: View Results

Analysis completes in < 5 minutes. Dashboard shows:

- **Overview**: Total issues by severity, health scores per layer
- **Issues List**: Filterable table of detected problems
- **Recommendations**: Prioritized optimization suggestions
- **Trends**: Historical comparison charts (requires ≥ 3 runs)
- **Roadmap**: Phased implementation plan

---

## Development Workflow

### Running Analysis

**From Dashboard** (Recommended):

1. Click **"Run Analysis"** button in top-right
2. Monitor progress bar (shows current analyzer)
3. Results appear automatically when complete

**From CLI** (Advanced):

```bash
cd analysis-service

# Run full analysis
pnpm run analyze --repo /path/to/k8s-agent-web

# Run specific analyzers only
pnpm run analyze --repo /path/to/k8s-agent-web --analyzers routing,state

# Skip cache for fresh analysis
pnpm run analyze --repo /path/to/k8s-agent-web --skip-cache
```

### Filtering Results

**Dashboard Filters**:

- **By Severity**: Critical, High, Medium, Low
- **By Category**: Routing, State, Micro-App, Shared, Performance, Security, Documentation
- **By Component**: Select affected micro-app or file

**Example**: View only critical routing issues:

1. Click severity filter → Select "Critical"
2. Click category filter → Select "Routing"
3. Results update instantly

### Viewing Issue Details

**Click any issue card to see**:

- Full description and potential impact
- Remediation guidance (step-by-step)
- Affected files with line numbers
- Related recommendations
- Auto-fix availability (if applicable)

### Applying Automated Fixes

**For Auto-Fixable Issues**:

1. Open issue detail view
2. Click **"Preview Fix"** button
3. Review diff showing proposed changes
4. Click **"Apply Fix"** button
5. Confirm approval in modal dialog
6. System applies fix and runs tests
7. View git commit created

**Safety Features**:

- ✅ Always requires explicit user approval
- ✅ Shows full diff preview before applying
- ✅ Runs automated tests after applying
- ✅ Creates git commit for easy rollback
- ✅ Only fixes low-risk issues (formatting, imports, config)

### Viewing Trends

**Requirements**: At least 3 historical analysis runs

**Available Visualizations**:

1. **Issue Count Over Time**: Line chart by severity
2. **Health Score Trends**: Multi-line chart per layer
3. **Issue Resolution Rate**: Bar chart showing resolved vs. new
4. **Category Distribution**: Stacked area chart

**Time Ranges**: 7 days, 14 days, 30 days, 90 days, All time

### Using Recommendations

**Recommendations Tab**:

- Sorted by priority (P1 → P2 → P3)
- Shows expected benefit (quantified metrics)
- Displays implementation complexity and effort
- Links to related issues

**Exporting Roadmap**:

1. Navigate to **Roadmap** tab
2. View phased implementation plan
3. Click **"Export as Markdown"** button
4. Save file for team planning

---

## Mock Mode Development

For frontend development without running analysis engine:

### Enable Mock Mode

```bash
cd analysis-app

# Edit .env file
echo "VITE_USE_MOCK=true" >> .env
echo "VITE_MOCK_DELAY=1500" >> .env  # Simulate 1.5s network delay

# Restart app
pnpm dev
```

### Mock Data

Mock mode provides:

- ✅ Pre-generated analysis results with sample issues
- ✅ Historical data for trend charts (10 mock runs)
- ✅ Automated fix previews and diffs
- ✅ Configurable mock delay for realistic UX testing

**Mock Data Location**: `analysis-app/src/mocks/data/`

---

## Testing

### Running Unit Tests

```bash
# Test analysis-service (backend)
cd analysis-service
pnpm test

# Test analysis-app (dashboard)
cd analysis-app
pnpm test
```

### Running E2E Tests

```bash
cd analysis-app
pnpm test:e2e

# Test specific scenario
pnpm playwright test --grep "should display issues"
```

### Testing Auto-Fix Feature

```bash
cd analysis-service
pnpm test:fix

# Test specific fix type
pnpm test tests/services/AutoFixEngine.test.js
```

---

## Troubleshooting

### Issue: Analysis Dashboard Shows Blank Page

**Symptom**: Navigating to `/analysis` shows empty page

**Causes**:

1. analysis-app not running on port 3007
2. Wujie config missing analysis-app registration
3. Main app router not updated

**Solution**:

```bash
# Check if analysis-app is running
lsof -ti:3007

# If not running, start it
cd analysis-app && pnpm dev

# Verify Wujie config
grep -A 5 "analysis-app" main-app/src/micro/wujie-config.js

# Verify router config
grep -A 3 "/analysis" main-app/src/router/index.js
```

### Issue: Analysis Takes > 5 Minutes

**Symptom**: Analysis exceeds SC-001 time constraint

**Causes**:

1. Large codebase (> 100k LOC)
2. No AST caching
3. Slow file I/O

**Solution**:

```bash
# Enable AST caching (edit analysis-service config)
# Set CACHE_AST=true in analysis-service/.env

# Run analysis with cache
curl -X POST http://localhost:8080/api/v1/analysis/start \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"repositoryPath": "/path/to/repo", "options": {"skipCache": false}}'

# Check cache directory size
du -sh analysis-service/.cache
```

### Issue: Auto-Fix Fails with Test Errors

**Symptom**: Fix applies but tests fail, changes rolled back

**Causes**:

1. Fix introduces syntax error
2. Tests were already failing before fix
3. Missing test dependencies

**Solution**:

```bash
# Manually run tests before applying fix
cd <affected-app>
pnpm lint
pnpm test

# If tests already fail, fix those first
# Then re-run analysis and retry auto-fix
```

### Issue: Historical Trends Not Showing

**Symptom**: Trends tab shows "Insufficient data" message

**Causes**:

1. < 3 analysis runs in database
2. Database connection issue
3. SQLite file missing

**Solution**:

```bash
# Check analysis run count
sqlite3 analysis-service/data/analysis.db \
  "SELECT COUNT(*) FROM analysis_runs;"

# If < 3, run analysis multiple times
# Or load sample historical data

cd analysis-service
pnpm run seed:history
```

### Issue: Port 3007 or 8080 Already in Use

**Symptom**: `Error: listen EADDRINUSE`

**Solution**:

```bash
# Kill processes on ports
lsof -ti:3007 | xargs kill -9
lsof -ti:8080 | xargs kill -9

# Restart services
make dev
```

---

## Configuration

### Analysis Service Configuration

**File**: `analysis-service/.env`

```bash
# Server
PORT=8080
HOST=localhost

# Analysis
CACHE_AST=true
CACHE_DIR=./.cache
MAX_ANALYSIS_DURATION=600000  # 10 minutes
MAX_CODEBASE_SIZE=524288000   # 500MB

# Database
DB_PATH=./data/analysis.db
RETENTION_DAYS=90

# Security
JWT_SECRET=your-secret-key
ALLOW_AUTO_FIX=true
MAX_AUTO_FIX_RISK=medium
```

### Analysis Dashboard Configuration

**File**: `analysis-app/.env`

```bash
# Server
VITE_PORT=3007

# API
VITE_API_BASE_URL=http://localhost:8080/api/v1

# Mock
VITE_USE_MOCK=false
VITE_MOCK_DELAY=1000

# Features
VITE_ENABLE_AUTO_FIX=true
VITE_ENABLE_EXPORT=true
```

---

## API Usage Examples

### Start Analysis (cURL)

```bash
curl -X POST http://localhost:8080/api/v1/analysis/start \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "repositoryPath": "/home/user/k8s-agent-web",
    "options": {
      "analyzers": ["routing", "state", "micro-app"],
      "skipCache": false
    }
  }'
```

### Get Results (cURL)

```bash
curl -X GET "http://localhost:8080/api/v1/analysis/{runId}/results?severityFilter=critical,high" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Apply Fix (cURL)

```bash
curl -X POST http://localhost:8080/api/v1/analysis/{runId}/issues/{issueId}/fixes/{fixId}/apply \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "approvedBy": "user-uuid",
    "runTests": true,
    "createGitCommit": true
  }'
```

---

## Best Practices

### When to Run Analysis

**Recommended Frequency**:

- ✅ Before major releases (baseline)
- ✅ After completing feature branches
- ✅ Weekly during active development
- ✅ After migrating to new framework versions

**Avoid Running**:

- ❌ During active development (uncommitted changes)
- ❌ More than once per day (creates noise in trends)
- ❌ On branches with experimental code

### Prioritizing Fixes

**Priority Order**:

1. **Critical Issues**: Fix immediately (causes system failure)
2. **High Issues**: Schedule for current sprint
3. **P1 Recommendations**: Quick wins, high impact
4. **Medium Issues**: Backlog for next sprint
5. **P2/P3 Recommendations**: Long-term planning

### Using Auto-Fix Safely

**Best Practices**:

- ✅ Always preview diffs before applying
- ✅ Apply one fix at a time for first-time use
- ✅ Run full test suite after fixes
- ✅ Review git commits created
- ✅ Keep fixes in separate commits for easy rollback

**When NOT to Use Auto-Fix**:

- ❌ Production code without staging validation
- ❌ Fixes with "high" risk level
- ❌ When tests are already failing
- ❌ Without understanding the proposed change

---

## Next Steps

After completing this quickstart:

1. **Run Your First Analysis**: Follow Step 1-3 above
2. **Review Issues**: Understand current codebase health
3. **Apply P1 Recommendations**: Start with quick wins
4. **Setup Weekly Analysis**: Add to team workflow
5. **Explore Trends**: Compare progress over time
6. **Read Full Documentation**: See `data-model.md`, API contracts

---

## Support

**Issues or Questions?**

- 📖 Check `TROUBLESHOOTING.md` in project root
- 💬 Ask in team Slack channel: `#architecture-analysis`
- 🐛 Report bugs: Create issue in GitHub repo
- 📧 Contact: architecture-team@company.com

---

## Summary

**You've learned to**:

- ✅ Start analysis dashboard and service
- ✅ Run architecture analysis
- ✅ Filter and view issues
- ✅ Apply automated fixes safely
- ✅ View historical trends
- ✅ Use mock mode for development
- ✅ Troubleshoot common problems

**Time to First Analysis**: < 5 minutes from clone to results!

Happy analyzing! 🎉
