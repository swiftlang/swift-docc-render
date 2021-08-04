<!--
  This source file is part of the Swift.org open source project

  Copyright (c) 2021 Apple Inc. and the Swift project authors
  Licensed under Apache License v2.0 with Runtime Library Exception

  See https://swift.org/LICENSE.txt for license information
  See https://swift.org/CONTRIBUTORS.txt for Swift project authors
-->

<template>
  <ImageAsset :alt="alt" :variants="variants"/>
</template>

<script>
import ImageAsset from 'docc-render/components/ImageAsset.vue';

export default {
  name: 'InlineImage',
  components: { ImageAsset },
  props: {
    alt: {
      type: String,
      default: '',
    },
    variants: {
      type: Array,
      required: true,
    },
  },
};
</script>

<style scoped>
/deep/ img {
  max-width: 100%;
}
</style>
