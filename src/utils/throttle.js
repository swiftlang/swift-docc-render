/**
 * This source file is part of the Swift.org open source project
 *
 * Copyright (c) 2022 Apple Inc. and the Swift project authors
 * Licensed under Apache License v2.0 with Runtime Library Exception
 *
 * See https://swift.org/LICENSE.txt for license information
 * See https://swift.org/CONTRIBUTORS.txt for Swift project authors
*/

/**
 * Throttles calls to a function, across an interval
 * @param {Function} func
 * @param {Number} limit
 * @return {function(): (undefined)}
 */
export default function throttle(func, limit) {
  let timer;
  let lastRanTime;

  return function(...args) {
    const currentTime = Date.now();

    if (!lastRanTime) {
      func.apply(this, args);
      lastRanTime = currentTime;
      return;
    }

    clearTimeout(timer);
    timer = setTimeout(() => {
      if (currentTime - lastRanTime >= limit) {
        func.apply(this, args);
        lastRanTime = currentTime;
      }
    }, limit - (currentTime - lastRanTime));
  };
}
