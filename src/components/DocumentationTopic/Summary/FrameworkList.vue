<!--
  This source file is part of the Swift.org open source project

  Copyright (c) 2021 Apple Inc. and the Swift project authors
  Licensed under Apache License v2.0 with Runtime Library Exception

  See https://swift.org/LICENSE.txt for license information
  See https://swift.org/CONTRIBUTORS.txt for Swift project authors
-->

<template>
  <Section
    class="frameworks"
    role="complementary"
    :aria-label="computedTitle"
  >
    <Title>{{ computedTitle }}</Title>
    <List>
      <Item v-for="framework in frameworks" :key="framework.name">
        <WordBreak class="name">{{ framework.name }}</WordBreak>
        <WordBreak
          v-for="module in (framework.relatedModules || [])"
          class="name"
          :key="module"
        >{{ module }}
        </WordBreak>
      </Item>
    </List>
  </Section>
</template>

<script>
import WordBreak from 'docc-render/components/WordBreak.vue';
import { pluralize } from 'docc-render/utils/strings';
import List from './List.vue';
import ListItem from './ListItem.vue';
import Section from './Section.vue';
import Title from './Title.vue';

export default {
  name: 'FrameworkList',
  components: {
    Item: ListItem,
    List,
    Section,
    Title,
    WordBreak,
  },
  props: {
    frameworks: {
      type: Array,
      required: true,
    },
    title: {
      type: String,
      default: 'Framework',
    },
  },
  computed: {
    computedTitle: ({ title, frameworks }) => `${title}${pluralize(frameworks)}`,
  },
};
</script>

<style scoped lang="scss">
.name {
  &::after {
    content: ', ';
  }

  &:last-of-type {
    &::after {
      content: '';
    }
  }
}
</style>
