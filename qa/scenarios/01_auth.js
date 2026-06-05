// scenarios/01_auth.js
// Covers: Signup · Wrong password error · Duplicate email error · Signin · Signout

const { PAUSE, log, logOk, logWarn, sleep, fill, shot, highlight } = require('../helpers');
const S = '01_Auth';

async function run(page, state) {
  // ── Step 1: Open Signup page ───────────────────────────────────────────────
  log(S, 1, 'Navigate to /signup');
  await page.goto(`${state.BASE_URL}/signup`);
  await sleep(PAUSE.NORMAL);
  await shot(page, '01_01_signup_page');

  // ── Step 2: Fill form ─────────────────────────────────────────────────────
  log(S, 2, 'Fill registration form');
  await fill(page, 'input[type="text"]', state.USER.full_name);
  await fill(page, 'input[type="email"]', state.USER.email);
  await fill(page, 'input[type="password"]', state.USER.password);
  await highlight(page, 'button[type="submit"]');
  await shot(page, '01_02_signup_filled');

  // ── Step 3: Submit → redirect /orgs ───────────────────────────────────────
  log(S, 3, 'Submit → expect redirect to /orgs');
  await page.click('button[type="submit"]');
  await page.waitForURL('**/orgs', { timeout: 12000 });
  logOk('Signup successful — landed on /orgs');
  await sleep(PAUSE.LONG);
  await shot(page, '01_03_orgs_page_after_signup');

  // ── Step 4: Sign out ──────────────────────────────────────────────────────
  log(S, 4, 'Sign out via sidebar');
  await page.click('button:has-text("Sign Out")');
  await page.waitForURL('**/login', { timeout: 8000 });
  logOk('Signed out → /login');
  await sleep(PAUSE.NORMAL);

  // ── Step 5: Wrong password → error message ────────────────────────────────
  log(S, 5, 'Sign in with WRONG password → expect error');
  await fill(page, 'input[type="email"]', state.USER.email);
  await fill(page, 'input[type="password"]', 'WrongPass!');
  await page.click('button[type="submit"]');
  await sleep(PAUSE.NORMAL);
  const wrongErr = await page.isVisible('p.text-destructive');
  wrongErr ? logOk('Error shown for wrong password') : logWarn('Error not visible');
  await shot(page, '01_05_wrong_password_error');

  // ── Step 6: Duplicate email → 409 error ──────────────────────────────────
  log(S, 6, 'Signup again with SAME email → expect 409 duplicate error');
  await page.goto(`${state.BASE_URL}/signup`);
  await sleep(PAUSE.NORMAL);
  await fill(page, 'input[type="text"]', 'Another Person');
  await fill(page, 'input[type="email"]', state.USER.email);
  await fill(page, 'input[type="password"]', 'Password123!');
  await page.click('button[type="submit"]');
  await sleep(PAUSE.NORMAL);
  const dupErr = await page.isVisible('p.text-destructive');
  dupErr ? logOk('Duplicate email error shown (409)') : logWarn('Duplicate error not visible');
  await shot(page, '01_06_duplicate_email_error');

  // ── Step 7: Correct sign in ───────────────────────────────────────────────
  log(S, 7, 'Sign in with CORRECT credentials');
  await page.goto(`${state.BASE_URL}/login`);
  await sleep(PAUSE.SHORT);
  await fill(page, 'input[type="email"]', state.USER.email);
  await fill(page, 'input[type="password"]', state.USER.password);
  await page.click('button[type="submit"]');
  await page.waitForURL('**/orgs', { timeout: 12000 });
  logOk('Signed in — redirected to /orgs');
  await sleep(PAUSE.NORMAL);
  await shot(page, '01_07_signin_success');
}

module.exports = { run };
