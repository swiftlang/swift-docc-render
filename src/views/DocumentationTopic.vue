<!--
  This source file is part of the Swift.org open source project

  Copyright (c) 2021-2022 Apple Inc. and the Swift project authors
  Licensed under Apache License v2.0 with Runtime Library Exception

  See https://swift.org/LICENSE.txt for license information
  See https://swift.org/CONTRIBUTORS.txt for Swift project authors
-->

<template>
  <div :class="{ 'modal-open': quickNavigationStore.state.showQuickNavigation }">
    <div v-show="quickNavigationStore.state.showQuickNavigation">
      <QuickNavigationModal />
    </div>
    <CodeTheme class="doc-topic-view">
      <template v-if="topicData">
        <component
          :is="enableNavigator ? 'AdjustableSidebarWidth' : 'StaticContentWidth'"
          v-bind="sidebarProps"
          v-on="sidebarListeners"
        >
          <template #aside="{ scrollLockID, breakpoint }">
            <div class="doc-topic-aside">
              <NavigatorDataProvider
                :interface-language="topicProps.interfaceLanguage"
                :technology="technology"
                :api-changes-version="store.state.selectedAPIChangesVersion"
              >
                <template #default="slotProps">
                  <transition name="delay-hiding">
                    <Navigator
                      v-show="sidenavVisibleOnMobile || breakpoint === BreakpointName.large"
                      :parent-topic-identifiers="parentTopicIdentifiers"
                      :technology="slotProps.technology || technology"
                      :is-fetching="slotProps.isFetching"
                      :error-fetching="slotProps.errorFetching"
                      :api-changes="slotProps.apiChanges"
                      :references="topicProps.references"
                      :navigator-references="slotProps.references"
                      :scrollLockID="scrollLockID"
                      :render-filter-on-top="breakpoint !== BreakpointName.large"
                      @close="handleToggleSidenav(breakpoint)"
                    />
                  </transition>
                </template>
              </NavigatorDataProvider>
            </div>
          </template>
          <Nav
            v-if="!isTargetIDE"
            :title="topicProps.title"
            :diffAvailability="topicProps.diffAvailability"
            :interfaceLanguage="topicProps.interfaceLanguage"
            :objcPath="objcPath"
            :swiftPath="swiftPath"
            :parentTopicIdentifiers="parentTopicIdentifiers"
            :isSymbolDeprecated="isSymbolDeprecated"
            :isSymbolBeta="isSymbolBeta"
            :currentTopicTags="topicProps.tags"
            :references="topicProps.references"
            :isWideFormat="enableNavigator"
            :sidenavHiddenOnLarge="sidenavHiddenOnLarge"
            @toggle-sidenav="handleToggleSidenav"
          />
          <Topic
            v-bind="topicProps"
            :key="topicKey"
            :objcPath="objcPath"
            :swiftPath="swiftPath"
            :isSymbolDeprecated="isSymbolDeprecated"
            :isSymbolBeta="isSymbolBeta"
            :languagePaths="languagePaths"
            :enableOnThisPageNav="enableOnThisPageNav"
          />
        </component>
      </template>
    </CodeTheme>
  </div>
</template>

<script>
import { apply } from 'docc-render/utils/json-patch';
import { TopicRole } from 'docc-render/constants/roles';
import {
  clone,
  fetchDataForRouteEnter,
  shouldFetchDataForRouteUpdate,
} from 'docc-render/utils/data';
import DocumentationTopic from 'theme/components/DocumentationTopic.vue';
import DocumentationTopicStore from 'docc-render/stores/DocumentationTopicStore';
import CodeTheme from 'docc-render/components/Tutorial/CodeTheme.vue';
import CodeThemeStore from 'docc-render/stores/CodeThemeStore';
import Language from 'docc-render/constants/Language';
import performanceMetrics from 'docc-render/mixins/performanceMetrics';
import onPageLoadScrollToFragment from 'docc-render/mixins/onPageLoadScrollToFragment';
import NavigatorDataProvider from 'theme/components/Navigator/NavigatorDataProvider.vue';
import QuickNavigationModal from 'docc-render/components/Navigator/QuickNavigationModal.vue';
import AdjustableSidebarWidth from 'docc-render/components/AdjustableSidebarWidth.vue';
import Navigator from 'docc-render/components/Navigator.vue';
import DocumentationNav from 'theme/components/DocumentationTopic/DocumentationNav.vue';
import StaticContentWidth from 'docc-render/components/DocumentationTopic/StaticContentWidth.vue';
import { compareVersions, combineVersions } from 'docc-render/utils/schema-version-check';
import { BreakpointName } from 'docc-render/utils/breakpoints';
import { storage } from 'docc-render/utils/storage';
import OnThisPageRegistrator from 'docc-render/mixins/onThisPageRegistrator';
import QuickNavigationStore from '../stores/QuickNavigationStore';

const MIN_RENDER_JSON_VERSION_WITH_INDEX = '0.3.0';
const NAVIGATOR_HIDDEN_ON_LARGE_KEY = 'navigator-hidden-large';

