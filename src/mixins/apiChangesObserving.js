/**
 * This source file is part of the Swift.org open source project
 *
 * Copyright (c) 2021 Apple Inc. and the Swift project authors
 * Licensed under Apache License v2.0 with Runtime Library Exception
 *
 * See https://swift.org/LICENSE.txt for license information
 * See https://swift.org/CONTRIBUTORS.txt for Swift project authors
*/

import { fetchAPIChangesForRoute } from 'docc-render/utils/data';

export default {
  inject: ['store'],
  data() {
    const {
      $route: {
        query: {
          changes = null,
        } = {},
      } = {},
    } = this;

    return {
      shouldDisplayChangesNav: false,
      selectedAPIChangesVersion: null,

      // On page load, do not update the changes query parameter. If the version provided in the URL
      // is not valid, we fall back to a default version, in which case we want to preserve the
      // original query parameter instead of updating it to the fallback version.
      shouldUpdateChangesQueryParameter: !changes,
    };
  },
  watch: {
    '$route.query.changes': {
      immediate: true,
      // defaulting to `null`, to be sure `undefined` is cast to `null`
      handler(newValue = null) {
        this.selectedAPIChangesVersion = newValue;
      },
    },
    selectedAPIChangesVersion: {
      immediate: true,
      // make sure oldValue defaults to null
      async handler(newValue, oldValue = null) {
        // if the we go back, and both the query and selectedAPIChangesVersion are false,
        // we dont want to update the URL
        const shouldPushNewUrl = this.shouldUpdateChangesQueryParameter
          && (this.$route.query.changes || newValue);

        if (newValue !== oldValue) {
          if (shouldPushNewUrl) {
            this.$router.push({
              query: {
                ...this.$route.query,

                // Explicitly pass undefined to remove the query parameter.
                changes: newValue || undefined,
              },
            });
          }

          // only display changes nav if query has available options
          this.shouldDisplayChangesNav = !!(newValue && this.availableOptions.has(newValue));

          let apiChanges = null;
          if (newValue && this.availableOptions.has(newValue)) {
            // Update the query parameter when a version has been selected from the changes nav.
            this.shouldUpdateChangesQueryParameter = true;

            let response;
            try {
              response = await fetchAPIChangesForRoute(this.$route, newValue);
            } catch (err) {
              // if the request errors out for some reason, return an empty object
              response = {};
            }
            if (this.shouldDisplayChangesNav) {
              // Make sure the nav is still visible, when we update the changes.
              apiChanges = response;
            }
          }
          this.store.setAPIChanges(apiChanges);
        }
      },
    },
  },
};
