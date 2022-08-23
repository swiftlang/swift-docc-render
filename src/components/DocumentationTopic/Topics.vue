<!--
  This source file is part of the Swift.org open source project

  Copyright (c) 2021 Apple Inc. and the Swift project authors
  Licensed under Apache License v2.0 with Runtime Library Exception

  See https://swift.org/LICENSE.txt for license information
  See https://swift.org/CONTRIBUTORS.txt for Swift project authors
-->

<template>
  <TopicsTable
    v-if="shouldRenderList"
    anchor="topics"
    title="Topics"
    :isSymbolDeprecated="isSymbolDeprecated"
    :isSymbolBeta="isSymbolBeta"
    :sections="sections"
  />
  <TopicsGrid
    v-else
    :sections="sections"
    :topicStyle="topicStyle"
  />
</template>

<script>
import { TopicStyles } from 'docc-render/constants/TopicStyles';
import TopicsGrid from './TopicsGrid.vue';
import TopicsTable from './TopicsTable.vue';

export default {
  name: 'Topics',
  components: { TopicsGrid, TopicsTable },
  props: {
    isSymbolDeprecated: Boolean,
    isSymbolBeta: Boolean,
    sections: TopicsTable.props.sections,
    topicStyle: {
      type: String,
      required: true,
    },
  },
  computed: {
    shouldRenderList: ({ topicStyle }) => topicStyle === TopicStyles.list,
  },
};
</script>