export default {
  name: 'DocumentationTopicView',
  constants: { MIN_RENDER_JSON_VERSION_WITH_INDEX, NAVIGATOR_HIDDEN_ON_LARGE_KEY },
  components: {
    Navigator,
    AdjustableSidebarWidth,
    StaticContentWidth,
    NavigatorDataProvider,
    Topic: DocumentationTopic,
    CodeTheme,
    Nav: DocumentationNav,
    QuickNavigationModal,
  },
  mixins: [performanceMetrics, onPageLoadScrollToFragment, OnThisPageRegistrator],
  data() {
    return {
      topicDataDefault: null,
      topicDataObjc: null,
      sidenavVisibleOnMobile: false,
      sidenavHiddenOnLarge: storage.get(NAVIGATOR_HIDDEN_ON_LARGE_KEY, false),
      showQuickNavigationModal: false,
      store: DocumentationTopicStore,
      quickNavigationStore: QuickNavigationStore,
      BreakpointName,
    };
  },
  computed: {
    objcOverrides: ({ topicData }) => {
      const { variantOverrides = [] } = topicData || {};

      const isObjcTrait = ({ interfaceLanguage }) => (
        interfaceLanguage === Language.objectiveC.key.api
      );
      const hasObjcTrait = ({ traits }) => traits.some(isObjcTrait);

      const objcVariant = variantOverrides.find(hasObjcTrait);
      return objcVariant ? objcVariant.patch : null;
    },
    topicData: {
      get() {
        return this.topicDataObjc ? this.topicDataObjc : this.topicDataDefault;
      },
      set(data) {
        this.topicDataDefault = data;
      },
    },
    topicKey: ({ $route, topicProps }) => [
      $route.path,
      topicProps.interfaceLanguage,
    ].join(),
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
          conformance,
          modules,
          platforms,
          required: isRequirement = false,
          roleHeading,
          title = '',
          tags = [],
          role,
          symbolKind = '',
          remoteSource,
          images: pageImages = [],
        } = {},
        primaryContentSections,
        relationshipsSections,
        references = {},
        sampleCodeDownload,
        topicSectionsStyle,
        topicSections,
        seeAlsoSections,
        variantOverrides,
      } = this.topicData;
      return {
        abstract,
        conformance,
        defaultImplementationsSections,
        deprecationSummary,
        downloadNotAvailableSummary,
        diffAvailability,
        hierarchy,
        role,
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
        topicSectionsStyle,
        seeAlsoSections,
        variantOverrides,
        symbolKind,
        tags: tags.slice(0, 1), // make sure we only show the first tag
        remoteSource,
        pageImages,
      };
    },
    // The `hierarchy.paths` array will contain zero or more subarrays, each
    // representing a "path" of parent topic IDs that could be considered the
    // hierarchy/breadcrumb for a given topic. We choose to render only the
    // one, that has the same path as the current URL.
    parentTopicIdentifiers: ({ topicProps: { hierarchy: { paths = [] }, references }, $route }) => {
      if (!paths.length) return [];
      return paths.find((identifiers) => {
        const rootIdentifier = identifiers.find(id => references[id] && references[id].kind !== 'technologies');
        const rootReference = rootIdentifier && references[rootIdentifier];
        // if there is an item, check if the current url starts with it
        return rootReference && $route.path.toLowerCase().startsWith(
          rootReference.url.toLowerCase(),
        );
      }) || paths[0];
    },
    technology: ({
      $route,
      topicProps: {
        identifier, references, role, title,
      },
      parentTopicIdentifiers,
    }) => {
      // create an end-case fallback technology
      const fallback = { title, url: $route.path };
      // get the reference to the current page
      const currentPageReference = references[identifier];
      // if there are no parent topics at all, use the current reference or a fallback one
      if (!parentTopicIdentifiers.length) return currentPageReference || fallback;
      // try to use the first parent topic reference, if not a technology kind
      const first = references[parentTopicIdentifiers[0]];
      if (first && first.kind !== 'technologies') return first;

      // if there is a top level collection that does not have a reference to
      // itself, manufacture a minimal one using other available data.
      // This is to guard against bad data or missing references.
      if (role === TopicRole.collection && !currentPageReference) {
        return fallback;
      }
      // use the second parent topic identifier, if there was a first,
      // otherwise fallback the current page reference or the final fallback
      return (first && references[parentTopicIdentifiers[1]]) || currentPageReference || fallback;
    },
    // Use `variants` data to build a map of paths associated with each unique
    // `interfaceLanguage` trait.
    languagePaths: ({ topicData: { variants = [] } }) => variants.reduce((memo, variant) => (
      variant.traits.reduce((_memo, trait) => (!trait.interfaceLanguage ? _memo : ({
        ..._memo,
        [trait.interfaceLanguage]: (_memo[trait.interfaceLanguage] || []).concat(variant.paths),
      })), memo)
    ), {}),
    // The first path for any variant with an "occ" interface language trait (if any)
    objcPath: ({ languagePaths: { [Language.objectiveC.key.api]: [path] = [] } = {} }) => path,
    // The first path for any variant with a "swift" interface language trait (if any)
    swiftPath: ({ languagePaths: { [Language.swift.key.api]: [path] = [] } = {} }) => path,
    isSymbolBeta:
      ({ topicProps: { platforms } }) => !!(platforms
        && platforms.length
        && platforms.every(platform => platform.beta)),
    isSymbolDeprecated:
      ({ topicProps: { platforms, deprecationSummary } }) => !!(
        (deprecationSummary && deprecationSummary.length > 0)
        || (platforms
          && platforms.length
          && platforms.every(platform => platform.deprecatedAt)
        )
      ),
    // Always disable the navigator for IDE targets. For other targets, detect whether the
    // RenderJSON version is in the required range.
    enableNavigator: ({ isTargetIDE, topicDataDefault }) => !isTargetIDE && (
      compareVersions(
        combineVersions(topicDataDefault.schemaVersion), MIN_RENDER_JSON_VERSION_WITH_INDEX,
      ) >= 0
    ),
    enableOnThisPageNav: ({ isTargetIDE, store }) => (
      !isTargetIDE && store.state.onThisPageSections.length > 2
    ),
    sidebarProps: ({ sidenavVisibleOnMobile, enableNavigator, sidenavHiddenOnLarge }) => (
      enableNavigator
        ? {
          class: 'full-width-container topic-wrapper',
          shownOnMobile: sidenavVisibleOnMobile,
          hiddenOnLarge: sidenavHiddenOnLarge,
        }
        : { class: 'static-width-container topic-wrapper' }
    ),
    sidebarListeners() {
      return this.enableNavigator ? ({
        'update:shownOnMobile': this.toggleMobileSidenav,
        'update:hiddenOnLarge': this.toggleLargeSidenav,
      }) : {};
    },
  },
  methods: {
    applyObjcOverrides() {
      this.topicDataObjc = apply(clone(this.topicData), this.objcOverrides);
    },
    handleCodeColorsChange(codeColors) {
      CodeThemeStore.updateCodeColors(codeColors);
    },
    handleToggleSidenav(breakpoint) {
      if (breakpoint === BreakpointName.large) {
        this.toggleLargeSidenav();
      } else {
        this.toggleMobileSidenav();
      }
    },
    toggleLargeSidenav(value = !this.sidenavHiddenOnLarge) {
      this.sidenavHiddenOnLarge = value;
      storage.set(NAVIGATOR_HIDDEN_ON_LARGE_KEY, value);
    },
    toggleMobileSidenav(value = !this.sidenavVisibleOnMobile) {
      this.sidenavVisibleOnMobile = value;
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
    return {
      quickNavigationStore: this.quickNavigationStore,
      store: this.store,
    };
  },
  inject: {
    isTargetIDE: {
      default() {
        return false;
      },
    },
  },
  beforeDestroy() {
    this.$bridge.off('codeColors', this.handleCodeColorsChange);
  },
  beforeRouteEnter(to, from, next) {
    fetchDataForRouteEnter(to, from, next).then(data => next((vm) => {
      vm.topicData = data; // eslint-disable-line no-param-reassign
      if (to.query.language === Language.objectiveC.key.url && vm.objcOverrides) {
        vm.applyObjcOverrides();
      }
    })).catch(next);
  },
  beforeRouteUpdate(to, from, next) {
    if (to.path === from.path && to.query.language === Language.objectiveC.key.url
      && this.objcOverrides) {
      this.applyObjcOverrides();
      next();
    } else if (shouldFetchDataForRouteUpdate(to, from)) {
      fetchDataForRouteEnter(to, from, next).then((data) => {
        this.topicDataObjc = null;
        this.topicData = data;
        if (to.query.language === Language.objectiveC.key.url && this.objcOverrides) {
          this.applyObjcOverrides();
        }
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
<style lang="scss" scoped>
@import 'docc-render/styles/_core.scss';

.doc-topic-view {
  --delay: 1s;
  display: flex;
  flex-flow: column;
  background: var(--colors-text-background, var(--color-text-background));

  .delay-hiding-leave-active {
    // don't hide navigator until delay time has passed
    transition: display var(--delay);
  }
}

.doc-topic-aside {
  height: 100%;
  box-sizing: border-box;
  border-right: 1px solid var(--color-grid);

  @include breakpoint(medium, nav) {
    background: var(--color-fill);
    border-right: none;

    .sidebar-transitioning & {
      border-right: 1px solid var(--color-grid);
    }
  }
}

.modal-open {
  position: fixed;
  width: 100%
}

.topic-wrapper {
  flex: 1 1 auto;
  width: 100%;
}

.full-width-container {
  @include inTargetWeb {
    @include breakpoint-full-width-container();
    @include breakpoints-from(xlarge) {
      border-left: 1px solid var(--color-grid);
      border-right: 1px solid var(--color-grid);
      box-sizing: border-box;
    }
  }
}
</style>
