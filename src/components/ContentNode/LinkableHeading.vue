<!--
  This source file is part of the Swift.org open source project

  Copyright (c) 2022 Apple Inc. and the Swift project authors
  Licensed under Apache License v2.0 with Runtime Library Exception

  See https://swift.org/LICENSE.txt for license information
  See https://swift.org/CONTRIBUTORS.txt for Swift project authors
-->

<template>
  <div class="heading-wrapper">
    <component
      :id="anchor"
      :is="`h${level}`"
      class="heading"
    >
      <slot />
    </component>
    <router-link
      v-if="shouldLink"
      :to="{ hash: `#${anchor}` }"
      class="anchor"
      @click="handleFocusAndScroll(anchor)"
    >
      <LinkIcon class="icon" aria-hidden="true" />
      <span :aria-labelledby="anchor" class="visuallyhidden" />
      <span class="visuallyhidden" >{{ $t('accessibility.in-page-link') }}</span>
    </router-link>
  </div>
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
  },
};
</script>

<style scoped lang="scss">
@import 'docc-render/styles/_core.scss';

$icon-margin: 7px;

.heading-wrapper {
  display: flex;
  align-items: baseline;
}

.heading {
  &:hover + .anchor > .icon {
    visibility: visible;
  }
}

.anchor {
  color: inherit;
  text-decoration: none;
  margin: 0;
  padding-right: $icon-margin;

  &:hover > .icon {
    visibility: visible;
  }

  &:focus > .icon {
    visibility: visible;
  }

  .icon {
    visibility: hidden;
    height: $icon-size-default;
    margin-left: $icon-margin;
  }

  &:hover .icon {
    display: inline;
  }
}
</style>
