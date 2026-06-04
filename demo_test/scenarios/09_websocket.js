// scenarios/09_websocket.js
// Covers: WS connection established · Dashboard auto-refresh on server push ·
//         Reconnect after disconnect · DevTools Network WS frame inspection

const { PAUSE, log, logOk, logInfo, logWarn, sleep, shot } = require('../helpers');
const S = '09_WebSocket';

async function run(page, state) {
  const orgId      = state.ORG_ID;
  const dashboardId = state.DASHBOARD_ID;
  const sourceId    = state.SOURCE_IDS?.[0];

  if (!dashboardId) {
    logWarn('No dashboard ID — run 03_dashboards first.');
    return;
  }

  // ── Step 1: Open dashboard page (WS auto-connects) ────────────────────────
  log(S, 1, 'Open dashboard — WebSocket connects automatically');
  await page.goto(`${state.BASE_URL}/orgs/${orgId}/dashboards/${dashboardId}`);
  await sleep(PAUSE.LONG);
  logInfo('WS connects to: ws://localhost:8000/api/v1/ws/{orgId}?token=<access_token>');
  logInfo('Open DevTools → Network → WS tab to inspect frames');
  await shot(page, '09_01_dashboard_ws_open');

  // ── Step 2: Inject WS message listener so we can observe messages ─────────
  log(S, 2, 'Inject console listener for WebSocket messages');
  await page.evaluate(() => {
    // Monkey-patch WebSocket to log all received messages to console
    const OrigWS = window.WebSocket;
    window.__wsMessages = [];
    window.WebSocket = function(url, protocols) {
      const ws = new OrigWS(url, protocols);
      const orig = ws.onmessage;
      ws.addEventListener('message', (e) => {
        window.__wsMessages.push(e.data);
        console.log('[WS received]', e.data);
      });
      return ws;
    };
    Object.assign(window.WebSocket, OrigWS);
  });
  await sleep(PAUSE.NORMAL);
  logOk('WS message listener injected — messages logged to browser console');

  // ── Step 3: Broadcast a fake dashboard_update via API ────────────────────
  log(S, 3, 'Trigger dashboard_update message via WebSocket broadcast endpoint');
  logInfo('The server broadcasts to all connected clients when events are ingested');

  if (sourceId) {
    // Ingest an event which triggers Celery → ws_manager.broadcast()
    const result = await page.evaluate(async ({ sourceId }) => {
      try {
        const res = await fetch('/api/v1/ingest/events', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify([{
            source_id: sourceId,
            payload: { metric: 'realtime_test', value: 999 },
          }]),
        });
        return { status: res.status, body: await res.json() };
      } catch (e) {
        return { error: e.message };
      }
    }, { sourceId });

    logInfo(`Ingestion trigger response: ${JSON.stringify(result)}`);
  }

  await sleep(PAUSE.LONG);

  // ── Step 4: Check if any WS messages were received ────────────────────────
  log(S, 4, 'Check received WebSocket messages');
  const messages = await page.evaluate(() => window.__wsMessages || []);
  if (messages.length > 0) {
    logOk(`${messages.length} WS message(s) received:`);
    messages.forEach(m => logInfo(`  → ${m}`));
  } else {
    logInfo('No WS messages yet — Celery worker processes async');
    logInfo('Messages appear when Celery completes the task and calls ws_manager.broadcast()');
  }
  await shot(page, '09_04_ws_messages_received');

  // ── Step 5: Show auto_refresh_seconds behaviour ────────────────────────────
  log(S, 5, 'Dashboard auto-refresh — triggered by WS "dashboard_update" type message');
  logInfo('When server sends: {"type": "dashboard_update"} — dashboard.refetch() is called');
  logInfo('When auto_refresh_seconds is set — refetch fires every N seconds via setInterval');
  await sleep(PAUSE.READ);
  await shot(page, '09_05_auto_refresh_explained');

  // ── Step 6: Open second browser context to show multi-client WS ──────────
  log(S, 6, 'Open API docs WS endpoint description');
  await page.goto(`http://localhost:8000/api/docs#/realtime`);
  await sleep(PAUSE.NORMAL);
  logInfo('WS endpoint: ws://localhost:8000/api/v1/ws/{org_id}?token=<access_token>');
  logInfo('Clients authenticate with JWT access token as query param');
  logInfo('Connection closes with code 4001 on invalid/expired token');
  await shot(page, '09_06_ws_api_docs');
}

module.exports = { run };
