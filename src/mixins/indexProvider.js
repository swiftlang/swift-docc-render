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
import { getAbsoluteUrl } from 'docc-render/utils/url-helper';
import { flattenNestedData } from 'docc-render/utils/navigatorData';
import Language from 'docc-render/constants/Language';
import IndexStore from 'docc-render/stores/IndexStore';

export default {
  computed: {
    technologyUrl: ({ technology }) => (technology ? technology.url : ''),
    /**
         * Recomputes the list of flat children.
         * @return NavigatorFlatItem[]
         */
    flatChildren: ({
      technologyWithChildren = {},
    }) => (
      flattenNestedData(
        technologyWithChildren.children || [], null, 0, technologyWithChildren.beta,
      )
    ),
    technologyPath: ({ technologyUrl }) => {
      // regex should match only the first section, no slash - `/documentation/:technology`
      const matches = /(\/documentation\/(?:[^/]+))\/?/.exec(technologyUrl);
      return matches ? matches[1] : '';
    },
    /**
     * Extracts the technology data, for the currently chosen language
     * @return {Object}
     */
    technologyWithChildren({
      navigationIndex,
      topicProps: { interfaceLanguage } = { interfaceLanguage: Language.swift.key.url },
      technologyPath,
    }) {
      // get the technologies for the current language
      let currentLangTechnologies = navigationIndex[interfaceLanguage] || [];
      // if no such items, we use the default swift one
      if (!currentLangTechnologies.length) {
        currentLangTechnologies = navigationIndex[Language.swift.key.url] || [];
      }
      // find the current technology
      const currentTechnology = currentLangTechnologies.find(t => (
        technologyPath.toLowerCase() === t.path.toLowerCase()
      ));
      return currentTechnology ?? currentLangTechnologies[0];
    },
    indexDataPath() {
      const slug = this.$route?.params?.locale || '';
      return pathJoin(['/index/', slug, 'index.json']);
    },
    technologyProps: ({ technologyWithChildren }) => (
      !technologyWithChildren ? null : {
        technology: technologyWithChildren.title,
        technologyPath: technologyWithChildren.path || technologyWithChildren.url,
        isTechnologyBeta: technologyWithChildren.beta,
      }
    ),
  },
  methods: {
    async fetchIndexPathsData() {
      const path = getAbsoluteUrl(this.indexDataPath);
      return fetchData(path);
    },
    async fetchIndexData() {
      try {
        const {
          includedArchiveIdentifiers = [],
          interfaceLanguages,
          references = {},
        } = await this.fetchIndexPathsData();
        this.navigationIndex = Object.freeze(interfaceLanguages);
        IndexStore.setReferences(references);
        IndexStore.setIncludedArchiveIdentifiers(includedArchiveIdentifiers);
        IndexStore.setFlatChildren(this.flatChildren);
        IndexStore.setTechnologyProps(this.technologyProps);
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
