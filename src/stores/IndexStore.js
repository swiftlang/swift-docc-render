/**
 * This source file is part of the Swift.org open source project
 *
 * Copyright (c) 2024 Apple Inc. and the Swift project authors
 * Licensed under Apache License v2.0 with Runtime Library Exception
 *
 * See https://swift.org/LICENSE.txt for license information
 * See https://swift.org/CONTRIBUTORS.txt for Swift project authors
*/

export default {
  state: {
    flatChildren: null,
    references: {},
    apiChanges: null,
    apiChangesVersion: null,
    includedArchiveIdentifiers: [],
    errorFetching: false,
    errorFetchingDiffs: false,
    technologyProps: {},
  },
  reset() {
    this.state.flatChildren = null;
    this.state.references = {};
    this.state.apiChanges = null;
    this.state.apiChangesVersion = null;
    this.state.includedArchiveIdentifiers = [];
    this.state.errorFetching = false;
    this.state.errorFetchingDiffs = false;
    this.state.technologyProps = {};
  },
  setFlatChildren(children) {
    this.state.flatChildren = children;
  },
  setReferences(references) {
    this.state.references = references;
  },
  setApiChanges(diff) {
    this.state.apiChanges = diff;
  },
  setApiChangesVersion(version) {
    this.state.apiChangesVersion = version;
  },
  setIncludedArchiveIdentifiers(includedArchiveIdentifiers) {
    this.state.includedArchiveIdentifiers = includedArchiveIdentifiers;
  },
  setErrorFetching(state) {
    this.state.errorFetching = state;
  },
  setErrorFetchingDiffs(state) {
    this.state.errorFetchingDiffs = state;
  },
  setTechnologyProps(technology) {
    this.state.technologyProps = technology;
  },
};
