/**
 * This source file is part of the Swift.org open source project
 *
 * Copyright (c) 2022-2023 Apple Inc. and the Swift project authors
 * Licensed under Apache License v2.0 with Runtime Library Exception
 *
 * See https://swift.org/LICENSE.txt for license information
 * See https://swift.org/CONTRIBUTORS.txt for Swift project authors
*/

export default {
  state: {
    onThisPageSections: [],
    currentPageAnchor: null,
  },
  resetPageSections() {
    this.state.onThisPageSections = [];
    this.state.currentPageAnchor = null;
  },
  /**
   * Register a section for the OnThisPage navigation
   * @param {{anchor: string, title:string, level: number}} section
   */
  addOnThisPageSection(section, { i18n = true } = {}) {
    this.state.onThisPageSections.push({ ...section, i18n });
  },
  /**
   * Sets a section as current.
   * @param {string} sectionAnchor
   */
  setCurrentPageSection(sectionAnchor) {
    const i = this.state.onThisPageSections.findIndex(({ anchor }) => anchor === sectionAnchor);
    if (i === -1) return;
    this.state.currentPageAnchor = sectionAnchor;
  },
};
