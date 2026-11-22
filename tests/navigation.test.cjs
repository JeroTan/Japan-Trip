const { test } = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
const { chromium } = require('playwright');

const entry = name => pathToFileURL(path.join(__dirname, '..', name + '.html')).href;
const views = ['index', 'day24', 'day25', 'day26', 'day27', 'day28', 'transport', 'toyota', 'phrases', 'etiquette', 'how-to', 'items', 'checklist'];

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
    assert.equal(await navigation.getByRole('link', {name:'Toyota history'}).getAttribute('href'), 'toyota.html');
    assert.equal(await navigation.getByRole('link', {name:'Etiquette'}).getAttribute('href'), 'etiquette.html');
    assert.equal(await navigation.getByRole('link', {name:'How to', exact:true}).getAttribute('href'), 'how-to.html');
    assert.equal(await navigation.getByRole('link', {name:'Items to look for'}).getAttribute('href'), 'items.html');
    if (/^day|^transport$/.test(view)) {
      const route = main.locator('iframe[src*="saddr="][src*="daddr="]').first();
      assert.ok(await route.isVisible(), view + ' has embedded directions without toggling a control');
    }
  }
});

test('the standalone shopping guide keeps sources at the end and opens nearby shop directions without scripts', async t => {
  const browser = await chromium.launch(process.env.CHROME_PATH ? { executablePath: process.env.CHROME_PATH } : {});
  t.after(() => browser.close());
  const page = await browser.newPage({javaScriptEnabled:false, viewport:{width:375,height:812}});
  await page.route('https://www.google.com/maps**', r => r.fulfill({body:'Map'}));
  await page.goto(entry('items'));
  const sources = page.getByRole('region', {name:'Sources'});
  assert.equal(await page.locator('main section').last().getAttribute('aria-labelledby'), 'shopping-sources');
  assert.equal(await page.locator('main a[href*="youtu"]').count(), 1);
  assert.equal(await sources.locator('a[href*="youtu"]').count(), 1);
  const items = page.locator('.souvenir-list');
  assert.equal(await items.locator('li:not(:has(figure img[alt]))').count(), 0);
  assert.doesNotMatch((await items.allInnerTexts()).join(' '), /the video|the creator|timestamp|featured shop/i);
  for (const id of ['imo-kenpi','ninja-meshi','oao','white-tees','vintage-watches','palm-shaver','bonsai','paolo-hot-sauce','white-tea-candle','shimbi']) {
    assert.ok(await items.locator('#' + id).isVisible(), id);
  }
  await page.getByRole('link', {name:'RAILYARD in Akihabara'}).click();
  assert.ok(page.url().endsWith('day26.html#akihabara-railyard'));
  const shop = page.getByRole('region', {name:'Akihabara · GENERAL STORE RAILYARD'});
  await shop.getByText('Walking map · APA Tokyo → RAILYARD', {exact:true}).click();
  const frame = shop.locator('details[open] iframe');
  assert.ok(await frame.isVisible());
  const map = new URL(await frame.getAttribute('src'));
  const directions = new URL(await shop.getByRole('link', {name:'APA Tokyo → RAILYARD ↗'}).getAttribute('href'));
  assert.equal(map.searchParams.get('saddr'), directions.searchParams.get('origin'));
  assert.equal(map.searchParams.get('daddr'), directions.searchParams.get('destination'));
  assert.equal(map.searchParams.get('dirflg'), 'w');
});

test('the first subway ride links to its approach tunes and distinguishes the JR departure signal', async t => {
  const browser = await chromium.launch(process.env.CHROME_PATH ? { executablePath: process.env.CHROME_PATH } : {});
  t.after(() => browser.close());
  const page = await browser.newPage({javaScriptEnabled:false, viewport:{width:375,height:812}});
  await page.goto(entry('how-to'));
  await page.getByRole('link', {name:'Follow your first ride from Nagoya to Sakae'}).click();
  const commute = page.getByRole('region', {name:'How to ride the train'});
  assert.equal(await commute.locator('.train-step-photos img').count(), 5);
  for (const photo of await commute.locator('.train-step-photos img').all()) {
    await photo.scrollIntoViewIfNeeded();
    await photo.evaluate(img => img.decode());
    assert.ok(await photo.getAttribute('alt'));
  }
  assert.match(await commute.innerText(), /Fushimi \(H09\).*Sakae \(H10\)/);
  await commute.getByRole('link', {name:'Hear the two Higashiyama tunes'}).click();
  assert.ok(page.url().endsWith('etiquette.html#train-jingles'));
  assert.equal(await page.locator('a[href$=".wmv"]').count(), 2);
  assert.ok(await page.getByText(/the melody signals departure/).isVisible());
});
