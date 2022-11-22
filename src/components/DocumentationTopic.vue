<!--
  This source file is part of the Swift.org open source project

  Copyright (c) 2021-2022 Apple Inc. and the Swift project authors
  Licensed under Apache License v2.0 with Runtime Library Exception

  See https://swift.org/LICENSE.txt for license information
  See https://swift.org/CONTRIBUTORS.txt for Swift project authors
-->

<template>
  <div
    class="doc-topic"
    :class="{ 'with-on-this-page': enableOnThisPageNav && isOnThisPageNavVisible }"
  >
    <main class="main" id="main" role="main" tabindex="0">
      <DocumentationHero
        :role="role"
        :enhanceBackground="enhanceBackground"
        :shortHero="shortHero"
        :shouldShowLanguageSwitcher="shouldShowLanguageSwitcher"
        :iconOverride="references[pageIcon]"
      >
        <template #above-content>
          <slot name="above-hero-content" />
        </template>
        <slot name="above-title" />
        <LanguageSwitcher
          v-if="shouldShowLanguageSwitcher"
          :interfaceLanguage="interfaceLanguage"
          :objcPath="objcPath"
          :swiftPath="swiftPath"
        />
        <Title :eyebrow="roleHeading">
          <component :is="titleBreakComponent">{{ title }}</component>
          <small
            v-if="isSymbolDeprecated || isSymbolBeta"
            slot="after"
            :class="tagName"
            :data-tag-name="tagName"
          />
        </Title>
        <Abstract v-if="abstract" :content="abstract" />
        <div v-if="sampleCodeDownload">
          <DownloadButton class="sample-download" :action="sampleCodeDownload.action" />
        </div>
        <Availability
          v-if="hasAvailability"
          :platforms="platforms" :technologies="technologies"
        />
      </DocumentationHero>
      <div class="doc-content-wrapper">
        <div class="doc-content" :class="{ 'no-primary-content': !hasPrimaryContent }">
          <div v-if="hasPrimaryContent" class="container">
            <div class="description" :class="{ 'after-enhanced-hero': enhanceBackground }">
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
            </div>
            <PrimaryContent
              v-if="primaryContentSections && primaryContentSections.length"
              :class="{ 'with-border': !enhanceBackground }"
              :conformance="conformance"
              :source="remoteSource"
              :sections="primaryContentSections"
            />
          </div>
          <Topics
            v-if="shouldRenderTopicSection"
            :sections="topicSections"
            :isSymbolDeprecated="isSymbolDeprecated"
            :isSymbolBeta="isSymbolBeta"
            :topicStyle="topicSectionsStyle"
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
        </div>
        <template v-if="enableOnThisPageNav">
          <OnThisPageStickyContainer v-show="isOnThisPageNavVisible">
            <OnThisPageNav v-if="topicState.onThisPageSections.length > 2" />
          </OnThisPageStickyContainer>
        </template>
      </div>
      <BetaLegalText v-if="!isTargetIDE && hasBetaContent" />
    </main>
    <div aria-live="polite" class="visuallyhidden">
      Current page is {{ pageTitle }}
    </div>
  </div>
</template>

<script>
import Language from 'docc-render/constants/Language';
import metadata from 'theme/mixins/metadata.js';

import Aside from 'docc-render/components/ContentNode/Aside.vue';
import BetaLegalText from 'theme/components/DocumentationTopic/BetaLegalText.vue';
import LanguageSwitcher from 'theme/components/DocumentationTopic/Summary/LanguageSwitcher.vue';
import DocumentationHero from 'docc-render/components/DocumentationTopic/DocumentationHero.vue';
import WordBreak from 'docc-render/components/WordBreak.vue';
import { TopicSectionsStyle } from 'docc-render/constants/TopicSectionsStyle';
import OnThisPageNav from 'theme/components/OnThisPageNav.vue';
import Abstract from './DocumentationTopic/Description/Abstract.vue';
import ContentNode from './DocumentationTopic/ContentNode.vue';
import CallToActionButton from './CallToActionButton.vue';
import DefaultImplementations from './DocumentationTopic/DefaultImplementations.vue';
import PrimaryContent from './DocumentationTopic/PrimaryContent.vue';
import Relationships from './DocumentationTopic/Relationships.vue';
import RequirementMetadata from './DocumentationTopic/Description/RequirementMetadata.vue';
import Availability from './DocumentationTopic/Summary/Availability.vue';
import SeeAlso from './DocumentationTopic/SeeAlso.vue';
import Title from './DocumentationTopic/Title.vue';
import Topics from './DocumentationTopic/Topics.vue';
import OnThisPageStickyContainer from './DocumentationTopic/OnThisPageStickyContainer.vue';

// size above which, the OnThisPage container is visible
const ON_THIS_PAGE_CONTAINER_BREAKPOINT = 1050;

