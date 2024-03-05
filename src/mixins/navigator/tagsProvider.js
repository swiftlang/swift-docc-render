/**
 * This source file is part of the Swift.org open source project
 *
 * Copyright (c) 2024 Apple Inc. and the Swift project authors
 * Licensed under Apache License v2.0 with Runtime Library Exception
 *
 * See https://swift.org/LICENSE.txt for license information
 * See https://swift.org/CONTRIBUTORS.txt for Swift project authors
*/

/* eslint-disable no-restricted-syntax */
import {
  FILTER_TAGS,
  TOPIC_TYPE_TO_TAG,
} from 'docc-render/constants/Tags';

export default {
  name: 'TagsDataProvider',
  constants: {
    TOPIC_TYPE_TO_TAG,
  },
  props: {
    shouldTruncateTags: {
      type: Boolean,
      default: false,
    },
  },
  computed: {
    /**
     * Generates an array of tag labels for filtering.
     * Shows only tags, that have children matches.
     */
    availableTags: ({
      renderableChildNodesMap,
      apiChangesObject,
      extractTags,
    }) => extractTags(renderableChildNodesMap, apiChangesObject),
    suggestedTags({
      availableTags,
      selectedTags,
      hideAvailableTags,
    }) {
      if (hideAvailableTags || selectedTags.length) return [];
      return availableTags;
    },
    translatableTags: ({ availableTags }) => [FILTER_TAGS.hideDeprecated, ...availableTags],
  },
  methods: {
    extractTags(nodes, apiChanges) {
      const possibleTags = new Set(Object.values(FILTER_TAGS));
      // create categories to order the availableTags
      const availableTags = {
        type: [],
        changes: [],
        other: [],
      };

      // when API changes are available, remove the hide deprecated option
      if (apiChanges && Object.values(apiChanges).length) {
        possibleTags.delete(FILTER_TAGS.hideDeprecated);
      }

      // iterate over the nodes to render
      for (const childID in nodes) {
        if (!Object.hasOwnProperty.call(nodes, childID)) {
          // eslint-disable-next-line no-continue
          continue;
        }
        // if there are no more tags to iterate over, end early
        if (!possibleTags.size) {
          break;
        }
        // extract props
        const { type, path, deprecated } = nodes[childID];

        // add type tag if not already added
        const tag = TOPIC_TYPE_TO_TAG[type];
        if (tag && possibleTags.has(tag)) {
          // if we have a match, store it
          availableTags.type.push(tag);
          // remove the match, so we can end the filter early
          possibleTags.delete(tag);
        }

        // add change tag
        const changeType = apiChanges[path];
        if (changeType && FILTER_TAGS[changeType]) {
          availableTags.changes.push(FILTER_TAGS[changeType]);
          possibleTags.delete(FILTER_TAGS[changeType]);
        }

        // add hide deprecated tag if there exists deprecated symbols
        // and API change is off
        if (deprecated && possibleTags.has(FILTER_TAGS.hideDeprecated)) {
          availableTags.other.push(FILTER_TAGS.hideDeprecated);
          possibleTags.delete(FILTER_TAGS.hideDeprecated);
        }
      }
      return Object.values(availableTags).flat();
    },
  },
};
