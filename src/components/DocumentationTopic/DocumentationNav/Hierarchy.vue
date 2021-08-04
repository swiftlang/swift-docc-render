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
      v-for="topic in collapsibleItems"
      :key="topic.title"
      :isCollapsed="shouldCollapseItems"
      :url="addQueryParamsToUrl(topic.url)"
    >
      {{ topic.title }}
    </HierarchyItem>
    <HierarchyCollapsedItems
      v-if="shouldCollapseItems"
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
  inject: {
    references: {
      default: () => ({}),
    },
  },
  props: {
    isSymbolDeprecated: Boolean,
    isSymbolBeta: Boolean,
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
  computed: {
    parentTopics() {
      return this.parentTopicIdentifiers.map((id) => {
        const { title, url } = this.references[id];
        return { title, url };
      });
    },
    shouldCollapseItems() {
      return (this.parentTopics.length + 1) > MaxVisibleItems;
    },
    collapsibleItems: ({ parentTopics }) => parentTopics.slice(0, -1),
    nonCollapsibleItems: ({ parentTopics }) => parentTopics.slice(-1),
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
<style scoped>
.hierarchy {
  justify-content: flex-start;
  min-width: 0;
}
</style>
