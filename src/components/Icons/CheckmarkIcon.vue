<!--
  This source file is part of the Swift.org open source project

  Copyright (c) 2025 Apple Inc. and the Swift project authors
  Licensed under Apache License v2.0 with Runtime Library Exception

  See https://swift.org/LICENSE.txt for license information
  See https://swift.org/CONTRIBUTORS.txt for Swift project authors
-->

<template>
  <SVGIcon
    class="CheckmarkIcon"
    viewBox="0 0 24 24"
    themeId="checkmark"
  >
    <path d="M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z"/>
  </SVGIcon>
</template>

<script>
import SVGIcon from 'docc-render/components/SVGIcon.vue';

export default {
  name: 'CheckmarkIcon',
  components: { SVGIcon },
};
</script>

<style scoped lang="scss">
.CheckmarkIcon {
  opacity: 1;
  stroke: currentColor;
}
</style>
