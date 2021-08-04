<!--
  This source file is part of the Swift.org open source project

  Copyright (c) 2021 Apple Inc. and the Swift project authors
  Licensed under Apache License v2.0 with Runtime Library Exception

  See https://swift.org/LICENSE.txt for license information
  See https://swift.org/CONTRIBUTORS.txt for Swift project authors
-->

<template>
  <div
    class="columns"
    :class="classes"
  >
    <template v-for="(column, i) in columns">
      <Asset
        :identifier="column.media"
        :key="column.media"
        :videoAutoplays="false"
      />
      <ContentNode
        v-if="column.content"
        :content="column.content"
        :key="i"
      />
    </template>
  </div>
</template>

<script>
import Asset from 'docc-render/components/Asset.vue';
import ContentNode from 'docc-render/components/Article/ContentNode.vue';

export default {
  name: 'Columns',
  components: {
    Asset,
    ContentNode,
  },
  props: {
    columns: {
      type: Array,
      required: true,
    },
  },
  computed: {
    classes() {
      return {
        'cols-2': this.columns.length === 2,
        'cols-3': this.columns.length === 3,
      };
    },
  },
};
</script>

<style scoped lang="scss">
@import 'docc-render/styles/_core.scss';

.columns {
  display: grid;
  grid-template-rows: repeat(2, auto);

  &.cols-2 {
    gap: $article-stacked-margin-small calculate-column-width(1);
    grid-template-columns: repeat(2, 1fr);
  }

  &.cols-3 {
    gap: $article-stacked-margin-small calculate-column-width(0.5);
    grid-template-columns: repeat(3, 1fr);
  }
}

.asset {
  align-self: end;
  grid-row: 1;
}

.content {
  grid-row: 2;
}

@include breakpoint(small) {
  .columns {
    &.cols-2,
    &.cols-3, {
      grid-template-columns: unset;
    }
  }

  .asset,
  .content {
    grid-row: auto;
  }
}
</style>
