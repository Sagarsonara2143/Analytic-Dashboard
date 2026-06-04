// demo.js - Full scenario orchestrator
// Runs all 12 scenarios in sequence with a shared state object
// Usage: node demo.js [scenario_number]
//   node demo.js        → run all scenarios
//   node demo.js 3      → run only scenario 03_dashboards
//   node demo.js 1 5    → run scenarios 01 through 05

const { chromium } = require('playwright');
const fs = require('fs');

// ── Bug & Error Logger ────────────────────────────────────────────────────────
const BUG_LOG = 'bugs_and_errors.log';
const bugEntries = [];

function logBug(severity, scenario, step, detail, stack) {
  const entry = {
    type: 'BUG',
    severity,     // CRITICAL | HIGH | MEDIUM
    scenario,
    step,
    detail,
    time: new Date().toISOString(),
  };
  bugEntries.push(entry);
  console.error(`  🐛 [BUG][${severity}] ${scenario} › ${step} — ${detail}`);
}

function logError(scenario, step, message, stack) {
  const entry = {
    type: 'ERROR',
    scenario,
    step,
    message,
    stack: stack || '',
    time: new Date().toISOString(),
  };
  bugEntries.push(entry);
  console.error(`  ❗ [ERROR] ${scenario} › ${step} — ${message}`);
}

function writeBugLog(results) {
  const lines = [
    'Analytics & Dashboard — Bug & Error Log',
    `Generated: ${new Date().toISOString()}`,
    '='.repeat(70),
    '',
  ];

  for (const e of bugEntries) {
    if (e.type === 'BUG') {
      lines.push(`[BUG][${e.severity}] ${e.scenario} › ${e.step} — ${e.detail}`);
      lines.push(`  Time: ${e.time}`);
    } else {
      lines.push(`[ERROR] ${e.scenario} › ${e.step} — ${e.message}`);
      if (e.stack) lines.push(`  Stack: ${e.stack}`);
      lines.push(`  Time: ${e.time}`);
    }
    lines.push('');
  }

  lines.push('');
  lines.push('='.repeat(70));
  lines.push('RUN SUMMARY');
  lines.push('='.repeat(70));
  lines.push(`Completed: ${new Date().toISOString()}`);
  const passed = results.filter(r => r.status === 'PASS').length;
  const failed = results.filter(r => r.status === 'FAIL').length;
  lines.push(`Total: ${results.length}  Passed: ${passed}  Failed: ${failed}  Time: ${results.reduce((s,r)=>s+parseFloat(r.elapsed),0).toFixed(1)}s`);
  lines.push('');
  for (const r of results) {
    const status = r.status === 'PASS' ? 'PASS' : `FAIL — ${r.error || 'unknown error'}`;
    lines.push(`  [${r.id.toString().padStart(2,'0')}] ${r.label.padEnd(32)} ${status}`);
  }

  fs.writeFileSync(BUG_LOG, lines.join('\n'));
  console.log(`\n🐛  Bug log saved: ${BUG_LOG}`);
}

// ── Shared state passed between scenarios ─────────────────────────────────────
const state = {
  BASE_URL: 'http://localhost:3004',
  USER: {
    full_name: 'Demo User',
    email:     `demo_${Date.now()}@example.com`,
    password:  'Password123!',
  },
  ORG: {
    name: 'Demo Analytics Corp',
    slug: 'demo-analytics-corp',
  },
  ORG_ID:       null,
  DASHBOARD_ID: null,
  SOURCE_IDS:   [],
  REPORT_ID:    null,
  SHARE_TOKEN:  null,
  REFRESH_TOKEN: null,
  API_KEY_PREVIEW: null,
};

// ── All scenarios in order ────────────────────────────────────────────────────
const ALL_SCENARIOS = [
  { id: '01', label: 'Authentication',      file: './scenarios/01_auth' },
  { id: '02', label: 'Organizations',       file: './scenarios/02_organizations' },
  { id: '03', label: 'Dashboards & Widgets',file: './scenarios/03_dashboards' },
  { id: '04', label: 'Alerts',              file: './scenarios/04_alerts' },
  { id: '05', label: 'API Keys',            file: './scenarios/05_api_keys' },
  { id: '06', label: 'Data Sources',        file: './scenarios/06_data_sources' },
  { id: '07', label: 'Data Ingestion',      file: './scenarios/07_ingestion' },
  { id: '08', label: 'Reports',             file: './scenarios/08_reports' },
  { id: '09', label: 'WebSocket Real-Time', file: './scenarios/09_websocket' },
  { id: '10', label: 'Members & RBAC',      file: './scenarios/10_members_rbac' },
  { id: '11', label: 'Dashboard Sharing',   file: './scenarios/11_dashboard_sharing' },
  { id: '12', label: 'Token Refresh',       file: './scenarios/12_token_refresh' },
];

// ── Parse CLI args: node demo.js [from] [to] ─────────────────────────────────
const args = process.argv.slice(2).map(Number).filter(Boolean);
let scenarios = ALL_SCENARIOS;
if (args.length === 1) {
  scenarios = ALL_SCENARIOS.filter(s => parseInt(s.id) === args[0]);
} else if (args.length >= 2) {
  scenarios = ALL_SCENARIOS.filter(s => parseInt(s.id) >= args[0] && parseInt(s.id) <= args[1]);
}

// ── Ensure screenshots dir exists ─────────────────────────────────────────────
if (!fs.existsSync('screenshots')) fs.mkdirSync('screenshots');

