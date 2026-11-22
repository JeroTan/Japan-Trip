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
  await page.route('https://www.google.com/maps?**', route => route.fulfill({contentType: 'text/html', body: '<p>Map fixture</p>'}));
  const entry = pathToFileURL(path.resolve(__dirname, '..', route + '.html'));
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

test('route map is visible on arrival and changes with the selected leg, including on mobile', async t => {
  for (const width of [375, 1280]) {
    const page = await visit(t, 'transport', {viewport: {width, height: 800}});
    const map = page.locator('.jt-map-panel:visible iframe');
    assert.equal(await map.count(), 1);
    const position = await map.boundingBox();
    assert.ok(position.y < 400 && position.height >= 250, 'Travellers can see the map on entry');
    const first = new URL(await map.getAttribute('src'));
    assert.match(first.searchParams.get('saddr'), /Centrair/);
    assert.equal(first.searchParams.get('output'), 'embed');
    assert.equal(first.searchParams.get('dirflg'), 'r');
    await page.getByRole('combobox', {name: 'Route leg'}).selectOption({label: 'Nov 27 · Tokyo to Narita'});
    assert.match(await map.getAttribute('title'), /Tokyo to Narita/);
    assert.match(new URL(await map.getAttribute('src')).searchParams.get('daddr'), /Narita Tobu/);
    assert.ok(await page.getByRole('link', {name: 'Open directions'}).isVisible());
    const hotel = page.locator('.jt-stay', {hasText: 'APA Hotel Nagoya Ekimae'});
    await hotel.locator('summary').click();
    assert.ok(await hotel.locator('iframe').isVisible());
    assert.match(new URL(await hotel.locator('iframe').getAttribute('src')).searchParams.get('q'), /APA Hotel Nagoya/);
  }
});

