/**
 * This source file is part of the Swift.org open source project
 *
 * Copyright (c) 2021 Apple Inc. and the Swift project authors
 * Licensed under Apache License v2.0 with Runtime Library Exception
 *
 * See https://swift.org/LICENSE.txt for license information
 * See https://swift.org/CONTRIBUTORS.txt for Swift project authors
*/

import { SafeLocalStorage } from 'docc-render/utils/storage';

const StorageKey = {
  preferredColorScheme: 'developer.setting.preferredColorScheme',
  preferredLanguage: 'docs.setting.preferredLanguage',
};

const DeprecatedKeys = {
  preferredColorScheme: 'docs.setting.preferredColorScheme',
};

// Creates an object with getters and setters which safely set or get a
// semi-persistent setting from localStorage if possible using the above keys
//
// Example:
//   // to set `docs.setting.preferredLanguage=objc` in local storage
//   Settings.preferredLanguage = 'objc' // sets 'docs.setting.preferredLanguage
//
//   // to get the value of `docs.setting.preferredLanguage` from local storage
//   Settings.preferredLanguage // 'objc'
export default Object.defineProperties({}, Object.keys(StorageKey).reduce((settings, name) => ({
  ...settings,
  [name]: {
    get: () => {
      // check if this property has an old key
      const oldKey = DeprecatedKeys[name];
      // get the currently stored item by the relevant key
      const storedItem = SafeLocalStorage.getItem(StorageKey[name]);
      // if there is no old key, just return the item with the relevant key
      if (!oldKey) return storedItem;
      // try to get an item using the old key, falling back to the relevant key
      return storedItem || SafeLocalStorage.getItem(oldKey);
    },
    set: value => SafeLocalStorage.setItem(StorageKey[name], value),
  },
}), {}));
