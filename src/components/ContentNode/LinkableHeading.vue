<!--
  This source file is part of the Swift.org open source project

  Copyright (c) 2022 Apple Inc. and the Swift project authors
  Licensed under Apache License v2.0 with Runtime Library Exception

  See https://swift.org/LICENSE.txt for license information
  See https://swift.org/CONTRIBUTORS.txt for Swift project authors
-->

<template>
  <component
   :id="id"
   :is="`h${level}`"
   class="section-title"
  >
    <router-link
      v-if="anchor && !isTargetIDE"
      :to="{ hash: `#${anchor}` }"
      class="header-anchor"
      aria-label="hidden"
      @click="handleFocusAndScroll(anchor)"
    >#</router-link>
    <slot />
  </component>
</template>

<script>
import scrollToElement from 'docc-render/mixins/scrollToElement';

export default {
  name: 'LinkableHeading',
  mixins: [scrollToElement],
  data() {
    return {
      id: null,
    };
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
  mounted() {
    if (!this.anchor) return;
    const element = document.getElementById(`${this.anchor}`);
    // if there is no element in the document that has an id,
    // add it to this component
    if (!element) {
      this.id = this.anchor;
    }
  },
};
</script>

<style scoped lang="scss">
@import 'docc-render/styles/_core.scss';

.section-title:hover {
  .header-anchor {
    opacity: 1;
  }
}

.header-anchor {
  margin-left: -0.73em;
  padding-right: 0.23em;
  transition: opacity .25s;
  opacity: 0;
  text-decoration: none;

  &:hover, &:focus {
    opacity: 1;
  }
}
</style>
