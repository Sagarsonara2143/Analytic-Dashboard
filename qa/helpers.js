// helpers.js - Shared utilities for all demo scenarios

const PAUSE = {
  SHORT:  1000,
  NORMAL: 1800,
  LONG:   2800,
  READ:   3500,
};

function log(scenario, step, msg) {
  const prefix = step ? `[${scenario} › Step ${step}]` : `[${scenario}]`;
  console.log(`\n${prefix} ${msg}`);
}

function logOk(msg)   { console.log(`  ✅ ${msg}`); }
function logInfo(msg) { console.log(`  ℹ️  ${msg}`); }
function logWarn(msg) { console.log(`  ⚠️  ${msg}`); }

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

// Show a floating step-banner on the live page so the watcher knows what's happening
async function banner(page, scenario, step, msg) {
  try {
    await page.evaluate(({ scenario, step, msg }) => {
      const id  = '__qa_banner__';
      const old = document.getElementById(id);
      if (old) old.remove();

      const el = document.createElement('div');
      el.id = id;
      el.style.cssText = [
        'position:fixed', 'bottom:28px', 'left:50%',
        'transform:translateX(-50%)', 'z-index:2147483645',
        'pointer-events:none',
        'background:rgba(15,23,42,0.96)',
        'color:#f8fafc', 'border-radius:14px',
        'padding:12px 28px', 'max-width:700px', 'text-align:center',
        'font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif',
        'font-size:14px', 'line-height:1.5',
        'box-shadow:0 8px 32px rgba(0,0,0,0.5)',
        'border:1px solid rgba(255,255,255,0.12)',
      ].join(';');

      el.innerHTML =
        `<span style="color:#94a3b8;font-size:11px;font-weight:700;letter-spacing:.08em;">` +
        `${String(scenario).toUpperCase()} &rsaquo; STEP ${step}</span><br>` +
        `<span style="font-weight:500;">${msg}</span>`;

      document.body.appendChild(el);
    }, { scenario, step: step || '—', msg });
  } catch (_) {}
}

async function fill(page, selector, value, pause = PAUSE.SHORT) {
  await page.fill(selector, value);
  await sleep(pause);
}

async function shot(page, name) {
  const fs = require('fs');
  if (!fs.existsSync('screenshots')) fs.mkdirSync('screenshots');
  const file = `screenshots/${name}.png`;
  await page.screenshot({ path: file, fullPage: true });
  console.log(`  📸 ${file}`);
}

// Scroll element into view + amber pulsing outline before interacting
async function highlight(page, selector) {
  try {
    await page.evaluate((sel) => {
      const el = document.querySelector(sel);
      if (!el) return;
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      const prev = el.style.cssText;
      el.style.outline       = '3px solid #f59e0b';
      el.style.outlineOffset = '3px';
      el.style.boxShadow     = '0 0 0 6px rgba(245,158,11,0.35)';
      el.style.transition    = 'all 0.2s';
      setTimeout(() => { el.style.cssText = prev; }, 1600);
    }, selector);
    await sleep(1800);
  } catch (_) {}
}

module.exports = { PAUSE, log, logOk, logInfo, logWarn, sleep, banner, fill, shot, highlight };
