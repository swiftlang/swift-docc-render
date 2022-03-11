<!--
  This source file is part of the Swift.org open source project

  Copyright (c) 2022 Apple Inc. and the Swift project authors
  Licensed under Apache License v2.0 with Runtime Library Exception

  See https://swift.org/LICENSE.txt for license information
  See https://swift.org/CONTRIBUTORS.txt for Swift project authors
-->

<template>
  <div
    :class="['documentation-hero', { 'documentation-hero--disabled': !enhanceBackground }]"
    :style="styles"
  >
    <NavigatorLeafIcon
      v-if="enhanceBackground" :type="type"
      key="first" class="background-icon first-icon" with-colors
    />
    <NavigatorLeafIcon
      v-if="enhanceBackground" :type="type"
      key="second" class="background-icon second-icon" with-colors
    />
    <div class="documentation-hero__content">
      <slot />
    </div>
  </div>
</template>

<script>

import NavigatorLeafIcon from 'docc-render/components/Navigator/NavigatorLeafIcon.vue';
import { TopicTypeColorsMap, TopicTypeAliases, TopicTypeColors } from 'docc-render/constants/TopicTypes';

export default {
  name: 'DocumentationHero',
  components: { NavigatorLeafIcon },
  props: {
    type: {
      type: String,
      required: true,
    },
    enhanceBackground: {
      type: Boolean,
      required: true,
    },
  },
  computed: {
    // get the alias, if any, and fallback to the `teal` color
    color: ({ type }) => TopicTypeColorsMap[TopicTypeAliases[type] || type] || TopicTypeColors.teal,
    styles: ({ color }) => ({
      // use the color or fallback to the gray secondary, if not defined.
      '--accent-color': `var(--color-type-icon-${color}, var(--color-figure-gray-secondary))`,
    }),
  },
};
</script>

<style scoped lang='scss'>
@import 'docc-render/styles/_core.scss';

$doc-hero-gradient-background: dark-color(fill-tertiary) !default;
$doc-hero-overlay-background: transparent !default;
$doc-hero-icon-opacity: 1 !default;
$doc-hero-icon-color: dark-color(fill-secondary) !default;

.documentation-hero {
  background: dark-color(fill);
  color: light-color(fill);
  overflow: hidden;
  text-align: left;
  padding-top: rem(40px);
  padding-bottom: 40px;
  position: relative;

  @include breakpoint(small) {
    text-align: center;
  }

  // gradient
  &:before {
    content: '';
    background: $doc-hero-gradient-background;
    position: absolute;
    width: 100%;
    left: 0;
    top: -50%;
    height: 150%;
    right: 0;
  }

  // black overlay
  &:after {
    background: $doc-hero-overlay-background;
    opacity: 0.4;
    width: 100%;
    position: absolute;
    content: '';
    height: 100%;
    left: 0;
    top: 0;
  }

  .background-icon {
    color: $doc-hero-icon-color;
    position: absolute;
    display: block;
    width: 250px;
    height: 250px;
    opacity: $doc-hero-icon-opacity;

    /deep/ svg {
      width: 100%;
      height: 100%;
    }

    &.first-icon {
      left: 0;
      top: 100%;
      transform: translateY(-50%);
      @include breakpoint(small) {
        left: -15%;
        top: 80%;
      }
    }

    &.second-icon {
      right: 0;
      top: -10%;
      transform: translateY(-50%);
      @include breakpoint(small) {
        display: none;
      }
    }
  }

  &__content {
    position: relative;
    z-index: 1;
    @include dynamic-content-container;
  }
}

.documentation-hero--disabled {
  background: none;
  color: dark-color(fill);
  --hero-eyebrow-color: var(--colors-secondary-label,var(--color-secondary-label));

  &:before {
    background: none;
  }

  &:after {
    background: none;
  }
}
</style>
