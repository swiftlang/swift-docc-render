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
 * Debounce a function
 * @param {function} fn - the function to debounce
 * @param {number} delay - the delay to apply
 * @param {boolean} [atStart] - should it be applied at the beginning between debounces
 * @param {boolean} [guarantee] - should it guarantee exactly X time passes before next call goes in
 * @returns {function}
 */
export default function debounce(fn, delay, atStart, guarantee) {
  let timeout;
  let self;

  return function debounced(...args) {
    self = this;

    function clear() {
      clearTimeout(timeout);
      timeout = null;
    }

    function run() {
      clear();
      fn.apply(self, args);
    }

    if (timeout && (atStart || guarantee)) {
      return;
    }
    if (!atStart) {
      clear();

      timeout = setTimeout(run, delay);
      return;
    }

    timeout = setTimeout(clear, delay);
    fn.apply(self, args);
  };
}
