<!--
  This source file is part of the Swift.org open source project

  Copyright (c) 2021 Apple Inc. and the Swift project authors
  Licensed under Apache License v2.0 with Runtime Library Exception

  See https://swift.org/LICENSE.txt for license information
  See https://swift.org/CONTRIBUTORS.txt for Swift project authors
-->

<template>
  <article class="body-content">
    <component
      class="layout"
      v-for="(section, i) in content"
      v-bind="propsFor(section)"
      :is="componentFor(section)"
      :key="i"
    />
  </article>
</template>

<script>
import Columns from './Layouts/Columns.vue';
import ContentAndMedia from './Layouts/ContentAndMedia.vue';
import FullWidth from './Layouts/FullWidth.vue';

const LayoutKind = {
  columns: 'columns',
  contentAndMedia: 'contentAndMedia',
  fullWidth: 'fullWidth',
};

export default {
  name: 'BodyContent',
  props: {
    content: {
      type: Array,
      required: true,
      validator: content => content.every(({ kind }) => (
        Object.prototype.hasOwnProperty.call(LayoutKind, kind)
      )),
    },
  },
  methods: {
    componentFor(section) {
      return {
        [LayoutKind.columns]: Columns,
        [LayoutKind.contentAndMedia]: ContentAndMedia,
        [LayoutKind.fullWidth]: FullWidth,
      }[section.kind];
    },
    propsFor(section) {
      const {
        content,
        kind,
        media,
        mediaPosition,
      } = section;
      return {
        [LayoutKind.columns]: {
          columns: content,
        },
        [LayoutKind.contentAndMedia]: {
          content,
          media,
          mediaPosition,
        },
        [LayoutKind.fullWidth]: {
          content,
        },
      }[kind];
    },
  },
  LayoutKind,
};
</script>

<style scoped lang="scss">
@import 'docc-render/styles/_core.scss';

.layout + * {
  margin-top: $article-stacked-margin-large;
}

// adds a top margin to the first layout element, if it does not have a header element.
@include breakpoint(small) {
  .layout:first-child > :not(.group[id]) {
    margin-top: $article-stacked-margin-small * 2;
  }
}

</style>
