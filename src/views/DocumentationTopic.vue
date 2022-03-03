<!--
  This source file is part of the Swift.org open source project

  Copyright (c) 2021 Apple Inc. and the Swift project authors
  Licensed under Apache License v2.0 with Runtime Library Exception

  See https://swift.org/LICENSE.txt for license information
  See https://swift.org/CONTRIBUTORS.txt for Swift project authors
-->

<template>
  <CodeTheme class="doc-topic-view">
    <template v-if="topicData">
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
        @toggle-sidenav="isSideNavOpen = !isSideNavOpen"
      />
      <component
        :is="enableNavigator ? 'AdjustableSidebarWidth' : 'div'"
        v-bind="sidebarProps"
        v-on="sidebarListeners"
      >
        <template #aside="{ scrollLockID }">
          <aside class="doc-topic-aside">
            <NavigatorDataProvider
              :interface-language="topicProps.interfaceLanguage"
              :technology="technology"
              :withAPIChanges="!!$route.query.changes"
            >
              <template #default="slotProps">
                <Navigator
                  :parent-topic-identifiers="navigatorParentTopicIdentifiers"
                  :technology="slotProps.technology || technology"
                  :is-fetching="slotProps.isFetching"
                  :api-changes="slotProps.apiChanges"
                  :references="topicProps.references"
                  :scrollLockID="scrollLockID"
                  @close="isSideNavOpen = false"
                />
              </template>
            </NavigatorDataProvider>
          </aside>
        </template>
        <Topic
          v-bind="topicProps"
          :key="topicKey"
          :objcPath="objcPath"
          :swiftPath="swiftPath"
          :isSymbolDeprecated="isSymbolDeprecated"
          :isSymbolBeta="isSymbolBeta"
          :languagePaths="languagePaths"
        />
      </component>
    </template>
  </CodeTheme>
</template>

<script>
import { apply } from 'docc-render/utils/json-patch';
import { getSetting } from 'docc-render/utils/theme-settings';
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
import AdjustableSidebarWidth from 'docc-render/components/AdjustableSidebarWidth.vue';
import Navigator from 'docc-render/components/Navigator.vue';
import DocumentationNav from 'theme/components/DocumentationTopic/DocumentationNav.vue';

export default {
  name: 'DocumentationTopicView',
  components: {
    Navigator,
    AdjustableSidebarWidth,
    NavigatorDataProvider,
    Topic: DocumentationTopic,
    CodeTheme,
    Nav: DocumentationNav,
  },
  mixins: [performanceMetrics, onPageLoadScrollToFragment],
  data() {
    return {
      topicDataDefault: null,
      topicDataObjc: null,
      isSideNavOpen: false,
      store: DocumentationTopicStore,
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
          extends: extendsTechnology,
          conformance,
          modules,
          platforms,
          required: isRequirement = false,
          roleHeading,
          title = '',
          tags = [],
          role,
          symbolKind = '',
        } = {},
        primaryContentSections,
        relationshipsSections,
        references = {},
        sampleCodeDownload,
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
        seeAlsoSections,
        variantOverrides,
        extendsTechnology,
        symbolKind,
        tags: tags.slice(0, 1), // make sure we only show the first tag
      };
    },
    // The `hierarchy.paths` array will contain zero or more subarrays, each
    // representing a "path" of parent topic IDs that could be considered the
    // hierarchy/breadcrumb for a given topic. We choose to render only the
    // first one.
    parentTopicIdentifiers: ({ topicProps: { hierarchy: { paths: [ids = []] = [] } } }) => ids,
    navigatorParentTopicIdentifiers: ({ topicProps: { hierarchy: { paths = [] } } }) => (
      paths.slice(-1)[0]
    ),
    technology: ({
      $route,
      topicProps: {
        identifier, references, role, title,
      },
      parentTopicIdentifiers,
    }) => {
      if (!parentTopicIdentifiers.length) return references[identifier];
      const first = references[parentTopicIdentifiers[0]];
      if (first.kind !== 'technologies') return first;

      // if there is a top level collection that does not have a reference to
      // itself, manufacture a minimal one using other available data
      if (role === TopicRole.collection && !references[identifier]) {
        return { title, url: $route.path };
      }

      return references[parentTopicIdentifiers[1]] || references[identifier];
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
    // Always disable the navigator for IDE targets. For other targets, allow
    // this feature to be enabled through the `features.docs.navigator.enable`
    // setting in `theme-settings.json`
    enableNavigator: ({ isTargetIDE }) => !isTargetIDE && (
      getSetting(['features', 'docs', 'navigator', 'enable'], false)
    ),
    sidebarProps: ({ isSideNavOpen, enableNavigator }) => (
      enableNavigator
        ? { class: 'full-width-container topic-wrapper', openExternally: isSideNavOpen }
        : { class: 'static-width-container topic-wrapper' }
    ),
    sidebarListeners() {
      return this.enableNavigator ? ({
        'update:openExternally': (v) => { this.isSideNavOpen = v; },
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
  display: flex;
  flex-flow: column;
  background: var(--colors-text-background, var(--color-text-background));
}

.doc-topic-aside {
  height: 100%;
  box-sizing: border-box;
  border-right: 1px solid var(--color-grid);

  @include breakpoint(medium, nav) {
    background: var(--color-fill);
    border-right: none;

    .animating & {
      border-right: 1px solid var(--color-grid);
    }
  }
}

.topic-wrapper {
  flex: 1 1 auto;
  width: 100%;
}

.full-width-container {
  @include inTargetWeb {
    @include breakpoint-full-width-container()
  }
}
</style>
