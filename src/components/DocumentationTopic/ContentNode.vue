<!--
  This source file is part of the Swift.org open source project

  Copyright (c) 2021 Apple Inc. and the Swift project authors
  Licensed under Apache License v2.0 with Runtime Library Exception

  See https://swift.org/LICENSE.txt for license information
  See https://swift.org/CONTRIBUTORS.txt for Swift project authors
-->

<template>
  <BaseContentNode v-bind="$props" />
</template>

<script>
import ContentNode from 'docc-render/components/ContentNode.vue';

export default {
  name: 'ContentNode',
  components: { BaseContentNode: ContentNode },
  props: ContentNode.props,
  methods: ContentNode.methods,
  BlockType: ContentNode.BlockType,
  InlineType: ContentNode.InlineType,
};
</script>

<style scoped lang="scss">
@import 'docc-render/styles/_core.scss';

$docs-code-listing-border-width: 1px !default;

@function between-elements-selector($el) {
  @return '* + #{$el}, #{$el} + *'
}

/deep/ {
  .code-listing {
    background: var(--background, var(--color-code-background));
    color: var(--text, var(--color-code-plain));
    border-color: var(--colors-grid, var(--color-grid));
    border-width: var(--code-border-width, $docs-code-listing-border-width);
    border-style: var(--code-border-style, solid);

    pre {
      padding: $code-block-style-elements-padding;
      // setting it to 0 prevents browsers from adding extra right spacing, when having scrollbar
      padding-right: 0;

      > code {
        @include font-styles(documentation-code-listing);
      }
    }
  }

  // use a helper function to generate common selectors.
  // Using `space-out-between-siblings` mixin does not work, because we are inside `/deep/`.
  #{between-elements-selector('.code-listing')},
  #{between-elements-selector('.endpoint-example')},
  #{between-elements-selector('.inline-image-container')},
  #{between-elements-selector(figure)},
  #{between-elements-selector(aside)}, {
    margin-top: $stacked-margin-xlarge;
  }

  #{between-elements-selector(dl)} {
    margin-top: $stacked-margin-large;
  }

  img {
    display: block;
    margin: auto;
    max-width: 100%;
  }

  ol,
  ul {
    margin-top: $stacked-margin-large;

    li:not(:first-child) {
      margin-top: $stacked-margin-large;
    }

    @include breakpoint(small) {
      margin-left: 1.25rem;
    }
  }

  dt:not(:first-child) {
    margin-top: $stacked-margin-large;
  }

  dd {
    margin-left: 2em;
  }
}
</style>
