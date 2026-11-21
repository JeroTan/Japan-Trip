import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { createRequire } from "node:module";
import { after, before, test } from "node:test";

const require = createRequire(import.meta.url);
const { chromium } = require("playwright");
const entry = process.env.JAPAN_GUIDE_ENTRY || new URL("../index.html", import.meta.url).href;
let browser;

before(async () => {
  const macChrome = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
  const executablePath = process.env.CHROME_PATH || (existsSync(macChrome) ? macChrome : undefined);
  browser = await chromium.launch({ executablePath });
});
after(async () => { await browser?.close(); });

async function openDay(number, options = {}) {
  const page = await browser.newPage(options);
  await page.goto(entry + "#day/" + number);
  return page;
}

test("the Tokyo-to-Narita agenda distinguishes the morning stop from the hotel booking", async () => {
  const page = await openDay(27);
  try {
    const text = await page.locator("main").innerText();
    assert.match(text, /08:30–09:00/);
    assert.match(text, /morning luggage storage.{0,15}unconfirmed/i);
    assert.match(text, /after 15:00/i);
    assert.match(text, /group check-in time.{0,12}confirm/i);
    assert.match(text, /VegieCorp sorting facility/i);
  } finally {
    await page.close();
  }
});

test("travelers can switch dates and read both flight clocks and terminals", async () => {
  const page = await openDay(24);
  try {
    const read = () => page.locator("main").innerText();
    let text = await read();
    assert.match(text, /07:35 PHT/);
    assert.match(text, /08:35 JST/);
    assert.match(text, /12:35 JST/);
    assert.match(text, /11:35 PHT/);
    assert.match(text, /5J 5038/);
    assert.match(text, /Centrair Terminal 2/);
    await page.getByRole("navigation", { name: "Trip dates" }).getByRole("link", { name: /28 November/ }).click();
    await page.waitForURL(url => url.hash === "#day/28");
    text = await read();
    assert.match(text, /19:00 JST/);
    assert.match(text, /18:00 PHT/);
    assert.match(text, /23:35 PHT/);
    assert.match(text, /00:35 JST on 29 Nov/);
    assert.match(text, /Narita Terminal 2/);
    assert.match(text, /NAIA Terminal 3/);
    assert.match(text, /5J 5057/);
    assert.match(text, /before 11:00/i);
    await page.goBack();
    await page.getByRole("heading", { name: "Manila to Nagoya", level: 1 }).waitFor();
  } finally {
    await page.close();
  }
});

test("all five days have a complete hourly view and an abridged agenda", async () => {
  const page = await openDay(24);
  page.setDefaultTimeout(2500);
  try {
    const dates = [24, 25, 26, 27, 28];
    const events = ["Check-in and immigration", "Toyota DNA Inheritance Hall", "Toma-san meets PMH and RY", "VegieCorp sorting facility", "Resume car-rental fieldwork"];
    for (const [index, day] of dates.entries()) {
      if (day !== 24) await page.getByRole("navigation", { name: "Trip dates" }).getByRole("link", { name: new RegExp(day + " November") }).click();
      await page.getByRole("navigation", { name: "Trip dates" }).locator('a[aria-current="date"][href="#day/' + day + '"]').waitFor();
      const toggle = page.getByRole("button", { name: "All 24 hours" });
      await toggle.focus();
      await page.keyboard.press("Enter");
      const hourly = page.getByRole("list", { name: "Hourly timetable" });
      await hourly.waitFor();
      const hours = hourly.locator(":scope > li");
      assert.equal(await hours.count(), 24);
      assert.match(await hours.first().innerText(), /00:00/);
      assert.match(await hours.last().innerText(), /23:00/);
      assert.match(await hourly.innerText(), new RegExp(events[index]));
      await page.getByRole("button", { name: "Agenda" }).click();
      assert.equal(await hourly.count(), 0);
    }
  } finally {
    await page.close();
  }
});

test("route legs and known stops respond to selection, and maps load only on request", async () => {
  const page = await openDay(26);
  page.setDefaultTimeout(2500);
  try {
    const legs = page.getByLabel("Route leg", { exact: true });
    await legs.selectOption({ label: "Nagoya Station → Tokyo Station" });
    const directions = new URL(await page.getByRole("link", { name: "Open directions" }).getAttribute("href"));
    assert.match(directions.searchParams.get("origin"), /Nagoya Station/);
    assert.match(directions.searchParams.get("destination"), /Tokyo Station/);
    assert.equal(directions.searchParams.get("travelmode"), "transit");
    const stop = page.getByLabel("Map stop", { exact: true });
    await stop.selectOption({ label: "APA Tokyo" });
    const mapLink = page.getByRole("link", { name: "Open place in Maps" });
    assert.match(new URL(await mapLink.getAttribute("href")).searchParams.get("query"), /Kayabacho Hatchobori Ekimae/);
    assert.equal(await page.locator("iframe").count(), 0);
    await page.route("https://www.google.com/maps?**", route => route.fulfill({ contentType: "text/plain", body: "Map" }));
    await page.getByRole("button", { name: "Show map" }).click();
    const iframe = page.locator('iframe[title="Map of APA Tokyo"]');
    await iframe.waitFor();
    assert.match(new URL(await iframe.getAttribute("src")).searchParams.get("q"), /Kayabacho Hatchobori Ekimae/);
    await stop.selectOption({ label: "Tokyo Station" });
    await page.locator('iframe[title="Map of Tokyo Station"]').waitFor();
    await page.getByRole("button", { name: "Hide map" }).click();
    assert.equal(await page.locator("iframe").count(), 0);
  } finally {
    await page.close();
  }
});

