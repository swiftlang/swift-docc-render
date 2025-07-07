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
      v-if="shouldLink"
      :to="linkWithAnchor"
      :data-after-text="$t('accessibility.in-page-link')"
      class="header-anchor"
      @click="handleFocusAndScroll(anchor)"
    >
      <slot />
      <LinkIcon class="icon" aria-hidden="true" />
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
    enableMinimized: {
      default: () => false,
    },
    isTargetIDE: {
      default: () => false,
    },
  },
  computed: {
    shouldLink: ({
      anchor,
      enableMinimized,
      isTargetIDE,
    }) => !!anchor && !enableMinimized && !isTargetIDE,
    linkWithAnchor: ({ anchor, $route }) => ({ hash: `#${anchor}`, query: $route.query }),
  },
};
</script>

<style scoped lang="scss">
@import 'docc-render/styles/_core.scss';

$icon-margin: 7px;

.header-anchor {
  color: inherit;
  text-decoration: none;
  position: relative;
  padding-inline-end: $icon-size-default + $icon-margin;
  display: inline-block;

  &::after {
    @include visuallyhidden;
    content: attr(data-after-text);
  }

  .icon {
    position: absolute;
    inset-inline-end: 0;
    bottom: .2em;
    display: none;
    height: $icon-size-default;
    margin-inline-start: $icon-margin;
  }

  &:hover, &:focus {
    .icon {
      display: inline;
    }
  }
}
</style>
