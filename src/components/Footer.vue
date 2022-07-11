<!--
  This source file is part of the Swift.org open source project

  Copyright (c) 2021 Apple Inc. and the Swift project authors
  Licensed under Apache License v2.0 with Runtime Library Exception

  See https://swift.org/LICENSE.txt for license information
  See https://swift.org/CONTRIBUTORS.txt for Swift project authors
-->

<template>
  <footer class="footer">
    <div class="row">
      <ColorSchemeToggle />
    </div>
  </footer>
</template>

<script>
import ColorSchemeToggle from 'docc-render/components/ColorSchemeToggle.vue';

export default {
  name: 'Footer',
  components: { ColorSchemeToggle },
};
</script>

<style scoped lang="scss">
@import 'docc-render/styles/_core.scss';

.footer {
  border-top: 1px solid var(--color-grid);
}

.row {
  @include breakpoint-content;
  display: flex;
  flex-direction: row-reverse;
  padding: 20px 0;
  @include breakpoint(small) {
    width: 100%;
    padding: 20px $nav-padding-small;
    box-sizing: border-box;
  }
}
</style>
