<!--
  This source file is part of the Swift.org open source project

  Copyright (c) 2021 Apple Inc. and the Swift project authors
  Licensed under Apache License v2.0 with Runtime Library Exception

  See https://swift.org/LICENSE.txt for license information
  See https://swift.org/CONTRIBUTORS.txt for Swift project authors
-->

<template>
  <section class="chapter" :id="anchor" tabindex="-1">
    <div class="info">
      <Asset :identifier="image" aria-hidden="true" />
      <div class="intro">
        <component
          :is="volumeHasName ? 'h3': 'h2'"
          class="name"
          :aria-label="`${name} - Chapter ${number}`"
        >
          <span class="eyebrow" aria-hidden="true">Chapter {{number}}</span>
          <span aria-hidden="true" class="name-text">{{name}}</span>
        </component>
        <ContentNode v-if="content" :content="content" />
      </div>
    </div>
    <TopicList :topics="topics" />
  </section>
</template>

<script>
import { anchorize } from 'docc-render/utils/strings';
import onIntersectViewport, { intersectionMargins } from 'docc-render/mixins/onIntersectViewport';

import Asset from 'docc-render/components/Asset.vue';
import ContentNode from 'docc-render/components/ContentNode.vue';

import ChapterTopicList from './ChapterTopicList.vue';

export default {
  name: 'Chapter',
  mixins: [onIntersectViewport],
  inject: {
    store: {
      default: () => ({
        setActiveSidebarLink() {},
        setActiveVolume() {},
      }),
    },
  },
  components: {
    Asset,
    ContentNode,
    TopicList: ChapterTopicList,
  },
  props: {
    content: {
      type: Array,
      required: false,
    },
    image: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    number: {
      type: Number,
      required: true,
    },
    topics: {
      type: Array,
      required: true,
    },
    volumeHasName: {
      type: Boolean,
      default: false,
    },
  },
  computed: {
    anchor: ({ name }) => anchorize(name),
    intersectionRootMargin: () => intersectionMargins.topOneThird,
  },
  methods: {
    onIntersectViewport() {
      this.store.setActiveSidebarLink(this.name);
      if (!this.volumeHasName) {
        // if the parent is not a Volume with a name, clear out the volume
        this.store.setActiveVolume(null);
      }
    },
  },
};
</script>

<style scoped lang="scss">
@import 'docc-render/styles/_core.scss';

.chapter {
  &:focus {
    outline: none !important;
  }
}

.info {
  align-items: center;
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
}

.name {
  @include font-styles(tutorials-overview-chapter-title);
  color: var(--color-tutorials-overview-header-text, light-color(fill-tertiary));

  &-text {
    word-break: break-word;
  }
}

.eyebrow {
  @include font-styles(body-tight);
  color: var(--color-tutorials-overview-eyebrow);
  display: block;
  font-weight: $font-weight-semibold;
  margin-bottom: 5px;
}

.content {
  @include font-styles(body-reduced);
  color: var(--color-tutorials-overview-content-alt);
}

.asset {
  flex: 0 0 190px;
}

.intro {
  flex: 0 1 360px;
}

@include breakpoint-between-medium-and-nav-medium() {
  .asset {
    flex: 0 0 130px;
  }

  .intro {
    flex: 0 1 260px;
  }
}

@include breakpoint(small, $scope: nav) {
  .intro {
    flex: 0 1 340px;
  }
}

@include breakpoint(small) {
  .info {
    display: block;
    text-align: center;
  }

  .asset {
    margin: 0 45px;
  }

  .eyebrow {
    margin-bottom: 7px;
  }

  .intro {
    margin-top: 40px;
  }
}
</style>
