<!--
  This source file is part of the Swift.org open source project

  Copyright (c) 2021 Apple Inc. and the Swift project authors
  Licensed under Apache License v2.0 with Runtime Library Exception

  See https://swift.org/LICENSE.txt for license information
  See https://swift.org/CONTRIBUTORS.txt for Swift project authors
-->

<template>
  <section class="volume">
    <VolumeName v-if="name" v-bind="{ name, image, content }" />
    <Chapter
      v-for="(chapter, i) in chapters"
      class="tile"
      :content="chapter.content"
      :image="chapter.image"
      :key="chapter.name"
      :name="chapter.name"
      :number="i + 1"
      :topics="lookupTopics(chapter.tutorials)"
      :volumeHasName="!!name"
    />
  </section>
</template>

<script>
import VolumeName from 'docc-render/components/TutorialsOverview/VolumeName.vue';
import onIntersectViewport, { intersectionMargins } from 'docc-render/mixins/onIntersectViewport';

import Chapter from './Chapter.vue';

export default {
  name: 'Volume',
  mixins: [onIntersectViewport],
  components: {
    VolumeName,
    Chapter,
  },
  computed: {
    intersectionRootMargin: () => intersectionMargins.topOneThird,
  },
  inject: {
    references: { default: () => ({}) },
    store: {
      default: () => ({
        setActiveVolume() {},
      }),
    },
  },
  props: {
    chapters: {
      type: Array,
      required: true,
    },
    content: {
      type: Array,
      required: false,
    },
    image: {
      type: String,
      required: false,
    },
    name: {
      type: String,
      required: false,
    },
  },
  methods: {
    lookupTopics(identifiers) {
      // map each identifier to a tutorial/article reference while omitting any
      // that can't be found
      return identifiers.reduce((refs, id) => (
        refs.concat(this.references[id] || [])
      ), []);
    },
    onIntersectViewport() {
      if (this.name) {
        this.store.setActiveVolume(this.name);
      }
    },
  },
};
</script>

<style scoped lang="scss">
@import 'docc-render/styles/_core.scss';

$tile-margin: $tutorials-overview-tile-margin-single-side;

.tile {
  background: var(--color-tutorials-overview-fill-secondary, dark-color(fill-secondary));
  margin: $tile-margin 0;
  padding: 50px 60px;
}

.asset {
  margin-bottom: 10px;
}

@include breakpoint-between-medium-and-nav-medium {
  .tile {
    padding: 40px 30px;
  }
}

@include breakpoint(small) {
  .volume {
    border-radius: 0;
  }
  .tile {
    padding: 40px 20px;
  }
}
</style>
