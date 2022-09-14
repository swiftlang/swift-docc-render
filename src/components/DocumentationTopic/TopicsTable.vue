<!--
  This source file is part of the Swift.org open source project

  Copyright (c) 2021-2022 Apple Inc. and the Swift project authors
  Licensed under Apache License v2.0 with Runtime Library Exception

  See https://swift.org/LICENSE.txt for license information
  See https://swift.org/CONTRIBUTORS.txt for Swift project authors
-->

<template>
  <ContentTable :anchor="anchor" :title="title">
    <ContentTableSection
      v-for="section in sectionsWithTopics"
      :key="section.title"
      :title="section.title"
      :anchor="section.anchor"
    >
      <template v-if="wrapTitle" slot="title">
        <LinkableHeading
          :level="3"
          :anchor="section.anchor"
          class="title"
          :register-on-this-page="false"
        >
          <WordBreak>{{ section.title }}</WordBreak>
        </LinkableHeading>
      </template>
      <template v-if="section.abstract" slot="abstract">
        <ContentNode :content="section.abstract" />
      </template>
      <template v-if="section.discussion" slot="discussion">
        <ContentNode :content="section.discussion.content" />
      </template>
      <TopicsLinkCardGrid
        v-if="!shouldRenderList"
        :items="section.topics"
        :topicStyle="topicStyle"
        class="topic"
      />
      <template v-else>
        <TopicsLinkBlock
          v-for="topic in section.topics"
          class="topic"
          :key="topic.identifier"
          :topic="topic"
          :isSymbolDeprecated="isSymbolDeprecated"
          :isSymbolBeta="isSymbolBeta"
        />
      </template>
    </ContentTableSection>
  </ContentTable>
</template>

<script>
import ContentNode from 'docc-render/components/DocumentationTopic/ContentNode.vue';
import WordBreak from 'docc-render/components/WordBreak.vue';
import { TopicStyles } from 'docc-render/constants/TopicStyles';
import TopicsLinkCardGrid from 'docc-render/components/DocumentationTopic/TopicsLinkCardGrid.vue';
import LinkableHeading from 'docc-render/components/ContentNode/LinkableHeading.vue';
import ContentTable from './ContentTable.vue';
import ContentTableSection from './ContentTableSection.vue';
import TopicsLinkBlock from './TopicsLinkBlock.vue';

export default {
  name: 'TopicsTable',
  inject: {
    references: {
      default() {
        return {};
      },
    },
  },
  components: {
    TopicsLinkCardGrid,
    WordBreak,
    ContentTable,
    TopicsLinkBlock,
    ContentNode,
    ContentTableSection,
    LinkableHeading,
  },
  props: {
    isSymbolDeprecated: Boolean,
    isSymbolBeta: Boolean,
    sections: {
      type: Array,
      required: true,
    },
    title: {
      type: String,
      required: false,
      default() {
        return 'Topics';
      },
    },
    anchor: {
      type: String,
      required: false,
      default() {
        return 'topics';
      },
    },
    wrapTitle: {
      type: Boolean,
      default: false,
    },
    topicStyle: {
      type: String,
      default: TopicStyles.list,
    },
  },
  computed: {
    shouldRenderList: ({ topicStyle }) => topicStyle === TopicStyles.list,
    sectionsWithTopics() {
      return this.sections.map(section => ({
        ...section,
        topics: section.identifiers.reduce(
          (list, id) => (this.references[id] ? list.concat(this.references[id]) : list),
          [],
        ),
      }));
    },
  },
};
</script>

<style scoped lang="scss">
@import 'docc-render/styles/_core.scss';

.topic,
.section-content > .content {
  margin-top: 15px;
}
</style>
