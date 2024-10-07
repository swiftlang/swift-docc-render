/**
 * This source file is part of the Swift.org open source project
 *
 * Copyright (c) 2021 Apple Inc. and the Swift project authors
 * Licensed under Apache License v2.0 with Runtime Library Exception
 *
 * See https://swift.org/LICENSE.txt for license information
 * See https://swift.org/CONTRIBUTORS.txt for Swift project authors
*/

import { filterInactiveReferences } from 'docc-render/utils/references';

export default {
  state: {
    activeTutorialLink: null,
    activeVolume: null,
    references: {},
  },
  reset() {
    this.state.activeTutorialLink = null;
    this.state.activeVolume = null;
    this.state.references = {};
  },
  setActiveSidebarLink(link) {
    this.state.activeTutorialLink = link;
  },
  setActiveVolume(name) {
    this.state.activeVolume = name;
  },
  setReferences(references) {
    this.state.references = filterInactiveReferences(references);
  },
  updateReferences() {
    this.setReferences(this.state.references);
  },
};
