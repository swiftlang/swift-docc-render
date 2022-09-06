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
      <LinkIcon class="icon" aria-hidden="true"/>
    </router-link>
    <template v-else>
      <slot />
    </template>
  </component>
</template>

<script>
import scrollToElement from 'docc-render/mixins/scrollToElement';
import LinkIcon from 'theme/components/Icons/LinkIcon.vue';

export default {
  name: 'LinkableHeading',
  mixins: [scrollToElement],
  components: {
    LinkIcon,
  },
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

  .icon {
    position: absolute;
    bottom: .2em;
    display: none;
    height: .6em;
    margin-left: .3em;
    fill: currentColor;
  }

  &:hover .icon {
    display: inline;
  }
}
</style>
