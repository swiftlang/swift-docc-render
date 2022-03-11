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
    $route: {
      immediate: true,
      handler(current) {
        const { changes = null } = current.query;
        this.shouldUpdateChangesQueryParameter = !changes;
        if (this.selectedAPIChangesVersion === changes) {
          // there is no change, we still want to re-fetch
          this.handleSelectedAPIChangesVersion(this.selectedAPIChangesVersion);
          return;
        }
        // store the new value
        this.selectedAPIChangesVersion = changes;
      },
    },
    selectedAPIChangesVersion: {
      immediate: true,
      handler: 'handleSelectedAPIChangesVersion',
    },
  },
  methods: {
    async handleSelectedAPIChangesVersion(newValue) {
      // if the we go back, and both the query and selectedAPIChangesVersion are false,
      // we dont want to update the URL
      const shouldPushNewUrl = this.shouldUpdateChangesQueryParameter
        && (this.$route.query.changes || newValue);

      if (shouldPushNewUrl) {
        this.$router.push({
          query: {
            ...this.$route.query,

            // Explicitly pass undefined to remove the query parameter.
            changes: newValue || undefined,
          },
        });
        // it will fetch on the next iteration
        return;
      }
      this.shouldDisplayChangesNav = !!(newValue && this.availableOptions.has(newValue));
      let apiChanges = null;
      if (this.shouldDisplayChangesNav) {
        // Update the query parameter when a version has been selected from the changes nav.
        this.shouldUpdateChangesQueryParameter = true;
        let response = null;
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
      // store the selected version, only if we should show the changes nav. Otherwise the value
      // might be none-existent value
      this.store.setSelectedAPIChangesVersion(this.shouldDisplayChangesNav ? newValue : null);
      this.store.setAPIChanges(apiChanges);
    },
  },
};
