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
  await page.goto(entry);
  await page.keyboard.press('Tab');
  assert.equal(await page.locator(':focus').innerText(), 'Skip to content');
  await page.keyboard.press('Enter');
  assert.equal(await page.locator(':focus').evaluate(el => el.tagName), 'MAIN');

  const days = page.getByRole('region', { name: 'Day by day' }).getByRole('link');
  assert.equal(await days.count(), 5);
  await days.filter({ hasText: 'Woven by Toyota' }).focus();
  await page.keyboard.press('Enter');
  await page.waitForURL(entry + '#day/26');
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
  await page.waitForURL(entry + '#phrases');
  await page.getByRole('heading', { level: 1, name: /phrase/i }).waitFor();
  assert.equal(await menu.getAttribute('aria-expanded'), 'false');
  await page.goBack();
  await page.getByRole('heading', { level: 1, name: dayHeading }).waitFor();
});
