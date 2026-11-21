(() => {
  'use strict';

  const main = document.querySelector('#main-content');

  function enableRouteSelector() {
    const index = main.querySelector('.jt-route-index');
    const selector = main.querySelector('#jt-leg');
    const panels = main.querySelectorAll('.jt-map-panel');
    for (const link of index.querySelectorAll('a')) {
      selector.add(new Option(link.textContent, link.hash.slice(1)));
    }

    function showRoute() {
      for (const panel of panels) panel.hidden = panel.id !== selector.value;
    }

    function restoreRoute() {
      const target = location.hash.slice(1);
      if ([...selector.options].some(option => option.value === target)) selector.value = target;
      showRoute();
    }

    selector.addEventListener('change', () => {
      showRoute();
      history.replaceState(history.state, '', '#' + selector.value);
    });
    window.addEventListener('hashchange', restoreRoute);
    window.addEventListener('pageshow', restoreRoute);
    restoreRoute();
    index.hidden = true;
    selector.parentElement.hidden = false;
  }

  function enableChecklist() {
    const progress = window.JapanTrip.progress;
    const groups = main.querySelectorAll('section:has(.jt-checklist)');
    const storageNote = main.querySelector('#jt-storage');

    function refresh() {
      const checked = progress.read();
      for (const group of groups) {
        const inputs = group.querySelectorAll('input[type="checkbox"]');
        const count = group.querySelector('.jt-count');
        let completed = 0;
        for (const input of inputs) {
          input.checked = checked[input.value] === true;
          if (input.checked) completed++;
        }
        count.textContent = completed + ' of ' + inputs.length + ' ' + count.dataset.countLabel;
      }
      storageNote.hidden = false;
      storageNote.textContent = progress.sessionOnly
        ? 'This browser is keeping progress for this session only.'
        : 'Checklist progress is saved in this browser.';
    }

    main.addEventListener('change', event => {
      if (event.target.type !== 'checkbox') return;
      progress.set(event.target.value, event.target.checked);
      refresh();
    });
    window.addEventListener('pageshow', refresh);
    window.addEventListener('storage', refresh);
    refresh();
  }

  function searchText(value) {
    return value.normalize('NFKC').toLowerCase()
      .replace(/[ァ-ヶ]/g, kana => String.fromCharCode(kana.charCodeAt(0) - 0x60))
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[’']/g, '').trim();
  }

  function plainJapanese(script) {
    const copy = script.cloneNode(true);
    copy.querySelectorAll('rt').forEach(reading => reading.remove());
    return copy.textContent;
  }

  async function copyJapanese(text, button) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      const field = document.createElement('textarea');
      field.className = 'jt-copy-field';
      field.value = text;
      field.readOnly = true;
      button.after(field);
      field.select();
      try {
        return document.execCommand('copy');
      } catch {
        return false;
      } finally {
        field.remove();
        button.focus();
      }
    }
  }

  function enablePhrasebook() {
    const query = main.querySelector('#jt-query');
    const situation = main.querySelector('#jt-situation');
    const resultCount = main.querySelector('#jt-results-count');
    const empty = main.querySelector('.jt-empty');
    const dialog = main.querySelector('dialog');
    const actions = main.querySelector('#jt-phrase-actions');
    const groups = [];
    let opener;

    for (const section of main.querySelectorAll('.jt-phrase-group')) {
      const name = section.querySelector('h2').textContent;
      situation.add(new Option(name, name));
      const cards = [];
      for (const element of section.querySelectorAll('.jt-phrase')) {
        const heading = element.querySelector('h3').textContent;
        const japanese = element.querySelector('.jt-script');
        const kana = japanese.cloneNode(true);
        for (const ruby of kana.querySelectorAll('ruby')) ruby.replaceWith(ruby.querySelector('rt').textContent);
        const searchable = searchText([name, heading, plainJapanese(japanese), kana.textContent,
          element.querySelector('.jt-roman').textContent].join(' '));
        const controls = actions.content.cloneNode(true);
        controls.querySelector('[data-show]').setAttribute('aria-label', 'Show ' + heading + ' in large type');
        controls.querySelector('[data-copy]').setAttribute('aria-label', 'Copy Japanese for ' + heading);
        element.append(controls);
        cards.push({element, searchable});
      }
      groups.push({name, section, cards});
    }

    function filter() {
      const terms = searchText(query.value).split(/\s+/).filter(Boolean);
      let total = 0;
      for (const {name, section, cards} of groups) {
        let matches = 0;
        for (const {element, searchable} of cards) {
          const visible = (!situation.value || situation.value === name) && terms.every(term => searchable.includes(term));
          element.hidden = !visible;
          if (visible) matches++;
        }
        section.hidden = matches === 0;
        total += matches;
      }
      resultCount.textContent = total + (total === 1 ? ' phrase' : ' phrases');
      empty.hidden = total !== 0;
    }

    query.addEventListener('input', filter);
    situation.addEventListener('change', filter);
    empty.querySelector('button').addEventListener('click', () => {
      query.value = '';
      situation.value = '';
      filter();
      query.focus();
    });

    main.addEventListener('click', async event => {
      const button = event.target.closest('[data-copy], [data-show]');
      if (!button) return;
      const card = button.closest('.jt-phrase');
      const japanese = card.querySelector('.jt-script');
      const english = card.querySelector('h3').textContent;
      if (button.hasAttribute('data-show')) {
        dialog.querySelector('.jt-dialog-ja').replaceChildren(...japanese.cloneNode(true).childNodes);
        dialog.querySelector('.jt-dialog-roman').textContent = card.querySelector('.jt-roman').textContent;
        dialog.querySelector('h2').textContent = english;
        opener = button;
        dialog.showModal();
        return;
      }

      const raw = plainJapanese(japanese);
      const copied = await copyJapanese(raw, button);
      button.textContent = copied ? 'Copied' : 'Copy';
      card.querySelector('.jt-copy-hint')?.remove();
      const status = main.querySelector('#jt-copy-status');
      if (copied) {
        status.textContent = 'Copied Japanese for ' + english + '.';
      } else {
        const hint = document.createElement('textarea');
        hint.className = 'jt-copy-hint';
        hint.setAttribute('aria-label', 'Japanese phrase to copy');
        hint.readOnly = true;
        hint.value = raw;
        card.append(hint);
        hint.focus();
        hint.select();
        status.textContent = 'Japanese selected. Use your device’s Copy command.';
      }
    });

    dialog.addEventListener('close', () => opener?.focus());
    window.addEventListener('pageshow', filter);
    filter();
    main.querySelector('.jt-filters').hidden = false;
    resultCount.hidden = false;
  }

  switch (main?.dataset.view) {
    case 'transport': enableRouteSelector(); break;
    case 'checklist': enableChecklist(); break;
    case 'phrases': enablePhrasebook(); break;
  }
})();
