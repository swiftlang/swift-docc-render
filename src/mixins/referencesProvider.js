/**
 * This source file is part of the Swift.org open source project
 *
 * Copyright (c) 2023 Apple Inc. and the Swift project authors
 * Licensed under Apache License v2.0 with Runtime Library Exception
 *
 * See https://swift.org/LICENSE.txt for license information
 * See https://swift.org/CONTRIBUTORS.txt for Swift project authors
*/
import AppStore from 'docc-render/stores/AppStore';

export default {
  // inject the `store`
  inject: {
    store: {
      default: () => ({
        state: {
          references: {},
        },
        setReferences() {},
        reset() {},
      }),
    },
  },
  data: () => ({ appState: AppStore.state }),
  computed: {
    // exposes the references for the current page
    references() {
      const {
        isFromIncludedArchive,
        store: {
          state: { references: originalRefs = {} },
        },
      } = this;
      // if present, use `includedArchiveIdentifiers` data to determine which
      // references should still be considered active or not
      return Object.keys(originalRefs).reduce((newRefs, id) => ({
        ...newRefs,
        [id]: {
          ...originalRefs[id],
          isFromIncludedArchive: isFromIncludedArchive(id),
        },
      }), {});
    },
  },
  methods: {
    isFromIncludedArchive(id) {
      const { includedArchiveIdentifiers = [] } = this.appState;
      // for backwards compatibility purposes, treat all references as being
      // from included archives if there is no data for it
      if (!includedArchiveIdentifiers.length) {
        return true;
      }

      return includedArchiveIdentifiers.some(archiveId => (
        id?.startsWith(`doc://${archiveId}`)
      ));
    },
  },
};
