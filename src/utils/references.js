/**
 * This source file is part of the Swift.org open source project
 *
 * Copyright (c) 2024 Apple Inc. and the Swift project authors
 * Licensed under Apache License v2.0 with Runtime Library Exception
 *
 * See https://swift.org/LICENSE.txt for license information
 * See https://swift.org/CONTRIBUTORS.txt for Swift project authors
*/

import IndexStore from 'docc-render/stores/IndexStore';

const TopicReferenceTypes = new Set([
  'section',
  'topic',
]);

function isFromIncludedArchive(id) {
  const { includedArchiveIdentifiers } = IndexStore.state;

  // for backwards compatibility purposes, treat all references as being
  // from included archives if there is no data for it
  if (!includedArchiveIdentifiers.length) {
    return true;
  }

  return includedArchiveIdentifiers.some(archiveId => (
    id?.startsWith(`doc://${archiveId}/`)
  ));
}

function filterInactiveReferences(references = {}) {
  return Object.keys(references).reduce((newRefs, id) => {
    const originalRef = references[id];
    const { url, ...refWithoutUrl } = originalRef;
    return TopicReferenceTypes.has(originalRef.type) ? ({
      ...newRefs,
      [id]: isFromIncludedArchive(id) ? originalRef : refWithoutUrl,
    }) : ({
      ...newRefs,
      [id]: originalRef,
    });
  }, {});
}

// eslint-disable-next-line import/prefer-default-export
export { filterInactiveReferences };
