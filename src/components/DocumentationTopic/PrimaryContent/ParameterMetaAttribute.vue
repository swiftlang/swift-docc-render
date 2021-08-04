<!--
  This source file is part of the Swift.org open source project

  Copyright (c) 2021 Apple Inc. and the Swift project authors
  Licensed under Apache License v2.0 with Runtime Library Exception

  See https://swift.org/LICENSE.txt for license information
  See https://swift.org/CONTRIBUTORS.txt for Swift project authors
-->

<template>
  <RenderChanged
    :value="attributes[kind]"
    :changes="changes[kind]"
  >
    <div slot-scope="{ value }" class="property-metadata">
      <slot :attribute="value" />
    </div>
  </RenderChanged>
</template>

<script>
import RenderChanged from 'docc-render/components/DocumentationTopic/PrimaryContent/RenderChanged.vue';

/**
 * Renders a meta property.
 * Renders API changes if available for the current meta property
 */
export default {
  name: 'ParameterMetaAttribute',
  components: { RenderChanged },
  props: {
    kind: {
      type: String,
      required: true,
    },
    attributes: {
      type: Object,
      required: true,
    },
    changes: {
      type: Object,
      default: () => ({}),
    },
  },
};
</script>

<style lang='scss' scoped>
@import 'docc-render/styles/_core.scss';

.property-metadata {
  color: var(--color-figure-gray-secondary);
}
</style>
