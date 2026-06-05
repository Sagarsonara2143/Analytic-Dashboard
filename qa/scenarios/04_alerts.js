// scenarios/04_alerts.js
// Covers: Create alert · List alerts · Mute alert · Delete alert

const { PAUSE, log, logOk, logInfo, sleep, fill, shot, highlight } = require('../helpers');
const S = '04_Alerts';

async function run(page, state) {
  const orgId = state.ORG_ID;

  // ── Step 1: Navigate to Alerts ────────────────────────────────────────────
  log(S, 1, 'Navigate to Alerts page');
  await page.goto(`${state.BASE_URL}/orgs/${orgId}/alerts`);
  await sleep(PAUSE.NORMAL);
  await shot(page, '04_01_alerts_empty');

  // ── Step 2: Open new alert form ───────────────────────────────────────────
  log(S, 2, 'Click "+ New Alert"');
  await page.click('a:has-text("+ New Alert")');
  await page.waitForURL('**/alerts/new', { timeout: 8000 });
  await sleep(PAUSE.NORMAL);
  await shot(page, '04_02_new_alert_form');

  // ── Step 3: Fill alert #1 - Error Rate ────────────────────────────────────
  log(S, 3, 'Fill Alert: High Error Rate (threshold: error_count > 100)');
  await fill(page, 'input[type="text"]', 'High Error Rate');
  await page.fill('textarea', '{"metric": "error_count"}');
  await sleep(PAUSE.SHORT);
  await page.selectOption('select', 'gt');
  await sleep(PAUSE.SHORT);
  await page.fill('input[type="number"]:last-of-type', '100');
  await sleep(PAUSE.SHORT);

  // check interval
  const intervals = await page.locator('input[type="number"]').all();
  if (intervals.length >= 2) {
    await intervals[intervals.length - 1].fill('5');
    await sleep(PAUSE.SHORT);
  }
  await shot(page, '04_03_alert_form_filled');

  // ── Step 4: Submit alert ──────────────────────────────────────────────────
  log(S, 4, 'Submit → create alert');
  await page.click('button:has-text("Create Alert")');
  await page.waitForURL('**/alerts', { timeout: 12000 });
  logOk('Alert created — status: active');
  await sleep(PAUSE.LONG);
  await shot(page, '04_04_alert_created_active');

  // ── Step 5: Create second alert ───────────────────────────────────────────
  log(S, 5, 'Create second alert: Low Revenue (value < 500)');
  await page.click('a:has-text("+ New Alert")');
  await page.waitForURL('**/alerts/new', { timeout: 8000 });
  await sleep(PAUSE.SHORT);
  await fill(page, 'input[type="text"]', 'Low Revenue Warning');
  await page.fill('textarea', '{"metric": "revenue"}');
  await sleep(PAUSE.SHORT);
  await page.selectOption('select', 'lt');
  await sleep(PAUSE.SHORT);
  const numInputs2 = await page.locator('input[type="number"]').all();
  if (numInputs2.length >= 1) await numInputs2[0].fill('500');
  await sleep(PAUSE.SHORT);
  await page.click('button:has-text("Create Alert")');
  await page.waitForURL('**/alerts', { timeout: 12000 });
  logOk('Second alert created');
  await sleep(PAUSE.NORMAL);
  await shot(page, '04_05_two_alerts_listed');

  // ── Step 6: Mute first alert for 1 hour ──────────────────────────────────
  log(S, 6, 'Mute first alert for 1 hour');
  // Mute button is now an icon-only button with title attribute (UI redesign)
  await highlight(page, 'button[title="Mute for 1 hour"]');
  await page.click('button[title="Mute for 1 hour"]');
  await sleep(PAUSE.LONG);
  logOk('Alert muted — status changes to "muted" (yellow)');
  await shot(page, '04_06_alert_muted');

  // ── Step 7: Delete second alert ───────────────────────────────────────────
  log(S, 7, 'Delete second alert (Low Revenue Warning)');
  // Delete button is now an icon-only button with title attribute (UI redesign)
  const deleteButtons = await page.locator('button[title="Delete alert"]').all();
  if (deleteButtons.length >= 1) {
    await deleteButtons[deleteButtons.length - 1].click();
    await sleep(PAUSE.LONG);
    logOk('Alert deleted — removed from list');
  }
  await shot(page, '04_07_alert_deleted');
}

module.exports = { run };
