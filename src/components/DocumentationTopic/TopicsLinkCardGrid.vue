<!--
  This source file is part of the Swift.org open source project

  Copyright (c) 2022 Apple Inc. and the Swift project authors
  Licensed under Apache License v2.0 with Runtime Library Exception

  See https://swift.org/LICENSE.txt for license information
  See https://swift.org/CONTRIBUTORS.txt for Swift project authors
-->

<template>
  <Pager class="TopicsLinkCardGrid" :pages="pages">
    <template #page="{ page }">
      <Row :columns="{
        large: compactCards ? 3 : 2,
        medium: 2,
      }">
        <Column
          v-for="item in page"
          :key="item.title"
        >
          <TopicsLinkCardGridItem :item="item" :compact="compactCards" />
        </Column>
      </Row>
    </template>
    <BreakpointEmitter @change="handleBreakpointChange" />
  </Pager>
</template>

<script>
import BreakpointEmitter from 'docc-render/components/BreakpointEmitter.vue';
import Column from 'docc-render/components/ContentNode/Column.vue';
import Pager from 'docc-render/components/Pager.vue';
import Row from 'docc-render/components/ContentNode/Row.vue';
import { TopicSectionsStyle } from 'docc-render/constants/TopicSectionsStyle';
import { BreakpointName } from 'docc-render/utils/breakpoints';
import { page } from 'docc-render/utils/arrays';
import TopicsLinkCardGridItem from './TopicsLinkCardGridItem.vue';

export default {
  name: 'TopicsLinkCardGrid',
  components: {
    BreakpointEmitter,
    Column,
    Pager,
    Row,
    TopicsLinkCardGridItem,
  },
  data: () => ({
    breakpoint: BreakpointName.large,
  }),
  props: {
    items: {
      type: Array,
      required: true,
    },
    topicStyle: {
      type: String,
      default: TopicSectionsStyle.compactGrid,
      validator: v => v === TopicSectionsStyle.compactGrid || v === TopicSectionsStyle.detailedGrid,
    },
  },
  computed: {
    compactCards: ({ topicStyle }) => topicStyle === TopicSectionsStyle.compactGrid,
    pageSize: ({ breakpoint, topicStyle }) => ({
      [TopicSectionsStyle.compactGrid]: {
        [BreakpointName.large]: 6,
        [BreakpointName.medium]: 4,
        [BreakpointName.small]: 1,
      },
      [TopicSectionsStyle.detailedGrid]: {
        [BreakpointName.large]: 4,
        [BreakpointName.medium]: 2,
        [BreakpointName.small]: 1,
      },
    }[topicStyle][breakpoint]),
    pages: ({ items, pageSize }) => page(items, pageSize),
  },
  methods: {
    handleBreakpointChange(breakpoint) {
      this.breakpoint = breakpoint;
    },
  },
};
</script>

<style scoped lang="scss">
.pager :deep(.control) {
  // adjust the flex-centered control by an amount that offsets the space
  // between individual cards within each grid row to visually center the
  // control
  //
  // TODO: make this not hardcoded and account for varying number of rows
  margin-top: -54px;
}
</style>
