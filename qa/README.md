# Analytics & Dashboard Platform — Full Demo Suite

Automated browser tests covering **every feature** with visual screenshots, pass/fail reports, and interactive scenario selection.

---

## 📋 What's Covered

| # | Scenario | Features Tested |
|---|---|---|
| 01 | **Authentication** | Signup · Login · Duplicate email error · Wrong password · Sign out |
| 02 | **Organizations** | Create org · List orgs · Select org · Slug auto-generation |
| 03 | **Dashboards & Widgets** | Create dashboard · Add all 5 widget types (KPI, LINE, BAR, PIE, TABLE) · Delete widget |
| 04 | **Alerts** | Create alert with threshold · List · Mute 1 hour · Delete |
| 05 | **API Keys** | Create API key · View ak_... preview · Delete key |
| 06 | **Data Sources** | Create REST/webhook/CSV sources · List · Delete |
| 07 | **Data Ingestion** | Bulk event ingest · CSV upload · Webhook receiver · Celery Flower monitor |
| 08 | **Reports** | Create daily/weekly/monthly reports · List · View run history · PDF download |
| 09 | **WebSocket Real-Time** | WS connection · Dashboard auto-refresh on server push · Reconnection |
| 10 | **Members & RBAC** | Invite analyst/viewer/admin · Role hierarchy · 403 enforcement |
| 11 | **Dashboard Sharing** | Generate share token · Public link · is_public flag |
| 12 | **Token Refresh** | Silent token refresh on 401 · Refresh token used · Logout on failure |

**Total scenarios: 12**  
**Total steps: ~80**  
**Screenshots captured: 80+**

---

## 🚀 Quick Start

### 1. Ensure app is running

```bash
cd ..
docker compose up --build
```

Wait for:
- Frontend: http://localhost:3000
- Backend: http://localhost:8000
- Flower: http://localhost:5555

### 2. Run the demo

#### Option A: Interactive menu (Windows)
```bash
cd demo_test
run_demo.bat
```

#### Option B: Command line
```bash
cd demo_test

# Run ALL scenarios
npm run demo

# Run individual scenario
npm run demo:auth     # Scenario 01
npm run demo:dash     # Scenario 03
npm run demo:ws       # Scenario 09

# Run range
node demo.js 1 6      # Scenarios 01-06 (core features)
```

---

## 🎮 Usage Examples

```bash
# Full demo suite (all 12 scenarios)
npm run demo

# Only authentication
npm run demo:auth

# Only dashboards & widgets
npm run demo:dash

# Core features only (scenarios 1-6)
npm run demo:core

# Individual scenarios by number
node demo.js 4        # Alerts
node demo.js 7        # Ingestion
node demo.js 10       # RBAC

# Run scenarios 3 through 8
node demo.js 3 8
```

---

## 📁 Output

After running, you'll have:

### 1. `screenshots/` folder
- 80+ PNG screenshots, one per step
- Named by scenario and step: `03_05_bar_widget_filled.png`
- Full page captures at 1440×900

### 2. `report.json`
- Pass/fail per scenario
- Execution time
- Error messages
- Org ID, Dashboard ID, etc.

Example:
```json
{
  "runAt": "2024-01-15T10:30:45.123Z",
  "user": "demo_1234567890@example.com",
  "orgId": "a1b2c3d4-...",
  "passed": 12,
  "failed": 0,
  "totalSeconds": "125.4",
  "results": [
    { "id": "01", "label": "Authentication", "status": "PASS", "elapsed": "8.2" },
    ...
  ]
}
```

### 3. Console output
- Real-time step-by-step progress
- ✅ Success indicators
- ⚠️ Warnings
- ℹ️ Info messages

---

## 🛠️ Advanced Options

### Run specific scenarios
```bash
# Single scenario
node demo.js 5

# Multiple scenarios
node demo.js 1          # Just auth
node demo.js 1 3        # Auth + Orgs + Dashboards
node demo.js 7 9        # Ingestion + Reports + WebSocket
```

### Speed control
Edit `helpers.js`:
```javascript
const PAUSE = {
  SHORT:  600,   // Faster (default: 1200)
  NORMAL: 1000,  // Faster (default: 2000)
  LONG:   1500,  // Faster (default: 3000)
  READ:   2000,  // Faster (default: 4500)
};
```

### Headless mode
Edit `demo.js`:
```javascript
const browser = await chromium.launch({
  headless: true,  // No browser window
  slowMo: 0,       // No artificial slowdown
});
```

---

## 📖 Scenario Details

### 01 — Authentication
- ✅ Signup new user
- ✅ Wrong password → error
- ✅ Duplicate email → 409 error
- ✅ Sign in
- ✅ Sign out

### 02 — Organizations
- ✅ Create org
- ✅ Slug auto-fills from name
- ✅ View org list
- ✅ Select org → navigate to dashboards

### 03 — Dashboards & Widgets
- ✅ Create dashboard
- ✅ Add KPI widget (sample data)
- ✅ Add LINE chart
- ✅ Add BAR chart
- ✅ Add PIE chart
- ✅ Add TABLE
- ✅ Hover → delete button appears
- ✅ Delete widget

