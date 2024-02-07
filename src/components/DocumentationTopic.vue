<!--
  This source file is part of the Swift.org open source project

  Copyright (c) 2021-2024 Apple Inc. and the Swift project authors
  Licensed under Apache License v2.0 with Runtime Library Exception

  See https://swift.org/LICENSE.txt for license information
  See https://swift.org/CONTRIBUTORS.txt for Swift project authors
-->

<template>
  <div
    class="doc-topic"
    :class="{ 'with-on-this-page': enableOnThisPageNav && isOnThisPageNavVisible }"
  >
    <component
      :is="isTargetIDE ? 'div' : 'main'"
      class="main" id="main"
    >
      <DocumentationHero
        :role="role"
        :enhanceBackground="enhanceBackground"
        :enableMinimized="enableMinimized"
        :shortHero="shortHero"
        :shouldShowLanguageSwitcher="shouldShowLanguageSwitcher"
        :iconOverride="references[pageIcon]"
        :standardColorIdentifier="standardColorIdentifier"
      >
        <template #above-content>
          <slot name="above-hero-content" />
        </template>
        <slot name="above-title" />
        <Hierarchy
          v-if="enhanceBackground && !isTargetIDE"
          :currentTopicTitle="title"
          :isSymbolDeprecated="isSymbolDeprecated"
          :isSymbolBeta="isSymbolBeta"
          :parentTopicIdentifiers="hierarchyItems"
          :currentTopicTags="tags"
        />
        <LanguageSwitcher
          v-if="shouldShowLanguageSwitcher"
          :interfaceLanguage="interfaceLanguage"
          :objcPath="objcPath"
          :swiftPath="swiftPath"
        />
        <Title
          :eyebrow="enableMinimized ? null : roleHeading"
          :class="{ 'minimized-title': enableMinimized }"
        >
          <component :is="titleBreakComponent">{{ title }}</component>
          <template #after v-if="isSymbolDeprecated || isSymbolBeta">
            <small
              :class="tagName"
              :data-tag-name="tagName"
            />
          </template>
        </Title>
        <Abstract
          v-if="abstract"
          :class="{ 'minimized-abstract': enableMinimized }"
          :content="abstract"
        />
        <div v-if="sampleCodeDownload">
          <DownloadButton class="sample-download" :action="sampleCodeDownload.action" />
        </div>
        <Availability
          v-if="shouldShowAvailability"
          :platforms="platforms" :technologies="technologies"
        />
        <div
          v-if="declarations.length"
          class="declarations-container"
          :class="{ 'minimized-container': enableMinimized }"
        >
          <Declaration
            v-for="(declaration, index) in declarations"
            :key="index"
            :conformance="conformance"
            :declarations="declaration.declarations"
            :source="remoteSource"
            :declListExpanded.sync="declListExpanded"
          />
        </div>
      </DocumentationHero>
      <div class="doc-content-wrapper">
        <div
          class="doc-content"
          :class="{ 'no-primary-content': !hasPrimaryContent && enhanceBackground }"
        >
          <div
            v-if="hasPrimaryContent || hasOtherDeclarations"
            :class="['container', { 'minimized-container': enableMinimized }]"
          >
            <div
              v-if="!declListExpanded"
              class="description"
              :class="{ 'after-enhanced-hero': enhanceBackground }"
            >
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
            <div v-if="hasOtherDeclarations" class="declaration-list-menu">
              <button
                class="declaration-list-toggle"
                @click="toggleDeclList"
              >
                {{ declListToggleText }}
                <div class="icon">
                  <InlinePlusCircleIcon :class="{'expand': declListExpanded }" />
                </div>
              </button>
            </div>
            <PrimaryContent
              v-if="primaryContentSectionsSanitized && primaryContentSectionsSanitized.length"
              :class="{ 'with-border': !enhanceBackground }"
              :conformance="conformance"
              :source="remoteSource"
              :sections="primaryContentSectionsSanitized"
            />
            <ViewMore v-if="shouldShowViewMoreLink" :url="viewMoreLink" />
          </div>
          <Topics
            v-if="shouldRenderTopicSection"
            :sections="topicSections"
            :isSymbolDeprecated="isSymbolDeprecated"
            :isSymbolBeta="isSymbolBeta"
            :topicStyle="topicSectionsStyle"
          />
          <DefaultImplementations
            v-if="defaultImplementationsSections && !enableMinimized"
            :sections="defaultImplementationsSections"
            :isSymbolDeprecated="isSymbolDeprecated"
            :isSymbolBeta="isSymbolBeta"
          />
          <Relationships
            v-if="relationshipsSections && !enableMinimized"
            :sections="relationshipsSections"
          />
          <!-- NOTE: see also may contain information about other apis, so we cannot
          pass deprecation and beta information -->
          <SeeAlso
            v-if="seeAlsoSections && !enableMinimized"
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
    </component>
    <div aria-live="polite" class="visuallyhidden">
      {{ $t('documentation.current-page', { title: pageTitle }) }}
    </div>
  </div>
