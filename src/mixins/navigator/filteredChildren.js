/**
 * This source file is part of the Swift.org open source project
 *
 * Copyright (c) 2023 Apple Inc. and the Swift project authors
 * Licensed under Apache License v2.0 with Runtime Library Exception
 *
 * See https://swift.org/LICENSE.txt for license information
 * See https://swift.org/CONTRIBUTORS.txt for Swift project authors
*/

import { TOPIC_TYPE_TO_TAG, HIDE_DEPRECATED } from 'docc-render/constants/Tags';
import { ChangeNames } from 'docc-render/constants/Changes';

export default {
  computed: {
    /**
       * Returns a list of the child nodes, that match the filter pattern.
       * @returns NavigatorFlatItem[]
       */
    filteredChildren: ({
      children,
      selectedTags,
      apiChanges,
      filterPattern,
      filterChildren,
    }) => (filterChildren(children, selectedTags, apiChanges, filterPattern)),
  },
  methods: {
    filterChildren(children, selectedTags, apiChanges, filterPattern) {
      const tagsSet = new Set(selectedTags);
      // find children that match current filters
      return children.filter(({
        title, path, type, deprecated, deprecatedChildrenCount, childUIDs,
      }) => {
        // groupMarkers know how many children they have and how many are deprecated
        const isDeprecated = deprecated || deprecatedChildrenCount === childUIDs.length;
        // check if `title` matches the pattern, if provided
        const titleMatch = filterPattern ? filterPattern.test(title) : true;
        // check if `type` matches any of the selected tags
        let tagMatch = true;
        if (tagsSet.size) {
          tagMatch = tagsSet.has(TOPIC_TYPE_TO_TAG[type]);
          // if there are API changes and there is no tag match, try to match change types
          if (apiChanges && !tagMatch) {
            const change = apiChanges[path];
            tagMatch = tagsSet.has(ChangeNames[change]);
          }
          if (!isDeprecated && tagsSet.has(HIDE_DEPRECATED)) {
            tagMatch = true;
          }
        }
        // find items, that have API changes
        const hasAPIChanges = apiChanges ? !!apiChanges[path] : true;
        // make sure groupMarker's dont get matched
        return titleMatch && tagMatch && hasAPIChanges;
      });
    },
  },
};
