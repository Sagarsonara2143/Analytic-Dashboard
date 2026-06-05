// scenarios/03_dashboards.js
// Covers: Create dashboard · List dashboards · View dashboard · Add all 5 widget types · Delete widget

const { PAUSE, log, logOk, logInfo, sleep, banner, fill, shot, highlight } = require('../helpers');
const S = '03_Dashboards';

const WIDGETS = [
  { type: 'kpi',   title: 'Total Revenue KPI' },
  { type: 'line',  title: 'Weekly Sales Trend' },
  { type: 'bar',   title: 'Monthly Revenue' },
  { type: 'pie',   title: 'Product Mix' },
  { type: 'table', title: 'Top Metrics Table' },
];

async function run(page, state) {
  const orgId = state.ORG_ID;
  if (!orgId) throw new Error('ORG_ID missing — run scenario 02 first');

  // ── Step 1: View dashboards list ──────────────────────────────────────────
  log(S, 1, 'View Dashboards list');
  await page.goto(`${state.BASE_URL}/orgs/${orgId}/dashboards`);
  await sleep(PAUSE.NORMAL);
  await shot(page, '03_01_dashboards_list_empty');

  // ── Step 2: Open new dashboard form ──────────────────────────────────────
  log(S, 2, 'Click "+ New Dashboard"');
  await page.click('a:has-text("+ New Dashboard")');
  await page.waitForURL('**/new', { timeout: 8000 });
  await sleep(PAUSE.NORMAL);
  await shot(page, '03_02_new_dashboard_form');

  // ── Step 3: Fill name + description ──────────────────────────────────────
  log(S, 3, 'Fill dashboard name and description');
  await fill(page, 'input[type="text"]', 'Sales Analytics Dashboard');
  await fill(page, 'textarea', 'Real-time sales metrics and KPIs');
  await shot(page, '03_03_dashboard_form_filled');

  // ── Step 4: Submit → redirect to dashboard page ───────────────────────────
  log(S, 4, 'Submit → create dashboard');
  await page.click('button:has-text("Create Dashboard")');
  await page.waitForURL(/\/dashboards\/[a-f0-9-]{36}$/, { timeout: 12000 });
  const dashUrl = page.url();
  state.DASHBOARD_ID = dashUrl.match(/\/dashboards\/([a-f0-9-]{36})$/)?.[1];
  logOk(`Dashboard created — ID: ${state.DASHBOARD_ID}`);
  await sleep(PAUSE.LONG);
  await shot(page, '03_04_empty_dashboard');

  // ── Steps 5-9: Add all 5 widget types ────────────────────────────────────
  for (let i = 0; i < WIDGETS.length; i++) {
    const w = WIDGETS[i];
    const stepNum = 5 + i;

    log(S, stepNum, `Add ${w.type.toUpperCase()} widget: "${w.title}"`);
    await banner(page, S, stepNum, `Adding ${w.type.toUpperCase()} widget: "${w.title}"`);
    await page.click('button:has-text("Add Widget")');
    await sleep(PAUSE.NORMAL);
    await shot(page, `03_0${stepNum}_widget_form_open`);

    // Fill title
    await page.fill('input[placeholder*="Weekly"]', w.title);
    await sleep(PAUSE.SHORT);

    // Select widget type
    await page.selectOption('select', w.type);
    await sleep(PAUSE.LONG); // let sample data preview update

    logInfo(`Sample data preview shown for ${w.type}`);
    await shot(page, `03_0${stepNum}_${w.type}_widget_filled`);

    // Submit (button text changed to "Create Widget" after UI update)
    await page.click('button:has-text("Create Widget")');
    await sleep(PAUSE.LONG);
    logOk(`${w.type.toUpperCase()} widget added`);
    await shot(page, `03_0${stepNum}_${w.type}_widget_on_dashboard`);
  }

  // ── Step 10: View full dashboard with all widgets ─────────────────────────
  log(S, 10, 'View full dashboard with all 5 widgets');
  await sleep(PAUSE.READ);
  await shot(page, '03_10_all_widgets_dashboard');

  // ── Step 11: Hover widget → show delete button ───────────────────────────
  log(S, 11, 'Hover first widget → delete button appears');
  const firstWidget = page.locator('.group').first();
  await firstWidget.hover();
  await sleep(PAUSE.LONG);
  await shot(page, '03_11_widget_hover_delete_visible');

  // ── Step 12: Delete first widget ─────────────────────────────────────────
  log(S, 12, 'Click delete button to remove widget');
  // Button has opacity-0 (only visible on CSS group-hover).
  // force:true bypasses Playwright's visibility check so it clicks despite opacity:0.
  await firstWidget.locator('button[title="Delete widget"]').click({ force: true });
  await sleep(PAUSE.LONG);
  logOk('Widget deleted — grid updated');
  await shot(page, '03_12_widget_deleted');

  // ── Step 13: Go back and verify dashboard card on list ────────────────────
  log(S, 13, 'Back to dashboards list — verify card shows widget count');
  await page.goto(`${state.BASE_URL}/orgs/${orgId}/dashboards`);
  await sleep(PAUSE.NORMAL);
  await shot(page, '03_13_dashboards_list_with_card');
  logOk('Dashboard card visible with widget count');
}

module.exports = { run };
