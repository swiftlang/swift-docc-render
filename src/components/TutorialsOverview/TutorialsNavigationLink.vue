<!--
  This source file is part of the Swift.org open source project

  Copyright (c) 2021 Apple Inc. and the Swift project authors
  Licensed under Apache License v2.0 with Runtime Library Exception

  See https://swift.org/LICENSE.txt for license information
  See https://swift.org/CONTRIBUTORS.txt for Swift project authors
-->

<template>
  <router-link
    class="tutorials-navigation-link"
    :class="{ active }"
    :to="fragment"
    @click.native="handleFocus"
  >
    <slot />
  </router-link>
</template>

<script>
import { anchorize } from 'docc-render/utils/strings';
import scrollToElement from 'docc-render/mixins/scrollToElement';

export default {
  name: 'TutorialsNavigationLink',
  mixins: [scrollToElement],
  inject: {
    store: {
      default: () => ({ state: {} }),
    },
  },
  data() {
    return { state: this.store.state };
  },
  computed: {
    active: ({
      state: { activeTutorialLink },
      text,
    }) => text === activeTutorialLink,
    fragment: ({ text, $route }) => ({ hash: anchorize(text), query: $route.query }),
    text: ({ $slots: { default: [{ text: slotText }] } }) => slotText.trim(),
  },
  methods: {
    /**
     * Always scroll to the element and focus it.
     * This ensures that the next tab target is inside
     * and that it is in view, even if the hash is in the url
     * @returns {Promise<void>}
     */
    async handleFocus() {
      const { hash } = this.fragment;
      const element = document.getElementById(hash);
      if (!element) return;
      // Focus scrolls to the element
      element.focus();
      // but we need to compensate for the navigation height
      await this.scrollToElement(`#${hash}`);
    },
  },
};
</script>

<style scoped lang="scss">
@import "docc-render/styles/_core.scss";

.tutorials-navigation-link {
  color: var(--color-tutorials-overview-navigation-link);
  transition: color .3s linear;

  &:hover {
    text-decoration: none;
    transition: none;
    color: var(--color-tutorials-overview-navigation-link-hover);
  }

  &.active {
    color: var(--color-tutorials-overview-navigation-link-active);
  }
}
</style>
