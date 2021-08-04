<!--
  This source file is part of the Swift.org open source project

  Copyright (c) 2021 Apple Inc. and the Swift project authors
  Licensed under Apache License v2.0 with Runtime Library Exception

  See https://swift.org/LICENSE.txt for license information
  See https://swift.org/CONTRIBUTORS.txt for Swift project authors
-->

<template>
  <div id="loading-placeholder" class="InitialLoadingPlaceholder" v-if="!loaded" />
</template>

<script>
export default {
  name: 'InitialLoadingPlaceholder',
  data() {
    return {
      loaded: false,
    };
  },
  created() {
    this.$router.onReady(() => {
      this.loaded = true;
    });
  },
};
</script>

<style scoped lang='scss'>
@import 'docc-render/styles/_core.scss';

.InitialLoadingPlaceholder {
  background: var(
    --colors-loading-placeholder-background,
    var(--color-loading-placeholder-background)
  );
  height: 100vh;
  width: 100%;
}
</style>
