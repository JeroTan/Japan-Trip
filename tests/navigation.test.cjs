const { test } = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
const { chromium } = require('playwright');

const entry = pathToFileURL(path.join(__dirname, '..', 'index.html')).href;

test('all trip views open from a local file at phone and desktop sizes', async t => {
  const browser = await chromium.launch(process.env.CHROME_PATH ? { executablePath: process.env.CHROME_PATH } : {});
  t.after(() => browser.close());
  const views = ['overview', 'day/24', 'day/25', 'day/26', 'day/27', 'day/28', 'transport', 'phrases', 'checklist'];
  for (const width of [375, 1280]) {
    const page = await browser.newPage({ viewport: { width, height: 840 } });
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    for (const view of views) {
      await page.goto(entry + '#' + view);
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
  await page.goto(entry + '#day/24');
  const shop = () => page.getByRole('checkbox', { name: /Sakae[-– ]SKYLE/i });
  await shop().check();
  await page.goto(entry + '#checklist');
  assert.equal(await shop().isChecked(), true);
  await shop().uncheck();
  await page.goto(entry + '#day/25');
  await page.reload();
  assert.equal(await shop().isChecked(), false);
});
