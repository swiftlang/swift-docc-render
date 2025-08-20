<!--
  This source file is part of the Swift.org open source project

  Copyright (c) 2025 Apple Inc. and the Swift project authors
  Licensed under Apache License v2.0 with Runtime Library Exception

  See https://swift.org/LICENSE.txt for license information
  See https://swift.org/CONTRIBUTORS.txt for Swift project authors
-->

<template>
  <SVGIcon
    class="CrossIcon"
    viewBox="0 0 24 24"
    themeId="cross"
  >
    <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41
         10.59 12 5 17.59 6.41 19 12 13.41
         17.59 19 19 17.59 13.41 12z"/>
  </SVGIcon>
</template>

<script>
import SVGIcon from 'docc-render/components/SVGIcon.vue';

export default {
  name: 'CrossIcon',
  components: { SVGIcon },
};
</script>

<style scoped lang="scss">
.CrossIcon {
  opacity: 1;
  stroke: currentColor;
}
</style>
