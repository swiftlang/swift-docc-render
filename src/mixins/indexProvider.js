/**
 * This source file is part of the Swift.org open source project
 *
 * Copyright (c) 2024 Apple Inc. and the Swift project authors
 * Licensed under Apache License v2.0 with Runtime Library Exception
 *
 * See https://swift.org/LICENSE.txt for license information
 * See https://swift.org/CONTRIBUTORS.txt for Swift project authors
*/
import { fetchData } from 'docc-render/utils/data';
import { pathJoin } from 'docc-render/utils/assets';
import { flattenNavigationIndex, extractTechnologyProps } from 'docc-render/utils/navigatorData';
import IndexStore from 'docc-render/stores/IndexStore';

export default {
  computed: {
    indexDataPath() {
      const slug = this.$route?.params?.locale || '';
      return pathJoin(['/index/', slug, 'index.json']);
    },
  },
  methods: {
    async fetchIndexPathsData() {
      return fetchData(this.indexDataPath);
    },
    async fetchIndexData() {
      try {
        IndexStore.reset();
        const {
          includedArchiveIdentifiers = [],
          interfaceLanguages,
          references = {},
        } = await this.fetchIndexPathsData();
        IndexStore.setFlatChildren(flattenNavigationIndex(interfaceLanguages));
        IndexStore.setTechnologyProps(extractTechnologyProps(interfaceLanguages));
        IndexStore.setReferences(references);
        IndexStore.setIncludedArchiveIdentifiers(includedArchiveIdentifiers);
      } catch (e) {
        IndexStore.setErrorFetching(true);
      }
    },
  },
  watch: {
    indexDataPath: {
      handler: 'fetchIndexData',
      immediate: true,
    },
  },
};
