<!--
  This source file is part of the Swift.org open source project

  Copyright (c) 2022 Apple Inc. and the Swift project authors
  Licensed under Apache License v2.0 with Runtime Library Exception

  See https://swift.org/LICENSE.txt for license information
  See https://swift.org/CONTRIBUTORS.txt for Swift project authors
-->

<template>
  <a :href="url">
    {{ fileName }}
  </a>
</template>

<script>
export default {
  name: 'DeclarationSourceLink',
  props: {
    url: {
      type: Array,
      required: true,
    },
    fileName: {
      type: String,
      required: true,
    },
  },
};
</script>

<style scoped lang="scss">
@import 'docc-render/styles/_core.scss';

a {
  @include font-styles(documentation-declaration-link);
}
</style>
