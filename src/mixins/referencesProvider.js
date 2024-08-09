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

const TopicReferenceTypes = new Set([
  'section',
  'topic',
]);

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
      // strip the `url` key from "topic"/"section" refs if their identifier
      // comes from an archive that hasn't been included by DocC
      return Object.keys(originalRefs).reduce((newRefs, id) => {
        const originalRef = originalRefs[id];
        const { url, ...refWithoutUrl } = originalRef;
        return TopicReferenceTypes.has(originalRef.type) ? ({
          ...newRefs,
          [id]: isFromIncludedArchive(id) ? originalRefs[id] : refWithoutUrl,
        }) : ({
          ...newRefs,
          [id]: originalRef,
        });
      }, {});
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
        id?.startsWith(`doc://${archiveId}/`)
      ));
    },
  },
};
