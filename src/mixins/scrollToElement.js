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
  methods: {
    scrollToElement(hash) {
      const resolvedRoute = this.$router.resolve({ hash });
      return this.$router.options.scrollBehavior(resolvedRoute.route).then(({
        selector,
        offset,
      }) => {
        const element = document.querySelector(selector);
        if (!element) return null;

        element.scrollIntoView();
        window.scrollBy(-offset.x, -offset.y);
        return element;
      });
    },
  },
};
