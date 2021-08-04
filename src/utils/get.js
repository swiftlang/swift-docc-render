/**
 * This source file is part of the Swift.org open source project
 *
 * Copyright (c) 2021 Apple Inc. and the Swift project authors
 * Licensed under Apache License v2.0 with Runtime Library Exception
 *
 * See https://swift.org/LICENSE.txt for license information
 * See https://swift.org/CONTRIBUTORS.txt for Swift project authors
*/

/**
 * Retrieve a property from an object, by a dot notation selector
 * @param {Object} object
 * @param {Array} pathArray
 * @param {*} [fallback]
 */
export default function get(object, path, fallback) {
// Cache the current object
  let current = object;
  let i;
  let pathArray = path;
  if (typeof pathArray === 'string') pathArray = [pathArray];
  // For each item in the path, dig into the object
  for (i = 0; i < pathArray.length; i += 1) {
    // If the item isn't found, return the default (or null)
    if (typeof current[pathArray[i]] === 'undefined') return fallback;

    // Otherwise, update the current  value
    current = current[pathArray[i]];
  }
  return current;
}
