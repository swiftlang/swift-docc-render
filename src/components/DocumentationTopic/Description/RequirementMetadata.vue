<!--
  This source file is part of the Swift.org open source project

  Copyright (c) 2021 Apple Inc. and the Swift project authors
  Licensed under Apache License v2.0 with Runtime Library Exception

  See https://swift.org/LICENSE.txt for license information
  See https://swift.org/CONTRIBUTORS.txt for Swift project authors
-->

<template functional>
  <!-- because the component is functional we must mannually pass the classes -->
  <p class="requirement-metadata" :class="data.staticClass">
    <strong>{{ $t('required') }}.</strong>
    <template v-if="props.defaultImplementationsCount">
       {{ $tc('default-implementation', props.defaultImplementationsCount) }}
    </template>
  </p>
</template>

<script>
export default {
  name: 'RequirementMetadata',
  props: {
    defaultImplementationsCount: {
      type: Number,
      default: 0,
    },
  },
};
</script>
