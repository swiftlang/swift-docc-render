import AppStore from 'docc-render/stores/AppStore';

const TopicReferenceTypes = new Set([
  'section',
  'topic',
]);

function isFromIncludedArchive(id) {
  const { includedArchiveIdentifiers } = AppStore.state;

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
