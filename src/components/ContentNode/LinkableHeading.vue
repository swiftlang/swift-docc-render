<!--
  This source file is part of the Swift.org open source project

  Copyright (c) 2022 Apple Inc. and the Swift project authors
  Licensed under Apache License v2.0 with Runtime Library Exception

  See https://swift.org/LICENSE.txt for license information
  See https://swift.org/CONTRIBUTORS.txt for Swift project authors
-->

<template>
  <component
   :id="anchor"
   :is="`h${level}`"
  >
    <router-link
      v-if="anchor && !isTargetIDE"
      :to="{ hash: `#${anchor}` }"
      class="header-anchor"
      @click="handleFocusAndScroll(anchor)"
    >
      <slot />
    </router-link>
    <template v-else>
      <slot />
    </template>
  </component>
</template>

<script>
import scrollToElement from 'docc-render/mixins/scrollToElement';

export default {
  name: 'LinkableHeading',
  mixins: [scrollToElement],
  props: {
    anchor: {
      type: String,
      required: false,
    },
    level: {
      type: Number,
      default: () => 2,
      validator: v => v >= 1 && v <= 6,
    },
  },
  inject: {
    isTargetIDE: {
      default: () => false,
    },
  },
};
</script>

<style scoped lang="scss">
@import 'docc-render/styles/_core.scss';

.header-anchor {
  color: var(--colors-text, var(--color-text));
  text-decoration: none;
  position: relative;

  &:after {
    content: "";
    display: block;
    position: absolute;
    width: 0px;
    bottom: -3px;
    height: 1px;
    background-color: var(--colors-text, var(--color-text));
    // transition: width 0.2s cubic-bezier(0.82, 0.085, 0.395, 0.895) 0s;
    // transition-delay: .5s;
  }

  &:hover::after {
    width: 100%;
  }
}
</style>
