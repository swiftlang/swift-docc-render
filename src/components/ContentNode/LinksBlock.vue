<!--
  This source file is part of the Swift.org open source project

  Copyright (c) 2022 Apple Inc. and the Swift project authors
  Licensed under Apache License v2.0 with Runtime Library Exception

  See https://swift.org/LICENSE.txt for license information
  See https://swift.org/CONTRIBUTORS.txt for Swift project authors
-->
<template>
  <TopicsLinkCardGrid v-if="!isListStyle" :identifiers="items" :topic-style="blockStyle" />
</template>

<script>
import TopicsLinkCardGrid from 'docc-render/components/DocumentationTopic/TopicsLinkCardGrid.vue';
import { TopicSectionsStyle } from 'docc-render/constants/TopicSectionsStyle';

export default {
  name: 'LinksBlock',
  components: { TopicsLinkCardGrid },
  props: {
    items: {
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
  },
};
</script>

<style scoped lang='scss'>
@import 'docc-render/styles/_core.scss';

</style>
