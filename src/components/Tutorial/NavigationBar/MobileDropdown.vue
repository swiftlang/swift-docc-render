<!--
  This source file is part of the Swift.org open source project

  Copyright (c) 2021 Apple Inc. and the Swift project authors
  Licensed under Apache License v2.0 with Runtime Library Exception

  See https://swift.org/LICENSE.txt for license information
  See https://swift.org/CONTRIBUTORS.txt for Swift project authors
-->

<template>
  <NavMenuItems class="mobile-dropdown">
    <ReferenceUrlProvider
      v-for="option in options"
      :key="option.reference"
      :reference="option.reference"
    >
      <NavMenuItemBase
        slot-scope="{ title: optionTitle }"
        class="chapter-list"
        role="group"
      >
        <p class="chapter-name">{{ optionTitle }}</p>
        <ul class="tutorial-list">
          <ReferenceUrlProvider
            v-for="tutorial in option.projects"
            :reference="tutorial.reference"
            :key="tutorial.reference"
          >
            <li
              slot-scope="{ url: tutorialUrl, urlWithParams, title: tutorialTitle }"
              class="tutorial-list-item"
            >
              <router-link
                :to="urlWithParams"
                :value="tutorialTitle"
                class="option tutorial"
              >
                {{ tutorialTitle }}
              </router-link>
              <ul v-if="tutorialUrl === $route.path" class="section-list" role="listbox">
                <li
                  v-for="section in sections"
                  :key="section.title"
                >
                  <router-link
                    :to="{ path: section.path, query: $route.query }"
                    :value="section.title"
                    :class="classesFor(section)"
                    @click.native="onClick(section)"
                  >
                    {{ section.title}}
                  </router-link>
                </li>
              </ul>
            </li>
          </ReferenceUrlProvider>
        </ul>
      </NavMenuItemBase>
    </ReferenceUrlProvider>
  </NavMenuItems>
</template>

<script>
import ReferenceUrlProvider from 'docc-render/components/ReferenceUrlProvider.vue';
import NavMenuItemBase from 'docc-render/components/NavMenuItemBase.vue';
import NavMenuItems from 'docc-render/components/NavMenuItems.vue';

export default {
  name: 'MobileDropdown',
  components: { NavMenuItems, NavMenuItemBase, ReferenceUrlProvider },
  props: {
    options: {
      type: Array,
      required: true,
    },
    currentOption: {
      type: String,
      required: true,
    },
    sections: {
      type: Array,
      required: false,
      default: () => [],
    },
  },
  methods: {
    classesFor(section) {
      return [
        'option',
        'section',
        { active: this.currentOption === section.title },
        this.depthClass(section),
      ];
    },
    depthClass(option) {
      const { depth = 0 } = option;
      return `depth${depth}`;
    },
    onClick(section) {
      this.$emit('select-section', section.path);
    },
  },
};
</script>

<style scoped lang="scss">
@import "docc-render/styles/_core.scss";

.mobile-dropdown {
  box-sizing: border-box;
  @include nav-in-breakpoint {
    padding-left: rem(4px);
    padding-right: rem(4px);
  }

  ul {
    list-style: none;
  }

  .option {
    cursor: pointer;
    font-size: rem(12px);
    padding: .5rem 0;
    display: block;
    text-decoration: none;
    color: inherit;

    &:focus {
      outline-offset: 0;
    }

    &.depth1 {
      padding-left: rem(8px);
    }
  }
}

.active,
.tutorial.router-link-active {
  font-weight: $font-weight-semibold;

  &:focus {
    outline: none;
  }
}

.chapter-list:not(:first-child) {
  margin-top: 1rem;
}

.chapter-name,
.tutorial {
  padding: .5rem 0;
  @include font-styles(body);
}

.tutorial-list,
.section-list {
  padding: 0 rem(10px);
}

// Add spacing below the last section in the dropdown, so that it can
// be selected on iOS Safari.
.chapter-list:last-child .tutorial-list:last-child {
  padding-bottom: $nav-menu-items-ios-bottom-spacing;
}

.chapter-list {
  display: inline-block;
}
</style>
