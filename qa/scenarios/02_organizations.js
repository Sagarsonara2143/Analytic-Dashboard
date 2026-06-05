// scenarios/02_organizations.js
// Covers: Create org · Org list · Select org · Slug auto-generation

const { PAUSE, log, logOk, logInfo, logWarn, sleep, banner, fill, shot, highlight } = require('../helpers');
const S = '02_Organizations';

async function run(page, state) {
  // ── Step 1: Confirm on /orgs ───────────────────────────────────────────────
  log(S, 1, 'View Organizations list page');
  await page.goto(`${state.BASE_URL}/orgs`);
  await sleep(PAUSE.NORMAL);
  await banner(page, S, 1, 'Organizations list page');
  await shot(page, '02_01_orgs_list');

  // ── Step 2: Open create org form ─────────────────────────────────────────
  log(S, 2, 'Click "+ New Organization"');
  await banner(page, S, 2, 'Opening the New Organization form');
  await highlight(page, 'button:has-text("+ New Organization")');
  await page.click('button:has-text("+ New Organization")');
  await sleep(PAUSE.NORMAL);
  await shot(page, '02_02_new_org_form');

  // ── Step 3: Fill name → watch slug auto-fill ─────────────────────────────
  log(S, 3, 'Type org name → watch slug auto-generate');
  await banner(page, S, 3, `Typing org name — slug auto-fills from name`);
  await fill(page, 'input[placeholder="Acme Corporation"]', state.ORG.name, PAUSE.LONG);
  logInfo(`Org name: "${state.ORG.name}" | Slug will be: "${state.ORG.slug}"`);
  await shot(page, '02_03_org_name_filled_slug_generated');

  // ── Step 4: Submit ────────────────────────────────────────────────────────
  log(S, 4, 'Submit → create org → redirect to dashboards');
  await banner(page, S, 4, 'Submitting org creation — waiting for redirect to Dashboards');
  await page.click('button:has-text("Create"):not(:has-text("Cancel"))');

  // Check for inline error (e.g. duplicate slug) before waiting for redirect
  await sleep(1000);
  const errVisible = await page.isVisible('div.bg-destructive\\/10');
  if (errVisible) {
    const errText = await page.locator('div.bg-destructive\\/10 p').textContent().catch(() => 'unknown error');
    await shot(page, '02_04_org_create_error');
    throw new Error(`Org creation failed — server error: ${errText.trim()}`);
  }

  await page.waitForURL('**/dashboards', { timeout: 20000 });

  // Capture orgId from URL
  const url = page.url();
  state.ORG_ID = url.match(/\/orgs\/([^/]+)\//)?.[1];
  if (!state.ORG_ID) throw new Error('ORG_ID missing — could not extract from URL after redirect');
  logOk(`Org created — ID: ${state.ORG_ID}`);
  await sleep(PAUSE.LONG);
  await shot(page, '02_04_org_created_dashboards');

  // ── Step 5: Go back to /orgs and click the org card ──────────────────────
  log(S, 5, 'Go back to /orgs and select org by clicking card');
  await page.goto(`${state.BASE_URL}/orgs`);
  await sleep(PAUSE.NORMAL);
  await shot(page, '02_05_orgs_list_with_org');

  await page.click(`button:has-text("${state.ORG.name}")`);
  await page.waitForURL('**/dashboards', { timeout: 12000 });
  logOk('Selected org → back to dashboards');
  await sleep(PAUSE.NORMAL);
}

module.exports = { run };
