<!--
  This source file is part of the Swift.org open source project

  Copyright (c) 2021 Apple Inc. and the Swift project authors
  Licensed under Apache License v2.0 with Runtime Library Exception

  See https://swift.org/LICENSE.txt for license information
  See https://swift.org/CONTRIBUTORS.txt for Swift project authors
-->

<template>
  <DropdownCustom
    :value="currentOption"
    aria-label="Current section"
    class="tutorial-dropdown"
    isSmall
  >
    <template slot="toggle-post-content">
      <span class="section-tracker">{{ sectionTracker }}</span>
    </template>
    <template
      slot="default"
      slot-scope="{
        closeAndFocusToggler,
        contentClasses,
        navigateOverOptions,
        OptionClass,
        ActiveOptionClass
      }"
    >
      <ul
        :class="contentClasses"
        class="options"
        role="listbox"
        tabindex="0"
      >
        <router-link
          v-for="option in options"
          :key="option.title"
          :to="{ path: option.path, query: $route.query }"
          custom
          v-slot="{ navigate }"
        >
          <li
            role="option"
            :value="option.title"
            :class="[OptionClass, { [ActiveOptionClass] : currentOption === option.title }]"
            :aria-selected="currentOption === option.title"
            :aria-current="ariaCurrent(option.title)"
            :tabindex="-1"
            @click="setActive(option, navigate, closeAndFocusToggler, $event)"
            @keydown.enter="setActive(option, navigate, closeAndFocusToggler, $event)"
            @keydown.esc="closeAndFocusToggler"
            @keydown.tab="closeAndFocusToggler"
            @keydown.down.prevent="navigateOverOptions($event, +1)"
            @keydown.up.prevent="navigateOverOptions($event, -1)"
          >
            {{ option.title }}
          </li>
        </router-link>
      </ul>
    </template>
  </DropdownCustom>
</template>

<script>
import DropdownCustom from 'docc-render/components/DropdownCustom.vue';

export default {
  name: 'SecondaryDropdown',
  components: { DropdownCustom },
  props: {
    options: {
      type: Array,
      required: true,
    },
    currentOption: {
      type: String,
      required: true,
    },
    sectionTracker: {
      type: String,
      required: false,
    },
  },
  methods: {
    ariaCurrent(title) {
      return this.currentOption === title ? 'section' : false;
    },
    setActive(option, navigate, closeAndFocusToggler, $event) {
      navigate($event);
      this.$emit('select-section', option.path);
      closeAndFocusToggler();
    },
  },
};
</script>

<style scoped lang="scss">
@import "docc-render/styles/_core.scss";

.tutorial-dropdown {
  grid-column: 3;
}

.section-tracker {
  @include font-styles(caption);
  color: var(--color-figure-gray-secondary);
  margin-left: 15px
}

</style>
