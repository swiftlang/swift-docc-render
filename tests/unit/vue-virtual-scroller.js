/**
 * This source file is part of the Swift.org open source project
 *
 * Copyright (c) 2026 Apple Inc. and the Swift project authors
 * Licensed under Apache License v2.0 with Runtime Library Exception
 *
 * See https://swift.org/LICENSE.txt for license information
 * See https://swift.org/CONTRIBUTORS.txt for Swift project authors
*/

import { h, reactive } from 'vue';

export const DynamicScroller = {
  name: 'DynamicScroller',
  props: {
    items: {
      type: Array,
      default: () => [],
    },
    keyField: {
      type: String,
      default: 'id',
    },
    minItemSize: {
      type: Number,
      default: 0,
    },
  },
  methods: {
    scrollToItem() {},
  },
  render() {
    const children = this.$slots.default
      ? this.items.flatMap((item, index) => this.$slots.default({
        active: true,
        index,
        item,
      }))
      : [];
    return h('div', children);
  },
};

export const DynamicScrollerItem = {
  name: 'DynamicScrollerItem',
  methods: {
    updateSize() {},
  },
  render() {
    return h('div', this.$slots.default ? this.$slots.default() : []);
  },
};

export const useIdState = options => ({
  idState: reactive(options.idState ? options.idState() : { isOpening: false }),
});
