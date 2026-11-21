const { before, after, test } = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
const { chromium } = require('playwright');

let browser;
before(async () => {
  browser = await chromium.launch(process.env.CHROME_PATH ? { executablePath: process.env.CHROME_PATH } : {});
});
after(async () => browser?.close());

async function visit(t, route, options = {}) {
  const page = await browser.newPage(options);
  t.after(() => page.close());
  const entry = pathToFileURL(path.resolve(__dirname, '..', 'index.html'));
  entry.hash = route;
  await page.goto(entry.href);
  page.setDefaultTimeout(2500);
  return page;
}

test('a traveler can switch between transport maps and find the booked times', async t => {
  const page = await visit(t, 'transport');
  const leg = page.getByRole('combobox', { name: 'Route leg' });
  await leg.selectOption({ label: 'Nov 27 · Tokyo to Narita' });
  const map = page.getByRole('link', { name: 'Open directions' });
  const directions = new URL(await map.getAttribute('href'));
  assert.match(directions.searchParams.get('origin'), /Tokyo Station/);
  assert.match(directions.searchParams.get('destination'), /Narita Tobu/);
  assert.match(await page.locator('main').innerText(), /Airport Terminal 2·3/);
  for (const time of ['07:35 PHT','12:35 JST','19:00 JST','23:35 PHT']) {
    assert.ok((await page.locator('main').innerText()).includes(time));
  }
  assert.equal(await page.getByRole('heading', {name: 'APA Hotel Kayabacho Hatchobori Ekimae'}).count(), 1);
  assert.match(await page.locator('main').innerText(), /morning bag drop/i);
});

test('preparation and optional shop choices survive reloading the local guide', async t => {
  const page = await visit(t, 'checklist', { viewport: {width: 375, height: 800} });
  const passport = page.getByRole('checkbox', {name: /Passport and Japan visa/});
  const shop = page.getByRole('checkbox', {name: /BOOKOFF SUPER BAZAAR/});
  await passport.check();
  await shop.check();
  await page.reload();
  assert.ok(await passport.isChecked());
  assert.ok(await shop.isChecked());
  assert.match(await page.locator('main').innerText(), /1 of 10 ready/);
  assert.match(await page.locator('main').innerText(), /1 of 5 visited/);
  assert.match(await page.locator('main').innerText(), /Nov 21 · 07:35 PHT/);
  assert.match(await page.locator('main').innerText(), /Nov 25 · 23:35 PHT/);
  assert.equal(new URL(await page.getByRole('link', {name: /Open eTravel/}).getAttribute('href')).host, 'etravel.gov.ph');
  assert.equal(new URL(await page.getByRole('link', {name: /Open Visit Japan Web/}).getAttribute('href')).host, 'services.digital.go.jp');
  assert.equal(await page.locator('a[href^="https://maps.app.goo.gl/"]').count(), 5);
});

test('a map only loads when requested, and switching legs clears the previous map', async t => {
  const page = await visit(t, 'transport');
  await page.route('https://www.google.com/maps?**', route => route.fulfill({ body: '<p>Map response</p>' }));
  assert.equal(await page.locator('iframe').count(), 0);
  await page.getByRole('button', {name: 'Load map'}).click();
  const map = page.locator('iframe[title*="Centrair"]');
  assert.match(await map.getAttribute('src'), /output=embed/);
  assert.match(new URL(await map.getAttribute('src')).searchParams.get('saddr') || '', /Centrair/);
  await page.getByRole('combobox', {name: 'Route leg'}).selectOption({label: 'Nov 27 · Tokyo to Narita'});
  assert.equal(await page.locator('iframe').count(), 0);
  await page.getByRole('button', {name: 'Load map'}).click();
  assert.match(await page.locator('iframe').getAttribute('title'), /Tokyo to Narita/);
  assert.ok(await page.getByRole('link', {name: 'Open directions'}).isVisible());
});

test('phrase search, situation filter, large display, keyboard focus and Japanese copy work', async t => {
  const page = await visit(t, 'phrases', {viewport: {width: 375, height: 800}});
  const query = page.getByRole('searchbox', {name: 'Search phrases'});
  await page.getByRole('combobox', {name: 'Situation'}).selectOption({label: 'At the hotel'});
  await query.fill('luggage');
  const results = page.getByRole('article');
  assert.equal(await results.count(), 1);
  assert.match(await results.innerText(), /荷物を預かっていただけますか/);
  const show = results.getByRole('button', {name: /Show/});
  await show.focus();
  await show.press('Enter');
  const dialog = page.getByRole('dialog');
  assert.ok(await dialog.isVisible());
  assert.equal(await dialog.locator('[lang="ja"]').innerText(), '荷物を預かっていただけますか。');
  await page.keyboard.press('Escape');
  assert.equal(await dialog.count(), 0);
  assert.ok(await show.evaluate(el => el === document.activeElement));
  await results.getByRole('button', {name: /Copy/}).click();
  await results.getByText('Copied', {exact: true}).waitFor();
  await query.fill('');
  await query.focus();
  await query.press('ControlOrMeta+v');
  assert.equal(await query.inputValue(), '荷物を預かっていただけますか。');
  await query.fill('zzz');
  assert.match(await page.locator('main').innerText(), /No matching phrases/);
  await page.getByRole('button', {name:'Clear filters'}).click();
  await query.fill('arigato');
  assert.match(await page.getByRole('article').first().innerText(), /Thank you/);
});
