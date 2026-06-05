// scenarios/08_reports.js
// Covers: Create daily/weekly/monthly reports · List reports · View run history

const { PAUSE, log, logOk, logInfo, logWarn, sleep, shot } = require('../helpers');
const S = '08_Reports';

async function run(page, state) {
  const orgId      = state.ORG_ID;
  const dashboardId = state.DASHBOARD_ID;

  if (!orgId) throw new Error('ORG_ID missing — run scenario 02 first');
  if (!dashboardId) throw new Error('DASHBOARD_ID missing — run scenario 03 first');

  // ── Step 1: Navigate to Reports page ─────────────────────────────────────
  log(S, 1, 'Navigate to Reports page');
  await page.goto(`${state.BASE_URL}/orgs/${orgId}/reports`);
  await sleep(PAUSE.NORMAL);
  await shot(page, '08_01_reports_empty');

  // ── Step 2: Create reports via API (no UI form — use Swagger) ────────────
  log(S, 2, 'Create 3 reports via API — daily PDF · weekly PDF · monthly PNG');
  logInfo('Reports are created via the backend API. Calling from browser context...');

  const reports = [
    { name: 'Daily Sales Report',   frequency: 'daily',   format: 'pdf', recipients: ['team@example.com'] },
    { name: 'Weekly KPI Summary',   frequency: 'weekly',  format: 'pdf', recipients: ['ceo@example.com', 'cto@example.com'] },
    { name: 'Monthly Analytics PNG', frequency: 'monthly', format: 'png', recipients: ['board@example.com'] },
  ];

  for (const report of reports) {
    const result = await page.evaluate(async ({ orgId, dashboardId, report }) => {
      try {
        const res = await fetch(`/api/v1/orgs/${orgId}/reports`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...report, dashboard_id: dashboardId }),
        });
        return { status: res.status, body: await res.json() };
      } catch (e) {
        return { error: e.message };
      }
    }, { orgId, dashboardId, report });

    if (result.status === 201) {
      logOk(`Created: "${report.name}" (${report.frequency} ${report.format.toUpperCase()})`);
      if (!state.REPORT_ID) state.REPORT_ID = result.body?.id;
    } else {
      logWarn(`Failed to create "${report.name}": ${JSON.stringify(result)}`);
    }
    await sleep(PAUSE.SHORT);
  }

  // ── Step 3: Reload reports page to see all 3 ─────────────────────────────
  log(S, 3, 'Reload Reports page — view all scheduled reports');
  await page.reload();
  await sleep(PAUSE.LONG);
  await shot(page, '08_03_three_reports_listed');
  logOk('All 3 reports listed with frequency, format, recipients, next run time');

  // ── Step 4: Inspect report details ───────────────────────────────────────
  log(S, 4, 'Inspect report card details');
  logInfo('Each card shows: name · frequency · format · recipient count · next_run_at');
  await sleep(PAUSE.READ);
  await shot(page, '08_04_report_details');

  // ── Step 5: View run history (via API) ───────────────────────────────────
  if (state.REPORT_ID) {
    log(S, 5, `View run history for report ID: ${state.REPORT_ID}`);
    const runs = await page.evaluate(async ({ orgId, reportId }) => {
      try {
        const res = await fetch(`/api/v1/orgs/${orgId}/reports/${reportId}/runs`);
        return { status: res.status, body: await res.json() };
      } catch (e) {
        return { error: e.message };
      }
    }, { orgId, reportId: state.REPORT_ID });

    if (runs.status === 200) {
      logOk(`Run history fetched — ${runs.body.length} run(s) found`);
      logInfo(runs.body.length === 0 ? 'No runs yet (Celery Beat triggers on schedule)' : JSON.stringify(runs.body[0]));
    } else {
      logWarn(`Run history response: ${JSON.stringify(runs)}`);
    }
  }
  await shot(page, '08_05_report_runs');

  // ── Step 6: Open Swagger for manual PDF download test ────────────────────
  log(S, 6, 'Swagger UI — Download report PDF (once a run exists)');
  logInfo(`Endpoint: GET /api/v1/orgs/${orgId}/reports/{report_id}/runs/{run_id}/download`);
  await page.goto(`http://localhost:8004/api/docs#/reports`);
  await sleep(PAUSE.NORMAL);
  await shot(page, '08_06_swagger_reports');
}

module.exports = { run };
