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
          <h1 class="hero__title">{{ heroTitle }}</h1>
          <p class="hero__lede">
            {{ heroCopy }}
          </p>
        </section>

        <section v-if="documentation.length" class="index-section index-section--grid">
          <header class="index-section__header">
            <h2>Frameworks</h2>
          </header>
          <p v-if="isLoading">Loading index…</p>
          <div v-else class="card-grid">
            <RouterLink
              v-for="doc in documentation"
              :key="doc.path"
              :to="doc.path"
              class="feature-card"
            >
              <div class="feature-card__icon">
                <TopicTypeIcon
                  :type="doc.type || 'module'"
                  :with-colors="false"
                  :shouldCalculateOptimalWidth="false"
                />
              </div>
              <div class="feature-card__body">
                <h3 class="feature-card__title">{{ doc.title || doc.path }}</h3>
              </div>
              <span v-if="doc.beta" class="feature-card__tag">Beta</span>
            </RouterLink>
          </div>
        </section>

        <section v-if="tutorials.length" class="index-section index-section--grid">
          <header class="index-section__header">
            <h2>Tutorials</h2>
          </header>
          <p v-if="isLoading">Loading index…</p>
          <div v-else class="card-grid">
            <RouterLink
              v-for="tutorial in tutorials"
              :key="tutorial.path"
              :to="tutorial.path"
              class="feature-card"
            >
              <div class="feature-card__icon">
                <TopicTypeIcon
                  :type="tutorial.type || 'tutorial'"
                  :with-colors="false"
                  :shouldCalculateOptimalWidth="false"
                />
              </div>
              <div class="feature-card__body">
                <h3 class="feature-card__title">{{ tutorial.title || tutorial.path }}</h3>
              </div>
              <span v-if="tutorial.beta" class="feature-card__tag">Beta</span>
            </RouterLink>
          </div>
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
import TopicTypeIcon from 'docc-render/components/TopicTypeIcon.vue';
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
    TopicTypeIcon,
  },
  mixins: [indexDataFetcher, indexDataGetter, communicationBridgeUtils],
  data: () => ({
    // fallback interface language used by indexDataGetter
    interfaceLanguage: Language.swift.key.url,
    heroTitle: 'Apple Developer Documentation',
    heroCopy: 'Browse the latest sample code, articles, tutorials, and API reference.',
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
    documentation() {
      const docs = this.topLevelIndexNodes
        .filter(node => node.path?.startsWith('/documentation/'));
      return docs;
    },
    tutorials() {
      const tops = this.topLevelIndexNodes
        .filter(node => node.path?.startsWith('/tutorials/'));
      return tops;
    },
    isLoading() {
      const { flatChildren, errorFetching } = this.indexState;
      return !flatChildren && !errorFetching;
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
  max-width: 1200px;
  margin: 0 auto;
  padding: 32px 24px 64px;
}

.index-section {
  margin-top: 32px;
}

.index-section__header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
}

.hero {
  background: linear-gradient(315deg, var(--color-fill-secondary), var(--color-fill-tertiary));
  color: var(--colors-header-text, var(--color-header-text));
  padding: 48px 36px;
  border-radius: 20px;
  box-shadow: 0 20px 60px var(--color-card-shadow);
  text-align: center;
  position: relative;
  overflow: hidden;
}

.hero__title {
  font-size: 2.6rem;
  line-height: 1.2;
  margin: 0 0 12px;
}

.hero__lede {
  margin: 0;
  color: var(--colors-text, var(--color-text));
  font-size: 1.1rem;
}

.index-section--grid {
  margin-top: 40px;
}

.card-grid {
  display: grid;
  gap: 16px;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
}

.feature-card {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 16px;
  background: var(--color-card-background);
  color: var(--color-card-content-text);
  border-radius: 12px;
  border: 1px solid var(--color-link-block-card-border);
  text-decoration: none;
  position: relative;
  transition: transform 0.15s ease, box-shadow 0.15s ease, border-color 0.15s ease;
}

.feature-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 30px var(--color-card-shadow);
  border-color: var(--color-navigator-item-hover);
}

.feature-card__icon {
  font-size: 1.5rem;
}

.feature-card__body {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.feature-card__title {
  margin: 0;
  font-size: 1.1rem;
}

.feature-card__tag {
  align-self: flex-start;
  font-size: 0.75rem;
  padding: 2px 8px;
  border-radius: 999px;
  background: var(--color-standard-yellow);
  color: var(--color-figure-orange);
}

@media (max-width: 768px) {
  .hero {
    padding: 32px 24px;
    text-align: left;
  }

  .hero__title {
    font-size: 2.1rem;
  }
}
</style>
