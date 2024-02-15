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
  </Pager>
</template>

<script>
import Column from 'docc-render/components/ContentNode/Column.vue';
import Pager from 'docc-render/components/Pager.vue';
import Row from 'docc-render/components/ContentNode/Row.vue';
import { TopicSectionsStyle } from 'docc-render/constants/TopicSectionsStyle';
import { page } from 'docc-render/utils/arrays';
import TopicsLinkCardGridItem from './TopicsLinkCardGridItem.vue';

const ItemsPerPage = 6;

export default {
  name: 'TopicsLinkCardGrid',
  components: {
    Column,
    Pager,
    Row,
    TopicsLinkCardGridItem,
  },
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
    pages: ({ items }) => page(items, ItemsPerPage),
  },
};
</script>
