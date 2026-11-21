const { test } = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
const { chromium } = require('playwright');

const entry = pathToFileURL(path.join(__dirname, '..', 'index.html')).href;

test('keyboard travelers can skip navigation, choose a date, and use the phone menu and browser back', async t => {
  const browser = await chromium.launch(process.env.CHROME_PATH ? { executablePath: process.env.CHROME_PATH } : {});
  t.after(() => browser.close());
  const page = await browser.newPage({ viewport: { width: 375, height: 800 } });
  await page.route('https://www.google.com/maps**', r => r.fulfill({ body: 'Map' }));
  await page.goto(entry);
  await page.keyboard.press('Tab');
  assert.equal(await page.locator(':focus').innerText(), 'Skip to content');
  await page.keyboard.press('Enter');
  assert.equal(await page.locator(':focus').evaluate(el => el.tagName), 'MAIN');

  const days = page.getByRole('region', { name: 'Day by day' }).getByRole('link');
  assert.equal(await days.count(), 5);
  await days.filter({ hasText: 'Woven by Toyota' }).focus();
  await page.keyboard.press('Enter');
  await page.waitForURL(new URL('day26.html', entry).href);
  await page.reload();
  const dayHeading = await page.getByRole('heading', { level: 1 }).innerText();

  const menu = page.getByRole('button', { name: 'Menu', exact: true });
  const navigation = page.getByRole('navigation', { name: 'Main navigation' });
  await menu.focus();
  await page.keyboard.press('Enter');
  assert.equal(await menu.getAttribute('aria-expanded'), 'true');
  await page.keyboard.press('Tab');
  assert.equal(await page.locator(':focus').innerText(), 'Overview');
  await page.keyboard.press('Escape');
  assert.equal(await menu.getAttribute('aria-expanded'), 'false');
  assert.equal(await menu.evaluate(el => el === document.activeElement), true);
  await page.keyboard.press('Enter');
  await navigation.getByRole('link', { name: 'Phrases' }).focus();
  await page.keyboard.press('Enter');
  await page.waitForURL(new URL('phrases.html', entry).href);
  await page.getByRole('heading', { level: 1, name: /phrase/i }).waitFor();
  assert.equal(await menu.getAttribute('aria-expanded'), 'false');
  await page.goBack();
  await page.getByRole('heading', { level: 1, name: dayHeading }).waitFor();
});

test('Back restores the phrase search and the selected train route', async t => {
  const browser = await chromium.launch(process.env.CHROME_PATH ? { executablePath: process.env.CHROME_PATH } : {});
  t.after(() => browser.close());
  const page = await browser.newPage();
  await page.route('https://www.google.com/maps**', r => r.fulfill({ body: 'Map' }));
  await page.goto(new URL('phrases.html', entry).href);
  const search = page.getByRole('searchbox', { name: 'Search phrases' });
  await search.fill('luggage');
  const count = await page.locator('main article').count();
  const navigation = page.getByRole('navigation', { name: 'Main navigation' });
  await navigation.getByRole('link', { name: 'Transport' }).click();
  const leg = page.getByRole('combobox', { name: 'Route leg' });
  await leg.selectOption({ label: 'Nov 27 · Tokyo to Narita' });
  await page.goBack();
  assert.equal(await search.inputValue(), 'luggage');
  assert.equal(await page.locator('main article').count(), count);
  await page.goForward();
  assert.match(await leg.locator('option:checked').innerText(), /Tokyo to Narita/);
});
