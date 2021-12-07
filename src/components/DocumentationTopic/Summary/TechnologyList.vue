<!--
  This source file is part of the Swift.org open source project

  Copyright (c) 2021 Apple Inc. and the Swift project authors
  Licensed under Apache License v2.0 with Runtime Library Exception

  See https://swift.org/LICENSE.txt for license information
  See https://swift.org/CONTRIBUTORS.txt for Swift project authors
-->

<template>
  <Section
    class="technologies"
    role="complementary"
    :aria-label="computedTitle"
  >
    <Title>{{ computedTitle }}</Title>
    <List>
      <Item v-for="technology in technologies" :key="technology.name">
        <WordBreak class="name">{{ technology.name }}</WordBreak>
        <WordBreak
          v-for="module in (technology.relatedModules || [])"
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
  name: 'TechnologyList',
  components: {
    Item: ListItem,
    List,
    Section,
    Title,
    WordBreak,
  },
  props: {
    technologies: {
      type: Array,
      required: true,
    },
    title: {
      type: Object,
      default: () => ({
        en: {
          one: 'Technology',
          other: 'Technologies',
        },
      }),
    },
  },
  computed: {
    computedTitle: ({ title, technologies }) => `${pluralize(title, technologies.length)}`,
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
