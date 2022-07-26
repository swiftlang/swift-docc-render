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
  state: {
    onThisPageSections: [],
    currentPageSection: null,
  },
  resetPageSections() {
    this.state.onThisPageSections = [];
    this.state.currentPageSection = null;
  },
  addOnThisPageSection(section) {
    this.state.onThisPageSections.push(section);
  },
  setCurrentPageSection(sectionAnchor) {
    const section = this.state.onThisPageSections.find(({ anchor }) => anchor === sectionAnchor);
    if (!section) return;
    this.state.currentPageSection = section;
  },
};
