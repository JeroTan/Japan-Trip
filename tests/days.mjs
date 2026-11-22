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
  await page.route("https://www.google.com/maps?**", route => route.fulfill({ contentType: "text/html", body: "<p>Map</p>" }));
  await page.goto(new URL("day" + number + ".html", entry).href);
  return page;
}

test("the Tokyo-to-Narita agenda distinguishes the morning stop from the hotel booking", async () => {
  const page = await openDay(27, { javaScriptEnabled: false });
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
    await page.waitForURL(new URL("day28.html", entry).href);
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
  const page = await openDay(24, { javaScriptEnabled: false });
  page.setDefaultTimeout(2500);
  try {
    const dates = [24, 25, 26, 27, 28];
    const events = ["Check-in and immigration", "Toyota DNA Inheritance Hall", "Toma-san meets PMH and RY", "VegieCorp sorting facility", "Resume car-rental fieldwork"];
    for (const [index, day] of dates.entries()) {
      if (day !== 24) await page.getByRole("navigation", { name: "Trip dates" }).getByRole("link", { name: new RegExp(day + " November") }).click();
      await page.getByRole("navigation", { name: "Trip dates" }).locator('a[aria-current="date"][href="day' + day + '.html"]').waitFor();
      const toggle = page.getByText("All 24 hours", { exact: true });
      await toggle.focus();
      await page.keyboard.press("Enter");
      const hourly = page.getByRole("list", { name: "Hourly timetable" });
      await hourly.waitFor();
      const hours = hourly.locator(":scope > li");
      assert.equal(await hours.count(), 24);
      assert.match(await hours.first().innerText(), /00:00/);
      assert.match(await hours.last().innerText(), /23:00/);
      assert.match(await hourly.innerText(), new RegExp(events[index]));
      await page.getByText("All 24 hours", { exact: true }).click();
      assert.equal(await hourly.count(), 0);
    }
  } finally {
    await page.close();
  }
});

test("route directions are visible above the agenda and change with the selected leg", async t => {
  for (const width of [375, 1280]) {
    const page = await openDay(26, { viewport: { width, height: 850 } });
    t.after(() => page.close());
    const card = page.getByRole("region", { name: "Route guide" });
    const iframe = card.locator("iframe").first();
    const route = async () => new URL(await iframe.getAttribute("src")).searchParams;
    const defaults = await route();
    assert.match(defaults.get("saddr"), /Nagoya Station/);
    assert.match(defaults.get("daddr"), /Tokyo Station/);
    assert.equal(defaults.get("dirflg"), "r");
    assert.equal(defaults.get("output"), "embed");
    const mapBox = await iframe.boundingBox();
    const agendaBox = await page.getByRole("list", { name: "Agenda" }).boundingBox();
    assert.ok(mapBox.height >= 180 && mapBox.y < 850 && mapBox.y < agendaBox.y);
    await card.getByRole("combobox", { name: "Route leg", exact: true }).selectOption({ label: "Tokyo Station → APA Tokyo" });
    const directions = new URL(await card.getByRole("link", { name: "Open directions" }).getAttribute("href"));
    const updated = await route();
    assert.equal(updated.get("saddr"), directions.searchParams.get("origin"));
    assert.equal(updated.get("daddr"), directions.searchParams.get("destination"));
    assert.match(updated.get("daddr"), /Kayabacho Hatchobori Ekimae/);
    assert.equal(directions.searchParams.get("travelmode"), "transit");
    const stop = card.getByLabel("Map stop");
    await stop.selectOption({ label: "APA Tokyo" });
    const place = new URL(await card.getByRole("link", { name: "Open place in Maps" }).getAttribute("href"));
    const stopMap = card.locator('iframe[title="Map of APA Tokyo"]');
    assert.equal(new URL(await stopMap.getAttribute("src")).searchParams.get("q"), place.searchParams.get("query"));
    await stop.selectOption({ label: "Tokyo Station" });
    await card.locator('iframe[title="Map of Tokyo Station"]').waitFor();
    await stop.selectOption({ label: "Choose a stop" });
    assert.equal(await card.locator("iframe").count(), 1);
  }
});

