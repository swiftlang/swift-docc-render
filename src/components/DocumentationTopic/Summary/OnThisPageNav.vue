<!--
  This source file is part of the Swift.org open source project

  Copyright (c) 2021 Apple Inc. and the Swift project authors
  Licensed under Apache License v2.0 with Runtime Library Exception

  See https://swift.org/LICENSE.txt for license information
  See https://swift.org/CONTRIBUTORS.txt for Swift project authors
-->

<template>
  <Section class="on-this-page">
    <nav aria-labelledby="on-this-page-title">
      <Title id="on-this-page-title">On This Page</Title>
      <List>
        <ListItem v-for="section in sectionsWithFragments" :key="section.anchor">
          <router-link
            class="link"
            :to="buildUrl(section.fragment, $route.query)"
          >
            <span class="link-text">{{ section.title }}</span>
            <span
              class="icon-holder"
              aria-hidden="true"
            >&nbsp;<InlineChevronDownCircleIcon class="link-icon icon-inline" /></span>
          </router-link>
        </ListItem>
      </List>
    </nav>
  </Section>
</template>

<script>
import InlineChevronDownCircleIcon from 'theme/components/Icons/InlineChevronDownCircleIcon.vue';
import { buildUrl } from 'docc-render/utils/url-helper';
import List from './List.vue';
import ListItem from './ListItem.vue';
import Section from './Section.vue';
import Title from './Title.vue';

export default {
  name: 'OnThisPageNav',
  components: {
    InlineChevronDownCircleIcon,
    List,
    ListItem,
    Section,
    Title,
  },
  props: {
    sections: {
      type: Array,
      required: true,
    },
  },
  computed: {
    sectionsWithFragments() {
      return this.sections.map(({
        anchor,
        title,
      }) => ({
        anchor,
        fragment: `#${anchor}`,
        title,
      }));
    },
  },
  methods: {
    buildUrl,
  },
};
</script>

<style scoped lang="scss">
@import 'docc-render/styles/_core.scss';

.icon-holder {
  display: inline;
  white-space: nowrap;

  .link-text {
    vertical-align: middle;
  }

  .link-icon {
    height: 1em;
    vertical-align: text-bottom;
  }
}
</style>
