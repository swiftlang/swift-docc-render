/**
 * This source file is part of the Swift.org open source project
 *
 * Copyright (c) 2021 Apple Inc. and the Swift project authors
 * Licensed under Apache License v2.0 with Runtime Library Exception
 *
 * See https://swift.org/LICENSE.txt for license information
 * See https://swift.org/CONTRIBUTORS.txt for Swift project authors
*/

import ApiChangesStoreBase from 'docc-render/stores/ApiChangesStoreBase';
import Settings from 'docc-render/utils/settings';

const { state: changesState, ...changesActions } = ApiChangesStoreBase;

export default {
  state: {
    onThisPageSections: [],
    preferredLanguage: Settings.preferredLanguage,
    ...changesState,
  },
  reset() {
    this.state.onThisPageSections = [];
    this.state.preferredLanguage = Settings.preferredLanguage;
    this.resetApiChanges();
  },
  addOnThisPageSection(section) {
    this.state.onThisPageSections.push(section);
  },
  setPreferredLanguage(language) {
    this.state.preferredLanguage = language;
    Settings.preferredLanguage = this.state.preferredLanguage;
  },
  ...changesActions,
};
