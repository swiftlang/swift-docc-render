<!--
  This source file is part of the Swift.org open source project

  Copyright (c) 2022 Apple Inc. and the Swift project authors
  Licensed under Apache License v2.0 with Runtime Library Exception

  See https://swift.org/LICENSE.txt for license information
  See https://swift.org/CONTRIBUTORS.txt for Swift project authors
-->

<template>
  <div class="TopicsLinkCardGrid">
    <Row :columns="{
      large: compactCards ? 3 : 2,
      medium: 2,
    }">
      <Column
        v-for="item in items"
        :key="item.title"
      >
        <TopicsLinkCardGridItem :item="item" :compact="compactCards" />
      </Column>
    </Row>
  </div>
</template>

<script>
import Row from 'docc-render/components/ContentNode/Row.vue';
import Column from 'docc-render/components/ContentNode/Column.vue';
import { TopicSectionsStyle } from 'docc-render/constants/TopicSectionsStyle';
import TopicsLinkCardGridItem from './TopicsLinkCardGridItem.vue';

export default {
  name: 'TopicsLinkCardGrid',
  components: { TopicsLinkCardGridItem, Column, Row },
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
  },
};
</script>
