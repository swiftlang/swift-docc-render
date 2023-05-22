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
 * Returns a promise which is invoked in `numFrames`
 * @param numFrames
 * @returns {Promise<any>}
 */
// eslint-disable-next-line import/prefer-default-export
export function waitFrames(numFrames) {
  let resolve = null;
  let framesLeft = numFrames - 1;
  const promise = new Promise((r) => {
    resolve = r;
  });
  requestAnimationFrame(function loop() {
    framesLeft -= 1;
    if (framesLeft <= 0) {
      resolve();
    } else {
      requestAnimationFrame(loop);
    }
  });
  return promise;
}

export function waitFor(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}
