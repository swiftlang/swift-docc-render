<!--
  This source file is part of the Swift.org open source project

  Copyright (c) 2021 Apple Inc. and the Swift project authors
  Licensed under Apache License v2.0 with Runtime Library Exception

  See https://swift.org/LICENSE.txt for license information
  See https://swift.org/CONTRIBUTORS.txt for Swift project authors
-->

<template>
  <div class="col" :class="classes">
    <slot />
  </div>
</template>

<script>
const colspanMin = 0;
const colspanMax = 12;
const breakpoints = new Set([
  'large',
  'medium',
  'small',
]);

const breakpointsProp = valueValidator => ({
  type: Object,
  default: () => ({}),
  validator: obj => Object.keys(obj).every(key => (
    breakpoints.has(key) && valueValidator(obj[key])
  )),
});
const Flags = breakpointsProp(value => typeof value === 'boolean');
const Colspans = breakpointsProp(value => typeof value === 'number' && (
  value >= colspanMin && value <= colspanMax
));

export default {
  name: 'GridColumn',
  props: {
    isCentered: Flags,
    isUnCentered: Flags,
    span: {
      ...Colspans,
      default: () => ({ large: colspanMax }),
    },
  },
  computed: {
    classes: function getClasses() {
      return {
        // main column span classes per breakpoint
        [`large-${this.span.large}`]: this.span.large !== undefined,
        [`medium-${this.span.medium}`]: this.span.medium !== undefined,
        [`small-${this.span.small}`]: this.span.small !== undefined,
        // centered classes per breakpoint
        'large-centered': !!this.isCentered.large,
        'medium-centered': !!this.isCentered.medium,
        'small-centered': !!this.isCentered.small,
        // non-centered classes per breakpoint
        'large-uncentered': !!this.isUnCentered.large,
        'medium-uncentered': !!this.isUnCentered.medium,
        'small-uncentered': !!this.isUnCentered.small,
      };
    },
  },
};
</script>

<style scoped lang="scss">
@import 'docc-render/styles/_core.scss';

//
// Generates grid styles for a 12 column grid, using a provided class.
// @param {String} $class - The class to generate styles for -
//
// @example generate-grid(large) -> large-1, large-2, large-centered etc.
//
@mixin generate-grid($class) {
  // loop from 1 to 12, included
  @for $i from 1 to $total-columns + 1 {
    .#{$class}-#{$i} {
      $width: calculate-column-width($i);
      flex-basis: $width;
      max-width: $width;
    }
  }

  .#{$class}-centered {
    margin-left: auto;
    margin-right: auto;
  }

  .#{$class}-uncentered {
    margin-left: 0;
    margin-right: 0;
  }
}

.col {
  box-sizing: border-box;
  flex: none;
}

@each $breakpoint-name in breakpoint-names() {
  @include breakpoint($breakpoint-name) {
    @include generate-grid($class: $breakpoint-name);
  }
}
</style>
