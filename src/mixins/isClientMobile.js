/**
 * This source file is part of the Swift.org open source project
 *
 * Copyright (c) 2021 Apple Inc. and the Swift project authors
 * Licensed under Apache License v2.0 with Runtime Library Exception
 *
 * See https://swift.org/LICENSE.txt for license information
 * See https://swift.org/CONTRIBUTORS.txt for Swift project authors
*/

export default {
  computed: {
    /**
     * Returns whether the client is a mobile device.
     * @see {@link https://developer.mozilla.org/en-US/docs/Web/HTTP/Browser_detection_using_the_user_agent}
     */
    isClientMobile() {
      let check = false;
      // detect if the device is a multi touch one
      if ('maxTouchPoints' in navigator || 'msMaxTouchPoints' in navigator) {
        check = Boolean(navigator.maxTouchPoints || navigator.msMaxTouchPoints);
      } else {
        // fallback to testing if the device has a precise pointer (mouse) or not
        check = window.matchMedia
          ? window.matchMedia('(pointer:coarse)').matches
          // check for `orientation` in window object, if client does not support `matchMedia`
          : 'orientation' in window;
      }
      return check;
    },
  },
};
