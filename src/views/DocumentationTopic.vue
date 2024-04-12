<!--
  This source file is part of the Swift.org open source project

  Copyright (c) 2021-2024 Apple Inc. and the Swift project authors
  Licensed under Apache License v2.0 with Runtime Library Exception

  See https://swift.org/LICENSE.txt for license information
  See https://swift.org/CONTRIBUTORS.txt for Swift project authors
-->

<template>
  <CodeTheme>
    <template>
      <DocumentationLayout
        v-if="topicData"
        v-bind="baseViewProps"
      >
        <template #title>
          <component
            :is="rootLink ? 'router-link' : 'span'"
            :to="rootLink"
            class="nav-title-link"
          >
            {{ $t('documentation.title') }}
          </component>
        </template>
        <template #default>
          <Topic
            v-bind="topicProps"
            :key="topicKey"
            :objcPath="objcPath"
            :swiftPath="swiftPath"
            :isSymbolDeprecated="isSymbolDeprecated"
            :isSymbolBeta="isSymbolBeta"
            :languagePaths="languagePaths"
            :enableOnThisPageNav="enableOnThisPageNav"
            :enableMinimized="enableMinimized"
            :hierarchyItems="hierarchyItems"
          />
        </template>
      </DocumentationLayout>
    </template>
  </CodeTheme>
</template>

<script>
import { apply } from 'docc-render/utils/json-patch';
import { TopicRole } from 'docc-render/constants/roles';
import { getSetting } from 'docc-render/utils/theme-settings';
import {
  clone,
  fetchDataForRouteEnter,
  shouldFetchDataForRouteUpdate,
} from 'docc-render/utils/data';
import DocumentationTopic from 'theme/components/DocumentationTopic.vue';
import DocumentationLayout from 'docc-render/components/DocumentationLayout.vue';
import DocumentationTopicStore from 'docc-render/stores/DocumentationTopicStore';
import Language from 'docc-render/constants/Language';
import OnThisPageRegistrator from 'docc-render/mixins/onThisPageRegistrator';
import { updateLocale } from 'theme/utils/i18n-utils';
import { compareVersions, combineVersions } from 'docc-render/utils/schema-version-check';
import communicationBridgeUtils from 'docc-render/mixins/communicationBridgeUtils';
import CodeTheme from 'docc-render/components/Tutorial/CodeTheme.vue';
import CodeThemeStore from 'docc-render/stores/CodeThemeStore';

const { extractProps } = DocumentationTopic.methods;

const MIN_RENDER_JSON_VERSION_WITH_INDEX = '0.3.0';

export default {
  name: 'DocumentationTopicView',
  constants: { MIN_RENDER_JSON_VERSION_WITH_INDEX },
  components: {
    CodeTheme,
    Topic: DocumentationTopic,
    DocumentationLayout,
  },
  mixins: [OnThisPageRegistrator, communicationBridgeUtils],
  props: {
    enableMinimized: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      topicDataDefault: null,
      topicDataObjc: null,
      store: DocumentationTopicStore,
    };
  },
  computed: {
    baseViewProps: ({
      topicProps: {
        diffAvailability,
        interfaceLanguage,
        references,
      },
      enableNavigator,
      technology,
      parentTopicIdentifiers,
      objcPath,
      swiftPath,
    }) => ({
      diffAvailability,
      interfaceLanguage,
      references,
      enableNavigator,
      technology,
      parentTopicIdentifiers,
      objcPath,
      swiftPath,
    }),
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
      return extractProps(this.topicData);
    },
    // The `hierarchy.paths` array will contain zero or more subarrays, each
    // representing a "path" of parent topic IDs that could be considered the
    // hierarchy/breadcrumb for a given topic. We choose to render only the
    // one, that has the same path as the current URL.
    parentTopicIdentifiers: ({ topicProps: { hierarchy, references }, $route }) => {
      if (!hierarchy) return [];
      const { paths = [] } = hierarchy;
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
    enableOnThisPageNav: ({ isTargetIDE }) => (
      !getSetting(['features', 'docs', 'onThisPageNavigator', 'disable'], false)
      && !isTargetIDE
    ),
    // Always disable the navigator for IDE targets. For other targets, detect whether the
    // RenderJSON version is in the required range.
    enableNavigator: ({ isTargetIDE, topicDataDefault }) => !isTargetIDE && (
      compareVersions(
        combineVersions(topicDataDefault.schemaVersion), MIN_RENDER_JSON_VERSION_WITH_INDEX,
      ) >= 0
    ),
    /**
     * Returns the first(root) hierarchy item reference
     * @return {Object}
     */
    rootHierarchyReference: ({ parentTopicIdentifiers, topicProps: { references } }) => (
      references[parentTopicIdentifiers[0]] || {}
    ),
    /**
     * Returns whether the root link is a technology page.
     * @return {boolean}
     */
    isRootTechnologyLink: ({ rootHierarchyReference: { kind } }) => kind === 'technologies',
    /**
     * Strips out the first link, if is the root Technologies link.
     * @return {string[]}
     */
    hierarchyItems: ({ parentTopicIdentifiers, isRootTechnologyLink }) => (
      isRootTechnologyLink ? parentTopicIdentifiers.slice(1) : parentTopicIdentifiers
    ),
    /**
     * Returns the root url reference object, if is a `technologies` link.
     * Otherwise returns a manual route query object.
     * @return {Object}
     */
    rootLink: ({
      isRootTechnologyLink, rootHierarchyReference, $route,
    }) => (isRootTechnologyLink
      ? {
        path: rootHierarchyReference.url,
        query: $route.query,
      } : null),
  },
  methods: {
    handleCodeColorsChange(codeColors) {
      CodeThemeStore.updateCodeColors(codeColors);
    },
    applyObjcOverrides() {
      this.topicDataObjc = apply(clone(this.topicData), this.objcOverrides);
    },
  },
  mounted() {
    this.$bridge.on('contentUpdate', this.handleContentUpdateFromBridge);
    this.$bridge.on('codeColors', this.handleCodeColorsChange);
    this.$bridge.send({ type: 'requestCodeColors' });
  },
  beforeDestroy() {
    this.$bridge.off('contentUpdate', this.handleContentUpdateFromBridge);
    this.$bridge.off('codeColors', this.handleCodeColorsChange);
  },
  inject: {
    isTargetIDE: {
      default() {
        return false;
      },
    },
  },
  beforeRouteEnter(to, from, next) {
    // skip fetching, and rely on data being provided via $bridge
    if (to.meta.skipFetchingData) {
      // notify the $bridge, the page is ready
      next(vm => vm.newContentMounted());
      return;
    }

    fetchDataForRouteEnter(to, from, next).then(data => next((vm) => {
      updateLocale(to.params.locale, vm);

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
        updateLocale(to.params.locale, this);
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
