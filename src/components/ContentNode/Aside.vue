<!--
  This source file is part of the Swift.org open source project

  Copyright (c) 2021 Apple Inc. and the Swift project authors
  Licensed under Apache License v2.0 with Runtime Library Exception

  See https://swift.org/LICENSE.txt for license information
  See https://swift.org/CONTRIBUTORS.txt for Swift project authors
-->

<template>
  <aside :class="kind" :aria-label="kind">
    <p class="label">{{ label }}</p>
    <slot />
  </aside>
</template>

<script>
const Kind = {
  deprecated: 'deprecated',
  experiment: 'experiment',
  important: 'important',
  note: 'note',
  tip: 'tip',
  warning: 'warning',
};

export default {
  name: 'Aside',
  props: {
    kind: {
      type: String,
      required: true,
      validator: kind => Object.prototype.hasOwnProperty.call(Kind, kind),
    },
    name: {
      type: String,
      required: false,
    },
  },
  computed: {
    label: ({ kind, name }) => name || ({
      [Kind.deprecated]: 'Deprecated',
      [Kind.experiment]: 'Experiment',
      [Kind.important]: 'Important',
      [Kind.note]: 'Note',
      [Kind.tip]: 'Tip',
      [Kind.warning]: 'Warning',
    }[kind]),
  },
};
</script>

<style scoped lang="scss">
@import 'docc-render/styles/_core.scss';

$aside-kinds: deprecated, experiment, important, note, tip, warning;

.label {
  @include font-styles(aside-label);

  & + * {
    margin-top: $stacked-margin-small;
  }

  @each $kind in $aside-kinds {
    .#{$kind} & {
      color: var(--color-aside-#{$kind});
    }
  }
}

// this applies a specific styling for asides on documentation pages and relies
// on the fact that a "doc-topic" class is applied to an ancestor element of
// the aside in question
.doc-topic aside {
  break-inside: avoid;
  border-radius: var(--aside-border-radius, $border-radius);
  border-style: var(--aside-border-style, solid);
  border-width: var(--aside-border-width,
    $aside-width-border
    $aside-width-border
    $aside-width-border
    $aside-width-left-border);
  padding: rem(16px);

  @each $kind in $aside-kinds {
    &.#{$kind} {
      background-color: var(--color-aside-#{$kind}-background);
      border-color: var(--color-aside-#{$kind}-border);
      // Anti-aliasing corners
      box-shadow: 0 0 $aside-width-border 0px var(--color-aside-#{$kind}-border) inset,
        0 0 $aside-width-border 0px var(--color-aside-#{$kind}-border);
    }
  }

  .label {
    @include font-styles(documentation-aside-name);
  }
}
</style>
