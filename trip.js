// Shared trip data and checklist progress.
(() => {
  'use strict';

  const destinations = {
    woven: 'Nihonbashi Muromachi Mitsui Tower, 3-2-1 Nihonbashi Muromachi, Tokyo, Japan',
    market: 'Narita City Wholesale Market, 80-1 Tenjinmine, Narita, Chiba, Japan'
  };

  const shops = [
    {
      id: 'shop-sakae-bookoff', days: [24, 25], area: 'Nagoya · Sakae',
      name: 'BOOKOFF SUPER BAZAAR Sakae-SKYLE Store',
      map: 'https://maps.app.goo.gl/dYiwFmqSvGHA9jdFA'
    },
    {
      id: 'shop-sakae-cpla', days: [24, 25], area: 'Nagoya · Sakae',
      name: '#C-pla 名古屋サカエチカ店', map: 'https://maps.app.goo.gl/MsaYXn66Wa1KcHDb6'
    },
    {
      id: 'shop-tokyo-hololive', days: [26], area: 'Tokyo Station',
      name: 'hololive production official shop in Tokyo Station',
      map: 'https://maps.app.goo.gl/XmUaUJQs5mVGn9ur7'
    },
    {
      id: 'shop-narita-bookoff', days: [27, 28], area: 'Narita',
      name: 'BOOKOFF AEON MALL Narita Store', map: 'https://maps.app.goo.gl/7sSh4HaFAaSLP11Q9'
    },
    {
      id: 'shop-narita-fasola', days: [28], area: 'Narita Airport · T1',
      name: 'Fa-So-La TAX FREE AKIHABARA Narita Airport Terminal 1',
      map: 'https://maps.app.goo.gl/q1QRgKrXWirfr7PM9',
      note: 'This branch is after international security in Terminal 1. Your Terminal 2 ticket does not give access.',
      source: 'https://www.narita-airport.jp/en/shop/shop-search/t1sw03_t0002m/'
    }
  ];

  const key = 'japan-guide-2026-11-checklist';
  let inMemory = {};
  let sessionOnly = false;

  function read() {
    if (sessionOnly) return inMemory;
    let raw;
    try {
      raw = localStorage.getItem(key);
    } catch {
      sessionOnly = true;
      return inMemory;
    }
    try {
      const stored = JSON.parse(raw);
      inMemory = stored && typeof stored === 'object' && !Array.isArray(stored) ? stored : {};
    } catch {
      inMemory = {};
    }
    return inMemory;
  }

  function set(id, checked) {
    inMemory = { ...read(), [id]: checked };
    if (sessionOnly) return;
    try {
      localStorage.setItem(key, JSON.stringify(inMemory));
    } catch {
      sessionOnly = true;
    }
  }

  window.JapanTrip = { destinations, shops, progress: { read, set, get sessionOnly() { return sessionOnly; } } };
})();
