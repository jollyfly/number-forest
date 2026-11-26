import { chromium } from 'playwright-core';
import fs from 'node:fs';

const OUT = '/opt/cursor/artifacts';
const DOCS = 'docs/screenshots';
fs.mkdirSync(OUT, { recursive: true });
fs.mkdirSync(DOCS, { recursive: true });

const browser = await chromium.launch({
  executablePath: '/usr/bin/google-chrome-stable',
  headless: true,
  args: ['--no-sandbox', '--disable-dev-shm-usage'],
});

async function tap(locator) {
  await locator.click({ force: true });
}

async function shot(page, name) {
  const file = `${DOCS}/${name}.png`;
  await page.screenshot({ path: file });
  fs.copyFileSync(file, `${OUT}/${name}.png`);
  console.log('shot', name);
}

function watch(page) {
  page.on('pageerror', (err) => {
    console.error('PAGEERROR', err.message);
    page._failed = err.message;
  });
}

const url = process.env.PLAY_URL || 'http://127.0.0.1:4173/number-forest/';

const context = await browser.newContext({
  viewport: { width: 1180, height: 820 },
  hasTouch: true,
  locale: 'zh-CN',
  deviceScaleFactor: 1,
});
const page = await context.newPage();
watch(page);

await page.goto(url);
await page.waitForSelector('[data-action=start]');
await shot(page, 'start');
await page.click('[data-action=start]');
await page.waitForSelector('[data-screen=map]');
await page.waitForTimeout(400);
await shot(page, 'map');
await page.locator('.map-scroll').evaluate((node) => {
  node.scrollLeft = 980;
});
await page.waitForTimeout(200);
await shot(page, 'map-more');
await page.locator('.map-scroll').evaluate((node) => {
  node.scrollLeft = 0;
});

for (const id of ['count', 'cart', 'add', 'frog', 'pattern']) {
  await tap(page.locator(`[data-game="${id}"]`));
  await page.waitForSelector(`[data-game="${id}"] [data-ready="1"]`);
  await page.waitForTimeout(200);
  await shot(page, id);
  await tap(page.locator('[data-action=back]'));
  await page.waitForSelector('[data-screen=map]');
}

await tap(page.locator('[data-game="pattern"]'));
await page.waitForSelector('[data-ready="1"]');
const patternAnswer = await page.locator('[data-stage]').getAttribute('data-answer');
const choiceCount = await page.locator('[data-choice]').count();
for (let i = 0; i < choiceCount; i++) {
  const value = await page.locator('[data-choice]').nth(i).getAttribute('data-choice');
  if (value !== patternAnswer) {
    await tap(page.locator('[data-choice]').nth(i));
    break;
  }
}
await page.waitForSelector('.is-hint');
await shot(page, 'pattern-hint');
await page.waitForTimeout(400);
await tap(page.locator(`[data-choice="${patternAnswer}"]`));
await page.waitForFunction(() => document.querySelector('[data-pips]')?.getAttribute('data-index') === '1');
await tap(page.locator('[data-action=back]'));
await page.waitForSelector('[data-screen=map]');

await tap(page.locator('[data-game="cart"]'));
await page.waitForSelector('[data-ready="1"]');
const target = Number(await page.locator('[data-stage]').getAttribute('data-answer'));
const cell = page.locator('[data-cell="0"]');
await page.locator('[data-pile] button').first().dragTo(cell);
await page.waitForTimeout(150);
for (let i = 1; i < target; i++) {
  await tap(page.locator('[data-pile] button').first());
}
const filled = await page.locator('.cell .pine-btn').count();
if (filled !== target) throw new Error(`cart filled ${filled}, wanted ${target}`);
await tap(page.locator('[data-action=check]'));
await page.waitForFunction(() => document.querySelector('[data-pips]')?.getAttribute('data-index') === '1');
await tap(page.locator('[data-action=back]'));
await page.waitForSelector('[data-screen=map]');

await tap(page.locator('[data-game="add"]'));
await page.waitForSelector('[data-ready="1"]');
const addAnswer = await page.locator('[data-stage]').getAttribute('data-answer');
await tap(page.locator(`[data-choice="${addAnswer}"]`));
await page.waitForFunction(() => document.querySelector('[data-pips]')?.getAttribute('data-index') === '1');
await tap(page.locator('[data-action=back]'));
await page.waitForSelector('[data-screen=map]');