</template>

<script>
import Language from 'docc-render/constants/Language';
import metadata from 'theme/mixins/metadata';
import { buildUrl } from 'docc-render/utils/url-helper';
import { normalizeRelativePath } from 'docc-render/utils/assets';

import AppStore from 'docc-render/stores/AppStore';
import Aside from 'docc-render/components/ContentNode/Aside.vue';
import BetaLegalText from 'theme/components/DocumentationTopic/BetaLegalText.vue';
import LanguageSwitcher from 'theme/components/DocumentationTopic/Summary/LanguageSwitcher.vue';
import ViewMore from 'theme/components/DocumentationTopic/ViewMore.vue';
import DocumentationHero from 'docc-render/components/DocumentationTopic/Hero/DocumentationHero.vue';
import WordBreak from 'docc-render/components/WordBreak.vue';
import { TopicSectionsStyle } from 'docc-render/constants/TopicSectionsStyle';
import OnThisPageNav from 'theme/components/OnThisPageNav.vue';
import { SectionKind } from 'docc-render/constants/PrimaryContentSection';
import Declaration from 'docc-render/components/DocumentationTopic/PrimaryContent/Declaration.vue';
import { StandardColors } from 'docc-render/constants/StandardColors';
import InlinePlusCircleIcon from 'theme/components/Icons/InlinePlusCircleIcon.vue';
import Abstract from './DocumentationTopic/Description/Abstract.vue';
import ContentNode from './DocumentationTopic/ContentNode.vue';
import CallToActionButton from './CallToActionButton.vue';
import DefaultImplementations from './DocumentationTopic/DefaultImplementations.vue';
import PrimaryContent from './DocumentationTopic/PrimaryContent.vue';
import Relationships from './DocumentationTopic/Relationships.vue';
import RequirementMetadata from './DocumentationTopic/Description/RequirementMetadata.vue';
import Availability from './DocumentationTopic/Summary/Availability.vue';
import SeeAlso from './DocumentationTopic/SeeAlso.vue';
import Title from './DocumentationTopic/Hero/Title.vue';
import Topics from './DocumentationTopic/Topics.vue';
import OnThisPageStickyContainer from './DocumentationTopic/OnThisPageStickyContainer.vue';
import Hierarchy from './DocumentationTopic/Hero/Hierarchy.vue';

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
    Declaration,
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
    ViewMore,
    WordBreak,
    Hierarchy,
    InlinePlusCircleIcon,
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
    hasNoExpandedDocumentation: {
      type: Boolean,
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
    enableMinimized: {
      type: Boolean,
      default: false,
    },
    enableOnThisPageNav: {
      type: Boolean,
      default: false,
    },
    disableHeroBackground: {
      type: Boolean,
      default: false,
    },
    standardColorIdentifier: {
      type: String,
      required: false,
      validator: v => Object.prototype.hasOwnProperty.call(StandardColors, v),
    },
    availableLocales: {
      type: Array,
      required: false,
    },
    hierarchyItems: {
      type: Array,
      required: false,
    },
  },
  provide() {
    // NOTE: this is not reactive: if this.identifier change, the provided value
    // to children will stay the same
    return {
      identifier: this.identifier,
      languages: new Set(Object.keys(this.languagePaths)),
      interfaceLanguage: this.interfaceLanguage,
      symbolKind: this.symbolKind,
      enableMinimized: this.enableMinimized,
    };
  },
  data() {
    return {
      topicState: this.store.state,
      declListExpanded: false, // Hide all other declarations by default
    };
  },
  computed: {
    normalizedSwiftPath: ({ swiftPath }) => (normalizeRelativePath(swiftPath)),
    normalizedObjcPath: ({
      objcPath,
      swiftPath,
    }) => (
      // do not append language query parameter if no swiftPath exists
      normalizeRelativePath((objcPath && swiftPath) ? buildUrl(objcPath, {
        language: Language.objectiveC.key.url,
      }) : objcPath)
    ),
    defaultImplementationsCount() {
      return (this.defaultImplementationsSections || []).reduce(
        (count, section) => count + section.identifiers.length,
        0,
      );
    },
    shouldShowAvailability: ({ platforms, technologies, enableMinimized }) => (
      ((platforms || []).length || (technologies || []).length) && !enableMinimized
    ),
    hasBetaContent:
      ({ platforms }) => platforms
        && platforms.length
        && platforms.some(platform => platform.beta),
    pageTitle: ({ title }) => title,
    pageDescription: ({ abstract, extractFirstParagraphText }) => (
      abstract ? extractFirstParagraphText(abstract) : null
    ),
    shouldShowLanguageSwitcher: ({
      objcPath,
      swiftPath,
      isTargetIDE,
      enableMinimized,
    }) => (
      !!(objcPath && swiftPath && isTargetIDE) && !enableMinimized
    ),
    enhanceBackground: ({
      symbolKind,
      disableHeroBackground,
      enableMinimized,
    }) => {
      if (
        // if the hero bg is forcefully disabled
        disableHeroBackground
        // or minimized view is enabled
        || enableMinimized
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
      declarations,
    }) => (
      // apply extra padding when there are less than 2 items in the Hero section other than `title`
      (!!roleHeading + !!abstract + !!sampleCodeDownload + !!declarations.length
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
      primaryContentSectionsSanitized,
      shouldShowViewMoreLink,
    }) => (
      isRequirement
      || (deprecationSummary && deprecationSummary.length)
      || (downloadNotAvailableSummary && downloadNotAvailableSummary.length)
      || (primaryContentSectionsSanitized.length)
      || shouldShowViewMoreLink
    ),
    viewMoreLink: ({
      interfaceLanguage,
      normalizedObjcPath,
      normalizedSwiftPath,
    }) => (
      interfaceLanguage === Language.objectiveC.key.api
        ? normalizedObjcPath : normalizedSwiftPath
    ),
    shouldShowViewMoreLink: ({
      enableMinimized,
      hasNoExpandedDocumentation,
      viewMoreLink,
    }) => (
      enableMinimized && !hasNoExpandedDocumentation && viewMoreLink
    ),
    tagName() {
      return this.isSymbolDeprecated ? this.$t('aside-kind.deprecated') : this.$t('aside-kind.beta');
    },
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
      enableMinimized,
    }) => topicSections && topicSectionsStyle !== TopicSectionsStyle.hidden && !enableMinimized,
    isOnThisPageNavVisible: ({ topicState }) => (
      topicState.contentWidth > ON_THIS_PAGE_CONTAINER_BREAKPOINT
    ),
    disableMetadata: ({ enableMinimized }) => enableMinimized,
    primaryContentSectionsSanitized({ primaryContentSections = [] }) {
      return primaryContentSections.filter(({ kind }) => kind !== SectionKind.declarations);
    },
    declarations({ primaryContentSections = [] }) {
      return primaryContentSections.filter(({ kind }) => kind === SectionKind.declarations);
    },
    hasOtherDeclarations({ declarations = [], enableMinimized }) {
      // disable otherDeclarations in minimized mode
      return !enableMinimized && declarations.length
        // there's always only 1 `declaration` at this level
        && declarations[0].declarations.some(decl => Object.prototype.hasOwnProperty.call(decl, 'otherDeclarations'));
    },
    declListToggleText({ declListExpanded }) {
      return declListExpanded ? this.$t('declarations.hide-other-declarations')
        : this.$t('declarations.show-all-declarations');
    },
  },
  methods: {
    extractProps(json) {
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
          hasNoExpandedDocumentation,
          modules,
          availableLocales,
          platforms,
          required: isRequirement = false,
          roleHeading,
          title = '',
          tags = [],
          role,
          symbolKind = '',
          remoteSource,
          images: pageImages = [],
          color: {
            standardColorIdentifier,
          } = {},
        } = {},
        primaryContentSections,
        relationshipsSections,
        references = {},
        sampleCodeDownload,
        topicSectionsStyle,
        topicSections,
        seeAlsoSections,
        variantOverrides,
        variants = [],
      } = json;
      const languagePaths = variants.reduce((memo, variant) => (
        variant.traits.reduce((_memo, trait) => (!trait.interfaceLanguage ? _memo : ({
          ..._memo,
          [trait.interfaceLanguage]: (_memo[trait.interfaceLanguage] || []).concat(variant.paths),
        })), memo)
      ), {});
      const {
        [Language.objectiveC.key.api]: [objcPath] = [],
        [Language.swift.key.api]: [swiftPath] = [],
      } = languagePaths;
      return {
        abstract,
        conformance,
        defaultImplementationsSections,
        deprecationSummary,
        downloadNotAvailableSummary,
        diffAvailability,
        hasNoExpandedDocumentation,
        availableLocales,
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
        objcPath,
        swiftPath,
        standardColorIdentifier,
      };
    },
    toggleDeclList() {
      this.declListExpanded = !this.declListExpanded;
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
          path: normalizeRelativePath(this.objcPath),
          query: {
            ...query,
            language: Language.objectiveC.key.url,
          },
        });
      });
    }

    AppStore.setAvailableLocales(this.availableLocales || []);
    this.store.reset();
    this.store.setReferences(this.references);
  },
  watch: {
    // update the references in the store, in case they update, but the component is not re-created
    references(references) {
      this.store.setReferences(references);
    },
    availableLocales(availableLocales) {
      AppStore.setAvailableLocales(availableLocales);
    },
  },
};
</script>

