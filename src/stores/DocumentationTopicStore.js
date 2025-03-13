/**
 * This source file is part of the Swift.org open source project
 *
 * Copyright (c) 2021 Apple Inc. and the Swift project authors
 * Licensed under Apache License v2.0 with Runtime Library Exception
 *
 * See https://swift.org/LICENSE.txt for license information
 * See https://swift.org/CONTRIBUTORS.txt for Swift project authors
*/

import { filterInactiveReferences } from 'theme/utils/references';
import ApiChangesStoreBase from 'docc-render/stores/ApiChangesStoreBase';
import OnThisPageSectionsStoreBase from 'docc-render/stores/OnThisPageSectionsStoreBase';
import Settings from 'docc-render/utils/settings';

const { state: changesState, ...changesActions } = ApiChangesStoreBase;
const { state: pageSectionsState, ...pageSectionsActions } = OnThisPageSectionsStoreBase;

export default {
  state: {
    preferredLanguage: Settings.preferredLanguage,
    contentWidth: 0,
    ...changesState,
    ...pageSectionsState,
    references: {},
  },
  reset() {
    this.state.preferredLanguage = Settings.preferredLanguage;
    this.state.references = {};
    this.resetApiChanges();
  },
  setPreferredLanguage(language) {
    this.state.preferredLanguage = language;
    Settings.preferredLanguage = this.state.preferredLanguage;
  },
  setContentWidth(width) {
    this.state.contentWidth = width;
  },
  setReferences(references) {
    this.state.references = filterInactiveReferences(references);
  },
  updateReferences() {
    this.setReferences(this.state.references);
  },
  ...changesActions,
  ...pageSectionsActions,
};
