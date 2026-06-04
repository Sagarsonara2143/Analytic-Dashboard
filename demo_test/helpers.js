// helpers.js - Shared utilities for all demo scenarios

const PAUSE = {
  SHORT: 1200,
  NORMAL: 2000,
  LONG: 3000,
  READ: 4500,
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

async function highlight(page, selector) {
  try {
    await page.evaluate((sel) => {
      const el = document.querySelector(sel);
      if (!el) return;
      const prev = el.style.outline;
      el.style.outline = '3px solid #ef4444';
      setTimeout(() => { el.style.outline = prev; }, 1800);
    }, selector);
    await sleep(1900);
  } catch (_) {}
}

module.exports = { PAUSE, log, logOk, logInfo, logWarn, sleep, fill, shot, highlight };
