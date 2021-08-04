<!--
  This source file is part of the Swift.org open source project

  Copyright (c) 2021 Apple Inc. and the Swift project authors
  Licensed under Apache License v2.0 with Runtime Library Exception

  See https://swift.org/LICENSE.txt for license information
  See https://swift.org/CONTRIBUTORS.txt for Swift project authors
-->

<template>
  <nav class="tutorials-navigation">
    <TutorialsNavigationList>
      <li
        v-for="(section, i) in sections"
        :key="`${section.name}_${i}`"
        :class="sectionClasses(section)"
      >
        <component
          v-if="isVolume(section)"
          :is="componentForVolume(section)"
          v-bind="propsForVolume(section)"
          @select-menu="onSelectMenu"
          @deselect-menu="onDeselectMenu"
        >
        <li v-for="(chapter) in section.chapters" :key="chapter.name">
          <TutorialsNavigationLink>
            {{ chapter.name }}
          </TutorialsNavigationLink>
        </li>
      </component>
      <TutorialsNavigationLink v-else-if="isResources(section)">
        Resources
      </TutorialsNavigationLink>
      </li>
    </TutorialsNavigationList>
  </nav>
</template>

<script>
import TutorialsNavigationLink from './TutorialsNavigationLink.vue';
import TutorialsNavigationList from './TutorialsNavigationList.vue';
import TutorialsNavigationMenu from './TutorialsNavigationMenu.vue';

const SectionKind = {
  resources: 'resources',
  volume: 'volume',
};

export default {
  name: 'TutorialsNavigation',
  components: {
    TutorialsNavigationLink,
    TutorialsNavigationList,
    TutorialsNavigationMenu,
  },
  constants: { SectionKind },
  inject: {
    store: {
      default: () => ({
        setActiveVolume() {},
      }),
    },
  },
  data() {
    return { state: this.store.state };
  },
  props: {
    sections: {
      type: Array,
      required: true,
    },
  },
  computed: {
    activeVolume: ({ state }) => state.activeVolume,
  },
  methods: {
    sectionClasses(section) {
      return {
        volume: this.isVolume(section),
        'volume--named': this.isNamedVolume(section),
        resource: this.isResources(section),
      };
    },
    componentForVolume: ({ name }) => (name ? TutorialsNavigationMenu : TutorialsNavigationList),
    isResources: ({ kind }) => kind === SectionKind.resources,
    isVolume: ({ kind }) => kind === SectionKind.volume,

    activateFirstNamedVolume() {
      // activate the first volume named volume right away on creation
      const { isNamedVolume, sections } = this;
      const firstNamedVolume = sections.find(isNamedVolume);

      if (firstNamedVolume) {
        this.store.setActiveVolume(firstNamedVolume.name);
      }
    },
    isNamedVolume(section) {
      return this.isVolume(section) && section.name;
    },
    onDeselectMenu() {
      this.store.setActiveVolume(null);
    },
    onSelectMenu(name) {
      this.store.setActiveVolume(name);
    },
    propsForVolume({ name }) {
      const { activeVolume } = this;
      return name ? ({
        collapsed: name !== activeVolume,
        title: name,
      }) : ({
        'aria-label': 'Chapters',
      });
    },
  },
  created() {
    this.activateFirstNamedVolume();
  },
};
</script>
<style lang="scss" scoped>
@import 'docc-render/styles/_core.scss';

.tutorials-navigation {
  @include font-styles(body-tight);
}
</style>
