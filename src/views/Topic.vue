<!--
  This source file is part of the Swift.org open source project

  Copyright (c) 2021 Apple Inc. and the Swift project authors
  Licensed under Apache License v2.0 with Runtime Library Exception

  See https://swift.org/LICENSE.txt for license information
  See https://swift.org/CONTRIBUTORS.txt for Swift project authors
-->

<template>
  <div>
    <component
      v-if="topicData"
      v-bind="propsFor(topicData)"
      :is="componentFor(topicData)"
      :key="topicKey"
      :hierarchy="hierarchy"
    />
  </div>
</template>

<script>
import {
  fetchDataForRouteEnter,
  shouldFetchDataForRouteUpdate,
} from 'docc-render/utils/data';

import TopicStore from 'docc-render/stores/TopicStore';
import Article from 'docc-render/components/Article.vue';
import Tutorial from 'docc-render/components/Tutorial.vue';

import communicationBridgeUtils from 'docc-render/mixins/communicationBridgeUtils';
import onPageLoadScrollToFragment from 'docc-render/mixins/onPageLoadScrollToFragment';

const TopicKind = {
  article: 'article',
  tutorial: 'project',
};

export default {
  name: 'Topic',
  inject: {
    isTargetIDE: {
      default: false,
    },
  },
  mixins: [communicationBridgeUtils, onPageLoadScrollToFragment],
  data() {
    return {
      topicData: null,
    };
  },
  computed: {
    // Height of the navigation bar, in pixels.
    navigationBarHeight() {
      return this.isTargetIDE ? 0 : 52;
    },
    store() {
      return TopicStore;
    },
    hierarchy() {
      const { hierarchy = {} } = this.topicData;
      // Provide a default value for backwards compatibility.
      const { technologyNavigation = ['overview', 'tutorials', 'resources'] } = hierarchy || {};

      return {
        ...hierarchy,
        technologyNavigation,
      };
    },
    topicKey: ({ $route, topicData }) => [
      $route.path,
      topicData.identifier.interfaceLanguage,
    ].join(),
  },
  beforeRouteEnter(to, from, next) {
    if (to.meta.skipFetchingData) {
      next(vm => vm.newContentMounted());
      return;
    }
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
  mounted() {
    this.$bridge.on('contentUpdate', this.handleContentUpdateFromBridge);
  },
  beforeDestroy() {
    this.$bridge.off('contentUpdate', this.handleContentUpdateFromBridge);
  },
  methods: {
    componentFor(topic) {
      const { kind } = topic;
      return {
        [TopicKind.article]: Article,
        [TopicKind.tutorial]: Tutorial,
      }[kind];
    },
    propsFor(topic) {
      const {
        hierarchy,
        kind,
        metadata,
        references,
        sections,
        identifier,
      } = topic;
      return {
        [TopicKind.article]: {
          hierarchy,
          metadata,
          references,
          sections,
          identifierUrl: identifier.url,
        },
        [TopicKind.tutorial]: {
          hierarchy,
          metadata,
          references,
          sections,
          identifierUrl: identifier.url,
        },
      }[kind];
    },
  },
  provide() {
    return {
      navigationBarHeight: this.navigationBarHeight,
      store: this.store,
    };
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
