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
    };
  },
  methods: {
    focusIndex(index) {
      this.focusedIndex = index;
    },
    focusPrev({ metaKey, ctrlKey, shiftKey }) {
      // Prevent user from moving when pressing metaKey or ctrlKey + shiftKey
      if ((metaKey || ctrlKey) && shiftKey) return;
      if (this.focusedIndex > 0) {
        this.focusIndex(this.focusedIndex - 1);
      } else {
        this.startingPointHook();
      }
    },
    focusNext({ metaKey, ctrlKey, shiftKey }) {
      // Prevent user from moving when pressing metaKey or ctrlKey + shiftKey
      if ((metaKey || ctrlKey) && shiftKey) return;
      if (this.focusedIndex < this.totalItemsToNavigate - 1) {
        this.focusIndex(this.focusedIndex + 1);
      } else {
        this.endingPointHook();
      }
    },
    focusFirst() {
      this.focusIndex(0);
    },
    focusLast() {
      this.focusIndex(this.totalItemsToNavigate - 1);
    },
    startingPointHook() {},
    endingPointHook() {},
  },
  computed: {
    totalItemsToNavigate: () => 0,
  },
};
