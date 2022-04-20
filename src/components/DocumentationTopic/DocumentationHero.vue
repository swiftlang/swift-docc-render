<!--
  This source file is part of the Swift.org open source project

  Copyright (c) 2022 Apple Inc. and the Swift project authors
  Licensed under Apache License v2.0 with Runtime Library Exception

  See https://swift.org/LICENSE.txt for license information
  See https://swift.org/CONTRIBUTORS.txt for Swift project authors
-->

<template>
  <div
    :class="['documentation-hero', {
      'documentation-hero--disabled': !enhanceBackground,
      'theme-dark': enhanceBackground,
    }]"
    :style="styles"
  >
    <div class="icon">
      <NavigatorLeafIcon
        v-if="enhanceBackground" :type="type"
        key="first" class="background-icon first-icon" with-colors
      />
    </div>
    <div class="documentation-hero__above-content">
      <slot name="above-content" />
    </div>
    <div
    class="documentation-hero__content"
    :class = "{ 'extra-padding': extraPadding }"
    >
      <slot />
    </div>
  </div>
</template>

<script>

import NavigatorLeafIcon from 'docc-render/components/Navigator/NavigatorLeafIcon.vue';
import { TopicTypeAliases } from 'docc-render/constants/TopicTypes';
import { HeroColorsMap, HeroColors } from 'docc-render/constants/HeroColors';

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
    extraPadding: {
      type: Boolean,
      required: true,
    },
  },
  computed: {
    // get the alias, if any, and fallback to the `teal` color
    color: ({ type }) => HeroColorsMap[TopicTypeAliases[type] || type] || HeroColors.teal,
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
$doc-hero-icon-spacing: 25px;
$doc-hero-icon-dimension: 250px;

.documentation-hero {
  background: dark-color(fill);
  color: dark-color(figure-gray);
  overflow: hidden;
  text-align: left;
  position: relative;

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

  .icon {
    position: absolute;
    margin-top: 10px;
    margin-right: $doc-hero-icon-spacing;
    right: 0;

    @include breakpoint(small) {
      display: none;
    }
  }

  .background-icon {
    color: $doc-hero-icon-color;
    display: block;
    width: $doc-hero-icon-dimension;
    height: auto;
    opacity: $doc-hero-icon-opacity;

    /deep/ svg {
      width: 100%;
      height: 100%;
    }
  }

  &__content {
    padding-top: rem(40px);
    padding-bottom: 40px;
    position: relative;
    z-index: 1;
    @include dynamic-content-container;
  }

  &__above-content {
    position: relative;
    z-index: 1;
  }
}

.documentation-hero--disabled {
  background: none;
  color: var(--colors-text, var(--color-text));

  &:before {
    content: none;
  }

  &:after {
    content: none;
  }
}

.extra-padding {
  padding-top: rem(60px);
  padding-bottom: rem(60px);
}

.theme-dark /deep/ a:not(.button-cta) {
  color: dark-color(figure-blue);
}
</style>
