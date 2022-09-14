<!--
  This source file is part of the Swift.org open source project

  Copyright (c) 2022 Apple Inc. and the Swift project authors
  Licensed under Apache License v2.0 with Runtime Library Exception

  See https://swift.org/LICENSE.txt for license information
  See https://swift.org/CONTRIBUTORS.txt for Swift project authors
-->
<template>
  <TopicsLinkCardGrid
    v-if="!isListStyle"
    class="links-block"
    :items="items"
    :topic-style="blockStyle"
  />
  <div v-else class="links-block">
    <TopicsLinkBlock
      v-for="item in items"
      :key="item.identifier"
      :topic="item"
    />
  </div>
</template>

<script>
import TopicsLinkCardGrid from 'docc-render/components/DocumentationTopic/TopicsLinkCardGrid.vue';
import { TopicSectionsStyle } from 'docc-render/constants/TopicSectionsStyle';

export default {
  name: 'LinksBlock',
  inject: ['references'],
  components: {
    // async import to overcome potential infinite loops from importing ContentNode inside.
    TopicsLinkBlock: () => import('docc-render/components/DocumentationTopic/TopicsLinkBlock.vue'),
    TopicsLinkCardGrid,
  },
  props: {
    identifiers: {
      type: Array,
      required: true,
    },
    blockStyle: {
      type: String,
      default: TopicSectionsStyle.compactGrid,
    },
  },
  computed: {
    isListStyle: ({ blockStyle }) => blockStyle === TopicSectionsStyle.list,
    items: ({ identifiers, references }) => identifiers.reduce((all, identifier) => (
      references[identifier] ? all.concat(references[identifier]) : all
    ), []),
  },
};
</script>

<style scoped lang='scss'>
@import 'docc-render/styles/_core.scss';

.links-block + /deep/ * {
  margin-top: $stacked-margin-xlarge;
}
</style>
