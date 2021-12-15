<!--
  This source file is part of the Swift.org open source project

  Copyright (c) 2021 Apple Inc. and the Swift project authors
  Licensed under Apache License v2.0 with Runtime Library Exception

  See https://swift.org/LICENSE.txt for license information
  See https://swift.org/CONTRIBUTORS.txt for Swift project authors
-->

<template>
  <div class="doc-topic">
    <Nav
      v-if="!isTargetIDE"
      :title="title"
      :diffAvailability="diffAvailability"
      :interfaceLanguage="interfaceLanguage"
      :objcPath="objcPath"
      :swiftPath="swiftPath"
      :parentTopicIdentifiers="parentTopicIdentifiers"
      :isSymbolDeprecated="isSymbolDeprecated"
      :isSymbolBeta="isSymbolBeta"
      :currentTopicTags="tags"
    />
    <AdjustableSidebarWidth storage-key="sidebar">
      <template #aside>
        <aside class="doc-topic-aside">
          <Navigator
            :interface-language="interfaceLanguage"
            :parent-topic-identifiers="navigatorParentTopicIdentifiers"
          />
        </aside>
      </template>
      <template #default>
        <main class="main" id="main" role="main" tabindex="0">

          <slot name="above-title" />
          <Title :eyebrow="roleHeading">{{ title }}</Title>
          <div class="container content-grid" :class="{ 'full-width': hideSummary }">
            <Description :hasOverview="hasOverview">
              <Abstract v-if="abstract" :content="abstract" />
              <RequirementMetadata
                v-if="isRequirement"
                :defaultImplementationsCount="defaultImplementationsCount"
              />
              <Aside v-if="deprecationSummary && deprecationSummary.length" kind="deprecated">
                <ContentNode :content="deprecationSummary" />
              </Aside>
              <Aside
                v-if="downloadNotAvailableSummary && downloadNotAvailableSummary.length"
                kind="note"
              >
                <ContentNode :content="downloadNotAvailableSummary" />
              </Aside>
              <DownloadButton v-if="sampleCodeDownload" :action="sampleCodeDownload.action" />
            </Description>
            <Summary v-if="!hideSummary">
              <LanguageSwitcher
                v-if="shouldShowLanguageSwitcher"
                :interfaceLanguage="interfaceLanguage"
                :objcPath="objcPath"
                :swiftPath="swiftPath"
              />
              <Availability v-if="platforms" :platforms="platforms" />
              <TechnologyList v-if="modules" :technologies="modules" />
              <TechnologyList
                v-if="extendsTechnology"
                class="extends-technology"
                title="Extends"
                :technologies="[{ name: extendsTechnology }]"
              />
              <OnThisPageNav v-if="onThisPageSections.length > 1" :sections="onThisPageSections" />
            </Summary>
            <PrimaryContent
              v-if="primaryContentSections && primaryContentSections.length"
              :conformance="conformance"
              :sections="primaryContentSections"
            />
          </div>
          <Topics
            v-if="topicSections"
            :sections="topicSections"
            :isSymbolDeprecated="isSymbolDeprecated"
            :isSymbolBeta="isSymbolBeta"
          />
          <DefaultImplementations
            v-if="defaultImplementationsSections"
            :sections="defaultImplementationsSections"
            :isSymbolDeprecated="isSymbolDeprecated"
            :isSymbolBeta="isSymbolBeta"
          />
          <Relationships v-if="relationshipsSections" :sections="relationshipsSections" />
          <!-- NOTE: see also may contain information about other apis, so we cannot
          pass deprecation and beta information -->
          <SeeAlso
            v-if="seeAlsoSections"
            :sections="seeAlsoSections"
          />
          <BetaLegalText v-if="!isTargetIDE && hasBetaContent" />
        </main>
      </template>
    </AdjustableSidebarWidth>
  </div>
</template>

<script>
import Language from 'docc-render/constants/Language';
import pageTitle from 'docc-render/mixins/pageTitle';
import { getSetting } from 'docc-render/utils/theme-settings';

