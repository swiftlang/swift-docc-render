<!--
  This source file is part of the Swift.org open source project

  Copyright (c) 2021 Apple Inc. and the Swift project authors
  Licensed under Apache License v2.0 with Runtime Library Exception

  See https://swift.org/LICENSE.txt for license information
  See https://swift.org/CONTRIBUTORS.txt for Swift project authors
-->

<template>
  <RenderChanged renderSingleChange :value="required" :changes="changes">
    <span slot-scope="{ value }" v-if="value" class="property-required">(Required) </span>
  </RenderChanged>
</template>

<script>
import RenderChanged from 'docc-render/components/DocumentationTopic/PrimaryContent/RenderChanged.vue';

export default {
  name: 'PossiblyChangedRequiredAttribute',
  components: { RenderChanged },
  props: {
    required: {
      type: Boolean,
      default: false,
    },
    changes: {
      type: Object,
      required: false,
    },
  },
};
</script>

<style lang='scss'>
@import 'docc-render/styles/_core.scss';

.property-required {
  font-weight: $font-weight-bold;
}
</style>
