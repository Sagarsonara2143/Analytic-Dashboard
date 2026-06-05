// scenarios/11_dashboard_sharing.js
// Covers: Generate share token · Public dashboard link · Token in response

const { PAUSE, log, logOk, logInfo, logWarn, sleep, shot } = require('../helpers');
const S = '11_DashboardSharing';

async function run(page, state) {
  const orgId      = state.ORG_ID;
  const dashboardId = state.DASHBOARD_ID;

  if (!orgId) throw new Error('ORG_ID missing — run scenario 02 first');
  if (!dashboardId) throw new Error('DASHBOARD_ID missing — run scenario 03 first');

  // ── Step 1: Open dashboard ────────────────────────────────────────────────
  log(S, 1, 'Open dashboard to share');
  await page.goto(`${state.BASE_URL}/orgs/${orgId}/dashboards/${dashboardId}`);
  await sleep(PAUSE.NORMAL);
  await shot(page, '11_01_dashboard_to_share');

  // ── Step 2: Generate share token via API ──────────────────────────────────
  log(S, 2, 'POST /dashboards/{id}/share → generate share token');
  const shareResult = await page.evaluate(async ({ orgId, dashboardId }) => {
    try {
      const res = await fetch(`/api/v1/orgs/${orgId}/dashboards/${dashboardId}/share`, {
        method: 'POST',
      });
      return { status: res.status, body: await res.json() };
    } catch (e) {
      return { error: e.message };
    }
  }, { orgId, dashboardId });

  if (shareResult.status === 200 && shareResult.body?.share_token) {
    state.SHARE_TOKEN = shareResult.body.share_token;
    logOk(`Share token generated: ${state.SHARE_TOKEN}`);
    logInfo(`Public link: ${state.BASE_URL}/orgs/${orgId}/dashboards/${dashboardId}?share_token=${state.SHARE_TOKEN}`);
  } else {
    logWarn(`Share response: ${JSON.stringify(shareResult)}`);
    logInfo('Note: share endpoint returns {share_token: "..."}');
  }
  await shot(page, '11_02_share_token_generated');

  // ── Step 3: Dashboard PATCH — enable public access ────────────────────────
  log(S, 3, 'PATCH dashboard → set is_public: true');
  const patchResult = await page.evaluate(async ({ orgId, dashboardId }) => {
    try {
      const res = await fetch(`/api/v1/orgs/${orgId}/dashboards/${dashboardId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_public: true, auto_refresh_seconds: 30 }),
      });
      return { status: res.status, body: await res.json() };
    } catch (e) {
      return { error: e.message };
    }
  }, { orgId, dashboardId });

  if (patchResult.status === 200) {
    logOk(`Dashboard updated — is_public: ${patchResult.body?.is_public}, auto_refresh: ${patchResult.body?.auto_refresh_seconds}s`);
  }
  await shot(page, '11_03_dashboard_public');

  // ── Step 4: Reload and confirm auto-refresh shown ─────────────────────────
  log(S, 4, 'Reload dashboard — confirm "Auto-refreshing every 30s" label');
  await page.reload();
  await sleep(PAUSE.LONG);
  // Label text changed in UI redesign from "Auto-refreshing every Xs" to "🔄 Refreshing every Xs"
  const autoRefreshLabel = await page.isVisible('span:has-text("Refreshing every")');
  autoRefreshLabel
    ? logOk('"Refreshing every 30s" label visible on dashboard')
    : logInfo('Auto-refresh label not visible — check auto_refresh_seconds value');
  await shot(page, '11_04_auto_refresh_label');
}

module.exports = { run };
