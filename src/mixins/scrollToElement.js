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
      // if not scrolled to the bottom, use the offset
      if (window.scrollY + window.innerHeight < document.body.scrollHeight) {
        window.scrollBy(-offset.x, -offset.y);
      }
      return element;
    },
    /**
     * Always scroll to the element and focus it.
     * This ensures that the next tab target is inside
     * and that it is in view, even if the hash is in the url
     * @returns {Promise<Element|void>}
    */
    async handleFocusAndScroll(hash) {
      const element = document.getElementById(hash);
      // if no element to focus or scroll, exit
      if (!element) return;
      // Focus scrolls to the element
      element.focus({
        preventScroll: true,
      });
      // but we need to compensate for the navigation height
      await this.scrollToElement(`#${hash}`);
    },
  },
};