export default {
  name: 'DocumentationTopic',
  mixins: [metadata],
  constants: { ON_THIS_PAGE_CONTAINER_BREAKPOINT },
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
          state: {},
        };
      },
    },
  },
  components: {
    OnThisPageStickyContainer,
    OnThisPageNav,
    DocumentationHero,
    Abstract,
    Aside,
    BetaLegalText,
    ContentNode,
    DefaultImplementations,
    DownloadButton: CallToActionButton,
    LanguageSwitcher,
    PrimaryContent,
    Relationships,
    RequirementMetadata,
    Availability,
    SeeAlso,
    Title,
    Topics,
    WordBreak,
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
    topicSectionsStyle: {
      type: String,
      default: TopicSectionsStyle.list,
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
    remoteSource: {
      type: Object,
      required: false,
    },
    pageImages: {
      type: Array,
      required: false,
    },
    enableOnThisPageNav: {
      type: Boolean,
      default: false,
    },
    disableHeroBackground: {
      type: Boolean,
      default: false,
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
    hasAvailability: ({ platforms, technologies }) => (
      (platforms || []).length || (technologies || []).length
    ),
    hasBetaContent:
      ({ platforms }) => platforms
        && platforms.length
        && platforms.some(platform => platform.beta),
    pageTitle: ({ title }) => title,
    pageDescription: ({ abstract, extractFirstParagraphText }) => (
      abstract ? extractFirstParagraphText(abstract) : null
    ),
    shouldShowLanguageSwitcher: ({ objcPath, swiftPath, isTargetIDE }) => (
      !!(objcPath && swiftPath && isTargetIDE)
    ),
    enhanceBackground: ({ symbolKind, disableHeroBackground, topicSectionsStyle }) => {
      if (
        // if the hero bg is forcefully disabled
        disableHeroBackground
        // or the topicSectionsStyle is a `grid` type
        || topicSectionsStyle === TopicSectionsStyle.compactGrid
        || topicSectionsStyle === TopicSectionsStyle.detailedGrid
      ) {
        return false;
      }
      return symbolKind ? (symbolKind === 'module') : true;
    },
    shortHero: ({
      roleHeading,
      abstract,
      sampleCodeDownload,
      hasAvailability,
      shouldShowLanguageSwitcher,
    }) => (
      // apply extra padding when there are less than 2 items in the Hero section other than `title`
      (!!roleHeading + !!abstract + !!sampleCodeDownload
        + !!hasAvailability + shouldShowLanguageSwitcher) <= 1
    ),
    technologies({ modules = [] }) {
      const technologyList = modules.reduce((list, module) => {
        list.push(module.name);
        return list.concat(module.relatedModules || []);
      }, []);
      // only show badges for technologies when there are multiple
      return technologyList.length > 1
        ? technologyList
        : [];
    },
    // there shouldn't be a pressing need to use the `WordBreak` component in
    // the main title for for non-symbol pages with the "enhanced" background
    titleBreakComponent: ({ enhanceBackground }) => (enhanceBackground
      ? 'span'
      : WordBreak),
    hasPrimaryContent: ({
      isRequirement,
      deprecationSummary,
      downloadNotAvailableSummary,
      primaryContentSections,
    }) => (
      isRequirement
      || (deprecationSummary && deprecationSummary.length)
      || (downloadNotAvailableSummary && downloadNotAvailableSummary.length)
      || (primaryContentSections && primaryContentSections.length)
    ),
    tagName: ({ isSymbolDeprecated }) => (isSymbolDeprecated ? 'Deprecated' : 'Beta'),
    /**
     * Finds the page icon in the `pageImages` array
     * @param {Array} pageImages
     * @returns {String|null}
     */
    pageIcon: ({ pageImages = [] }) => {
      const icon = pageImages.find(({ type }) => type === 'icon');
      return icon ? icon.identifier : null;
    },
    shouldRenderTopicSection: ({
      topicSectionsStyle,
      topicSections,
    }) => topicSections && topicSectionsStyle !== TopicSectionsStyle.hidden,
    isOnThisPageNavVisible: ({ topicState }) => (
      topicState.contentWidth > ON_THIS_PAGE_CONTAINER_BREAKPOINT
    ),
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

  &.with-on-this-page {
    --doc-hero-right-offset: #{$on-this-page-aside-width};
  }
}

#main {
  outline-style: none;
  height: 100%;

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
  outline-style: none;
  @include dynamic-content-container;
}

.description {
  margin-bottom: $contenttable-spacing-single-side;

  &:empty {
    display: none;
  }

  &.after-enhanced-hero {
    margin-top: $contenttable-spacing-single-side;
  }

  /deep/ .content + * {
    margin-top: $stacked-margin-large;
  }
}

// remove border-top for first section of the page
/deep/ {
  .no-primary-content {
    --content-table-title-border-width: 0px;
  }
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

.doc-content-wrapper {
  display: flex;
  justify-content: center;

  .doc-content {
    min-width: 0;
    width: 100%;

    .with-on-this-page & {
      $large-max-width: map-deep-get($breakpoint-attributes, (default, large, content-width));

      max-width: $large-max-width - 2*$large-viewport-dynamic-content-padding;

      @include breakpoints-from(large) {
        max-width: $large-max-width;
      }

      @media only screen and (min-width: 1500px) {
        max-width: $large-max-width + 100;
      }
    }
  }
}
</style>