import Aside from 'docc-render/components/ContentNode/Aside.vue';
import DocumentationNav from 'theme/components/DocumentationTopic/DocumentationNav.vue';
import BetaLegalText from 'theme/components/DocumentationTopic/BetaLegalText.vue';
import LanguageSwitcher from 'theme/components/DocumentationTopic/Summary/LanguageSwitcher.vue';
import AdjustableSidebarWidth from 'docc-render/components/AdjustableSidebarWidth.vue';
import Navigator from 'docc-render/components/Navigator.vue';
import Abstract from './DocumentationTopic/Description/Abstract.vue';
import ContentNode from './DocumentationTopic/ContentNode.vue';
import CallToActionButton from './CallToActionButton.vue';
import DefaultImplementations from './DocumentationTopic/DefaultImplementations.vue';
import Description from './DocumentationTopic/Description.vue';
import TechnologyList from './DocumentationTopic/Summary/TechnologyList.vue';
import OnThisPageNav from './DocumentationTopic/Summary/OnThisPageNav.vue';
import PrimaryContent from './DocumentationTopic/PrimaryContent.vue';
import Relationships from './DocumentationTopic/Relationships.vue';
import RequirementMetadata from './DocumentationTopic/Description/RequirementMetadata.vue';
import Availability from './DocumentationTopic/Summary/Availability.vue';
import SeeAlso from './DocumentationTopic/SeeAlso.vue';
import Summary from './DocumentationTopic/Summary.vue';
import Title from './DocumentationTopic/Title.vue';
import Topics from './DocumentationTopic/Topics.vue';

export default {
  name: 'DocumentationTopic',
  mixins: [pageTitle],
  inject: {
    isTargetIDE: {
      default() {
        return false;
      },
    },
    store: {
      default() {
        return {
          reset() {},
          state: { onThisPageSections: [] },
        };
      },
    },
  },
  components: {
    Navigator,
    AdjustableSidebarWidth,
    Abstract,
    Aside,
    BetaLegalText,
    ContentNode,
    DefaultImplementations,
    Description,
    DownloadButton: CallToActionButton,
    TechnologyList,
    LanguageSwitcher,
    Nav: DocumentationNav,
    OnThisPageNav,
    PrimaryContent,
    Relationships,
    RequirementMetadata,
    Availability,
    SeeAlso,
    Summary,
    Title,
    Topics,
  },
  props: {
    abstract: {
      type: Array,
      required: false,
    },
    conformance: {
      type: Object,
      required: false,
    },
    defaultImplementationsSections: {
      type: Array,
      required: false,
    },
    downloadNotAvailableSummary: {
      type: Array,
      required: false,
    },
    deprecationSummary: {
      type: Array,
      required: false,
    },
    diffAvailability: {
      type: Object,
      required: false,
    },
    modules: {
      type: Array,
      required: false,
    },
    hierarchy: {
      type: Object,
      default: () => ({}),
    },
    interfaceLanguage: {
      type: String,
      required: true,
    },
    identifier: {
      type: String,
      required: true,
    },
    isRequirement: {
      type: Boolean,
      default: () => false,
    },
    platforms: {
      type: Array,
      required: false,
    },
    primaryContentSections: {
      type: Array,
      required: false,
    },
    references: {
      type: Object,
      required: true,
    },
    relationshipsSections: {
      type: Array,
      required: false,
    },
    roleHeading: {
      type: String,
      required: false,
    },
    title: {
      type: String,
      required: true,
    },
    topicSections: {
      type: Array,
      required: false,
    },
    sampleCodeDownload: {
      type: Object,
      required: false,
    },
    seeAlsoSections: {
      type: Array,
      required: false,
    },
    variants: {
      type: Array,
      default: () => ([]),
    },
    extendsTechnology: {
      type: String,
    },
    tags: {
      type: Array,
      required: true,
    },
  },
  provide() {
    // NOTE: this is not reactive: if this.references change, the provided value
    // to children will stay the same
    return {
      references: this.references,
      identifier: this.identifier,
      languages: new Set(Object.keys(this.languagePaths)),
      interfaceLanguage: this.interfaceLanguage,
    };
  },
  data() {
    return {
      topicState: this.store.state,
    };
  },
  computed: {
    defaultImplementationsCount() {
      return (this.defaultImplementationsSections || []).reduce(
        (count, section) => count + section.identifiers.length,
        0,
      );
    },
    hasOverview: ({ primaryContentSections = [] }) => primaryContentSections.filter(section => (
      section.kind === PrimaryContent.constants.SectionKind.content
    )).length > 0,
    // Use `variants` data to build a map of paths associated with each unique
    // `interfaceLanguage` trait.
    languagePaths: ({ variants }) => variants.reduce((memo, variant) => (
      variant.traits.reduce((_memo, trait) => (!trait.interfaceLanguage ? _memo : ({
        ..._memo,
        [trait.interfaceLanguage]: (_memo[trait.interfaceLanguage] || []).concat(variant.paths),
      })), memo)
    ), {}),
    // The first path for any variant with an "occ" interface language trait (if any)
    objcPath: ({ languagePaths: { [Language.objectiveC.key.api]: [path] = [] } = {} }) => path,
    // The first path for any variant with a "swift" interface language trait (if any)
    swiftPath: ({ languagePaths: { [Language.swift.key.api]: [path] = [] } = {} }) => path,
    onThisPageSections() {
      return this.topicState.onThisPageSections;
    },
    isSymbolBeta:
      ({ platforms }) => platforms
        && platforms.length
        && platforms.every(platform => platform.beta),
    hasBetaContent:
      ({ platforms }) => platforms
        && platforms.length
        && platforms.some(platform => platform.beta),
    isSymbolDeprecated:
      ({ platforms, deprecationSummary }) => (deprecationSummary && deprecationSummary.length > 0)
        || (platforms
          && platforms.length
          && platforms.every(platform => platform.deprecatedAt)
        ),
    pageTitle: ({ title }) => title,
    // The `hierarchy.paths` array will contain zero or more subarrays, each
    // representing a "path" of parent topic IDs that could be considered the
    // hierarchy/breadcrumb for a given topic. We choose to render only the
    // first one.
    parentTopicIdentifiers: ({ hierarchy: { paths: [ids = []] = [] } }) => ids,
    navigatorParentTopicIdentifiers: ({ hierarchy: { paths = [] } }) => paths.slice(-1)[0],
    shouldShowLanguageSwitcher: ({ objcPath, swiftPath }) => objcPath && swiftPath,
    hideSummary: () => getSetting(['features', 'docs', 'summary', 'hide'], false),
  },
  methods: {
    normalizePath(path) {
      // Sometimes `paths` data from `variants` are prefixed with a leading
      // slash and sometimes they aren't
      return path.startsWith('/') ? path : `/${path}`;
    },
  },
  created() {
    // Switch to the Objective-C variant of a page if the query parameter is not
    // present in the URL _but_ the user has previously selected Objective-C
    // using the navigation toggle (indicating a semi-global preference/mode)
    if (this.topicState.preferredLanguage === Language.objectiveC.key.url
      && this.interfaceLanguage !== Language.objectiveC.key.api
      && this.objcPath && this.$route.query.language !== Language.objectiveC.key.url) {
      const { query } = this.$route;

      this.$nextTick().then(() => {
        this.$router.replace({
          path: this.normalizePath(this.objcPath),
          query: {
            ...query,
            language: Language.objectiveC.key.url,
          },
        });
      });
    }

    this.store.reset();
  },
};
</script>

