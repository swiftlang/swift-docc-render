/**
 * This source file is part of the Swift.org open source project
 *
 * Copyright (c) 2021 Apple Inc. and the Swift project authors
 * Licensed under Apache License v2.0 with Runtime Library Exception
 *
 * See https://swift.org/LICENSE.txt for license information
 * See https://swift.org/CONTRIBUTORS.txt for Swift project authors
*/

const IntersectionDirections = {
  up: 'up',
  down: 'down',
};

export default {
  constants: { IntersectionDirections },
  data() {
    return {
      intersectionObserver: null,
      intersectionPreviousScrollY: 0,
      intersectionScrollDirection: IntersectionDirections.down,
    };
  },
  computed: {
    intersectionThreshold() {
      const threshold = [];
      for (let i = 0.0; i <= 1.0; i += 0.01) {
        threshold.push(i);
      }
      return threshold;
    },
    intersectionRoot() {
      return null; // `null` used to indicate the implicit root of the viewport
    },
    intersectionRootMargin() {
      return '0px 0px 0px 0px';
    },
    intersectionObserverOptions() {
      return {
        root: this.intersectionRoot,
        rootMargin: this.intersectionRootMargin,
        threshold: this.intersectionThreshold,
      };
    },
  },
  async mounted() {
    await import('intersection-observer');
    this.intersectionObserver = new IntersectionObserver((entries) => {
      this.detectIntersectionScrollDirection();
      const callback = this.onIntersect;
      if (callback) {
        entries.forEach(callback);
      } else {
        // eslint-disable-next-line no-console
        console.warn('onIntersect not implemented');
      }
    }, this.intersectionObserverOptions);
    this.getIntersectionTargets().forEach((child) => {
      this.intersectionObserver.observe(child);
    });
  },
  beforeDestroy() {
    if (this.intersectionObserver) {
      this.intersectionObserver.disconnect();
    }
  },
  methods: {
    getIntersectionTargets() { return [this.$el]; },

    detectIntersectionScrollDirection() {
      // Detect the scroll direction
      if (window.scrollY < this.intersectionPreviousScrollY) {
        this.intersectionScrollDirection = IntersectionDirections.down;
      } else if (window.scrollY > this.intersectionPreviousScrollY) {
        this.intersectionScrollDirection = IntersectionDirections.up;
      }
      this.intersectionPreviousScrollY = window.scrollY;
    },
  },
};
