<!--
  This source file is part of the Swift.org open source project

  Copyright (c) 2021 Apple Inc. and the Swift project authors
  Licensed under Apache License v2.0 with Runtime Library Exception

  See https://swift.org/LICENSE.txt for license information
  See https://swift.org/CONTRIBUTORS.txt for Swift project authors
-->

<template>
  <component
    :is="resolvedComponent"
    class="button-cta"
    :class="{ 'is-dark': isDark }"
    v-bind="componentProps"
  >
    <slot />
  </component>
</template>

<script>
import Reference from 'docc-render/components/ContentNode/Reference.vue';

export default {
  name: 'ButtonLink',
  components: {
    Reference,
  },
  props: {
    url: {
      type: String,
      required: false,
    },
    isDark: {
      type: Boolean,
      default: false,
    },
  },
  computed: {
    resolvedComponent: ({ url }) => (url ? Reference : 'button'),
    componentProps: ({ url }) => (url ? { url } : {}),
  },
};
</script>

<style scoped lang="scss">
@import "docc-render/styles/_core.scss";

.button-cta {
  background: var(--colors-button-light-background, var(--color-button-background));
  border-color: var(--color-button-border, currentcolor);
  border-radius: var(--button-border-radius, $button-radius);
  border-style: var(--button-border-style, none);
  border-width: var(--button-border-width, medium);
  color: var(--colors-button-text, var(--color-button-text));
  cursor: pointer;
  min-width: rem(30px);
  padding: $button-padding-vertical $button-padding-horizontal;
  text-align: center;
  white-space: nowrap;
  display: inline-block;
  @include font-styles(button);

  &:active {
    background: var(--colors-button-light-backgroundActive, var(--color-button-background-active));
    outline: none;
  }

  // Make sure hover does not happen when disabled
  &:hover:not([disabled]) {
    background: var(--colors-button-light-backgroundHover, var(--color-button-background-hover));
    text-decoration: none;
  }

  &:disabled {
    opacity: $button-disabled-opacity;
    cursor: default;
  }

  @include replace-outline-for-shadow-on-focus();

  &.is-dark {
    background: var(--colors-button-dark-background, dark-color(fill-blue));

    &:active {
      background: var(--colors-button-dark-backgroundActive, var(--color-button-background-active));
    }

    &:hover:not([disabled]) {
      background: var(--colors-button-dark-backgroundHover, var(--color-button-background-hover));
    }
  }
}
</style>
