<!--
  This source file is part of the Swift.org open source project

  Copyright (c) 2022 Apple Inc. and the Swift project authors
  Licensed under Apache License v2.0 with Runtime Library Exception

  See https://swift.org/LICENSE.txt for license information
  See https://swift.org/CONTRIBUTORS.txt for Swift project authors
-->

<script>
import { fetchIndexPathsData } from 'docc-render/utils/data';
import Language from 'docc-render/constants/Language';

/**
 * Fetches the sidebar navigator data and provides it via a scoped slot,
 * extracting for current language
 */
export default {
  name: 'NavigatorDataProvider',
  props: {
    interfaceLanguage: {
      type: String,
      default: Language.swift.key.url,
    },
    technology: {
      type: Object,
      required: true,
    },
    apiChangesVersion: {
      type: String,
      default: '',
    },
  },
  data() {
    return {
      isFetching: false,
      errorFetching: false,
      isFetchingAPIChanges: false,
      navigationIndex: {
        [Language.swift.key.url]: [],
      },
      navigationReferences: {},
      diffs: null,
    };
  },
  computed: {
    technologyPath: ({ technology }) => {
      // regex should match only the first section, no slash - `/documentation/:technology`
      const matches = /(\/documentation\/(?:[^/]+))\/?/.exec(technology.url);
      return matches ? matches[1] : '';
    },
    /**
     * Extracts the technology data, for the currently chosen language
     * @return {Object}
     */
    technologyWithChildren({ navigationIndex, interfaceLanguage, technologyPath }) {
      // get the technologies for the current language
      let currentLangTechnologies = navigationIndex[interfaceLanguage] || [];
      // if no such items, we use the default swift one
      if (!currentLangTechnologies.length) {
        currentLangTechnologies = navigationIndex[Language.swift.key.url] || [];
      }
      // find the current technology
      return currentLangTechnologies.find(t => (
        technologyPath.toLowerCase() === t.path.toLowerCase()
      ));
    },
  },
  created() {
    this.fetchIndexData();
  },
  methods: {
    async fetchIndexData() {
      try {
        this.isFetching = true;
        const { interfaceLanguages, references } = await fetchIndexPathsData();
        this.navigationIndex = Object.freeze(interfaceLanguages);
        this.navigationReferences = Object.freeze(references);
      } catch (e) {
        this.errorFetching = true;
      } finally {
        this.isFetching = false;
      }
    },
  },
  render() {
    return this.$scopedSlots.default({
      technology: this.technologyWithChildren,
      isFetching: this.isFetching,
      errorFetching: this.errorFetching,
      isFetchingAPIChanges: this.isFetchingAPIChanges,
      apiChanges: this.diffs,
      references: this.navigationReferences,
    });
  },
};
</script>
