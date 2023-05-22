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
  inject: {
    performanceMetricsEnabled: {
      default: false,
    },
    isTargetIDE: {
      default: false,
    },
  },
  methods: {
    // This function should be called every time a view's main content has been rendered and patched
    // onto the DOM.
    newContentMounted() {
      let time;

      if (this.performanceMetricsEnabled) {
        // Round the number to an integer, because the browser sometimes returns a float that
        // has too many decimals for the clients' native number types.
        time = Math.round(window.performance.now());
        if (!window.renderedTimes) {
          window.renderedTimes = [];
        }
        window.renderedTimes.push(time);
      }

      // Send the 'rendered' message when Vue has patched the DOM with the latest data.
      this.$bridge.send({
        type: 'rendered',
        data: {
          time,
        },
      });
    },
    /**
     * @param {Object} data
     */
    handleContentUpdateFromBridge(data) {
      this.topicData = data;
    },
  },
};
