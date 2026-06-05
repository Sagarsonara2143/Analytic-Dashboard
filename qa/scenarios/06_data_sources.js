// scenarios/06_data_sources.js
// Covers: Create REST source · Create Webhook source · Create CSV source · List · Delete

const { PAUSE, log, logOk, logInfo, sleep, fill, shot, highlight } = require('../helpers');
const S = '06_DataSources';

const SOURCES = [
  { name: 'Production REST API',  type: 'rest' },
  { name: 'Webhook Receiver',     type: 'webhook' },
  { name: 'CSV Batch Upload',     type: 'csv' },
];

async function run(page, state) {
  const orgId = state.ORG_ID;

  // ── Step 1: Navigate to Data Sources ─────────────────────────────────────
  log(S, 1, 'Navigate to Data Sources page');
  await page.goto(`${state.BASE_URL}/orgs/${orgId}/sources`);
  await sleep(PAUSE.NORMAL);
  await shot(page, '06_01_sources_empty');

  // ── Steps 2-4: Create all 3 source types ─────────────────────────────────
  for (let i = 0; i < SOURCES.length; i++) {
    const src = SOURCES[i];
    const stepNum = 2 + i;
    log(S, stepNum, `Create source: "${src.name}" (type: ${src.type})`);

    await fill(page, 'input[placeholder="Source name"]', src.name);
    await page.selectOption('select', src.type);
    await sleep(PAUSE.NORMAL);
    await shot(page, `06_0${stepNum}_${src.type}_source_filled`);

    await page.click('button:has-text("Create")');
    await sleep(PAUSE.LONG);
    logOk(`${src.type} source created`);
    await shot(page, `06_0${stepNum}_${src.type}_source_created`);
  }

  // ── Step 5: Verify all 3 sources listed ──────────────────────────────────
  log(S, 5, 'View all 3 sources listed with IDs');
  await sleep(PAUSE.READ);
  await shot(page, '06_05_all_sources_listed');

  // Capture source IDs for ingestion scenario
  const sourceIds = await page.locator('p.text-xs:has-text("ID:")').allTextContents();
  state.SOURCE_IDS = sourceIds.map(t => t.replace('ID: ', '').trim());
  logInfo(`Source IDs captured: ${state.SOURCE_IDS.join(', ')}`);

  // ── Step 6: Delete the CSV source ────────────────────────────────────────
  log(S, 6, 'Delete "CSV Batch Upload" source');
  // Delete button is now an icon-only button with title attribute (UI redesign)
  const deleteButtons = await page.locator('button[title="Delete source"]').all();
  if (deleteButtons.length >= 1) {
    await deleteButtons[deleteButtons.length - 1].click();
    await sleep(PAUSE.LONG);
    logOk('CSV source deleted — 2 sources remain');
  }
  await shot(page, '06_06_source_deleted');
}

module.exports = { run };
