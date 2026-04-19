<!--
  This source file is part of the Swift.org open source project

  Copyright (c) 2024 Apple Inc. and the Swift project authors
  Licensed under Apache License v2.0 with Runtime Library Exception

  See https://swift.org/LICENSE.txt for license information
  See https://swift.org/CONTRIBUTORS.txt for Swift project authors
-->

<template>
  <DocumentationLayout
    :enableNavigator="true"
    :interfaceLanguage="interfaceLanguage"
    :references="indexState.references"
    :navigatorFixedWidth="296"
    :quickNavNodes="topLevelIndexNodes"
  >
    <template #nav-title="{ className }">
      <h2 :class="className">{{ $t('documentation.title') || 'Documentation' }}</h2>
    </template>

    <template #navigator="{
      scrollLockID,
      breakpoint,
      sidenavVisibleOnMobile,
      handleToggleSidenav,
      enableQuickNavigation,
      openQuickNavigationModal,
    }">
      <Navigator
        key="base-navigator"
        v-show="sidenavVisibleOnMobile || breakpoint === BreakpointName.large"
        v-bind="topLevelNavigatorProps"
        :parent-topic-identifiers="parentTopicIdentifiers"
        :references="references"
        :scrollLockID="scrollLockID"
        :render-filter-on-top="breakpoint !== BreakpointName.large"
        @close="handleToggleSidenav(breakpoint)"
      >
        <template v-if="enableQuickNavigation" #filter>
          <QuickNavigationButton @click.native="openQuickNavigationModal" />
        </template>
        <template #above-navigator-head>
          <slot name="above-navigator-head"/>
        </template>
        <template #navigator-head="{ className }">
          <slot name="nav-title" :className="className" />
        </template>
      </Navigator>
    </template>

    <template #content>
      <main class="index-page">
        <section class="hero">
          <h1 class="hero__title">{{ $t('documentation.hero.title') }}</h1>
          <p class="hero__subtitle">
            {{ $t('documentation.hero.copy') }}
          </p>
        </section>
      </main>
    </template>
  </DocumentationLayout>
</template>

<script>
import Language from 'docc-render/constants/Language';
import DocumentationLayout from 'theme/components/DocumentationLayout.vue';
import Navigator from 'docc-render/components/Navigator.vue';
import QuickNavigationButton from 'docc-render/components/Navigator/QuickNavigationButton.vue';
import DocumentationTopicStore from 'docc-render/stores/DocumentationTopicStore';
import { BreakpointName } from 'docc-render/utils/breakpoints';
import { INDEX_ROOT_KEY } from 'docc-render/constants/sidebar';
import { hashCode } from 'docc-render/utils/navigatorData';
import communicationBridgeUtils from 'docc-render/mixins/communicationBridgeUtils';
import indexDataFetcher from 'theme/mixins/indexDataFetcher';
import indexDataGetter from 'theme/mixins/indexDataGetter';

export default {
  name: 'Index',
  components: {
    DocumentationLayout,
    Navigator,
    QuickNavigationButton,
  },
  mixins: [indexDataFetcher, indexDataGetter, communicationBridgeUtils],
  data: () => ({
    // fallback interface language used by indexDataGetter
    interfaceLanguage: Language.swift.key.url,
    store: DocumentationTopicStore,
    BreakpointName,
  }),
  provide() {
    return {
      store: this.store,
    };
  },
  computed: {
    references() {
      return this.indexState.references;
    },
    parentTopicIdentifiers() {
      return [];
    },
    topLevelIndexNodes() {
      const nodes = this.indexState.topLevelNodes || [];
      const siblingsCount = nodes.length;
      return nodes.map((node, index) => ({
        uid: hashCode(node.path || node.title || `${index}`),
        title: node.title,
        path: node.path,
        type: node.type,
        parent: INDEX_ROOT_KEY,
        childUIDs: [],
        depth: 0,
        index,
        siblingsCount,
      })).filter(item => item.path);
    },
    topLevelNavigatorProps() {
      return {
        ...this.navigatorProps,
        flatChildren: this.topLevelIndexNodes,
        // hide the technology header to avoid duplicate top entry
        technologyProps: null,
      };
    },
  },
  watch: {
    indexNodes() {
      this.$nextTick(this.newContentMounted);
    },
  },
};
</script>

<style scoped lang="scss">
.index-page {
  padding: 32px 28px 56px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
}

.hero {
  color: var(--colors-header-text, var(--color-header-text));
  text-align: center;
}

.hero__subtitle {
  color: var(--colors-text, var(--color-text));
}

</style>