<style scoped lang="scss">
@import 'docc-render/styles/_core.scss';

$space-size: 15px;

.declaration-list-menu {
  position: relative;
  width: 100%;

  .declaration-list-toggle {
    display: flex;
    flex-direction: row;
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background-color: var(--color-fill); // cover border line
    padding: 5px 15px;
    color: var(--colors-link, var(--color-link));
    z-index: 1;
    gap: 5px;
    white-space: nowrap;
    align-items: center;
  }

  .icon {
    display: flex;
    svg {
      transition-duration: 400ms;
      transition-timing-function: linear;
      transition-property: transform;

      width: $space-size;
      height: $space-size;
      fill: var(--colors-link, var(--color-link));

      &.expand {
        transform: rotate(45deg);
      }
    }
  }
}

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

:deep(.minimized-title) {
  margin-bottom: 0.833rem;

  .title {
    font-size: 1.416rem;
    font-weight: bold;
  }

  small {
    font-size: 1rem;
    padding-left: 0.416rem;
  }
}

.minimized-abstract {
  @include font-styles(body);
}

.container:not(.minimized-container) {
  outline-style: none;
  @include dynamic-content-container;
}

:deep() {
  .minimized-container {
    outline-style: none;

    --spacing-stacked-margin-large: 0.667em;
    --spacing-stacked-margin-xlarge: 1em;
    --declaration-code-listing-margin: 1em 0 0 0;
    --declaration-conditional-constraints-margin: 1em;
    --declaration-source-link-margin: 0.833em;
    --code-block-style-elements-padding: 7px 12px;
    --spacing-param: var(--spacing-stacked-margin-large);
    --aside-border-radius: 6px;
    --code-border-radius: 6px;

    .description {
      margin-bottom: 1.5em;
    }

    & > .primary-content > * {
      margin-top: 1.5em;
      margin-bottom: 1.5em;
    }

    .description {
      margin-top: 0;
    }

    h1,
    h2,
    h3,
    h4,
    h5,
    h6 {
      font-size: 1rem;
      font-weight: bold;
    }

    h2 {
      font-size: 1.083rem;
    }

    h1 {
      font-size: 1.416rem;
    }

    aside {
      padding: 0.667rem 1rem;
    }

    .source {
      border-radius: var(--code-border-radius);
      margin: var(--declaration-code-listing-margin);
    }

    /* wrap declaration only when not using smart wrapping */
    .source:not(.has-multiple-lines) > code {
      @include inTargetIde() {
        white-space: pre-wrap;

        .token-identifier {
          word-break: break-all;
        }
      }
    }

    .single-line {
      border-radius: var(--code-border-radius);
    }
  }
}

.description {
  margin-bottom: $contenttable-spacing-single-side;

  &:empty {
    display: none;
  }

  &.after-enhanced-hero {
    margin-top: $contenttable-spacing-single-side;
  }

  :deep(.content + *) {
    margin-top: var(--spacing-stacked-margin-large);
  }
}

.full-width-container .doc-content .minimized-container {
  padding-left: 1.4rem;
  padding-right: 1.4rem;
}

:deep() {
  .no-primary-content {
    // remove border-top for first section of the page
    --content-table-title-border-width: 0px;
  }
}

.sample-download {
  margin-top: 20px;
}

.declarations-container {
  margin-top: 30px;

  &.minimized-container {
    margin-top: 0;
  }
}

:deep() {
  h1 {
    @include font-styles(headline-reduced);
  }

  h2 {
    @include font-styles(heading-2-reduced);
  }

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

    // only render border on declaration list menu
    // when there are no content sections afterwards at all
    .container:only-child {
      .declaration-list-menu:last-child::before {
        border-top-color: var(--colors-grid, var(--color-grid));
        border-top-style: solid;
        border-top-width: var(--content-table-title-border-width, 1px);
        content: '';
        display: block;
      }
    }

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
