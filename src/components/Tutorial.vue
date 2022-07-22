<!--
  This source file is part of the Swift.org open source project

  Copyright (c) 2021 Apple Inc. and the Swift project authors
  Licensed under Apache License v2.0 with Runtime Library Exception

  See https://swift.org/LICENSE.txt for license information
  See https://swift.org/CONTRIBUTORS.txt for Swift project authors
-->

<template>
  <div class="tutorial">
    <NavigationBar
      v-if="!isTargetIDE"
      :technology="metadata.category"
      :chapters="hierarchy.modules"
      :topic="tutorialTitle || ''"
      :rootReference="hierarchy.reference"
      :identifierUrl="identifierUrl"
    />
    <main id="main" role="main" tabindex="0">
      <Section
        v-for="(section, index) in sections"
        :section="section"
        :key="index"
      />
      <BreakpointEmitter @change="handleBreakpointChange" />
    </main>
    <PortalTarget name="modal-destination" multiple />
  </div>
</template>

<script>
import { PortalTarget } from 'portal-vue';

import CodeThemeStore from 'docc-render/stores/CodeThemeStore';
import metadata from 'theme/mixins/metadata.js';
import isClientMobile from 'docc-render/mixins/isClientMobile';
import Hero from 'theme/components/Tutorial/Hero.vue';
import NavigationBar from 'theme/components/Tutorial/NavigationBar.vue';
import Assessments from './Tutorial/Assessments.vue';
import SectionList from './Tutorial/SectionList.vue';
import CallToAction from './Tutorial/CallToAction.vue';
import BreakpointEmitter from './BreakpointEmitter.vue';

const SectionComponents = {
  assessments: Assessments,
  hero: Hero,
  tasks: SectionList,
  callToAction: CallToAction,
};
const ValidSectionTypes = new Set(Object.keys(SectionComponents));

const TutorialSection = {
  name: 'TutorialSection',
  render: function render(createElement) {
    // Dynamically map each section to a static Vue component based on the
    // `kind` value of the section payload. Sections with unrecognized `kind`
    // values should be ignored.
    const {
      kind,
      ...props
    } = this.section;
    const component = SectionComponents[kind];
    return component ? createElement(component, { props }) : null;
  },
  props: {
    section: {
      type: Object,
      required: true,
      validator: section => ValidSectionTypes.has(section.kind),
    },
  },
};

export default {
  name: 'Tutorial',
  mixins: [metadata, isClientMobile],
  components: {
    NavigationBar,
    Section: TutorialSection,
    PortalTarget,
    BreakpointEmitter,
  },
  inject: [
    'isTargetIDE',
    'store',
  ],
  computed: {
    heroSection() {
      return this.sections.find(({ kind }) => kind === 'hero');
    },
    tutorialTitle() {
      return (this.heroSection || {}).title;
    },
    pageTitle() {
      return this.tutorialTitle ? (
        `${this.tutorialTitle} — ${this.metadata.category} Tutorials`
      ) : (
        undefined
      );
    },
    pageDescription: ({ heroSection, extractFirstParagraphText }) => (
      heroSection ? extractFirstParagraphText(heroSection.content) : null
    ),
  },
  props: {
    sections: {
      type: Array,
      required: true,
    },
    references: {
      type: Object,
      required: true,
    },
    hierarchy: {
      type: Object,
      required: true,
    },
    metadata: {
      type: Object,
      required: true,
    },
    identifierUrl: {
      type: String,
      required: true,
    },
  },
  methods: {
    handleBreakpointChange(breakpoint) {
      this.store.updateBreakpoint(breakpoint);
    },
    handleCodeColorsChange(codeColors) {
      CodeThemeStore.updateCodeColors(codeColors);
    },
  },
  created() {
    this.store.reset();
  },
  mounted() {
    this.$bridge.on('codeColors', this.handleCodeColorsChange);
    this.$bridge.send({ type: 'requestCodeColors' });
  },
  provide() {
    return {
      references: this.references,
      isClientMobile: this.isClientMobile,
    };
  },
  beforeDestroy() {
    this.$bridge.off('codeColors', this.handleCodeColorsChange);
  },
};
</script>

<style scoped lang="scss">
@import 'docc-render/styles/_core.scss';

.tutorial {
  background-color: var(--colors-text-background, var(--color-tutorial-background));
}
</style>
