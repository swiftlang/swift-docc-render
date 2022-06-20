<!--
  This source file is part of the Swift.org open source project

  Copyright (c) 2021 Apple Inc. and the Swift project authors
  Licensed under Apache License v2.0 with Runtime Library Exception

  See https://swift.org/LICENSE.txt for license information
  See https://swift.org/CONTRIBUTORS.txt for Swift project authors
-->

<template>
  <div class="type">
    <template v-for="(type, index) in types">
      <DeclarationToken v-if="type.kind" class="type-child token-type" v-bind="type" :key="index" />
      <span
        v-else
        :key="index"
        class="type-child simple-type"
      >{{ normaliseType(type) }}</span><template
       v-if="index + 1 < typesCount"
      >
        <template v-if="!moreThanTwo"> or </template>
        <template
          v-else>, <template v-if="index === typesCount - 2">or </template>
        </template>
      </template>
    </template>
  </div>
</template>

<script>
import DeclarationToken
  from 'docc-render/components/DocumentationTopic/PrimaryContent/DeclarationToken.vue';

export default {
  name: 'PropertyListKeyType',
  components: { DeclarationToken },
  props: {
    types: {
      type: Array,
      required: true,
    },
  },
  computed: {
    typesCount: ({ types }) => types.length,
    moreThanTwo: ({ types }) => types.length > 2,
  },
  methods: {
    normaliseType({ arrayMode, baseType = '*' }) {
      return arrayMode ? (
        `array of ${this.pluralizeKeyType(baseType)}`
      ) : (
        baseType
      );
    },
    pluralizeKeyType(type) {
      switch (type) {
      case 'dictionary':
        return 'dictionaries';
      case 'array':
      case 'number':
      case 'string':
        return `${type}s`;
      default:
        return type;
      }
    },
  },
};
</script>

<style scoped lang="scss">
.type::first-letter {
  text-transform: capitalize;
}
</style>
