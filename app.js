(() => {
  'use strict';

  // Keep bookmarks from the first version of the guide working.
  if (document.querySelector('main[data-view="overview"]')) {
    const oldDay = /^#day\/(2[4-8])$/.exec(location.hash);
    const oldTool = /^#(transport|phrases|checklist)$/.exec(location.hash);
    if (oldDay || oldTool) {
      location.replace(oldDay ? 'day' + oldDay[1] + '.html' : oldTool[1] + '.html');
      return;
    }
  }

  const menu = document.querySelector('.guide-menu');
  const nav = document.querySelector('#guide-nav');
  const header = document.querySelector('.guide-header');
  const main = document.querySelector('main');
  document.documentElement.classList.add('nav-ready');

  function setMenu(open) {
    menu.setAttribute('aria-expanded', String(open));
    nav.classList.toggle('guide-nav-open', open);
  }

  menu.addEventListener('click', () => setMenu(menu.getAttribute('aria-expanded') !== 'true'));
  function closeOutside(event) {
    if (menu.getAttribute('aria-expanded') === 'true' && !header.contains(event.target)) setMenu(false);
  }
  document.addEventListener('pointerdown', closeOutside);
  document.addEventListener('focusin', closeOutside);
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && menu.getAttribute('aria-expanded') === 'true') {
      setMenu(false);
      menu.focus();
    }
  });
  window.matchMedia('(max-width: 1080px)').addEventListener('change', () => setMenu(false));

  // A full navigation can bypass the browser's back/forward cache, especially with maps.
  function rememberControls() {
    const values = {};
    for (const field of main.querySelectorAll('select[id], input[type="search"][id]')) values[field.id] = field.value;
    history.replaceState({ ...history.state, guideControls: values }, '');
  }
  main.addEventListener('change', rememberControls);
  main.addEventListener('input', rememberControls);
  window.addEventListener('pageshow', event => {
    if (event.persisted) setMenu(false);
    const saved = history.state?.guideControls;
    if (!saved) return;
    for (const [id, value] of Object.entries(saved)) {
      const field = document.getElementById(id);
      if (!field) continue;
      field.value = value;
      field.dispatchEvent(new Event(field.matches('select') ? 'change' : 'input', { bubbles: true }));
    }
  });
})();
