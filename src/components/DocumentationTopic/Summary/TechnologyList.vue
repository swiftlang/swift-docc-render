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
    <Badge
      v-for="technology in technologies"
      class="technology"
      :key="technology.name"
    >
      <TechnologyIcon class="tech-icon" />
      <WordBreak class="name">{{ technology.name }}</WordBreak>
      <WordBreak
        v-for="module in (technology.relatedModules || [])"
        class="name"
        :key="module"
      >{{ module }}
      </WordBreak>
    </Badge>
  </Section>
</template>

<script>
import Badge from 'docc-render/components/Badge.vue';
import TechnologyIcon from 'docc-render/components/Icons/TechnologyIcon.vue';
import WordBreak from 'docc-render/components/WordBreak.vue';
import { pluralize } from 'docc-render/utils/strings';
import Section from './Section.vue';

export default {
  name: 'TechnologyList',
  components: {
    Badge,
    TechnologyIcon,
    Section,
    WordBreak,
  },
  props: {
    technologies: {
      type: Array,
      required: true,
    },
    title: {
      type: String,
      required: false,
    },
  },
  computed: {
    computedTitle: ({ title, defaultTitle }) => title || defaultTitle,
    defaultTitle: ({ technologies }) => pluralize({
      en: {
        one: 'Technology',
        other: 'Technologies',
      },
    }, technologies.length),
  },
};
</script>

<style scoped lang="scss">
@import 'docc-render/styles/_core.scss';

.technologies, .technology-list {
  display: flex;
}

.tech-icon {
  height: 12px;
  position: relative;
  align-items: center;
  padding-right: 5px;
}

.name {
  text-rendering: optimizeLegibility;

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
