/**
 * This source file is part of the Swift.org open source project
 *
 * Copyright (c) 2024 Apple Inc. and the Swift project authors
 * Licensed under Apache License v2.0 with Runtime Library Exception
 *
 * See https://swift.org/LICENSE.txt for license information
 * See https://swift.org/CONTRIBUTORS.txt for Swift project authors
*/
import { flattenNestedData } from 'docc-render/utils/navigatorData';
import Language from 'docc-render/constants/Language';
import IndexStore from 'docc-render/stores/IndexStore';

export default {
  computed: {
    /**
         * Recomputes the list of flat children.
         * @return NavigatorFlatItem[]
         */
    flatChildren: ({
      technologyWithChildren = {},
    }) => (
      IndexStore.setFlatChildren(
        flattenNestedData(
          technologyWithChildren.children || [], null, 0, technologyWithChildren.beta,
        ),
      )
    ),
    technologyPath: ({ technology }) => {
      // regex should match only the first section, no slash - `/documentation/:technology`
      const matches = /(\/documentation\/(?:[^/]+))\/?/.exec(technology.url);
      return matches ? matches[1] : '';
    },
    /**
     * Extracts the technology data, for the currently chosen language
     * @return {Object}
     */
    technologyWithChildren({ navigationIndex, topicProps: { interfaceLanguage }, technologyPath }) {
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
  },
};