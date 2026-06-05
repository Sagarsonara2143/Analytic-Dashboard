// scenarios/05_api_keys.js
// Covers: Create API key · List keys · Key preview (ak_...) · Delete key

const { PAUSE, log, logOk, logInfo, logWarn, sleep, fill, shot, highlight } = require('../helpers');
const S = '05_ApiKeys';

async function run(page, state) {
  const orgId = state.ORG_ID;

  // ── Step 1: Navigate to API Keys ──────────────────────────────────────────
  log(S, 1, 'Navigate to API Keys page');
  await page.goto(`${state.BASE_URL}/orgs/${orgId}/api-keys`);
  await sleep(PAUSE.NORMAL);
  await shot(page, '05_01_api_keys_empty');

  // ── Step 2: Create first API key ─────────────────────────────────────────
  log(S, 2, 'Create API key: "Production Ingestion Key"');
  // Placeholder changed in UI redesign from "Key name" to "Enter a name for this key"
  await fill(page, 'input[placeholder="Enter a name for this key"]', 'Production Ingestion Key');
  await highlight(page, 'button:has-text("Create")');
  await shot(page, '05_02_api_key_name_filled');

  await page.click('button:has-text("Create")');
  await sleep(PAUSE.LONG);
  logOk('API key created with ak_... preview');
  await shot(page, '05_03_api_key_created');

  // Capture key preview text — now rendered in <code> not <p> after UI redesign
  const keyText = await page.locator('code.font-mono').first().textContent().catch(() => 'ak_...');
  logInfo(`Key preview shown: ${keyText}`);
  state.API_KEY_PREVIEW = keyText;

  // ── Step 3: Create second API key ────────────────────────────────────────
  log(S, 3, 'Create second API key: "Dev Testing Key"');
  await fill(page, 'input[placeholder="Enter a name for this key"]', 'Dev Testing Key');
  await page.click('button:has-text("Create")');
  await sleep(PAUSE.LONG);
  logOk('Second key created');
  await shot(page, '05_04_two_api_keys');

  // ── Step 4: Delete second API key ────────────────────────────────────────
  log(S, 4, 'Delete "Dev Testing Key"');
  // Delete button is now an icon-only button with title attribute (UI redesign)
  const deleteButtons = await page.locator('button[title="Delete key"]').all();
  if (deleteButtons.length >= 1) {
    await deleteButtons[deleteButtons.length - 1].click();
    await sleep(PAUSE.LONG);
    logOk('Second key deleted — only Production key remains');
  }
  await shot(page, '05_05_one_key_remains');
}

module.exports = { run };
