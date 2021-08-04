<!--
  This source file is part of the Swift.org open source project

  Copyright (c) 2021 Apple Inc. and the Swift project authors
  Licensed under Apache License v2.0 with Runtime Library Exception

  See https://swift.org/LICENSE.txt for license information
  See https://swift.org/CONTRIBUTORS.txt for Swift project authors
-->

<template>
  <component :is="tag" :id="anchor"><slot /></component>
</template>

<script>
import onIntersect from 'docc-render/mixins/onIntersect';

export default {
  name: 'LinkableElement',
  mixins: [onIntersect],
  inject: {
    navigationBarHeight: {
      default() {
        return undefined;
      },
    },
    store: {
      default() {
        return {
          addLinkableSection() {},
          updateLinkableSection() {},
        };
      },
    },
  },
  props: {
    anchor: {
      type: String,
      required: true,
    },
    // The `depth` integer provides a hint as to how nested a linked element is
    // in a given page. A value of `0` would indicate there is no increased
    // depth, while increasing values indicate additional levels of nesting.
    // Visually, the navbar renders each level of additional depth as
    // indentation in both the mobile/desktop dropdown items (only one level is
    // currently supported).
    depth: {
      type: Number,
      default: () => 0,
    },
    tag: {
      type: String,
      default: () => 'div',
    },
    title: {
      type: String,
      required: true,
    },
  },
  computed: {
    intersectionRootMargin() {
      // shrink the top margin by the height of the navbar, if available
      const topMargin = this.navigationBarHeight ? (
        `-${this.navigationBarHeight}px`
      ) : (
        '0%'
      );
      // shrink the bottom margin by 50%
      return `${topMargin} 0% -50% 0%`;
    },
  },
  created() {
    this.store.addLinkableSection({
      anchor: this.anchor,
      depth: this.depth,
      title: this.title,
      visibility: 0,
    });
  },
  methods: {
    onIntersect(observerEntry) {
      const visibility = Math.min(1, observerEntry.intersectionRatio);
      this.store.updateLinkableSection({
        anchor: this.anchor,
        depth: this.depth,
        title: this.title,
        visibility,
      });
    },
  },
};
</script>
