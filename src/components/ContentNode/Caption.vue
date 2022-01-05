<!--
  This source file is part of the Swift.org open source project

  Copyright (c) 2021 Apple Inc. and the Swift project authors
  Licensed under Apache License v2.0 with Runtime Library Exception

  See https://swift.org/LICENSE.txt for license information
  See https://swift.org/CONTRIBUTORS.txt for Swift project authors
-->

<template>
  <component :is="tag" class="caption">
    <strong>{{ title }}</strong>&nbsp;<slot />
  </component>
</template>

<script>
export default {
  name: 'Caption',
  props: {
    title: {
      type: String,
      required: true,
    },
    tag: {
      type: String,
      required: false,
      default: () => 'caption',
    },
  },
};
</script>

<style scoped lang="scss">
@import 'docc-render/styles/_core.scss';

.caption {
  @include font-styles(documentation-caption);
}

/deep/ p {
  display: inline-block;
}

caption {
  margin-bottom: 1rem;
}
</style>
