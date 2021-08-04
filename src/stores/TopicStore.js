/**
 * This source file is part of the Swift.org open source project
 *
 * Copyright (c) 2021 Apple Inc. and the Swift project authors
 * Licensed under Apache License v2.0 with Runtime Library Exception
 *
 * See https://swift.org/LICENSE.txt for license information
 * See https://swift.org/CONTRIBUTORS.txt for Swift project authors
*/

import BreakpointEmitter from 'docc-render/components/BreakpointEmitter.vue';

const { BreakpointName } = BreakpointEmitter.constants;

export default {
  state: {
    linkableSections: [],
    breakpoint: BreakpointName.large,
  },
  addLinkableSection(section) {
    const newLinkableSection = {
      ...section,
      visibility: 0,
    };
    newLinkableSection.sectionNumber = this.state.linkableSections.length;
    this.state.linkableSections.push(newLinkableSection);
  },
  reset() {
    this.state.linkableSections = [];
    this.state.breakpoint = BreakpointName.large;
  },
  updateLinkableSection(section) {
    this.state.linkableSections = this.state.linkableSections.map(oldSection => (
      section.anchor === oldSection.anchor ? ({
        ...oldSection,
        visibility: section.visibility,
      }) : (
        oldSection
      )
    ));
  },
  updateBreakpoint(value) {
    this.state.breakpoint = value;
  },
};
