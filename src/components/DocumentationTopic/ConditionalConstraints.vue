<!--
  This source file is part of the Swift.org open source project

  Copyright (c) 2021 Apple Inc. and the Swift project authors
  Licensed under Apache License v2.0 with Runtime Library Exception

  See https://swift.org/LICENSE.txt for license information
  See https://swift.org/CONTRIBUTORS.txt for Swift project authors
-->

<template>
  <ContentNode class="conditional-constraints" :content="content" />
</template>

<script>
import ContentNode from './ContentNode.vue';

export default {
  name: 'ConditionalConstraints',
  components: { ContentNode },
  props: {
    constraints: ContentNode.props.content,
    prefix: ContentNode.props.content,
  },
  computed: {
    content: ({
      constraints,
      prefix,
      space,
    }) => prefix.concat(space).concat(constraints),
    space: () => ({
      type: ContentNode.InlineType.text,
      text: ' ',
    }),
  },
};
</script>

<style lang="scss" scoped>
@import 'docc-render/styles/_core.scss';

.conditional-constraints /deep/ code {
  color: var(--colors-secondary-label, var(--color-secondary-label));
}
</style>
