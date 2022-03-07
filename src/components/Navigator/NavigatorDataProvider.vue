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
    apiChanges: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      isFetching: false,
      isFetchingAPIChanges: false,
      navigationIndex: {
        [Language.swift.key.url]: [],
      },
      diffs: {},
    };
  },
  computed: {
    /**
     * Extracts the technology data, for the currently chosen language
     * @return {Object}
     */
    technologyWithChildren({ navigationIndex, interfaceLanguage, technology }) {
      // get the technologies for the current language
      let currentLangTechnologies = navigationIndex[interfaceLanguage] || [];
      // if no such items, we use the default swift one
      if (!currentLangTechnologies.length) {
        currentLangTechnologies = navigationIndex[Language.swift.key.url];
      }
      // find the current technology
      return currentLangTechnologies.find(t => t.path === technology.url);
    },
  },
  created() {
    this.fetchIndexData();
  },
  methods: {
    async fetchIndexData() {
      try {
        this.isFetching = true;
        const { interfaceLanguages } = await fetchIndexPathsData();
        this.navigationIndex = interfaceLanguages;
      } catch (e) {
        console.error(e);
      } finally {
        this.isFetching = false;
      }
    },
  },
  render() {
    return this.$scopedSlots.default({
      technology: this.technologyWithChildren,
      isFetching: this.isFetching,
      isFetchingAPIChanges: this.isFetchingAPIChanges,
      apiChanges: this.diffs,
    });
  },
};
</script>
