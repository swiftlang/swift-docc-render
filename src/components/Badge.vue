<!--
  This source file is part of the Swift.org open source project

  Copyright (c) 2021-2022 Apple Inc. and the Swift project authors
  Licensed under Apache License v2.0 with Runtime Library Exception

  See https://swift.org/LICENSE.txt for license information
  See https://swift.org/CONTRIBUTORS.txt for Swift project authors
-->

<template>
  <span class="badge" :class="{ [`badge-${variant}`]: variant }" role="presentation">
    <slot>{{ text }}</slot>
  </span>
</template>

<script>
const VARIANT_TEXT = {
  beta: 'Beta',
  deprecated: 'Deprecated',
};

export default {
  name: 'Badge',
  props: {
    variant: {
      type: String,
      default: () => '',
    },
  },

  computed: {
    /**
     * Returns text for pre-defined badge types, when there is no default slot.
     * @param variant
     * @return {'Deprecated' | 'Beta'}
     */
    text: ({ variant }) => VARIANT_TEXT[variant],
  },
};
</script>

<style lang="scss" scoped>
@import 'docc-render/styles/_core.scss';

@mixin badge-variation($color) {
  --badge-color: var(--color-badge-#{$color});
  --badge-dark-color: var(--color-badge-dark-#{$color});
}

.badge {
  @include badge-variation(default);

  @include font-styles(badge);
  display: inline-block;
  padding: 2px 10px;
  white-space: nowrap;
  background: none;
  border-radius: var(--badge-border-radius, calc(#{$border-radius} - 1px));
  border-style: var(--badge-border-style, solid);
  border-width: var(--badge-border-width, 1px);
  margin-left: 10px;
  color: var(--badge-color);

  .theme-dark & {
    --badge-color: var(--badge-dark-color);
  }

  /* nav bar badge */
  &-deprecated {
    @include badge-variation(deprecated);
  }

  &-beta {
    @include badge-variation(beta);
  }
}
</style>
