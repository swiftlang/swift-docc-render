/**
 * This source file is part of the Swift.org open source project
 *
 * Copyright (c) 2022 Apple Inc. and the Swift project authors
 * Licensed under Apache License v2.0 with Runtime Library Exception
 *
 * See https://swift.org/LICENSE.txt for license information
 * See https://swift.org/CONTRIBUTORS.txt for Swift project authors
*/

export const storageKey = 'developer.setting.';

function createSafeStorage(storage = localStorage) {
  return {
    getItem: (key) => {
      try {
        return storage.getItem(key);
      } catch (_) {
        // referencing `storage` in Safari with "Block all cookies" enabled
        // will throw a `SecurityError`
        return null;
      }
    },
    setItem: (key, value) => {
      try {
        storage.setItem(key, value);
      } catch (_) {
        // referencing `storage` in Safari with "Block all cookies" enabled
        // will throw a `SecurityError`
      }
    },
    removeItem: (key) => {
      try {
        storage.removeItem(key);
      } catch (_) {
        // referencing `storage` in Safari with "Block all cookies" enabled
        // will throw a `SecurityError`
      }
    },
  };
}

function createStorageManager(storage) {
  return {
    get: (key, fallback) => {
      const parsed = JSON.parse(storage.getItem(storageKey + key));
      if (parsed !== null) return parsed;
      return fallback;
    },
    set: (key, value) => storage.setItem(storageKey + key, JSON.stringify(value)),
    remove: key => storage.removeItem(storageKey + key),
  };
}

export const SafeLocalStorage = createSafeStorage(window.localStorage);
export const SafeSessionStorage = createSafeStorage(window.sessionStorage);

export const storage = createStorageManager(SafeLocalStorage);
export const sessionStorage = createStorageManager(SafeSessionStorage);