test("optional shops retain their original links, dates and saved selections after navigation and reload", async () => {
  const page = await openDay(24);
  page.setDefaultTimeout(2500);
  try {
    const box = page.getByRole("checkbox", { name: "BOOKOFF SUPER BAZAAR Sakae-SKYLE Store", exact: true });
    const hobby = page.getByRole("region", { name: "Optional hobby stops" });
    const links = async () => hobby.locator('a[href^="https://maps.app.goo.gl/"]').evaluateAll(items => items.map(item => item.href));
    await box.check();
    assert.deepEqual(await links(), ["https://maps.app.goo.gl/dYiwFmqSvGHA9jdFA", "https://maps.app.goo.gl/MsaYXn66Wa1KcHDb6"]);
    const dates = page.getByRole("navigation", { name: "Trip dates" });
    await dates.getByRole("link", { name: /25 November/ }).click();
    await page.reload();
    await page.getByRole("heading", { name: "Nagoya & Toyota City" }).waitFor();
    assert.equal(await box.isChecked(), true);
    await box.uncheck();
    await dates.getByRole("link", { name: /26 November/ }).click();
    await page.getByRole("checkbox", { name: /hololive/ }).waitFor();
    assert.deepEqual(await links(), ["https://maps.app.goo.gl/XmUaUJQs5mVGn9ur7"]);
    await dates.getByRole("link", { name: /27 November/ }).click();
    await page.getByRole("checkbox", { name: /AEON MALL Narita/ }).waitFor();
    assert.deepEqual(await links(), ["https://maps.app.goo.gl/7sSh4HaFAaSLP11Q9"]);
    await dates.getByRole("link", { name: /28 November/ }).click();
    await page.getByRole("checkbox", { name: /Fa-So-La/ }).waitFor();
    assert.deepEqual(await links(), ["https://maps.app.goo.gl/7sSh4HaFAaSLP11Q9", "https://maps.app.goo.gl/q1QRgKrXWirfr7PM9"]);
    assert.match(await hobby.innerText(), /after international security in Terminal 1/i);
    assert.match(await hobby.innerText(), /Terminal 2 ticket/i);
    await dates.getByRole("link", { name: /24 November/ }).click();
    await box.waitFor();
    assert.equal(await box.isChecked(), false);
  } finally {
    await page.close();
  }
});

test("phone travelers can jump directly to the day's map or hobby list by keyboard", async () => {
  const page = await openDay(25, { viewport: { width: 375, height: 800 } });
  page.setDefaultTimeout(2500);
  try {
    const jump = page.getByRole("navigation", { name: "On this day" });
    await jump.getByRole("button", { name: "Route guide" }).focus();
    await page.keyboard.press("Enter");
    assert.equal(await page.evaluate(() => document.activeElement.textContent), "Route guide");
    await jump.getByRole("button", { name: "Hobby stops" }).click();
    assert.equal(await page.evaluate(() => document.activeElement.textContent), "Optional hobby stops");
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);
  } finally {
    await page.close();
  }
});

test("the full timetable carries multi-hour activities into otherwise empty hours", async () => {
  const page = await openDay(25);
  try {
    await page.getByRole("button", { name: "All 24 hours" }).click();
    const rows = page.getByRole("list", { name: "Hourly timetable" }).getByRole("listitem");
    assert.match(await rows.nth(8).innerText(), /Drive to Toyota City HQ/);
    assert.match(await rows.nth(14).innerText(), /AI Driven Development team/);
    assert.match(await rows.nth(15).innerText(), /AI Driven Development team/);
    assert.doesNotMatch(await rows.nth(19).innerText(), /Buffer time/);
    await page.goto(entry + "#day/24");
    await page.getByRole("heading", { name: "Manila to Nagoya", level: 1 }).waitFor();
    await page.getByRole("button", { name: "All 24 hours" }).click();
    assert.match(await rows.nth(10).innerText(), /In flight.*5J 5038/);
    await page.goto(entry + "#day/28");
    await page.getByRole("heading", { name: "Narita to Manila", level: 1 }).waitFor();
    await page.getByRole("button", { name: "All 24 hours" }).click();
    assert.match(await rows.nth(21).innerText(), /In flight.*5J 5057/);
  } finally {
    await page.close();
  }
});
