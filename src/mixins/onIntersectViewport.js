/**
 * This source file is part of the Swift.org open source project
 *
 * Copyright (c) 2021 Apple Inc. and the Swift project authors
 * Licensed under Apache License v2.0 with Runtime Library Exception
 *
 * See https://swift.org/LICENSE.txt for license information
 * See https://swift.org/CONTRIBUTORS.txt for Swift project authors
*/

import onIntersect from './onIntersect';

export const intersectionMargins = {
  topOneThird: '-30% 0% -70% 0%',
  center: '-50% 0% -50% 0%',
};

export default {
  mixins: [onIntersect],
  computed: {
    intersectionRoot() {
      return null; // `null` used to indicate the implicit root of the viewport
    },
    intersectionRootMargin() {
      // this margin from the viewport root is used to track intersection
      // along the center of the viewport itself
      return intersectionMargins.center;
    },
  },
  methods: {
    onIntersect(observerEntry) {
      if (!observerEntry.isIntersecting) {
        return;
      }

      const callback = this.onIntersectViewport;
      if (callback) {
        callback();
      } else {
        // eslint-disable-next-line no-console
        console.warn('onIntersectViewportCenter not implemented');
      }
    },
  },
};
