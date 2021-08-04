<!--
  This source file is part of the Swift.org open source project

  Copyright (c) 2021 Apple Inc. and the Swift project authors
  Licensed under Apache License v2.0 with Runtime Library Exception

  See https://swift.org/LICENSE.txt for license information
  See https://swift.org/CONTRIBUTORS.txt for Swift project authors
-->

<template>
  <div class="tile-group" :class="countClass">
    <Tile v-for="tile in tiles" v-bind="propsFor(tile)" :key="tile.title" />
  </div>
</template>

<script>
import ResourcesTile from './ResourcesTile.vue';

export default {
  name: 'TileGroup',
  components: { Tile: ResourcesTile },
  props: {
    tiles: {
      type: Array,
      required: true,
    },
  },
  computed: {
    countClass: ({ tiles }) => `count-${tiles.length}`,
  },
  methods: {
    propsFor: ({
      action,
      content,
      identifier,
      title,
    }) => ({
      action,
      content,
      identifier,
      title,
    }),
  },
};
</script>

<style scoped lang="scss">
@import 'docc-render/styles/_core.scss';

$tile-margin: $tutorials-overview-tile-margin-single-side;

.tile-group {
  display: grid;
  grid-column-gap: $tile-margin;
  grid-row-gap: $tile-margin;

  &.count-1 {
    grid-template-columns: 1fr;
    text-align: center;

    /deep/ .icon {
      margin-left: auto;
      margin-right: auto;
    }
  }

  &.count-2 {
    grid-template-columns: repeat(2, 1fr);
  }

  &.count-3 {
    grid-template-columns: repeat(3, 1fr);
  }

  &.count-4 {
    grid-template-columns: repeat(2, 1fr);
    grid-template-rows: repeat(2, auto);
  }

  &.count-5 {
    grid-template-columns: repeat(6, 1fr);
    grid-template-rows: repeat(2, auto);

    .tile {
      grid-column-end: span 2;

      &:nth-of-type(-n+2) {
        grid-column-end: span 3;
      }
    }
  }

  &.count-6 {
    grid-template-columns: repeat(2, 1fr);
    grid-template-rows: repeat(3, auto);
  }
}

@include breakpoint-between-medium-and-nav-medium() {
  .tile-group.tile-group {
    grid-template-columns: 1fr;
    grid-template-rows: auto;
  }
}

@include breakpoint(small) {
  .tile-group {
    &.count-1,
    &.count-2,
    &.count-3,
    &.count-4,
    &.count-5,
    &.count-6 {
      grid-template-columns: 1fr;
      grid-template-rows: auto;
    }
  }
}
</style>
