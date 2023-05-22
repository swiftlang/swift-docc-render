/**
 * This source file is part of the Swift.org open source project
 *
 * Copyright (c) 2022 Apple Inc. and the Swift project authors
 * Licensed under Apache License v2.0 with Runtime Library Exception
 *
 * See https://swift.org/LICENSE.txt for license information
 * See https://swift.org/CONTRIBUTORS.txt for Swift project authors
*/

export default {
  data() {
    return {
      focusedIndex: 0,
      externalFocusChange: false,
    };
  },
  methods: {
    focusIndex(index) {
      if (index < 0) return;
      this.focusedIndex = index;
    },
    focusPrev({ metaKey, ctrlKey, shiftKey }) {
      // Prevent user from moving when pressing metaKey or ctrlKey + shiftKey
      if ((metaKey || ctrlKey) && shiftKey) return;
      this.externalFocusChange = false;
      if (this.focusedIndex > 0) {
        this.focusIndex(this.focusedIndex - 1);
      } else {
        this.startingPointHook();
      }
    },
    focusNext({ metaKey, ctrlKey, shiftKey }) {
      // Prevent user from moving when pressing metaKey or ctrlKey + shiftKey
      if ((metaKey || ctrlKey) && shiftKey) return;
      this.externalFocusChange = false;
      if (this.focusedIndex < this.totalItemsToNavigate - 1) {
        this.focusIndex(this.focusedIndex + 1);
      } else {
        this.endingPointHook();
      }
    },
    async focusFirst() {
      this.externalFocusChange = false;
      // reset focus index so we can focus on value 0 too
      this.focusIndex(null);
      await this.$nextTick();
      this.focusIndex(0);
      this.scrollToFocus();
    },
    async focusLast() {
      this.externalFocusChange = false;
      // reset focus index so we can focus on value 0 too
      this.focusIndex(null);
      await this.$nextTick();
      this.focusIndex(this.totalItemsToNavigate - 1);
      this.scrollToFocus();
    },
    startingPointHook() {},
    endingPointHook() {},
    scrollToFocus() {},
  },
  computed: {
    totalItemsToNavigate: () => 0,
  },
};
