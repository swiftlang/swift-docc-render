export const storageKey = 'developer.setting.';

export const SafeLocalStorage = {
  getItem: (key) => {
    try {
      return localStorage.getItem(key);
    } catch (_) {
      // referencing `localStorage` in Safari with "Block all cookies" enabled
      // will throw a `SecurityError`
      return null;
    }
  },
  setItem: (key, value) => {
    try {
      localStorage.setItem(key, value);
    } catch (_) {
      // referencing `localStorage` in Safari with "Block all cookies" enabled
      // will throw a `SecurityError`
    }
  },
  removeItem: (key) => {
    try {
      localStorage.removeItem(key);
    } catch (_) {
      // referencing `localStorage` in Safari with "Block all cookies" enabled
      // will throw a `SecurityError`
    }
  },
};

export const storage = {
  get: (key, fallback) => {
    const parsed = JSON.parse(SafeLocalStorage.getItem(storageKey + key));
    if (typeof parsed !== 'undefined') return parsed;
    return fallback;
  },
  set: (key, value) => SafeLocalStorage.setItem(storageKey + key, JSON.stringify(value)),
  remove: key => SafeLocalStorage.removeItem(storageKey + key),
};
