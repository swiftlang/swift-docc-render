<!--
  This source file is part of the Swift.org open source project

  Copyright (c) 2021 Apple Inc. and the Swift project authors
  Licensed under Apache License v2.0 with Runtime Library Exception

  See https://swift.org/LICENSE.txt for license information
  See https://swift.org/CONTRIBUTORS.txt for Swift project authors
-->

<template>
  <LinkableSection
    class="section"
    :anchor="anchor"
    :title="introProps.title"
  >
    <Intro v-bind="introProps"/>
    <Steps
      v-if="stepsSection.length > 0"
      :content="stepsSection"
      :isRuntimePreviewVisible="isRuntimePreviewVisible"
      @runtime-preview-toggle="onRuntimePreviewToggle"
      :sectionNumber="sectionNumber"
    />
  </LinkableSection>
</template>

<script>
import LinkableElement from 'docc-render/components/LinkableElement.vue';

import SectionIntro from './SectionIntro.vue';
import SectionSteps from './SectionSteps.vue';

export default {
  name: 'Section',
  components: {
    Intro: SectionIntro,
    LinkableSection: LinkableElement,
    Steps: SectionSteps,
  },
  computed: {
    introProps() {
      const [
        {
          content,
          media,
        },
        ...expandedSections
      ] = this.contentSection;
      return {
        content,
        expandedSections,
        media,
        sectionAnchor: this.anchor,
        sectionNumber: this.sectionNumber,
        title: this.title,
      };
    },
  },
  props: {
    anchor: {
      type: String,
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    contentSection: {
      type: Array,
      required: true,
    },
    stepsSection: {
      type: Array,
      required: true,
    },
    sectionNumber: {
      type: Number,
      required: true,
    },
    isRuntimePreviewVisible: {
      type: Boolean,
      required: true,
    },
  },
  methods: {
    onRuntimePreviewToggle(value) {
      this.$emit('runtime-preview-toggle', value);
    },
  },
};
</script>

<style scoped lang="scss">
@import 'docc-render/styles/_core.scss';

.section {
  padding-top: $tutorial-section-spacing-single-side;
}

</style>
