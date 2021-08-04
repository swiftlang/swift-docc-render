<!--
  This source file is part of the Swift.org open source project

  Copyright (c) 2021 Apple Inc. and the Swift project authors
  Licensed under Apache License v2.0 with Runtime Library Exception

  See https://swift.org/LICENSE.txt for license information
  See https://swift.org/CONTRIBUTORS.txt for Swift project authors
-->

<template>
  <CodeTheme>
    <Topic
      v-if="topicData"
      v-bind="topicProps"
      :key="topicProps.identifier + topicProps.interfaceLanguage"
    />
  </CodeTheme>
</template>

<script>
import {
  fetchDataForRouteEnter,
  shouldFetchDataForRouteUpdate,
} from 'docc-render/utils/data';
import DocumentationTopic from 'theme/components/DocumentationTopic.vue';
import DocumentationTopicStore from 'docc-render/stores/DocumentationTopicStore';
import CodeTheme from 'docc-render/components/Tutorial/CodeTheme.vue';
import CodeThemeStore from 'docc-render/stores/CodeThemeStore';
import performanceMetrics from 'docc-render/mixins/performanceMetrics';
import onPageLoadScrollToFragment from 'docc-render/mixins/onPageLoadScrollToFragment';

export default {
  name: 'DocumentationTopic',
  components: {
    Topic: DocumentationTopic,
    CodeTheme,
  },
  mixins: [performanceMetrics, onPageLoadScrollToFragment],
  data() {
    return { topicData: null };
  },
  computed: {
    store() {
      return DocumentationTopicStore;
    },
    topicProps() {
      const {
        abstract,
        defaultImplementationsSections,
        deprecationSummary,
        downloadNotAvailableSummary,
        diffAvailability,
        hierarchy,
        identifier: {
          interfaceLanguage,
          url: identifier,
        },
        metadata: {
          extends: extendsFramework,
          conformance,
          modules,
          platforms,
          required: isRequirement,
          roleHeading,
          title = '',
          tags = [],
        } = {},
        primaryContentSections,
        relationshipsSections,
        references = {},
        sampleCodeDownload,
        topicSections,
        seeAlsoSections,
        variants,
      } = this.topicData;
      return {
        abstract,
        conformance,
        defaultImplementationsSections,
        deprecationSummary,
        downloadNotAvailableSummary,
        diffAvailability,
        hierarchy,
        identifier,
        interfaceLanguage,
        isRequirement,
        modules,
        platforms,
        primaryContentSections,
        relationshipsSections,
        references,
        roleHeading,
        sampleCodeDownload,
        title,
        topicSections,
        seeAlsoSections,
        variants,
        extendsFramework,
        tags: tags.slice(0, 1), // make sure we only show the first tag
      };
    },
  },
  methods: {
    handleCodeColorsChange(codeColors) {
      CodeThemeStore.updateCodeColors(codeColors);
    },
  },
  mounted() {
    this.$bridge.on('contentUpdate', (data) => {
      this.topicData = data;
    });

    this.$bridge.on('codeColors', this.handleCodeColorsChange);
    this.$bridge.send({ type: 'requestCodeColors' });
  },
  provide() {
    return { store: this.store };
  },
  beforeDestroy() {
    this.$bridge.off('codeColors', this.handleCodeColorsChange);
  },
  beforeRouteEnter(to, from, next) {
    fetchDataForRouteEnter(to, from, next).then(data => next((vm) => {
      vm.topicData = data; // eslint-disable-line no-param-reassign
    })).catch(next);
  },
  beforeRouteUpdate(to, from, next) {
    if (shouldFetchDataForRouteUpdate(to, from)) {
      fetchDataForRouteEnter(to, from, next).then((data) => {
        this.topicData = data;
        next();
      }).catch(next);
    } else {
      next();
    }
  },
  created() {
    this.store.reset();
  },
  watch: {
    topicData() {
      this.$nextTick(() => {
        // Send a 'rendered' message to the host when new data has been patched onto the DOM.
        this.newContentMounted();
      });
    },
  },
};
</script>