test("travelers can unfold known stop maps in the agenda and hobby list without scripts", async t => {
  const page = await openDay(26, { javaScriptEnabled: false });
  t.after(() => page.close());
  const routes = page.getByRole("list", { name: "Route legs" });
  await routes.getByRole("link", { name: "APA Tokyo → Woven by Toyota", exact: true }).click();
  const route = page.frame({ name: "jd-route-map" });
  await route.waitForURL(url => /Nihonbashi Muromachi Mitsui Tower/.test(url.searchParams.get("daddr")));
  const agenda = page.getByRole("list", { name: "Agenda" });
  const woven = agenda.getByRole("listitem").filter({ has: page.getByRole("heading", { name: "Travel to Woven by Toyota" }) });
  const place = woven.locator("iframe");
  assert.equal(await place.isVisible(), false);
  await woven.getByText("Map of Woven by Toyota", { exact: true }).click();
  assert.equal(await place.isVisible(), true);
  const address = new URL(await place.getAttribute("src")).searchParams.get("q");
  assert.match(address, /Nihonbashi Muromachi Mitsui Tower/);
  const link = woven.getByRole("link", { name: /Open Woven by Toyota in Maps/ });
  assert.equal(new URL(await link.getAttribute("href")).searchParams.get("query"), address);
  const hobby = page.getByRole("region", { name: "Optional hobby stops" });
  await hobby.locator("summary").click();
  const shopMap = hobby.locator("iframe");
  assert.equal(await shopMap.isVisible(), true);
  assert.match(new URL(await shopMap.getAttribute("src")).searchParams.get("q"), /hololive production official shop in Tokyo Station/);
});

