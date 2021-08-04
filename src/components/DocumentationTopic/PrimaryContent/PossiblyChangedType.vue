<!--
  This source file is part of the Swift.org open source project

  Copyright (c) 2021 Apple Inc. and the Swift project authors
  Licensed under Apache License v2.0 with Runtime Library Exception

  See https://swift.org/LICENSE.txt for license information
  See https://swift.org/CONTRIBUTORS.txt for Swift project authors
-->

<template>
  <RenderChanged
    :value="type"
    :wrapChanges="false"
    :changes="changes"
  >
    <DeclarationTokenGroup
      slot-scope="{ value }"
      :type="getValues(value)"
      class="property-metadata property-type"
    />
  </RenderChanged>
</template>

<script>
import RenderChanged from 'docc-render/components/DocumentationTopic/PrimaryContent/RenderChanged.vue';
import DeclarationTokenGroup
  from 'docc-render/components/DocumentationTopic/PrimaryContent/DeclarationTokenGroup.vue';

export default {
  name: 'PossiblyChangedType',
  components: { DeclarationTokenGroup, RenderChanged },
  props: {
    type: {
      type: Array,
      required: true,
    },
    changes: {
      type: Object,
      required: false,
    },
  },
  methods: {
    /**
     * API changes for `type` return data inside `values` property,
     * where as Render JSON returns them directly.
     * @param {Array | Object} value
     * @returns {Array}
     */
    getValues(value) {
      return Array.isArray(value) ? value : value.values;
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