test('all route notes, phrases, entry forms and checklist items are usable with scripts disabled', async t => {
  const options = {javaScriptEnabled: false, viewport: {width: 375, height: 800}};
  const transport = await visit(t, 'transport', options);
  assert.ok(await transport.locator('.jt-map-panel iframe').first().isVisible());
  const routes = transport.locator('.jt-map-panel');
  assert.equal(await routes.count(), 10);
  const index = transport.locator('.jt-route-index');
  await index.locator('summary').click();
  const direct = index.getByRole('link', {name: 'Nov 28 · Narita hotel to Terminal 2'});
  await direct.click();
  assert.match(transport.url(), /#narita-terminal-2$/);
  assert.ok(await transport.getByRole('heading', {name: 'To the Manila departure'}).isVisible());
  for (const route of await routes.all()) {
    assert.ok(await route.getByRole('link', {name: /directions/i}).first().isVisible());
    assert.ok(await route.locator('li').count() >= 2);
    assert.ok(await route.locator('p').first().innerText());
    assert.ok(await route.locator('iframe').getAttribute('title'));
  }
  assert.equal(await transport.locator('.jt-stay iframe').count(), 3);
  assert.equal(await transport.locator('.jt-ticket').locator('a[href="day24.html"], a[href="day28.html"]').count(), 2);

  const phrases = await visit(t, 'phrases', options);
  assert.equal(await phrases.getByRole('article').count(), 60);
  assert.equal(await phrases.locator('article .jt-script[lang="ja"]').count(), 60);
  assert.equal(await phrases.locator('article [lang="ja"]').count(), 60);
  const secondhand = phrases.getByRole('article').filter({ hasText: 'Is this secondhand?' });
  assert.equal(await secondhand.locator('ruby rt').textContent(), 'ちゅうこひん');
  assert.equal(await phrases.locator('article .jt-roman').count(), 60);
  assert.equal(await secondhand.locator('.jt-roman').textContent(), 'Kore wa chuukohin desu ka?');
  const readings = await phrases.locator('article .jt-roman').allTextContents();
  assert.ok(readings.every(line => /^[\x20-\x7e]+$/.test(line)));
  assert.ok(readings.includes('Kono densha wa Toukyou-eki ni ikimasu ka?'));
  assert.ok(readings.includes('Pasupooto o nakushimashita.'));
  assert.equal(await phrases.getByRole('searchbox').count(), 0);
  assert.equal(await phrases.getByRole('button', {name: /Show phrase/}).count(), 0);

  const checklist = await visit(t, 'checklist', options);
  assert.equal(await checklist.getByRole('checkbox').count(), 15);
  await checklist.getByRole('checkbox', {name: /Travel insurance/}).check();
  assert.ok(await checklist.getByRole('checkbox', {name: /Travel insurance/}).isChecked());
  assert.ok(await checklist.getByRole('link', {name: /Open Visit Japan Web/}).isVisible());
});

test('Sakae travelers can compare the subway and GO Taxi and open directions for each shop', async t => {
  const page = await visit(t, 'transport', {viewport: {width: 375, height: 812}});
  await page.getByRole('navigation', {name: 'Nagoya hotel to Sakae'}).getByRole('link', {name: 'Subway'}).click();
  const subway = page.getByRole('article', {name: 'Nagoya hotel to Sakae by subway'});
  await subway.waitFor();
  assert.match(await subway.innerText(), /¥210/);
  assert.match(await subway.innerText(), /inclined elevator/i);
  await subway.getByRole('link', {name: 'Compare GO Taxi'}).click();
  const taxi = page.getByRole('article', {name: 'Nagoya hotel to Sakae by GO Taxi'});
  await taxi.waitFor();
  assert.match(await taxi.innerText(), /pickup pin/i);
  await page.reload();
  await taxi.waitFor();
  for (const [panel, mode] of [[taxi, 'driving'], [subway, 'transit']]) {
    if (mode === 'transit') await taxi.getByRole('link', {name: 'Compare subway'}).click();
    const frame = new URL(await panel.locator('iframe').getAttribute('src'));
    assert.equal(frame.searchParams.get('saddr'), 'APA Hotel Nagoya Ekimae');
    assert.equal(frame.searchParams.get('dirflg'), mode === 'transit' ? 'r' : 'd');
    for (const [label, dest] of [['BOOKOFF directions', /BOOKOFF/], ['#C-pla directions', /#C-pla/]]) {
      const url = new URL(await panel.getByRole('link', {name: label}).getAttribute('href'));
      assert.equal(url.searchParams.get('origin'), 'APA Hotel Nagoya Ekimae');
      assert.match(url.searchParams.get('destination'), dest);
      assert.equal(url.searchParams.get('travelmode'), mode);
    }
  }
});

test('checklist saves new choices after recovering from malformed device storage', async t => {
  const page = await visit(t, 'checklist');
  const passport = page.getByRole('checkbox', { name: /Passport and Japan visa/ });
  const hotel = page.getByRole('checkbox', { name: /Three hotel confirmations/ });
  await passport.check();
  await page.evaluate(() => localStorage.setItem('japan-guide-2026-11-checklist', '{'));
  await page.reload();
  assert.equal(await passport.isChecked(), false);
  await hotel.check();
  await page.reload();
  assert.equal(await hotel.isChecked(), true);
  assert.equal(await passport.isChecked(), false);
});

test('phrase search, situation filter, large display, keyboard focus and Japanese copy work', async t => {
  const page = await visit(t, 'phrases', {viewport: {width: 375, height: 800}});
  const query = page.getByRole('searchbox', {name: 'Search phrases'});
  await page.getByRole('combobox', {name: 'Situation'}).selectOption({label: 'At the hotel'});
  await query.fill('荷物を預かって');
  const results = page.getByRole('article');
  assert.equal(await results.count(), 1);
  assert.deepEqual(await results.locator('ruby rt').allTextContents(), ['にもつ', 'あず']);
  await query.fill('にもつをあずかって');
  assert.equal(await results.count(), 1);
  const show = results.getByRole('button', {name: /Show/});
  await show.focus();
  await show.press('Enter');
  const dialog = page.getByRole('dialog');
  assert.ok(await dialog.isVisible());
  assert.deepEqual(await dialog.locator('ruby rt').allTextContents(), ['にもつ', 'あず']);
  assert.equal(await dialog.locator('[lang="ja"]').count(), 1);
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
  for (const spelling of ['chuukohin', 'chūkohin', 'chukohin']) {
    await query.fill(spelling);
    assert.equal(await results.count(), 1);
    assert.match(await results.innerText(), /Is this secondhand/);
  }
  await results.getByRole('button', {name: /Show/}).click();
  assert.equal(await dialog.locator('.jt-dialog-roman').textContent(), 'Kore wa chuukohin desu ka?');
});
