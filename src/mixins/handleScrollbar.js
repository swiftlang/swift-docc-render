/**
 * This source file is part of the Swift.org open source project
 *
 * Copyright (c) 2022 Apple Inc. and the Swift project authors
 * Licensed under Apache License v2.0 with Runtime Library Exception
 *
 * See https://swift.org/LICENSE.txt for license information
 * See https://swift.org/CONTRIBUTORS.txt for Swift project authors
*/

import debounce from 'docc-render/utils/debounce';

const ScrollingDebounceDelay = 1000;

export default {
  constants: { ScrollingDebounceDelay },
  data() {
    return {
      isScrolling: false,
      scrollRemovedAt: 0,
    };
  },
  created() {
    // replace with a debounced version if the method
    this.deleteScroll = debounce(this.deleteScroll, ScrollingDebounceDelay);
  },
  methods: {
    deleteScroll() {
      this.isScrolling = false;
      this.scrollRemovedAt = Date.now();
    },
    handleScroll(event) {
      const { target } = event;
      // if we are trying to scroll vertically, prevent that.
      if (target.scrollTop !== 0) {
        // need to reset it back to 0, because preventDefault does not revert it.
        target.scrollTop = 0;
        event.preventDefault();
        return;
      }
      const safeExtraWidth = 150;
      const listWidth = target.offsetWidth;
      const noScrollBarsWidth = listWidth + safeExtraWidth; // safe width added to the list width
      // To prevent from applying the scrolling styles when scroll bars doesn't appear
      if (target.scrollWidth < noScrollBarsWidth) return;
      // make sure the scroll is not called again, right after deleting the scrollbar.
      // The difference is around 25ms, we use 100 to be safe.
      const difference = Date.now() - this.scrollRemovedAt;
      if (difference < ScrollingDebounceDelay / 10) return;
      this.isScrolling = true;
      // make sure we do this only once
      if (!target.style.getPropertyValue('--scroll-target-height')) {
        // expose the current height as a css var, so we can limit it's height
        target.style.setProperty('--scroll-target-height', `${target.offsetHeight}px`);
      }
      this.deleteScroll();
    },
  },
};