await tap(page.locator('[data-game="frog"]'));
await page.waitForSelector('[data-ready="1"]');
const frogAnswer = await page.locator('[data-stage]').getAttribute('data-answer');
await tap(page.locator(`[data-pad="${frogAnswer}"]`));
await page.waitForFunction(
  () => document.querySelector('[data-pips]')?.getAttribute('data-index') === '1',
  null,
  { timeout: 8000 },
);
await tap(page.locator('[data-action=back]'));
await page.waitForSelector('[data-screen=map]');

await tap(page.locator('[data-game="count"]'));
for (let i = 0; i < 6; i++) {
  await page.waitForSelector('[data-ready="1"]');
  const answer = await page.locator('[data-stage]').getAttribute('data-answer');
  const pines = page.locator('.pine-layer .pine-btn:not(.is-hidden)');
  const visible = await pines.count();
  for (let p = 0; p < Math.min(visible, Number(answer)); p++) {
    await tap(pines.nth(p));
  }
  await tap(page.locator(`[data-choice="${answer}"]`));
  if (i < 5) {
    await page.waitForFunction(
      (idx) => document.querySelector('[data-pips]')?.getAttribute('data-index') === String(idx),
      i + 1,
      { timeout: 8000 },
    );
  }
}
await page.waitForSelector('[data-screen=reward]', { timeout: 8000 });
await page.waitForTimeout(500);
await shot(page, 'reward');

const save = await page.evaluate(() => JSON.parse(localStorage.getItem('number-forest-v1') || '{}'));
console.log('progress', JSON.stringify({ stars: save.stars, count: save.games.count }));
if (save.stars !== 3) throw new Error(`expected 3 stars, got ${save.stars}`);
if (save.games.count.level !== 3) throw new Error(`expected count level 3, got ${save.games.count.level}`);
if (!save.games.count.stickers.includes(1)) throw new Error('missing level 1 sticker');

await tap(page.locator('[data-action=done]'));
await page.waitForSelector('[data-screen=map]');
const shown = await page.locator('[data-stars]').first().getAttribute('data-stars');
if (shown !== '3') throw new Error(`map stars ${shown}`);
await shot(page, 'map-progress');

await page.evaluate(() => {
  const data = JSON.parse(localStorage.getItem('number-forest-v1'));
  data.stars = 32;
  localStorage.setItem('number-forest-v1', JSON.stringify(data));
});
await page.reload();
await tap(page.locator('[data-action=start]'));
await page.waitForSelector('[data-screen=map]');
await tap(page.locator('[data-action=treehouse]'));
await page.waitForSelector('[data-screen=tree]');
const tier = await page.locator('[data-screen=tree]').getAttribute('data-tier');
if (tier !== '4') throw new Error(`tree tier ${tier}`);
await shot(page, 'treehouse');

if (page._failed) throw new Error(page._failed);

const offline = await browser.newContext({
  viewport: { width: 1180, height: 820 },
  hasTouch: true,
  locale: 'zh-CN',
});
const offlinePage = await offline.newPage();
watch(offlinePage);
await offlinePage.goto(url);
await offlinePage.waitForSelector('[data-action=start]');
await offlinePage.waitForFunction(() => navigator.serviceWorker?.ready, null, { timeout: 10000 });
await offlinePage.reload();
await offlinePage.waitForSelector('[data-action=start]');
const controlled = await offlinePage.evaluate(() => Boolean(navigator.serviceWorker.controller));
console.log('sw controlled', controlled);
await offline.setOffline(true);
await offlinePage.reload();
await offlinePage.waitForSelector('[data-action=start]', { timeout: 8000 });
console.log('offline reload ok');

const portrait = await browser.newContext({
  viewport: { width: 820, height: 1180 },
  hasTouch: true,
  locale: 'zh-CN',
});
const tall = await portrait.newPage();
watch(tall);
await tall.goto(url);
await tap(tall.locator('[data-action=start]'));
await tall.waitForSelector('[data-screen=map]');
await shot(tall, 'map-portrait');
await tap(tall.locator('[data-game="frog"]'));
await tall.waitForSelector('[data-ready="1"]');
await shot(tall, 'frog-portrait');

await browser.close();
console.log('playtest ok');
