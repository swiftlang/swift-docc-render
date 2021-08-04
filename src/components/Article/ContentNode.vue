<!--
  This source file is part of the Swift.org open source project

  Copyright (c) 2021 Apple Inc. and the Swift project authors
  Licensed under Apache License v2.0 with Runtime Library Exception

  See https://swift.org/LICENSE.txt for license information
  See https://swift.org/CONTRIBUTORS.txt for Swift project authors
-->

<template>
  <BaseContentNode :content="articleContent" />
</template>

<script>
import ContentNode from 'docc-render/components/ContentNode.vue';

export default {
  name: 'ContentNode',
  components: { BaseContentNode: ContentNode },
  props: ContentNode.props,
  computed: {
    // Returns a copy of the original `content` prop with the addition of
    // including the `showLineNumbers` prop for code listings. The anchors are
    // stripped for headings as well, since they are used at a higher level for
    // tracking larger sections of blocks.
    articleContent() {
      return this.map((node) => {
        switch (node.type) {
        case ContentNode.BlockType.codeListing:
          return { ...node, showLineNumbers: true };
        case ContentNode.BlockType.heading: {
          const { anchor, ...nodeWithoutAnchor } = node;
          return nodeWithoutAnchor;
        }
        default:
          return node;
        }
      });
    },
  },
  methods: ContentNode.methods,
  BlockType: ContentNode.BlockType,
  InlineType: ContentNode.InlineType,
};
</script>

<style scoped lang="scss">
@import 'docc-render/styles/_core.scss';

/deep/ {
  aside,
  h2,
  h3,
  ol,
  p,
  ul,
  .code-listing {
    & + * {
      margin-top: $article-stacked-margin-small;
    }
  }

  // make sure nested lists do not get margin-top, from the above declaration
  ol, ul {
    ol, ul {
      margin-top: 0;
    }
  }

  h2 {
    @include font-styles(heading-2);
  }

  h3 {
    @include font-styles(label);
  }

  .code-listing {
    background: var(--color-code-background);
    border-color: var(--colors-grid, var(--color-grid));
    border-style: solid;
    border-width: 1px;

    pre {
      @include font-styles(code-preview);
      padding: 20px 0;
    }
  }
}
</style>
