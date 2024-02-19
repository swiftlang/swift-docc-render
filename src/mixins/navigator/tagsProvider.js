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
import { ChangeNames } from 'docc-render/constants/Changes';
import {
  HIDE_DEPRECATED,
  FILTER_TAGS,
  TOPIC_TYPE_TO_TAG,
} from 'docc-render/constants/Tags';

export default {
  name: 'TagsDataProvider',
  constants: {
    TOPIC_TYPE_TO_TAG,
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
    translatableTags: ({ availableTags }) => [HIDE_DEPRECATED, ...availableTags],
  },
  methods: {
    extractTags(nodes, apiChanges) {
      // extract tags from child nodes
      const apiChangesTypesSet = new Set(Object.values(apiChanges));
      const tagsSet = new Set(Object.values(FILTER_TAGS));
      const generalTags = new Set([HIDE_DEPRECATED]);
      // when API changes are available, remove the `HIDE_DEPRECATED` option
      if (apiChangesTypesSet.size) {
        generalTags.delete(HIDE_DEPRECATED);
      }

      const availableTags = {
        type: [],
        changes: [],
        other: [],
      };
      // iterate over the nodes to render
      for (const childID in nodes) {
        if (!Object.hasOwnProperty.call(nodes, childID)) {
          // eslint-disable-next-line no-continue
          continue;
        }
        // if there are no more tags to iterate over, end early
        if (!tagsSet.size && !apiChangesTypesSet.size && !generalTags.size) {
          break;
        }
        // extract props
        const { type, path, deprecated } = nodes[childID];
        // grab the tagLabel
        const tag = TOPIC_TYPE_TO_TAG[type];
        const changeType = apiChanges[path];
        // try to match a tag
        if (tagsSet.has(tag)) {
          // if we have a match, store it
          availableTags.type.push(tag);
          // remove the match, so we can end the filter early
          tagsSet.delete(tag);
        }
        if (changeType && apiChangesTypesSet.has(changeType)) {
          availableTags.changes.push(ChangeNames[changeType]);
          apiChangesTypesSet.delete(changeType);
        }
        if (deprecated && generalTags.has(HIDE_DEPRECATED)) {
          availableTags.other.push(HIDE_DEPRECATED);
          generalTags.delete(HIDE_DEPRECATED);
        }
      }
      return Object.values(availableTags).flat();
    },
  },
};
