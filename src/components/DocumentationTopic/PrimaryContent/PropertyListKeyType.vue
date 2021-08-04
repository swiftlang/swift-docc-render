<!--
  This source file is part of the Swift.org open source project

  Copyright (c) 2021 Apple Inc. and the Swift project authors
  Licensed under Apache License v2.0 with Runtime Library Exception

  See https://swift.org/LICENSE.txt for license information
  See https://swift.org/CONTRIBUTORS.txt for Swift project authors
-->

<template>
 <div class="type">{{ typeOutput }}</div>
</template>

<script>
export default {
  name: 'PropertyListKeyType',
  props: {
    types: {
      type: Array,
      required: true,
    },
  },
  computed: {
    englishTypes() {
      return this.types.map(({
        arrayMode,
        baseType = '*',
      }) => (arrayMode ? (
        `array of ${this.pluralizeKeyType(baseType)}`
      ) : (
        baseType
      )));
    },
    typeOutput() {
      if (this.englishTypes.length > 2) {
        return [this.englishTypes.slice(0, this.englishTypes.length - 1).join(', '),
          this.englishTypes[this.englishTypes.length - 1],
        ].join(', or ');
      }
      return this.englishTypes.join(' or ');
    },
  },
  methods: {
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