<style scoped lang="scss">
@import 'docc-render/styles/_core.scss';

.doc-topic {
  background: var(--colors-text-background, var(--color-text-background));
}

#main {
  outline-style: none;
  border-left: 1px solid var(--color-grid);

  @include inTargetIde {
    min-height: 100vh;
    display: flex;
    flex-flow: column wrap;
    border: none;

    & > .contenttable:last-of-type {
      flex: 1;
    }
  }
}

.container {
  @include section-content;
  margin-top: $section-spacing-single-side / 2;
  padding: 0 20px;
}

.content-grid {
  display: grid;
  grid-template-columns: 75% 25%;
  grid-template-rows: auto minmax(0, 1fr);

  @include breakpoint(small) {
    display: block;
  }

  &:before, &:after {
    display: none;
  }

  &.full-width {
    grid-template-columns: 100%;
  }
}

.description {
  grid-column: 1;
}

.summary {
  grid-column: 2;
  grid-row: 1 / -1;
}

.primary-content {
  grid-column: 1;
}

.button-cta {
  margin-top: 2em;
}

.doc-topic-aside {
  padding: 1rem;
}

/deep/ {
  @each $heading in (h3, h4, h5, h6) {
    #{$heading} {
      @include font-styles(documentation-#{$heading});
    }
  }
}
</style>
