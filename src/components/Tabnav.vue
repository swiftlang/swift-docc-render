<!--
  This source file is part of the Swift.org open source project

  Copyright (c) 2021 Apple Inc. and the Swift project authors
  Licensed under Apache License v2.0 with Runtime Library Exception

  See https://swift.org/LICENSE.txt for license information
  See https://swift.org/CONTRIBUTORS.txt for Swift project authors
-->

<template>
  <nav class="tabnav">
    <ul class="tabnav-items">
      <slot />
    </ul>
  </nav>
</template>

<script>
const ProvideKey = 'tabnavData';
export default {
  name: 'Tabnav',
  constants: { ProvideKey },
  provide() {
    const tabnavData = {
      selectTab: this.selectTab,
    };
    // allows passing the `value` prop as a reactive property
    Object.defineProperty(tabnavData, 'activeTab', {
      enumerable: true,
      get: () => this.value,
    });
    return {
      [ProvideKey]: tabnavData,
    };
  },
  props: {
    value: {
      type: String,
      required: true,
    },
  },
  methods: {
    selectTab(value) {
      this.$emit('input', value);
    },
  },
};
</script>

<style lang='scss' scoped>
@import 'docc-render/styles/_core.scss';

$-tabnav-top-margin: rem(15px);
$-tabnav-bottom-margin: rem(25px);

.tabnav {
  margin: $-tabnav-top-margin 0 $-tabnav-bottom-margin 0;
}

.tabnav-items {
  display: inline-block;
  margin: 0;
  text-align: center;
}
</style>
