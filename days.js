/* Daily field guide. Static local data, November 2026. */
(function () {
  "use strict";

  const days = {
    24: {
      weekday: "Tuesday", city: "Manila to Nagoya", flightNumber: "5J 5038",
      intro: "An early start at NAIA, lunch after landing and an afternoon hotel rendezvous in Nagoya.",
      events: [
        ["03:00 PHT", "Leave for NAIA Terminal 3"],
        ["03:30–07:00 PHT", "Check-in and immigration", "Planned airport time. The ticket gives no check-in deadline."],
        ["07:35 PHT", "Fly Manila to Nagoya", "Cebu Pacific 5J 5038 departs NAIA Terminal 3 (MNL). It will be 08:35 JST in Japan.", "Ticketed"],
        ["12:35 JST", "Land at Nagoya Centrair Terminal 2", "It will be 11:35 PHT in Manila. Aim to exit the airport by 13:15 JST.", "Ticketed"],
        ["13:15–14:15", "Lunch"],
        ["14:15–16:00", "Airport to APA Hotel Nagoya Ekimae", "Meet Toma-san at the hotel."],
        ["After 15:00", "Nagoya hotel check-in opens", "The booking covers two nights, 24–26 November.", "Hotel window"],
        ["16:00–17:00", "Check in, rest and have dinner"]
      ]
    },
    25: {
      weekday: "Wednesday", city: "Nagoya & Toyota City",
      intro: "Visit Toyota’s heritage sites in the morning and meet the DIG and AI Driven Development teams in Nagoya.",
      events: [
        ["By 07:45", "Breakfast"],
        ["07:45–09:30", "Drive to Toyota City HQ"],
        ["09:30–10:15", "Toyota DNA Inheritance Hall"],
        ["10:15–11:00", "Toyota Kaikan"],
        ["11:00–11:30", "Lunch"],
        ["11:30–12:45", "Toyota City to Nagoya HQ", "Return the TMC vehicle."],
        ["12:45–13:45", "DIG office meeting", "Includes a 10-minute TMSPH introduction."],
        ["13:45–16:00", "AI Driven Development team"],
        ["16:00–17:00", "TMSPH introduction and discussion"],
        ["17:00–18:00", "Buffer time"],
        ["18:00", "Dinner with the AI team", "With Jiku-san, Kawachi-san and Hiramoto-san."]
      ]
    },
    26: {
      weekday: "Thursday", city: "Nagoya to Tokyo",
      intro: "Travel to Tokyo for a cafeteria lunch, an office tour and discussions with two Woven by Toyota teams.",
      events: [
        ["06:30–07:00", "Check out of APA Nagoya", "Planned departure. The confirmed hotel checkout deadline is before 10:00."],
        ["07:00–07:30", "Hotel to Nagoya Station"],
        ["07:30–09:30", "Nagoya to Tokyo", "Breakfast on the way."],
        ["09:30–10:00", "Station to APA Hotel Kayabacho Hatchobori Ekimae", "The Tokyo booking covers 26–27 November. Confirm the room check-in time with the hotel."],
        ["10:00–11:00", "Travel to Woven by Toyota"],
        ["10:30–10:45", "Toma-san meets PMH and RY"],
        ["11:00–12:00", "Lunch at the Woven cafeteria"],
        ["12:00–13:00", "Woven office tour"],
        ["13:00–14:00", "Woven Safe Driving team", "Introduction and discussion."],
        ["14:00–15:00", "Woven Logistics team", "Introduction and discussion."],
        ["15:00", "Buffer for mobility research"],
        ["18:00", "Dinner with Sogabe-san"]
      ]
    },
    28: {
      weekday: "Saturday", city: "Narita to Manila", flightNumber: "5J 5057",
      intro: "Finish the fieldwork in Narita and return to Manila on the evening flight from Terminal 2.",
      events: [
        ["By 09:00", "Breakfast at Narita Tobu", "Breakfast is included for four."],
        ["09:00–09:30", "Planned Narita hotel checkout"],
        ["09:30–12:15", "Car-rental fieldwork"],
        ["Before 11:00", "Narita hotel checkout deadline", "Allow time for the planned morning departure.", "Hotel window"],
        ["12:15–13:15", "Lunch"],
        ["13:15", "Resume car-rental fieldwork", "Confirm the finish time, airport transfer and bag drop for the 19:00 flight."],
        ["19:00 JST", "Fly Narita to Manila", "Cebu Pacific 5J 5057 departs Narita Terminal 2 (NRT). It will be 18:00 PHT in Manila.", "Ticketed"],
        ["23:35 PHT", "Land at Manila NAIA Terminal 3", "It will be 00:35 JST on 29 November in Japan. Arrange your own transport home.", "Ticketed"]
      ]
    },
    27: {
      weekday: "Friday", city: "Tokyo to Narita",
      intro: "Travel from Tokyo to Narita for a market visit and an afternoon of car-rental fieldwork.",
      events: [
        ["By 07:00", "Check out of APA Tokyo", "The Tokyo hotel confirmation gives no checkout time."],
        ["07:00–07:30", "Hotel to Tokyo Station"],
        ["07:30–08:30", "Tokyo Station to Narita Tobu Hotel Airport"],
        ["08:30–09:00", "Morning stop at Narita Tobu", "Morning luggage storage is unconfirmed. Ask the hotel before bringing the bags."],
        ["09:00–10:00", "Hotel to Narita Market"],
        ["10:00–11:00", "Narita Market site visit"],
        ["11:00–12:00", "VegieCorp sorting facility"],
        ["12:00–13:00", "Lunch"],
        ["13:00–17:00", "Visit car-rental stations", "Rent a vehicle for the fieldwork."],
        ["After 15:00", "Narita hotel check-in opens", "Group check-in time to confirm.", "Hotel window"],
        ["17:00", "Dinner"]
      ]
    }
  };

  // For office visits without an address, the name starts a search rather than asserting a particular entrance.
  const places = {
    naia: ["NAIA Terminal 3", "Ninoy Aquino International Airport Terminal 3, Pasay, Philippines"],
    centrair: ["Centrair Terminal 2", "Chubu Centrair International Airport Terminal 2, Tokoname, Japan"],
    nagoyaHotel: ["APA Nagoya", "APA Hotel Nagoya Ekimae, 1-5-3 Noritake, Nagoya, Japan"],
    toyotaHQ: ["Toyota City HQ", "Toyota Motor Corporation Head Office, Toyota City, Aichi, Japan"],
    dnaHall: ["Toyota DNA Inheritance Hall", "Toyota DNA Inheritance Hall, Toyota City, Aichi, Japan"],
    kaikan: ["Toyota Kaikan", "Toyota Kaikan Museum, Toyota City, Aichi, Japan"],
    nagoyaStation: ["Nagoya Station", "Nagoya Station, Aichi, Japan"],
    tokyoStation: ["Tokyo Station", "Tokyo Station, Tokyo, Japan"],
    tokyoHotel: ["APA Tokyo", "APA Hotel Kayabacho Hatchobori Ekimae, Tokyo, Japan"],
    woven: ["Woven by Toyota", "Woven by Toyota, Tokyo, Japan"],
    naritaHotel: ["Narita Tobu Hotel Airport", "Narita Tobu Hotel Airport, 320-1 Tokko, Narita, Japan"],
    market: ["Narita Market", "Narita Market, Narita, Chiba, Japan"],
    naritaT2: ["Narita Terminal 2", "Narita International Airport Terminal 2, Narita, Japan"]
  };

  const routes = {
    24: {
      legs: [["centrair", "nagoyaHotel"]], extraStops: ["naia"]
    },
    25: {
      legs: [["nagoyaHotel", "toyotaHQ", "driving"], ["toyotaHQ", "dnaHall"], ["dnaHall", "kaikan"]],
      note: "Confirm the meeting entrances and Nagoya HQ return point with the team."
    },
    26: {
      legs: [["nagoyaHotel", "nagoyaStation"], ["nagoyaStation", "tokyoStation", "transit"], ["tokyoStation", "tokyoHotel"], ["tokyoHotel", "woven"]]
    },
    27: {
      legs: [["tokyoHotel", "tokyoStation"], ["tokyoStation", "naritaHotel"], ["naritaHotel", "market"]],
      note: "Confirm the sorting facility and car-rental station addresses with the team."
    },
    28: {
      legs: [["naritaHotel", "naritaT2"]], extraStops: ["naia"],
      note: "The route from the hotel to Terminal 2 is for reference. Confirm the pickup location and time after fieldwork."
    }
  };

  const external = 'target="_blank" rel="noopener noreferrer"';
  const externalMark = '<span aria-hidden="true">↗</span>';

  function routeCard(date) {
    const route = routes[date];
    const stops = new Set(route.legs.flatMap(([from, to]) => [from, to]).concat(route.extraStops || []));
    const options = route.legs.map(([from, to], index) => `<option value="${index}">${places[from][0]} → ${places[to][0]}</option>`).join("");
    const stopOptions = Array.from(stops, id => `<option value="${id}">${places[id][0]}</option>`).join("");
    return `<section class="jd-route" aria-labelledby="jd-route-title">
      <div class="jd-route-head"><h2 id="jd-route-title" tabindex="-1">Route guide</h2>
        <svg aria-hidden="true" width="57" height="30" viewBox="0 0 57 30" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 24h15L36 7h20"/><circle cx="9" cy="24" r="3"/><circle cx="29" cy="13" r="3"/><circle cx="48" cy="7" r="3"/></svg>
      </div>
      <div class="jd-route-body">
        <label for="jd-route-leg">Route leg</label>
        <select id="jd-route-leg">${options}</select>
        <a class="jd-map-link jd-directions" ${external}>Open directions ${externalMark}</a>
        ${route.note ? `<p class="jd-route-note">${route.note}</p>` : ""}
        <div class="jd-stop-panel"><label for="jd-map-stop">Map stop</label>
        <select id="jd-map-stop">${stopOptions}</select>
        <div class="jd-map-actions"><button type="button" class="jd-map-toggle" aria-controls="jd-map-frame" aria-expanded="false">Show map</button>
          <a class="jd-map-link jd-place" ${external}>Open place in Maps ${externalMark}</a></div>
        <div id="jd-map-frame"></div></div>
      </div>
    </section>`;
  }

  function routeControls(main, date) {
    const card = main.querySelector(".jd-route");
    const legSelect = card.querySelector("#jd-route-leg");
    const stopSelect = card.querySelector("#jd-map-stop");
    const mapToggle = card.querySelector(".jd-map-toggle");
    const frameHost = card.querySelector("#jd-map-frame");

    function updateLeg() {
      const [from, to, mode] = routes[date].legs[Number(legSelect.value)];
      const params = new URLSearchParams({ api: "1", origin: places[from][1], destination: places[to][1] });
      if (mode) params.set("travelmode", mode);
      card.querySelector(".jd-directions").href = "https://www.google.com/maps/dir/?" + params;
    }

    function updateStop() {
      const [label, query] = places[stopSelect.value];
      card.querySelector(".jd-place").href = "https://www.google.com/maps/search/?" + new URLSearchParams({ api: "1", query });
      frameHost.replaceChildren();
      if (mapToggle.getAttribute("aria-expanded") === "true") {
        const frame = document.createElement("iframe");
        frame.title = "Map of " + label;
        frame.referrerPolicy = "no-referrer-when-downgrade";
        frame.src = "https://www.google.com/maps?" + new URLSearchParams({ q: query, output: "embed" });
        frameHost.append(frame);
      }
    }

    legSelect.addEventListener("change", updateLeg);
    stopSelect.addEventListener("change", updateStop);
    mapToggle.addEventListener("click", () => {
      const show = mapToggle.getAttribute("aria-expanded") === "false";
      mapToggle.setAttribute("aria-expanded", String(show));
      mapToggle.textContent = show ? "Hide map" : "Show map";
      updateStop();
    });
    updateLeg();
    updateStop();
  }

  const shops = [
    { id: "shop-sakae-bookoff", days: [24, 25], area: "Nagoya · Sakae", name: "BOOKOFF SUPER BAZAAR Sakae-SKYLE Store", map: "https://maps.app.goo.gl/dYiwFmqSvGHA9jdFA" },
    { id: "shop-sakae-cpla", days: [24, 25], area: "Nagoya · Sakae", name: "#C-pla 名古屋サカエチカ店", map: "https://maps.app.goo.gl/MsaYXn66Wa1KcHDb6" },
    { id: "shop-tokyo-hololive", days: [26], area: "Tokyo Station", name: "hololive production official shop in Tokyo Station", map: "https://maps.app.goo.gl/XmUaUJQs5mVGn9ur7" },
    { id: "shop-narita-bookoff", days: [27, 28], area: "Narita", name: "BOOKOFF AEON MALL Narita Store", map: "https://maps.app.goo.gl/7sSh4HaFAaSLP11Q9" },
    { id: "shop-narita-fasola", days: [28], area: "Narita Airport · T1", name: "Fa-So-La TAX FREE AKIHABARA Narita Airport Terminal 1", map: "https://maps.app.goo.gl/q1QRgKrXWirfr7PM9",
      note: 'This branch is after international security in Terminal 1. Your Terminal 2 ticket does not give access.',
      source: "https://www.narita-airport.jp/en/shop/shop-search/t1sw03_t0002m/" }
  ];
  const checklistKey = "japan-guide-2026-11-checklist";
  let sessionChecklist = {};

  function checklist() {
    try {
      const value = JSON.parse(localStorage.getItem(checklistKey));
      if (value && typeof value === "object" && !Array.isArray(value)) return value;
    } catch { /* Private browsing can limit local storage. */ }
    return sessionChecklist;
  }

  function shopList(date) {
    const saved = checklist();
    return `<section class="jd-shops" aria-labelledby="jd-shops-title">
      <h2 id="jd-shops-title" tabindex="-1">Optional hobby stops</h2>
      <p class="jd-shop-intro">Tick a stop when you’ve visited.</p>
      <ul>${shops.filter(shop => shop.days.includes(date)).map(shop => `<li>
        <p class="jd-shop-area">${shop.area}</p>
        <label><input type="checkbox" value="${shop.id}" ${saved[shop.id] === true ? "checked" : ""}><span>${shop.name}</span></label>
        ${shop.note ? `<p class="jd-shop-note">${shop.note}</p>` : ""}
        <div class="jd-shop-links"><a href="${shop.map}" aria-label="Map for ${shop.name}" ${external}>Map ${externalMark}</a>
        ${shop.source ? `<a href="${shop.source}" ${external}>Airport listing ${externalMark}</a>` : ""}</div>
      </li>`).join("")}</ul>
    </section>`;
  }

  function shopControls(main) {
    const panel = main.querySelector(".jd-shops");
    panel.addEventListener("change", change => {
      const checkbox = change.target;
      if (checkbox.type !== "checkbox") return;
      sessionChecklist = { ...checklist(), [checkbox.value]: checkbox.checked };
      try { localStorage.setItem(checklistKey, JSON.stringify(sessionChecklist)); }
      catch { /* Keep progress in memory when device storage is unavailable. */ }
    });
  }

  function eventCopy(event) {
    const [, title, note, status] = event;
    return `<div class="jd-event-copy"><h3>${title}</h3>${status ? `<span class="jd-status">${status}</span>` : ""}${note ? `<p>${note}</p>` : ""}</div>`;
  }

  function agenda(day) {
    return `<ol class="jd-agenda">${day.events.map(event => `<li class="jd-event"><span class="jd-event-time">${event[0]}</span>${eventCopy(event)}</li>`).join("")}</ol>`;
  }

  function hourly(day) {
    const hours = Array.from({ length: 24 }, () => ({ starts: [], ongoing: [] }));
    day.events.forEach(event => {
      const [start, end] = event[0].match(/\d{2}:\d{2}/g);
      const startHour = Number(start.slice(0, 2));
      hours[startHour].starts.push(event);
      if (end) {
        const endHour = Number(end.slice(0, 2)) + (end.endsWith(":00") ? 0 : 1);
        for (let hour = startHour + 1; hour < endHour; hour++) {
          hours[hour].ongoing.push(event[1] + " · until " + end);
        }
      }
    });
    if (day.flightNumber) {
      const [takeoff, landing] = day.events.filter(event => event[3] === "Ticketed");
      const arrivalHour = Number(landing[0].slice(0, 2));
      for (let hour = Number(takeoff[0].slice(0, 2)) + 1; hour < arrivalHour; hour++) {
        hours[hour].ongoing.push("In flight · " + day.flightNumber + " · lands " + landing[0]);
      }
    }
    return `<ol class="jd-hours" aria-label="Hourly timetable">${hours.map(({ starts, ongoing }, hour) => {
      const clock = String(hour).padStart(2, "0") + ":00";
      const carried = ongoing.map(label => `<p class="jd-continuation">${label}</p>`).join("");
      const beginning = starts.map(event => `<div class="jd-hour-entry"><span class="jd-hour-exact">${event[0]}</span>${eventCopy(event)}</div>`).join("");
      const detail = carried + beginning || '<span class="jd-empty">No new entry</span>';
      return `<li class="jd-hour"><span class="jd-hour-label">${clock}</span><div>${detail}</div></li>`;
    }).join("")}</ol>`;
  }

  function timetableControls(main, day) {
    const controls = main.querySelector(".jd-views");
    controls.addEventListener("click", click => {
      const selected = click.target.closest("button");
      if (!selected || selected.getAttribute("aria-pressed") === "true") return;
      for (const button of controls.querySelectorAll("button")) {
        button.setAttribute("aria-pressed", String(button === selected));
      }
      main.querySelector(".jd-schedule-body").innerHTML = selected.dataset.view === "hours" ? hourly(day) : agenda(day);
    });
  }

  function dateNav(dayNumber) {
    return `<nav class="jd-dates" aria-label="Trip dates">${Object.entries(days).map(([date, day]) => {
      const current = Number(date) === dayNumber ? ' aria-current="date"' : '';
      return `<a href="#day/${date}" aria-label="${day.weekday}, ${date} November"${current}><span>${day.weekday.slice(0, 3)}</span><b>${date}</b></a>`;
    }).join("")}</nav>`;
  }

  function render(main, dayNumber) {
    const day = days[dayNumber];
    if (!day) return;
    const date = Number(dayNumber);
    const clock = date === 24 ? "Manila time (PHT) until takeoff, then Japan time (JST)." : date === 28 ? "Japan time (JST) until landing in Manila (PHT)." : "All times in Japan Standard Time (JST).";
    main.innerHTML = `<article class="jd-guide">
      <header class="jd-heading"><div><p class="jd-kicker">Day ${String(date - 23).padStart(2, "0")} <span aria-hidden="true">/</span> ${day.weekday}, ${date} November 2026</p>
        <h1>${day.city}</h1><p class="jd-intro">${day.intro}</p>
      </div>${dateNav(date)}</header>
      <nav class="jd-jump" aria-label="On this day"><button type="button" aria-controls="jd-route-title">Route guide <span aria-hidden="true">↓</span></button><button type="button" aria-controls="jd-shops-title">Hobby stops <span aria-hidden="true">↓</span></button></nav>
      <div class="jd-columns"><section class="jd-schedule" aria-labelledby="jd-schedule-title">
        <div class="jd-schedule-head"><h2 id="jd-schedule-title">Itinerary</h2>
          <div class="jd-views" role="group" aria-label="Timetable view">
            <button type="button" data-view="agenda" aria-pressed="true">Agenda</button>
            <button type="button" data-view="hours" aria-pressed="false">All 24 hours</button>
          </div>
        </div>
        <p class="jd-schedule-note">${clock} Work visits and transfers are provisional.</p>
        <div class="jd-schedule-body">${agenda(day)}</div>
      </section><aside class="jd-side" aria-label="Day resources">${routeCard(date)}${shopList(date)}</aside></div>
    </article>`;
    timetableControls(main, day);
    routeControls(main, date);
    shopControls(main);
    main.querySelector(".jd-jump").addEventListener("click", click => {
      const button = click.target.closest("button");
      if (button) document.getElementById(button.getAttribute("aria-controls")).focus();
    });
  }

  window.JapanDays = { render };
}());