### 04 — Alerts
- ✅ Create alert: `error_count > 100`
- ✅ Create alert: `revenue < 500`
- ✅ Mute for 1 hour → status "muted"
- ✅ Delete alert

### 05 — API Keys
- ✅ Create "Production Ingestion Key"
- ✅ Key preview shown: `ak_...`
- ✅ Create second key
- ✅ Delete second key

### 06 — Data Sources
- ✅ Create REST source
- ✅ Create Webhook source
- ✅ Create CSV source
- ✅ List shows all 3 with IDs
- ✅ Delete CSV source

### 07 — Data Ingestion
- ✅ POST `/ingest/events` (bulk)
- ✅ View Swagger docs for CSV upload
- ✅ POST `/ingest/webhook/{source_id}`
- ✅ View Celery Flower task queue

### 08 — Reports
- ✅ Create daily PDF report via API
- ✅ Create weekly PDF report
- ✅ Create monthly PNG report
- ✅ List shows: name · frequency · format · recipients · next run time
- ✅ View run history (empty until Celery Beat triggers)

### 09 — WebSocket Real-Time
- ✅ Dashboard opens → WS connects automatically
- ✅ Inject message listener
- ✅ Ingest event → WS receives `dashboard_update`
- ✅ Dashboard refetches data
- ✅ View WS frames in DevTools Network tab

### 10 — Members & RBAC
- ✅ Invite analyst member
- ✅ Invite viewer member
- ✅ Invite admin member
- ✅ Explain role hierarchy: Owner → Admin → Analyst → Viewer
- ✅ Viewer cannot POST /dashboards (403)

### 11 — Dashboard Sharing
- ✅ POST `/dashboards/{id}/share` → get share_token
- ✅ PATCH dashboard → `is_public: true`
- ✅ PATCH dashboard → `auto_refresh_seconds: 30`
- ✅ Reload → "Auto-refreshing every 30s" label visible

### 12 — Token Refresh
- ✅ View tokens in localStorage
- ✅ Simulate expired access token
- ✅ Navigate → 401 intercepted → silent refresh
- ✅ New token issued
- ✅ Call POST `/auth/refresh` directly

---

## 🧪 Troubleshooting

### Browser doesn't open
```bash
npm run setup
# or
npx playwright install chromium
```

### "Frontend not running"
```bash
cd ..
docker compose up --build
```
Wait for frontend to show `ready` in logs.

### Scenario fails with timeout
- Backend may be slow — increase `waitForURL` timeout in scenario file
- Database migrations not run → `docker compose exec backend alembic upgrade head`

### Screenshots are blank
- Playwright may not have rendered page fully — increase `PAUSE` values in `helpers.js`

### Flower not reachable (Scenario 07)
- Redis/Celery not running → check `docker compose ps`
- Flower disabled in docker-compose.yml → uncomment service

### WebSocket not connecting (Scenario 09)
- Backend WS URL wrong → check `NEXT_PUBLIC_WS_URL` in frontend/.env.local
- Token expired → refresh tokens have 7 day TTL

---

## 🔍 Debugging

### Watch console in real-time
```bash
node demo.js 3 2>&1 | tee demo.log
```

### Inspect screenshots
```bash
# Windows
explorer screenshots

# Open specific screenshot
start screenshots\03_05_bar_widget_filled.png
```

### View JSON report
```bash
type report.json | more
```

### DevTools
The browser opens with DevTools available:
- Press `F12` to open
- Network tab → see all API calls
- WS tab → inspect WebSocket frames
- Console → see injected messages

---

## 📝 CI/CD Integration

### GitHub Actions
```yaml
- name: Run Demo Suite
  run: |
    cd demo_test
    npx playwright install chromium
    npm run demo
    
- name: Upload Screenshots
  uses: actions/upload-artifact@v3
  with:
    name: demo-screenshots
    path: demo_test/screenshots/
    
- name: Upload Report
  uses: actions/upload-artifact@v3
  with:
    name: demo-report
    path: demo_test/report.json
```

### Exit code
- **0** if all scenarios pass
- **1** if any scenario fails

---

## 🎯 Best Practices

1. **Run demo after every code change** to catch regressions
2. **Review screenshots** to verify UI looks correct
3. **Commit report.json** to track performance trends
4. **Run individual scenarios** during development (faster feedback)
5. **Run full suite** before merging PRs

---

## 📚 Tech Stack

- **Playwright** — Browser automation
- **Node.js** — JavaScript runtime
- **Chromium** — Browser engine

---

## 🤝 Contributing

To add a new scenario:

1. Create `scenarios/13_feature_name.js`
2. Export `async function run(page, state) { ... }`
3. Add to `ALL_SCENARIOS` array in `demo.js`
4. Use `helpers.js` utilities for logging and timing

---

## 📄 License

ISC

---

## 💬 Support

Check the main README.md in the project root for:
- Architecture overview
- API documentation
- Manual testing guides
- Deployment instructions
