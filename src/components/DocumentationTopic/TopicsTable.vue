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
      v-for="(section, i) in sectionsWithTopics"
      :key="`${section.title}_${i}`"
      :title="section.title"
      :anchor="section.anchor"
      :class="{ 'no-title': !section.title }"
    >
      <template v-if="section.title && wrapTitle" #title="{ className }">
        <LinkableHeading
          :level="3"
          :anchor="section.anchor"
          :class="className"
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
      <template v-if="shouldRenderList">
        <TopicsLinkBlock
          v-for="topic in section.topics"
          class="topic"
          :key="topic.identifier"
          :topic="topic"
          :isSymbolDeprecated="isSymbolDeprecated"
          :isSymbolBeta="isSymbolBeta"
        />
      </template>
      <TopicsLinkCardGrid
        v-else
        :items="section.topics"
        :topicStyle="topicStyle"
        class="topic"
      />
    </ContentTableSection>
  </ContentTable>
</template>

<script>
import ContentNode from 'docc-render/components/DocumentationTopic/ContentNode.vue';
import WordBreak from 'docc-render/components/WordBreak.vue';
import { TopicSectionsStyle } from 'docc-render/constants/TopicSectionsStyle';
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
      default: TopicSectionsStyle.list,
    },
  },
  computed: {
    shouldRenderList: ({ topicStyle }) => topicStyle === TopicSectionsStyle.list,
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

  // if there is no title, remove the top margin of the first item
  .no-title &:first-child {
    margin-top: 0;
  }
}
</style>
