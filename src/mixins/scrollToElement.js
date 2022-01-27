/**
 * This source file is part of the Swift.org open source project
 *
 * Copyright (c) 2021 Apple Inc. and the Swift project authors
 * Licensed under Apache License v2.0 with Runtime Library Exception
 *
 * See https://swift.org/LICENSE.txt for license information
 * See https://swift.org/CONTRIBUTORS.txt for Swift project authors
*/

import { waitFrames } from 'docc-render/utils/loading';

export default {
  methods: {
    async scrollToElement(hash) {
      // wait a few frames, so the app has settled down animating, loading or unlocking scrolls
      await waitFrames(8);
      const resolvedRoute = this.$router.resolve({ hash });
      const {
        selector,
        offset,
      } = await this.$router.options.scrollBehavior(resolvedRoute.route);
      const element = document.querySelector(selector);
      if (!element) return null;

      element.scrollIntoView();
      window.scrollBy(-offset.x, -offset.y);
      return element;
    },
  },
};
