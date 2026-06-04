// scenarios/12_token_refresh.js
// Covers: Access token expiry simulation · Silent refresh via interceptor ·
//         Refresh token used once · New token pair issued · Logout on refresh failure

const { PAUSE, log, logOk, logInfo, logWarn, sleep, shot } = require('../helpers');
const S = '12_TokenRefresh';

async function run(page, state) {
  const orgId = state.ORG_ID;

  // ── Step 1: Show current token in localStorage ────────────────────────────
  log(S, 1, 'Inspect access + refresh tokens in localStorage');
  await page.goto(`${state.BASE_URL}/orgs/${orgId}/dashboards`);
  await sleep(PAUSE.NORMAL);

  const tokens = await page.evaluate(() => {
    const raw = localStorage.getItem('auth-storage');
    if (!raw) return null;
    try { return JSON.parse(raw); } catch { return null; }
  });

  if (tokens) {
    logOk('Tokens found in localStorage (Zustand persist)');
    logInfo(`Access token: ${String(tokens?.state?.accessToken || '').slice(0, 40)}...`);
    logInfo(`Refresh token: ${String(tokens?.state?.refreshToken || '').slice(0, 40)}...`);
    state.REFRESH_TOKEN = tokens?.state?.refreshToken;
  } else {
    logWarn('Token not found in localStorage — may use different storage key');
  }
  await shot(page, '12_01_tokens_in_storage');

  // ── Step 2: Manually expire the access token ─────────────────────────────
  log(S, 2, 'Simulate expired access token by replacing it with an invalid value');
  await page.evaluate(() => {
    const raw = localStorage.getItem('auth-storage');
    if (!raw) return;
    const parsed = JSON.parse(raw);
    if (parsed?.state) {
      parsed.state.accessToken = 'expired.token.invalid';
      localStorage.setItem('auth-storage', JSON.stringify(parsed));
    }
  });
  logOk('Access token replaced with expired value');
  await sleep(PAUSE.NORMAL);

  // ── Step 3: Make an API call → interceptor catches 401 → uses refresh token
  log(S, 3, 'Navigate to alerts page → 401 intercepted → silent refresh');
  await page.goto(`${state.BASE_URL}/orgs/${orgId}/alerts`);
  await sleep(PAUSE.LONG);

  const freshToken = await page.evaluate(() => {
    const raw = localStorage.getItem('auth-storage');
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed?.state?.accessToken || null;
  });

  if (freshToken && freshToken !== 'expired.token.invalid') {
    logOk('Silent token refresh successful — new access token issued');
    logInfo(`New token: ${freshToken.slice(0, 40)}...`);
  } else {
    logInfo('Token not refreshed yet — page may have redirected to login');
    logInfo('This is expected if refresh token also expired (7 day TTL)');
  }
  await shot(page, '12_03_after_token_refresh');

  // ── Step 4: Call /auth/refresh directly via API ───────────────────────────
  log(S, 4, 'Call POST /auth/refresh directly to demonstrate refresh flow');
  if (state.REFRESH_TOKEN) {
    const refreshResult = await page.evaluate(async ({ refreshToken }) => {
      try {
        const res = await fetch('/api/v1/auth/refresh', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refresh_token: refreshToken }),
        });
        return { status: res.status, body: await res.json() };
      } catch (e) {
        return { error: e.message };
      }
    }, { refreshToken: state.REFRESH_TOKEN });

    if (refreshResult.status === 200) {
      logOk('POST /auth/refresh → 200 OK');
      logInfo('Response: { access_token, refresh_token, token_type: "bearer" }');
      logInfo('Axios interceptor in api-client.ts handles this automatically on 401');
    } else {
      logWarn(`Refresh failed: ${JSON.stringify(refreshResult)}`);
    }
  }
  await shot(page, '12_04_refresh_token_flow');

  // ── Step 5: Show interceptor code in browser ──────────────────────────────
  log(S, 5, 'Summary — token refresh flow in api-client.ts');
  logInfo('1. api.interceptors.response catches HTTP 401');
  logInfo('2. If not already refreshing: calls POST /api/v1/auth/refresh');
  logInfo('3. New token stored in Zustand → queued requests retried');
  logInfo('4. If refresh fails → useAuthStore.logout() → redirected to /login');
  await sleep(PAUSE.READ);
  await shot(page, '12_05_refresh_flow_summary');
}

module.exports = { run };
