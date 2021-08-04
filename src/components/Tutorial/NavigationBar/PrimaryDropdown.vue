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
    aria-label="Current tutorial"
    class="tutorial-dropdown"
    isSmall
  >
    <template
      slot="default"
      slot-scope="{
        closeAndFocusToggler,
        contentClasses,
        closeDropdown,
        navigateOverOptions,
        OptionClass,
        ActiveOptionClass
     }"
    >
      <ul
        :class="contentClasses"
        class="options"
        tabindex="0"
      >
        <ReferenceUrlProvider
          v-for="chapterName in options"
          :key="chapterName.reference"
          :reference="chapterName.reference"
        >
          <li
            slot-scope="{ title: chapterTitle }"
            class="chapter-list"
            role="group"
          >
            <p class="chapter-name">{{ chapterTitle }}</p>
            <ul role="listbox">
              <ReferenceUrlProvider
                v-for="tutorial in chapterName.projects"
                :key="tutorial.reference"
                :reference="tutorial.reference"
                #default="{ urlWithParams, title }"
              >
                <router-link
                  :to="urlWithParams"
                  custom
                  #default="{ navigate, isActive }"
                >
                  <li
                    :class="{ [OptionClass]: true, [ActiveOptionClass]: isActive }"
                    role="option"
                    :value="title"
                    :aria-selected="isActive"
                    :aria-current="isActive ? 'tutorial': false"
                    :tabindex="-1"
                    @click="setActive(navigate, closeDropdown, $event)"
                    @keydown.enter="setActive(navigate, closeDropdown, $event)"
                    @keydown.esc="closeAndFocusToggler"
                    @keydown.tab="closeAndFocusToggler"
                    @keydown.down.prevent="navigateOverOptions($event, +1)"
                    @keydown.up.prevent="navigateOverOptions($event, -1)"
                  >
                    {{ title }}
                  </li>
                </router-link>
              </ReferenceUrlProvider>
            </ul>
          </li>
        </ReferenceUrlProvider>
      </ul>
    </template>
  </DropdownCustom>
</template>

<script>
import ReferenceUrlProvider from 'docc-render/components/ReferenceUrlProvider.vue';
import DropdownCustom from 'docc-render/components/DropdownCustom.vue';

export default {
  name: 'PrimaryDropdown',
  components: { DropdownCustom, ReferenceUrlProvider },
  props: {
    options: {
      type: Array,
      required: true,
    },
    currentOption: {
      type: String,
      required: true,
    },
  },

  methods: {
    setActive(navigate, closeDropdown, $event) {
      navigate($event);
      closeDropdown();
    },
  },
};
</script>

<style scoped lang="scss">
@import "docc-render/styles/_core.scss";

.tutorial-dropdown {
  grid-column: 1/2;

  .options {
    padding-top: 1rem;
    padding-bottom: 0;
  }

  .option {
    padding: 5px 20px 5px 30px;
  }
}

.chapter-list {
  padding-bottom: 20px;
}

.chapter-name {
  margin: 0 20px 5px 20px;
  line-height: initial;
  color: var(--color-figure-gray-secondary);
}

</style>
