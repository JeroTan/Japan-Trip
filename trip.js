// Checklist progress is shared by the day pages and the preparation checklist.
(() => {
  'use strict';

  const key = 'japan-guide-2026-11-checklist';
  let storage = 'localStorage';
  let inMemory = {};

  function read() {
    if (!storage) return inMemory;
    let raw;
    try {
      raw = window[storage].getItem(key);
    } catch {
      storage = storage === 'localStorage' ? 'sessionStorage' : null;
      return read();
    }
    try {
      const value = JSON.parse(raw);
      inMemory = value && typeof value === 'object' && !Array.isArray(value) ? value : {};
    } catch {
      inMemory = {};
    }
    return inMemory;
  }

  function set(id, checked) {
    inMemory = { ...read(), [id]: checked };
    while (storage) {
      try {
        window[storage].setItem(key, JSON.stringify(inMemory));
        return;
      } catch {
        storage = storage === 'localStorage' ? 'sessionStorage' : null;
      }
    }
  }

  window.JapanTrip = { progress: { read, set, get sessionOnly() { return storage !== 'localStorage'; } } };
})();
