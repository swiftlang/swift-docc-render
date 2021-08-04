<!--
  This source file is part of the Swift.org open source project

  Copyright (c) 2021 Apple Inc. and the Swift project authors
  Licensed under Apache License v2.0 with Runtime Library Exception

  See https://swift.org/LICENSE.txt for license information
  See https://swift.org/CONTRIBUTORS.txt for Swift project authors
-->

<template>
  <svg
    aria-hidden="true"
    class="svg-icon"
    xmlns="http://www.w3.org/2000/svg"
  >
    <slot />
  </svg>
</template>

<script>
export default { name: 'SVGIcon' };
</script>

<style scoped lang="scss">
@import 'docc-render/styles/_core.scss';

.svg-icon {
  fill: var(--colors-svg-icon-fill-light, var(--color-svg-icon));
  @include prevent-clipped-svg();

  .theme-dark & {
    fill: var(--colors-svg-icon-fill-dark, var(--color-svg-icon));
  }

  // sets an icon as "inline", adding some common styles, like color and alignments.
  &.icon-inline {
    display: inline-block;
    vertical-align: middle;
    fill: currentColor;

    /deep/ .svg-icon-stroke {
      stroke: currentColor;
    }
  }
}

/deep/ .svg-icon-stroke {
  stroke: var(--colors-svg-icon-fill-light, var(--color-svg-icon));

  .theme-dark & {
    stroke: var(--colors-svg-icon-fill-dark, var(--color-svg-icon));
  }
}
</style>