// ── Check app is reachable ────────────────────────────────────────────────────
async function checkApp() {
  try {
    const http = require('http');
    return new Promise((resolve) => {
      const req = http.get('http://localhost:3000', (res) => resolve(res.statusCode < 500));
      req.on('error', () => resolve(false));
      req.setTimeout(3000, () => { req.destroy(); resolve(false); });
    });
  } catch { return false; }
}

// ── Main ──────────────────────────────────────────────────────────────────────
(async () => {
  console.log('╔══════════════════════════════════════════════════════════╗');
  console.log('║     Analytics & Dashboard Platform — Full Demo Suite     ║');
  console.log('╚══════════════════════════════════════════════════════════╝');
  console.log(`\n👤 Test user:  ${state.USER.email}`);
  console.log(`🏢 Org:        ${state.ORG.name}`);
  console.log(`🎬 Scenarios:  ${scenarios.map(s => s.id).join(', ')}\n`);

  // Pre-flight check
  const appUp = await checkApp();
  if (!appUp) {
    console.error('❌  Frontend not reachable at http://localhost:3000');
    console.error('   Start with: docker compose up --build');
    process.exit(1);
  }
  console.log('✅  App is running at http://localhost:3000\n');

  const browser = await chromium.launch({
    headless: false,
    slowMo: 80,
    args: ['--start-maximized'],
  });

  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
  });

  const page = await context.newPage();

  // Track pass/fail per scenario
  const results = [];
  const startTime = Date.now();

  for (const scenario of scenarios) {
    const scenStart = Date.now();
    console.log(`\n${'═'.repeat(60)}`);
    console.log(`▶  SCENARIO ${scenario.id}: ${scenario.label}`);
    console.log('═'.repeat(60));

    try {
      const mod = require(scenario.file);
      await mod.run(page, state);
      const elapsed = ((Date.now() - scenStart) / 1000).toFixed(1);
      results.push({ id: scenario.id, label: scenario.label, status: 'PASS', elapsed });
      console.log(`\n✅  SCENARIO ${scenario.id} PASSED (${elapsed}s)`);
    } catch (err) {
      const elapsed = ((Date.now() - scenStart) / 1000).toFixed(1);
      results.push({ id: scenario.id, label: scenario.label, status: 'FAIL', elapsed, error: err.message });
      console.error(`\n❌  SCENARIO ${scenario.id} FAILED: ${err.message}`);

      // Classify and log the error
      const step = err.message.includes('ORG_ID') ? 'Step 0'
                 : err.message.includes('DASHBOARD_ID') ? 'Step 0'
                 : err.message.includes('SOURCE_ID') ? 'Step 0'
                 : err.message.includes('waitForURL') ? 'Step (waitForURL)'
                 : 'Step —';

      if (err.message.includes('ORG_ID missing')) {
        logBug('CRITICAL', scenario.label, step, 'ORG_ID not set — dependent scenario skipped', err.stack);
      } else if (err.message.includes('DASHBOARD_ID')) {
        logBug('HIGH', scenario.label, step, 'DASHBOARD_ID not set — dependent scenario skipped', err.stack);
      } else if (err.message.includes('SOURCE_ID') || err.message.includes('source')) {
        logBug('HIGH', scenario.label, step, 'SOURCE_ID not available — run scenario 06 first', err.stack);
      } else if (err.message.includes('waitForURL') || err.message.includes('Timeout')) {
        logBug('CRITICAL', scenario.label, step, `Navigation timeout: ${err.message.split('\n')[0]}`, err.stack);
      } else {
        logError(scenario.label, step, err.message, err.stack);
      }

      // Take error screenshot
      try {
        await page.screenshot({ path: `screenshots/ERROR_${scenario.id}_${scenario.label.replace(/[\s&]/g,'_')}.png`, fullPage: true });
        console.log(`   📸  Error screenshot saved`);
      } catch (_) {}
    }
  }

  // ── Final Summary ─────────────────────────────────────────────────────────
  const totalSec = ((Date.now() - startTime) / 1000).toFixed(1);
  const passed = results.filter(r => r.status === 'PASS').length;
  const failed = results.filter(r => r.status === 'FAIL').length;

  console.log(`\n${'═'.repeat(60)}`);
  console.log('  FINAL REPORT');
  console.log('═'.repeat(60));
  results.forEach(r => {
    const icon = r.status === 'PASS' ? '✅' : '❌';
    const err  = r.error ? `  → ${r.error}` : '';
    console.log(`  ${icon}  [${r.id}] ${r.label.padEnd(28)} ${r.elapsed}s${err}`);
  });
  console.log('─'.repeat(60));
  console.log(`  Total: ${results.length} | Passed: ${passed} | Failed: ${failed} | Time: ${totalSec}s`);
  console.log('═'.repeat(60));

  if (failed === 0) {
    console.log('\n🎉  All scenarios passed!');
  } else {
    console.log(`\n⚠️   ${failed} scenario(s) failed — check screenshots/ for details`);
  }

  // Write JSON report
  const report = {
    runAt: new Date().toISOString(),
    user: state.USER.email,
    org: state.ORG.name,
    orgId: state.ORG_ID,
    dashboardId: state.DASHBOARD_ID,
    totalSeconds: totalSec,
    passed,
    failed,
    results,
  };
  fs.writeFileSync('report.json', JSON.stringify(report, null, 2));
  console.log('\n📄  Full report saved: report.json');
  console.log('📸  Screenshots saved: screenshots/\n');

  // Write bug/error log
  writeBugLog(results);

  console.log('⏸️   Browser stays open for 20 seconds for inspection...');
  await new Promise(r => setTimeout(r, 20000));

  await browser.close();
  console.log('👋  Done.\n');
  process.exit(failed > 0 ? 1 : 0);
})();
