/**
 * This source file is part of the Swift.org open source project
 *
 * Copyright (c) 2021 Apple Inc. and the Swift project authors
 * Licensed under Apache License v2.0 with Runtime Library Exception
 *
 * See https://swift.org/LICENSE.txt for license information
 * See https://swift.org/CONTRIBUTORS.txt for Swift project authors
*/

import Vue from 'vue';
import { ChangeTypes } from 'docc-render/constants/Changes';

/**
 * Returns a changes counts object,
 * with property for each change type
 * @returns {{[string]: number}}
 */
export const apiChangesCountsFactory = () => ({
  [ChangeTypes.modified]: 0,
  [ChangeTypes.added]: 0,
  [ChangeTypes.deprecated]: 0,
});

export default {
  state: {
    apiChanges: null,
    apiChangesCounts: apiChangesCountsFactory(),
    selectedAPIChangesVersion: null,
  },
  setAPIChanges(changes) {
    this.state.apiChanges = changes;
  },
  setSelectedAPIChangesVersion(value) {
    this.state.selectedAPIChangesVersion = value;
  },
  // Reset the API changes data, except for the `selectedAPIChangesVersion`.
  // This method is called primarily on page navigation, to clear old changes data.
  resetApiChanges() {
    this.state.apiChanges = null;
    this.state.apiChangesCounts = apiChangesCountsFactory();
  },
  async updateApiChangesCounts() {
    await Vue.nextTick();
    Object.keys(this.state.apiChangesCounts)
      .forEach((changeType) => {
        this.state.apiChangesCounts[changeType] = this.countChangeType(changeType);
      });
  },
  countChangeType(changeType) {
    if (document && document.querySelectorAll) {
      const selector = `.changed-${changeType}:not(.changed-total)`;
      return document.querySelectorAll(selector).length;
    }
    return 0;
  },
};
