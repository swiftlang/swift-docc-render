<!--
  This source file is part of the Swift.org open source project

  Copyright (c) 2021 Apple Inc. and the Swift project authors
  Licensed under Apache License v2.0 with Runtime Library Exception

  See https://swift.org/LICENSE.txt for license information
  See https://swift.org/CONTRIBUTORS.txt for Swift project authors
-->

<template>
  <div class="article">
    <NavigationBar
      v-if="!isTargetIDE"
      :chapters="hierarchy.modules"
      :technology="metadata.category"
      :topic="heroTitle || ''"
      :rootReference="hierarchy.reference"
      :identifierUrl="identifierUrl"
    />
    <main id="app-main" tabindex="0">
      <slot name="above-hero" />
      <component
        v-for="(section, index) in sections"
        v-bind="propsFor(section)"
        :is="componentFor(section)"
        :key="index"
      />
    </main>
    <PortalTarget name="modal-destination" multiple />
  </div>
</template>

<script>
import { PortalTarget } from 'portal-vue';

import AppStore from 'docc-render/stores/AppStore';
import NavigationBar from 'theme/components/Tutorial/NavigationBar.vue';
import metadata from 'theme/mixins/metadata';
import Body from './Article/Body.vue';
import CallToAction from './Article/CallToAction.vue';
import Hero from './Article/Hero.vue';
import Assessments from './Article/Assessments.vue';

const SectionKind = {
  articleBody: 'articleBody',
  callToAction: 'callToAction',
  hero: 'hero',
  assessments: 'assessments',
};

export default {
  name: 'Article',
  components: { NavigationBar, PortalTarget },
  mixins: [metadata],
  inject: {
    isTargetIDE: {
      default: false,
    },
    store: {
      default() {
        return {
          reset() {},
          setReferences() {},
        };
      },
    },
  },
  props: {
    hierarchy: {
      type: Object,
      required: true,
    },
    metadata: {
      type: Object,
      required: true,
    },
    references: {
      type: Object,
      required: true,
    },
    sections: {
      type: Array,
      required: true,
      validator: sections => sections.every(({ kind }) => (
        Object.prototype.hasOwnProperty.call(SectionKind, kind)
      )),
    },
    identifierUrl: {
      type: String,
      required: true,
    },
  },
  computed: {
    heroSection() {
      return this.sections.find(this.isHero);
    },
    heroTitle() {
      return (this.heroSection || {}).title;
    },
    pageTitle() {
      return this.heroTitle ? (
        `${this.heroTitle} — ${this.metadata.category} Tutorials`
      ) : (
        undefined
      );
    },
    pageDescription: ({ heroSection, extractFirstParagraphText }) => (
      heroSection ? extractFirstParagraphText(heroSection.content) : null
    ),
  },
  methods: {
    componentFor(section) {
      const { kind } = section;
      return {
        [SectionKind.articleBody]: Body,
        [SectionKind.callToAction]: CallToAction,
        [SectionKind.hero]: Hero,
        [SectionKind.assessments]: Assessments,
      }[kind];
    },
    isHero(section) {
      return section.kind === SectionKind.hero;
    },
    propsFor(section) {
      const {
        abstract,
        action,
        anchor,
        assessments,
        backgroundImage,
        chapter,
        content,
        estimatedTimeInMinutes,
        kind,
        media,
        projectFiles,
        title,
        video,
        xcodeRequirement,
      } = section;
      return {
        [SectionKind.articleBody]: {
          content,
        },
        [SectionKind.callToAction]: {
          abstract,
          action,
          media,
          title,
        },
        [SectionKind.hero]: {
          backgroundImage,
          chapter,
          content,
          estimatedTimeInMinutes,
          projectFiles,
          title,
          video,
          xcodeRequirement,
        },
        [SectionKind.assessments]: {
          anchor,
          assessments,
        },
      }[kind];
    },
  },
  created() {
    AppStore.setAvailableLocales(this.metadata.availableLocales);
    this.store.reset();
    this.store.setReferences(this.references);
  },
  watch: {
    // update the references in the store, in case they update, but the component is not re-created
    references(references) {
      this.store.setReferences(references);
    },
    'metadata.availableLocales': function availableLocalesWatcher(availableLocales) {
      AppStore.setAvailableLocales(availableLocales);
    },
  },
  SectionKind,
};
</script>

<style scoped lang="scss">
@import 'docc-render/styles/_core.scss';

.article {
  background: var(--colors-article-background, var(--color-article-background));

  @include breakpoint(small) {
    background: var(--colors-text-background, var(--color-article-body-background));
  }
}
</style>
