/**
 * This source file is part of the Swift.org open source project
 *
 * Copyright (c) 2022 Apple Inc. and the Swift project authors
 * Licensed under Apache License v2.0 with Runtime Library Exception
 *
 * See https://swift.org/LICENSE.txt for license information
 * See https://swift.org/CONTRIBUTORS.txt for Swift project authors
*/

export const last = array => array[array.length - 1];

export const isEqual = (first, second) => (
  JSON.stringify(first) === JSON.stringify(second)
);

// A generator that yields subarray chunks of an original array that are
// up to `chunkSize` in length.
function* chunk(list, chunkSize) {
  for (let i = 0; i < list.length; i += chunkSize) {
    yield list.slice(i, i + chunkSize);
  }
}

/**
 * Given a list of items, return a list of pages, which are just nested lists
 * of the original items, each having a maxium size given by the page size.
 *
 * @param {Array} list - An array of any kind
 * @param {Number} pageSize - The maximum length of any pages to be returned
 * @return {Array} An array of arrays. Each nested array will be filled with
 *   items from the original array until the array reaches the specified page
 *   size. Only the last page can have a length less than the page size.
 * @example
 * page(['a', 'b', 'c', 'd', 'e'], 2) // [['a', 'b'], ['c', 'd'], ['e']]
 */
export function page(list, pageSize) {
  if (!pageSize || pageSize < 1) {
    throw new Error('page size must be 1 or higher');
  }
  return [...chunk(list, pageSize)];
}
