<!--
  This source file is part of the Swift.org open source project

  Copyright (c) 2021 Apple Inc. and the Swift project authors
  Licensed under Apache License v2.0 with Runtime Library Exception

  See https://swift.org/LICENSE.txt for license information
  See https://swift.org/CONTRIBUTORS.txt for Swift project authors
-->

<template>
  <NavMenuItems
    aria-label="Breadcrumbs"
    :class="{ 'has-badge': hasBadge }"
    class="hierarchy"
  >
    <HierarchyItem
      v-if="root"
      :key="root.title"
      class="root-hierarchy"
      :url="addQueryParamsToUrl(root.url)"
    >
      {{ root.title }}
    </HierarchyItem>
    <HierarchyItem
      v-for="topic in collapsibleItems"
      :key="topic.title"
      isCollapsed
      :url="addQueryParamsToUrl(topic.url)"
    >
      {{ topic.title }}
    </HierarchyItem>
    <HierarchyCollapsedItems
      v-if="collapsibleItems.length"
      :topics="collapsibleItems"
    />
    <HierarchyItem
      v-for="topic in nonCollapsibleItems"
      :key="topic.title"
      :url="addQueryParamsToUrl(topic.url)"
    >
      {{ topic.title }}
    </HierarchyItem>
    <HierarchyItem>
      {{ currentTopicTitle }}
      <template slot="tags">
        <Badge v-if="isSymbolDeprecated" variant="deprecated" />
        <Badge v-else-if="isSymbolBeta" variant="beta" />
        <Badge
          v-for="badge in currentTopicTags"
          :key="`${badge.type}-${badge.text}`"
          :variant="badge.type"
        >
          {{ badge.text }}
        </Badge>
      </template>
    </HierarchyItem>
  </NavMenuItems>
</template>

<script>
import { buildUrl } from 'docc-render/utils/url-helper';
import NavMenuItems from 'docc-render/components/NavMenuItems.vue';
import Badge from 'docc-render/components/Badge.vue';
import throttle from 'docc-render/utils/throttle';
import HierarchyCollapsedItems from './HierarchyCollapsedItems.vue';
import HierarchyItem from './HierarchyItem.vue';

// The max number of items that will initially be visible and uncollapsed w/o
// any user interaction. If there are more items, they will be collapsed into a
// menu that users need to interact with to see.
const MaxVisibleItems = 3;

export default {
  name: 'Hierarchy',
  components: {
    Badge,
    NavMenuItems,
    HierarchyCollapsedItems,
    HierarchyItem,
  },
  props: {
    isSymbolDeprecated: Boolean,
    isSymbolBeta: Boolean,
    references: Object,
    currentTopicTitle: {
      type: String,
      required: true,
    },
    parentTopicIdentifiers: {
      type: Array,
      default: () => [],
    },
    currentTopicTags: {
      type: Array,
      default: () => [],
    },
  },
  data() {
    return {
      windowWidth: window.innerWidth,
    };
  },
  mounted() {
    // start tracking the window size
    const cb = throttle(() => { this.windowWidth = window.innerWidth; }, 150);
    window.addEventListener('resize', cb);
    this.$once('hook:beforeDestroy', () => {
      window.removeEventListener('resize', cb);
    });
  },
  computed: {
    parentTopics() {
      return this.parentTopicIdentifiers.map((id) => {
        const { title, url } = this.references[id];
        return { title, url };
      });
    },
    /**
     * Extract the root item from the parentTopics
     */
    root: ({ parentTopics }) => parentTopics[0],
    /**
     * Figure out how many items we can show, after the collapsed items,
     * based on the window.innerWidth
     */
    linksAfterCollapse: ({ windowWidth }) => {
      // never show more than the `MaxVisibleItems`
      if (windowWidth > 1200) return MaxVisibleItems;
      if (windowWidth > 1000) return MaxVisibleItems - 1;
      if (windowWidth >= 800) return MaxVisibleItems - 2;
      return 0;
    },
    collapsibleItems: ({ parentTopics, linksAfterCollapse }) => (
      // if there are links, slice all except those, otherwise get all but the root
      linksAfterCollapse ? parentTopics.slice(1, -linksAfterCollapse) : parentTopics.slice(1)
    ),
    nonCollapsibleItems: ({ parentTopics, linksAfterCollapse }) => (
      // if there are links to show, slice them out, otherwise return none
      linksAfterCollapse ? parentTopics.slice(1).slice(-linksAfterCollapse) : []
    ),
    hasBadge: ({ isSymbolDeprecated, isSymbolBeta, currentTopicTags }) => (
      isSymbolDeprecated || isSymbolBeta || currentTopicTags.length
    ),
  },
  methods: {
    addQueryParamsToUrl(url) {
      return buildUrl(url, this.$route.query);
    },
  },
};
</script>
<style scoped lang="scss">
@import 'docc-render/styles/_core.scss';

.hierarchy {
  justify-content: flex-start;
  min-width: 0;
  margin-right: 80px;
  @include nav-in-breakpoint() {
    margin-right: 0;
  }

  .root-hierarchy {
    flex: 1 0 auto;
  }
}
</style>
