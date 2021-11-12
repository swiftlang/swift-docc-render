<!--
  This source file is part of the Swift.org open source project

  Copyright (c) 2021 Apple Inc. and the Swift project authors
  Licensed under Apache License v2.0 with Runtime Library Exception

  See https://swift.org/LICENSE.txt for license information
  See https://swift.org/CONTRIBUTORS.txt for Swift project authors
-->

<template>
  <Overview v-if="topicData" v-bind="overviewProps" :key="topicKey" />
</template>

<script>
import {
  fetchDataForRouteEnter,
  shouldFetchDataForRouteUpdate,
} from 'docc-render/utils/data';
import performanceMetrics from 'docc-render/mixins/performanceMetrics';
import TutorialsOverview from 'theme/components/TutorialsOverview.vue';
import onPageLoadScrollToFragment from 'docc-render/mixins/onPageLoadScrollToFragment';

export default {
  name: 'TutorialsOverview',
  components: { Overview: TutorialsOverview },
  mixins: [performanceMetrics, onPageLoadScrollToFragment],
  data() {
    return { topicData: null };
  },
  computed: {
    overviewProps: ({
      topicData: {
        metadata,
        references,
        sections,
      },
    }) => ({
      metadata,
      references,
      sections,
    }),
    topicKey: ({ $route, topicData }) => [
      $route.path,
      topicData.identifier.interfaceLanguage,
    ].join(),
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
