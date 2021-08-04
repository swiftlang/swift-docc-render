<!--
  This source file is part of the Swift.org open source project

  Copyright (c) 2021 Apple Inc. and the Swift project authors
  Licensed under Apache License v2.0 with Runtime Library Exception

  See https://swift.org/LICENSE.txt for license information
  See https://swift.org/CONTRIBUTORS.txt for Swift project authors
-->

<template>
  <div class="sections">
    <Section
       v-for="(section, index) in tasks"
       v-bind="section"
       :key="index"
       :id="section.anchor"
       :sectionNumber="index + 1"
       :isRuntimePreviewVisible="isRuntimePreviewVisible"
       @runtime-preview-toggle="onRuntimePreviewToggle"
    />
  </div>
</template>

<script>
import Section from './Section.vue';

export default {
  name: 'SectionList',
  components: { Section },
  data() {
    return {
      isRuntimePreviewVisible: true,
    };
  },
  props: {
    tasks: {
      type: Array,
      required: true,
    },
  },
  methods: {
    onRuntimePreviewToggle(value) {
      this.isRuntimePreviewVisible = value;
    },
  },
};
</script>

<style scoped lang="scss">
@import 'docc-render/styles/_core.scss';

.sections {
  @include breakpoint-content;

  @include breakpoint(small) {
    margin: 0;
    width: 100%;
  }
}
</style>
