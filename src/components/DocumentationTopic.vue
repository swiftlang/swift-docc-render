<!--
  This source file is part of the Swift.org open source project

  Copyright (c) 2021 Apple Inc. and the Swift project authors
  Licensed under Apache License v2.0 with Runtime Library Exception

  See https://swift.org/LICENSE.txt for license information
  See https://swift.org/CONTRIBUTORS.txt for Swift project authors
-->

<template>
  <div class="doc-topic">
    <main class="main" id="main" role="main" tabindex="0">
      <DocumentationHero :type="symbolKind || role" :enhanceBackground="enhanceBackground">
        <slot name="above-title" />
        <Title :eyebrow="roleHeading">{{ title }}</Title>
        <Abstract v-if="abstract" :content="abstract" />
        <div v-if="sampleCodeDownload">
          <DownloadButton class="sample-download" :action="sampleCodeDownload.action" />
        </div>
        <Availability
          v-if="platforms.length || (technologies || []).length"
          :platforms="platforms" :technologies="technologies"
        />
      </DocumentationHero>
        <Summary v-if="!hideSummary && shouldShowLanguageSwitcher">
          <LanguageSwitcher
            v-if="shouldShowLanguageSwitcher"
            :interfaceLanguage="interfaceLanguage"
            :objcPath="objcPath"
            :swiftPath="swiftPath"
          />
        </Summary>
        <div class="container">
          <Description :hasOverview="hasOverview">
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
          </Description>
          <PrimaryContent
            v-if="primaryContentSections && primaryContentSections.length"
            :class="{ 'with-border': !enhanceBackground }"
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
  </div>
</template>

<script>
import Language from 'docc-render/constants/Language';
import metadata from 'docc-render/mixins/metadata';
import { getSetting } from 'docc-render/utils/theme-settings';

import Aside from 'docc-render/components/ContentNode/Aside.vue';
import BetaLegalText from 'theme/components/DocumentationTopic/BetaLegalText.vue';
import LanguageSwitcher from 'theme/components/DocumentationTopic/Summary/LanguageSwitcher.vue';
import DocumentationHero from 'docc-render/components/DocumentationTopic/DocumentationHero.vue';
import Abstract from './DocumentationTopic/Description/Abstract.vue';
import ContentNode from './DocumentationTopic/ContentNode.vue';
import CallToActionButton from './CallToActionButton.vue';
import DefaultImplementations from './DocumentationTopic/DefaultImplementations.vue';
import Description from './DocumentationTopic/Description.vue';
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
  mixins: [metadata],
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
    DocumentationHero,
    Abstract,
    Aside,
    BetaLegalText,
    ContentNode,
    DefaultImplementations,
    Description,
    DownloadButton: CallToActionButton,
    LanguageSwitcher,
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
    languagePaths: {
      type: Object,
      default: () => ({}),
    },
    tags: {
      type: Array,
      required: true,
    },
    objcPath: {
      type: String,
      required: false,
    },
    swiftPath: {
      type: String,
      required: false,
    },
    isSymbolDeprecated: {
      type: Boolean,
      required: false,
    },
    isSymbolBeta: {
      type: Boolean,
      required: false,
    },
    symbolKind: {
      type: String,
      default: '',
    },
    role: {
      type: String,
      default: '',
    },
    technology: {
      type: Object,
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
      symbolKind: this.symbolKind,
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
    hasOverview:
      ({ primaryContentSections = [], abstract = [] }) => primaryContentSections.filter(section => (
        section.kind === PrimaryContent.constants.SectionKind.content
      )).length > 0 || abstract.length > 0,
    onThisPageSections() {
      return this.topicState.onThisPageSections;
    },
    hasBetaContent:
      ({ platforms }) => platforms
        && platforms.length
        && platforms.some(platform => platform.beta),
    pageTitle: ({ title }) => title,
    pageDescription: ({ abstract, extractFirstParagraphText }) => (
      abstract ? extractFirstParagraphText(abstract) : null
    ),
    shouldShowLanguageSwitcher: ({ objcPath, swiftPath }) => objcPath && swiftPath,
    hideSummary: () => getSetting(['features', 'docs', 'summary', 'hide'], false),
    enhanceBackground: ({ symbolKind }) => (symbolKind ? (symbolKind === 'module') : true),
    technologies({ modules = [], technology }) {
      const technologyList = modules.reduce((list, module) => {
        list.push(module.name);
        return list.concat(module.relatedModules || []);
      }, []);
      // show modules if page belongs to/require multiple technologies
      // or if name doesn't match root of page
      return technologyList.length === 1
        && technologyList[0] === technology.title ? [] : technologyList;
    },
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
  display: flex;
  flex-direction: column;
  height: 100%;
}

#main {
  outline-style: none;
  height: 100%;

  @include with-adjustable-sidebar {
    border-left: 1px solid var(--color-grid);
    border-right: 1px solid var(--color-grid);
  }

  @include inTargetIde {
    min-height: 100vh;
    display: flex;
    flex-flow: column nowrap;
    border: none;

    & > .contenttable:last-of-type {
      flex: 1;
    }
  }
}

.container {
  margin-top: $section-spacing-single-side / 2;
  outline-style: none;
  @include dynamic-content-container;
}

.sample-download {
  margin-top: 20px;
}

/deep/ {
  @each $heading in (h3, h4, h5, h6) {
    #{$heading} {
      @include font-styles(documentation-#{$heading});
    }
  }
}
</style>
