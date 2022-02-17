/**
 * This source file is part of the Swift.org open source project
 *
 * Copyright (c) 2022 Apple Inc. and the Swift project authors
 * Licensed under Apache License v2.0 with Runtime Library Exception
 *
 * See https://swift.org/LICENSE.txt for license information
 * See https://swift.org/CONTRIBUTORS.txt for Swift project authors
*/

import { storage, storageKey } from '@/utils/storage';

const BASE_KEY = 'foo';
const KEY = storageKey + BASE_KEY;

const defaultValue = JSON.stringify({ a: 'a', 1: 1, arr: [1] });

describe('storage', () => {
  it('gets items from localStorage, converting to JSON', () => {
    localStorage.setItem(KEY, defaultValue);
    expect(storage.get(BASE_KEY)).toEqual(JSON.parse(defaultValue));
  });

  it('returns fallback if get is null', () => {
    const fallback = 'FALLBACK';
    expect(storage.get('unknown', fallback)).toEqual(fallback);
  });

  it('sets items in localStorage', () => {
    const newValue = ['new-value'];
    expect(storage.set(BASE_KEY, newValue));
    expect(localStorage.getItem(KEY)).toEqual(JSON.stringify(newValue));
  });

  it('removes items from localStorage', () => {
    localStorage.setItem(KEY, defaultValue);
    storage.remove(BASE_KEY);
    expect(localStorage.getItem(KEY)).toBeFalsy();
  });

  describe('when localStorage throws exceptions', () => {
    beforeAll(() => {
      Object.defineProperty(window, 'localStorage', {
        value: {
          getItem: jest.fn(),
          setItem: jest.fn(),
        },
      });
      localStorage.getItem.mockImplementation(() => {
        throw new Error('fake error for getItem');
      });
      localStorage.setItem.mockImplementation(() => {
        throw new Error('fake error for setItem');
      });
    });

    it('returns `null` for getting settings', () => {
      expect(() => storage.get(BASE_KEY)).not.toThrow();
    });

    it('does not throw exceptions for setting settings', () => {
      expect(() => {
        storage.set(BASE_KEY, 'foo');
      }).not.toThrow();
    });
  });
});
