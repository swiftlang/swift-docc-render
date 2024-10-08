<!--
  This source file is part of the Swift.org open source project

  Copyright (c) 2021 Apple Inc. and the Swift project authors
  Licensed under Apache License v2.0 with Runtime Library Exception

  See https://swift.org/LICENSE.txt for license information
  See https://swift.org/CONTRIBUTORS.txt for Swift project authors
-->

<template>
  <div class="tutorials-overview">
    <Nav
      v-if="!isTargetIDE"
      :sections="otherSections"
      class="theme-dark"
    >
      {{ title }}
    </Nav>
    <main id="app-main" tabindex="0" class="main">
      <div class="radial-gradient">
        <slot name="above-hero" />
        <Hero
          v-if="heroSection"
          :action="heroSection.action"
          :content="heroSection.content"
          :estimatedTime="metadata.estimatedTime"
          :image="heroSection.image"
          :title="heroSection.title"
        />
      </div>
      <LearningPath v-if="otherSections.length > 0" :sections="otherSections" />
    </main>
  </div>
</template>

<script>
import AppStore from 'docc-render/stores/AppStore';
import TutorialsOverviewStore from 'docc-render/stores/TutorialsOverviewStore';
import Nav from 'theme/components/TutorialsOverview/Nav.vue';
import metadata from 'theme/mixins/metadata';
import Hero from './TutorialsOverview/Hero.vue';
import LearningPath from './TutorialsOverview/LearningPath.vue';

const SectionKind = {
  hero: 'hero',
  resources: 'resources',
  volume: 'volume',
};

export default {
  name: 'TutorialsOverview',
  components: {
    Hero,
    LearningPath,
    Nav,
  },
  mixins: [metadata],
  constants: { SectionKind },
  inject: {
    isTargetIDE: { default: false },
  },
  props: {
    metadata: {
      type: Object,
      default: () => ({}),
    },
    references: {
      type: Object,
      default: () => ({}),
    },
    sections: {
      type: Array,
      default: () => ([]),
      validator: sections => sections.every(section => (
        Object.prototype.hasOwnProperty.call(SectionKind, section.kind)
      )),
    },
  },
  computed: {
    pageTitle: ({ title }) => [title, 'Tutorials'].filter(Boolean).join(' '),
    pageDescription: ({ heroSection, extractFirstParagraphText }) => (
      heroSection ? extractFirstParagraphText(heroSection.content) : null
    ),
    partitionedSections: ({ sections }) => sections.reduce(([heroes, others], section) => (
      section.kind === SectionKind.hero ? (
        [heroes.concat(section), others]
      ) : (
        [heroes, others.concat(section)]
      )
    ), [[], []]),
    heroSections: ({ partitionedSections }) => partitionedSections[0],
    otherSections: ({ partitionedSections }) => partitionedSections[1],
    heroSection: ({ heroSections }) => heroSections[0],
    store: () => TutorialsOverviewStore,
    title: ({ metadata: { category = '' } }) => category,
  },
  provide() {
    return {
      store: this.store,
    };
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
};
</script>

<style scoped lang="scss">
@import 'docc-render/styles/_core.scss';

.tutorials-overview {
  background: dark-color(fill);
  flex: 1;
  height: 100%;

  .radial-gradient {
    margin-top: -$nav-height;
    padding-top: $nav-height;

    @include breakpoint(small) {
      margin-top: -$nav-height-small;
      padding-top: $nav-height-small;
    }

    background: var(--color-tutorials-overview-fill-secondary,
      var(--color-tutorials-overview-background));
  }

  // HACK - remove the gradient for firefox only
  @-moz-document url-prefix() {
    .radial-gradient {
      background: #111111 !important;
    }
  }
}
</style>
