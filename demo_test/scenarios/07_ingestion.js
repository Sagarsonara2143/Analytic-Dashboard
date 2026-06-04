// scenarios/07_ingestion.js
// Covers: Bulk event ingest (API key) · CSV upload · Webhook receiver
// All ingestion calls are made via page.evaluate() using fetch() so you can
// watch Network tab in DevTools and see the real requests + responses.

const { PAUSE, log, logOk, logInfo, logWarn, sleep, shot } = require('../helpers');
const S = '07_Ingestion';

async function run(page, state) {
  const orgId   = state.ORG_ID;
  const sourceId = state.SOURCE_IDS?.[0];

  if (!sourceId) {
    logWarn('No source ID found — skipping ingestion scenario. Run 06_data_sources first.');
    return;
  }

  // ── Step 1: Navigate to API docs to show available endpoints ─────────────
  log(S, 1, 'Open API Docs (Swagger UI) to view ingestion endpoints');
  await page.goto('http://localhost:8000/api/docs#/ingestion');
  await sleep(PAUSE.READ);
  await shot(page, '07_01_swagger_ingestion_endpoints');

  // ── Step 2: Bulk REST event ingest via fetch() ────────────────────────────
  log(S, 2, 'Bulk Event Ingest — POST /api/v1/ingest/events (API key auth)');
  logInfo('Calling API directly from browser via fetch()');

  // Navigate to dashboard so we have a valid page context
  await page.goto(`${state.BASE_URL}/orgs/${orgId}/dashboards`);
  await sleep(PAUSE.NORMAL);

  // Open DevTools console hint
  logInfo('Open DevTools (F12) → Network tab to watch these requests live');

  const ingestResult = await page.evaluate(async ({ sourceId }) => {
    const events = [
      { source_id: sourceId, payload: { metric: 'page_views',   value: 1250 } },
      { source_id: sourceId, payload: { metric: 'sessions',     value: 480  } },
      { source_id: sourceId, payload: { metric: 'error_count',  value: 12   } },
      { source_id: sourceId, payload: { metric: 'revenue',      value: 8420 } },
      { source_id: sourceId, payload: { metric: 'conversions',  value: 95   } },
    ];
    try {
      const res = await fetch('/api/v1/ingest/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(events),
      });
      const body = await res.json();
      return { status: res.status, body };
    } catch (e) {
      return { error: e.message };
    }
  }, { sourceId });

  if (ingestResult.status === 200 || ingestResult.body?.queued) {
    logOk(`Events queued: ${ingestResult.body?.queued ?? '?'} — processed by Celery worker`);
  } else {
    logWarn(`Ingest response: ${JSON.stringify(ingestResult)}`);
    logInfo('Note: /ingest/events requires X-API-Key header. Showing endpoint structure.');
  }
  await shot(page, '07_02_events_ingested');

  // ── Step 3: CSV upload ────────────────────────────────────────────────────
  log(S, 3, 'CSV Upload — POST /api/v1/orgs/{id}/ingest/csv');
  logInfo('Open API Docs to try CSV upload manually:');
  logInfo(`  URL: http://localhost:8000/api/docs#/ingestion/ingest_csv_orgs__org_id__ingest_csv_post`);
  logInfo(`  org_id: ${orgId}`);
  logInfo(`  source_id: ${sourceId}`);
  logInfo('  Upload a CSV with columns: metric, value');

  await page.goto('http://localhost:8000/api/docs');
  await sleep(PAUSE.NORMAL);

  // Expand the ingestion section
  try {
    const ingestTag = page.locator('span:has-text("ingestion")').first();
    await ingestTag.click();
    await sleep(PAUSE.NORMAL);
  } catch (_) {}

  await shot(page, '07_03_swagger_csv_upload');

  // ── Step 4: Webhook ingest ────────────────────────────────────────────────
  log(S, 4, 'Webhook ingest — POST /api/v1/ingest/webhook/{source_id}');
  logInfo(`Webhook URL: http://localhost:8000/api/v1/ingest/webhook/${sourceId}`);

  const webhookResult = await page.evaluate(async ({ sourceId }) => {
    try {
      const res = await fetch(`/api/v1/ingest/webhook/${sourceId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ event: 'purchase', amount: 299.99, user_id: 'u_42' }),
      });
      const body = await res.json();
      return { status: res.status, body };
    } catch (e) {
      return { error: e.message };
    }
  }, { sourceId });

  if (webhookResult.status === 200 || webhookResult.body?.status === 'received') {
    logOk(`Webhook received — status: ${webhookResult.body?.status}`);
  } else {
    logWarn(`Webhook response: ${JSON.stringify(webhookResult)}`);
    logInfo('Note: Webhook also requires API key auth. Test via Swagger with Authorization header.');
  }
  await shot(page, '07_04_webhook_ingested');

  // ── Step 5: Celery worker monitor ────────────────────────────────────────
  log(S, 5, 'View Celery Flower dashboard — worker task queue');
  try {
    await page.goto('http://localhost:5555');
    await sleep(PAUSE.READ);
    logOk('Flower dashboard shows queued/processed ingestion tasks');
    await shot(page, '07_05_celery_flower_tasks');
  } catch (_) {
    logWarn('Flower not reachable at :5555 — ensure docker compose is running');
  }
}

module.exports = { run };
