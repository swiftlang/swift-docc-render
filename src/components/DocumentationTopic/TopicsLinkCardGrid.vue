<!--
  This source file is part of the Swift.org open source project

  Copyright (c) 2022 Apple Inc. and the Swift project authors
  Licensed under Apache License v2.0 with Runtime Library Exception

  See https://swift.org/LICENSE.txt for license information
  See https://swift.org/CONTRIBUTORS.txt for Swift project authors
-->

<template>
  <div class="TopicsLinkCardGrid">
    <Grid :columns="compactCards ? 3 : 2">
      <Column
        v-for="(item, index) in items"
        :key="index"
      >
        <TopicsLinkCardGridItem :item="item" :compact="compactCards" />
      </Column>
    </Grid>
  </div>
</template>

<script>
import Grid from 'docc-render/components/ContentNode/Grid.vue';
import Column from 'docc-render/components/ContentNode/Column.vue';
import { TopicStyles } from 'docc-render/constants/TopicStyles';
import TopicsLinkCardGridItem from './TopicsLinkCardGridItem.vue';

export default {
  name: 'TopicsLinkCardGrid',
  components: { TopicsLinkCardGridItem, Column, Grid },
  inject: ['references'],
  props: {
    identifiers: {
      type: Array,
      required: true,
    },
    topicStyle: {
      type: String,
      default: TopicStyles.compactGrid,
    },
  },
  computed: {
    items() {
      return this.identifiers.map(i => this.references[i]);
    },
    compactCards: ({ topicStyle }) => topicStyle === TopicStyles.compactGrid,
  },
};
</script>

<style scoped lang='scss'>
@import 'docc-render/styles/_core.scss';

.grid {
  grid-gap: 20px;
}
</style>
