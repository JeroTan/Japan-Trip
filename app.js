(() => {
  'use strict';

  const main = document.querySelector('#main-content');
  const overview = document.querySelector('#guide-overview');
  const dayCards = [
    [24, 'Tue', 'Arrive in Nagoya', 'Manila to Nagoya', 'land'],
    [25, 'Wed', 'Inside Toyota City', 'Toyota City & Nagoya', 'car'],
    [26, 'Thu', 'Woven by Toyota', 'Nagoya to Tokyo', 'building'],
    [27, 'Fri', 'Market fieldwork', 'Tokyo to Narita', 'market'],
    [28, 'Sat', 'Return to Manila', 'Narita to Manila', 'takeoff']
  ];
  const icon = name => '<svg class="guide-icon" aria-hidden="true"><use href="#i-' + name + '"/></svg>';
  const cards = overview.content.querySelector('.guide-day-cards');
  for (const [date, weekday, title, place, symbol] of dayCards) {
    const card = document.createElement('a');
    card.href = '#day/' + date;
    card.className = 'guide-day-card';
    card.innerHTML = '<div class="guide-card-top"><span class="guide-day-icon">' + icon(symbol) +
      '</span>' + icon('arrow') + '</div><time datetime="2026-11-' + date + '">' + weekday +
      ' · Nov ' + date + '</time><h3>' + title + '</h3><span class="guide-card-place">' +
      icon('pin') + place + '</span>';
    cards.append(card);
  }
  const nav = document.querySelector('#guide-nav');
  const menu = document.querySelector('.guide-menu');
  const mobileLayout = window.matchMedia('(max-width: 680px)');
  const routeTitles = { overview: 'Overview', transport: 'Transport', phrases: 'Phrases', checklist: 'Checklist' };
  const visits = new Map();
  let currentVisit;
  let nextVisit = Date.now();
  history.scrollRestoration = 'manual';

  // Each browser-history entry remembers its own filter, map leg and scroll position.
  // Checkbox progress is trip-wide and is read fresh from the checklist on every visit.
  function rememberVisit() {
    if (!currentVisit) return;
    const controls = [...main.querySelectorAll('select[id], input[type="search"][id]')]
      .map(control => [control.id, control.value]);
    visits.set(currentVisit, {
      controls,
      fullDay: Boolean(main.querySelector('button[data-view="hours"][aria-pressed="true"]')),
      mapOpen: Boolean(main.querySelector('button[aria-expanded="true"][aria-controls]')),
      scroll: window.scrollY
    });
  }

  function restoreVisit(visit) {
    for (const [id, value] of visit.controls) {
      const control = document.getElementById(id);
      if (!control || control.value === value) continue;
      control.value = value;
      control.dispatchEvent(new Event(control.matches('select') ? 'change' : 'input', { bubbles: true }));
    }
    if (visit.fullDay) main.querySelector('button[data-view="hours"]')?.click();
    if (visit.mapOpen) main.querySelector('button[aria-expanded="false"][aria-controls]')?.click();
  }

  function setMenu(open) {
    menu.setAttribute('aria-expanded', String(open));
    nav.classList.toggle('guide-nav-open', open);
  }

  function showRoute(moveFocus) {
    rememberVisit();
    currentVisit = history.state?.guideVisit || ++nextVisit;
    if (!history.state?.guideVisit) history.replaceState({ guideVisit: currentVisit }, '');
    const visit = visits.get(currentVisit);
    const requested = location.hash.slice(1) || 'overview';
    const day = /^day\/(2[4-8])$/.exec(requested);
    const route = (day || Object.hasOwn(routeTitles, requested)) ? requested : 'overview';
    const navTarget = day ? '#day/24' : '#' + route;

    main.dataset.view = day ? 'day' : route;
    main.replaceChildren();
    if (day) {
      window.JapanDays.render(main, Number(day[1]));
    } else if (route === 'overview') {
      main.append(overview.content.cloneNode(true));
    } else {
      window.JapanTools.render(main, route);
    }
    for (const link of nav.querySelectorAll('a')) {
      if (link.hash === navTarget) link.setAttribute('aria-current', 'page');
      else link.removeAttribute('aria-current');
    }
    document.title = (day ? 'November ' + day[1] + ' itinerary' : routeTitles[route]) + ' · Japan field guide';
    setMenu(false);
    if (visit) restoreVisit(visit);
    if (moveFocus) {
      main.focus({ preventScroll: true });
      window.scrollTo(0, visit?.scroll || 0);
    }
  }

  menu.addEventListener('click', () => setMenu(menu.getAttribute('aria-expanded') === 'false'));
  const header = document.querySelector('.guide-header');
  header.addEventListener('click', event => {
    const link = event.target.closest('a');
    if (!link || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
    setMenu(false);
    if (link.hash === location.hash) {
      main.focus({ preventScroll: true });
      window.scrollTo(0, 0);
    }
  });
  function closeMenuOutside(event) {
    if (menu.getAttribute('aria-expanded') === 'true' && !header.contains(event.target)) {
      setMenu(false);
    }
  }
  document.addEventListener('pointerdown', closeMenuOutside);
  document.addEventListener('focusin', closeMenuOutside);
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && menu.getAttribute('aria-expanded') === 'true') {
      setMenu(false);
      menu.focus();
    }
  });
  mobileLayout.addEventListener('change', () => setMenu(false));
  document.querySelector('.guide-skip').addEventListener('click', event => {
    event.preventDefault();
    main.focus();
    main.scrollIntoView({ block: 'start' });
  });
  window.addEventListener('hashchange', () => showRoute(true));
  showRoute(false);
})();