test("Nagoya hobby cards show subway directions from the first hotel", async t => {
  for (const date of [24, 25]) {
    const page = await openDay(date, { javaScriptEnabled: false, viewport: { width: 375, height: 812 } });
    t.after(() => page.close());
    for (const shop of ["BOOKOFF SUPER BAZAAR Sakae-SKYLE Store", "#C-pla 名古屋サカエチカ店"]) {
      const card = page.getByRole("listitem").filter({ has: page.getByRole("checkbox", { name: shop, exact: true }) });
      const link = new URL(await card.getByRole("link", { name: /Directions from hotel/ }).getAttribute("href"));
      const frame = card.locator("iframe");
      assert.ok(await frame.isVisible());
      const embedded = new URL(await frame.getAttribute("src"));
      assert.equal(link.searchParams.get("origin"), "APA Hotel Nagoya Ekimae");
      assert.equal(link.searchParams.get("destination"), shop);
      assert.equal(link.searchParams.get("travelmode"), "transit");
      assert.equal(embedded.searchParams.get("saddr"), link.searchParams.get("origin"));
      assert.equal(embedded.searchParams.get("daddr"), shop);
      assert.equal(embedded.searchParams.get("dirflg"), "r");
    }
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

for (const visit of [
  {
    day: 26, hotel: "APA Tokyo", stop: "Woven by Toyota", mode: "walking",
    address: "Nihonbashi Muromachi Mitsui Tower, 3-2-1 Nihonbashi Muromachi, Tokyo, Japan",
    hostNote: /confirm.*reception.*host/i
  },
  {
    day: 27, hotel: "Narita Tobu Hotel Airport", stop: "Narita Market", mode: "driving",
    address: "Narita City Wholesale Market, 80-1 Tenjinmine, Narita, Chiba, Japan",
    hostNote: /confirm.*market.*host/i
  }
]) {
  test(visit.stop + " uses the same destination in day and transport maps", async t => {
    const page = await openDay(visit.day);
    t.after(() => page.close());
    await page.route("https://www.google.com/maps?**", route => route.fulfill({ body: "Map" }));
    const leg = page.getByRole("combobox", { name: "Route leg" });
    const directions = page.getByRole("link", { name: "Open directions" });
    await leg.selectOption({ label: visit.hotel + " → " + visit.stop });
    const dayRoute = new URL(await directions.getAttribute("href")).searchParams;
    assert.equal(dayRoute.get("destination"), visit.address);
    assert.equal(dayRoute.get("travelmode"), visit.mode);
    await page.getByLabel("Map stop").selectOption({ label: visit.stop });
    const place = page.getByRole("link", { name: "Open place in Maps" });
    assert.equal(new URL(await place.getAttribute("href")).searchParams.get("query"), visit.address);
    assert.match(await page.getByRole("region", { name: "Route guide" }).innerText(), visit.hostNote);
    const map = page.getByRole("region", { name: "Route guide" }).locator('iframe[title="Map of ' + visit.stop + '"]');
    assert.equal(new URL(await map.getAttribute("src")).searchParams.get("q"), visit.address);

    await page.getByRole("link", { name: "Transport", exact: true }).click();
    await leg.selectOption({ label: "Nov " + visit.day + " · Hotel to " + visit.stop });
    const transportRoute = new URL(await directions.getAttribute("href")).searchParams;
    assert.equal(transportRoute.get("destination"), visit.address);
    assert.equal(transportRoute.get("travelmode"), visit.mode);
    assert.match(await page.locator("main").innerText(), visit.hostNote);
    const transportMap = page.locator('main iframe[src*="daddr="]:visible');
    assert.equal(new URL(await transportMap.getAttribute("src")).searchParams.get("daddr"), visit.address);
  });
}

test("daily train and shuttle directions use the planned travel modes", async t => {
  const page = await openDay(24);
  t.after(() => page.close());
  for (const [day, leg, mode] of [
    [24, "Centrair Terminal 2 → APA Nagoya", "transit"],
    [26, "Tokyo Station → APA Tokyo", "transit"],
    [27, "Tokyo Station → Narita Tobu Hotel Airport", "transit"],
    [28, "Narita Tobu Hotel Airport → Narita Terminal 2", "driving"]
  ]) {
    await page.getByRole("navigation", { name: "Trip dates" }).getByRole("link", { name: new RegExp(day + " November") }).click();
    await page.getByRole("combobox", { name: "Route leg", exact: true }).selectOption({ label: leg });
    const link = await page.getByRole("link", { name: "Open directions" }).getAttribute("href");
    assert.equal(new URL(link).searchParams.get("travelmode"), mode, leg);
  }
});

test("phone travelers can jump directly to the day's map or hobby list by keyboard", async () => {
  const page = await openDay(25, { viewport: { width: 375, height: 800 } });
  page.setDefaultTimeout(2500);
  try {
    const jump = page.getByRole("navigation", { name: "On this day" });
    await jump.getByRole("link", { name: /Route guide/ }).focus();
    await page.keyboard.press("Enter");
    assert.equal(await page.evaluate(() => document.activeElement.textContent), "Route guide");
    await jump.getByRole("link", { name: /Hobby stops/ }).click();
    assert.equal(await page.evaluate(() => document.activeElement.textContent), "Optional hobby stops");
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);
  } finally {
    await page.close();
  }
});

test("the full timetable carries multi-hour activities into otherwise empty hours", async () => {
  const page = await openDay(25);
  try {
    await page.getByText("All 24 hours", { exact: true }).click();
    const rows = page.getByRole("list", { name: "Hourly timetable" }).getByRole("listitem");
    assert.match(await rows.nth(8).innerText(), /Drive to Toyota City HQ/);
    assert.match(await rows.nth(14).innerText(), /AI Driven Development team/);
    assert.match(await rows.nth(15).innerText(), /AI Driven Development team/);
    assert.doesNotMatch(await rows.nth(19).innerText(), /Buffer time/);
  } finally {
    await page.close();
  }
});

test("Toyota City agenda and hourly titles fit a 320px phone with doubled text", async t => {
  const page = await openDay(25, { viewport: { width: 320, height: 760 } });
  t.after(() => page.close());
  await page.addStyleTag({ content: "html { font-size: 200%; }" });
  for (const view of ["Agenda", "All 24 hours"]) {
    if (view === "All 24 hours") await page.getByText(view, { exact: true }).click();
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true, view);
  }
});

test("flight days use a Manila-time axis through both partial flight hours", async t => {
  const page = await openDay(24);
  t.after(() => page.close());
  const hourly = page.getByText("All 24 hours", { exact: true });
  await hourly.click();
  const rows = page.getByRole("list", { name: "Hourly timetable" }).getByRole("listitem");
  const row = hour => rows.nth(hour).innerText();
  assert.match(await row(3), /03:00 PHT[\s\S]*Leave for NAIA/);
  assert.match(await row(7), /07:35 PHT[\s\S]*Fly Manila to Nagoya/);
  assert.match(await row(10), /In flight.*5J 5038/);
  assert.match(await row(11), /In flight.*5J 5038[\s\S]*11:35 PHT \(12:35 JST\)[\s\S]*Land at Nagoya/);
  assert.doesNotMatch(await row(12), /In flight|Land at Nagoya/);
  assert.match(await row(12), /12:15–13:15 PHT[\s\S]*Lunch/);
  assert.match(await row(13), /Lunch.*until 13:15/);
  await page.getByRole("navigation", { name: "Trip dates" }).getByRole("link", { name: /28 November/ }).click();
  await hourly.click();
  assert.match(await row(8), /08:00–08:30 PHT[\s\S]*Planned Narita hotel checkout/);
  assert.doesNotMatch(await row(17), /In flight|Fly Narita/);
  assert.match(await row(18), /18:00 PHT \(19:00 JST\)[\s\S]*Fly Narita to Manila/);
  assert.match(await row(19), /In flight.*5J 5057/);
  assert.match(await row(23), /In flight.*5J 5057[\s\S]*23:35 PHT[\s\S]*Land at Manila/);
  await page.getByText("All 24 hours", { exact: true }).click();
  assert.match(await page.locator("main").innerText(), /19:00 JST[\s\S]*Fly Narita to Manila/);
});
