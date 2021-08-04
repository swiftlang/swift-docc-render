/**
 * This source file is part of the Swift.org open source project
 *
 * Copyright (c) 2021 Apple Inc. and the Swift project authors
 * Licensed under Apache License v2.0 with Runtime Library Exception
 *
 * See https://swift.org/LICENSE.txt for license information
 * See https://swift.org/CONTRIBUTORS.txt for Swift project authors
*/

function hasSchemeColor(object, mode) {
  return object && typeof object === 'object' && Object.prototype.hasOwnProperty.call(object, mode) && typeof object[mode] === 'string';
}

/**
 * Walks an object recursively, concating it's keys together until it reaches the end
 * @param {String} parentKey - the parent's current item key
 * @param {*} parentValue - the parent's current item value
 * @param {Object} accumulated - the object that holds the end result
 * @param {String} colorScheme - the current color scheme
 */
function walkThemeObject(parentKey, parentValue, accumulated, colorScheme) {
  if (
    parentValue
    && typeof parentValue === 'object'
    && !(colorScheme && (hasSchemeColor(parentValue, 'light') || hasSchemeColor(parentValue, 'dark')))
  ) {
    Object.entries(parentValue).forEach(([key, value]) => {
      const currentKey = [parentKey, key].join('-');
      walkThemeObject(currentKey, value, accumulated, colorScheme);
    });
  } else {
    let value = parentValue;
    if (hasSchemeColor(parentValue, colorScheme)) value = parentValue[colorScheme];
    // if `value` is still an object, its probably the wrong color for the current color scheme.
    if (typeof value === 'object') return;
    // eslint-disable-next-line no-param-reassign
    accumulated[parentKey] = value;
  }
}

/**
 * Converts a deeply nested object to an object of custom css properties
 * @param {Object} object
 * @param {String} [colorScheme]
 * @return {Object}
 */
// eslint-disable-next-line import/prefer-default-export
export function objectToCustomProperties(object, colorScheme = 'light') {
  const collector = {};
  const objectToWalk = object || {};
  walkThemeObject('-', objectToWalk, collector, colorScheme);
  return collector;
}
