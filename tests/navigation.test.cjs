const { test } = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
const { chromium } = require('playwright');

const entry = name => pathToFileURL(path.join(__dirname, '..', name + '.html')).href;
const views = ['index', 'day24', 'day25', 'day26', 'day27', 'day28', 'transport', 'phrases', 'etiquette', 'how-to', 'checklist'];

test('all trip views open from a local file at phone and desktop sizes', async t => {
  const browser = await chromium.launch(process.env.CHROME_PATH ? { executablePath: process.env.CHROME_PATH } : {});
  t.after(() => browser.close());
  for (const width of [375, 681, 1280]) {
    const page = await browser.newPage({ viewport: { width, height: 840 } });
    await page.route('https://www.google.com/maps**', r => r.fulfill({ body: 'Map' }));
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    for (const view of views) {
      await page.goto(entry(view));
      await page.locator('main h1').first().waitFor();
      assert.ok((await page.locator('main').innerText()).length > 120, view + ' has travel information');
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - innerWidth);
      assert.ok(overflow <= 1, view + ' fits a ' + width + 'px viewport');
    }
    assert.deepEqual(errors, []);
    await page.close();
  }
});

test('marking a hobby stop on a day also updates the travel checklist', async t => {
  const browser = await chromium.launch(process.env.CHROME_PATH ? { executablePath: process.env.CHROME_PATH } : {});
  t.after(() => browser.close());
  const page = await browser.newPage();
  await page.route('https://www.google.com/maps**', r => r.fulfill({ body: 'Map' }));
  await page.goto(entry('day24'));
  const shop = () => page.getByRole('checkbox', { name: /Sakae[-– ]SKYLE/i });
  await shop().check();
  await page.goto(entry('checklist'));
  assert.equal(await shop().isChecked(), true);
  await shop().uncheck();
  await page.goto(entry('day25'));
  await page.reload();
  assert.equal(await shop().isChecked(), false);
});

test('checklist choices stay available across views when device storage is blocked', async t => {
  const browser = await chromium.launch(process.env.CHROME_PATH ? { executablePath: process.env.CHROME_PATH } : {});
  t.after(() => browser.close());
  const page = await browser.newPage();
  await page.route('https://www.google.com/maps**', r => r.fulfill({ body: 'Map' }));
  await page.addInitScript(() => {
    Object.defineProperty(window, 'localStorage', {
      get() { throw new DOMException('Storage is disabled', 'SecurityError'); }
    });
  });
  await page.goto(entry('day24'));
  const shop = () => page.getByRole('checkbox', { name: /Sakae[-– ]SKYLE/i });
  await shop().check();
  await page.goto(entry('checklist'));
  assert.equal(await shop().isChecked(), true);
});

test('all HTML documents contain readable trip content and request no indexing without JavaScript', async t => {
  const browser = await chromium.launch(process.env.CHROME_PATH ? { executablePath: process.env.CHROME_PATH } : {});
  t.after(() => browser.close());
  const page = await browser.newPage({ javaScriptEnabled: false, viewport: { width: 375, height: 810 } });
  await page.route('https://www.google.com/maps**', r => r.fulfill({ body: 'Map' }));
  await page.goto(entry('index'));
  assert.equal(await page.locator('.guide-day-cards a[href$=".html"]').count(), 5);
  for (const view of views) {
    await page.goto(entry(view));
    const main = page.locator('main');
    assert.ok((await main.innerText()).length > 350, view + ' has static travel content');
    assert.equal(await main.getByRole('heading', {level: 1}).count(), 1);
    assert.match(await page.locator('head meta[name="robots"]').getAttribute('content'), /\bnoindex\b/);
    const navigation = page.getByRole('navigation', {name: 'Main navigation'});
    assert.equal(await navigation.getByRole('link', {name:'Overview'}).isVisible(), true);
    assert.equal(await navigation.getByRole('link', {name:'Etiquette'}).getAttribute('href'), 'etiquette.html');
    assert.equal(await navigation.getByRole('link', {name:'How to', exact:true}).getAttribute('href'), 'how-to.html');
    if (/^day|^transport$/.test(view)) {
      const route = main.locator('iframe[src*="saddr="][src*="daddr="]').first();
      assert.ok(await route.isVisible(), view + ' has embedded directions without toggling a control');
    }
  }
});
