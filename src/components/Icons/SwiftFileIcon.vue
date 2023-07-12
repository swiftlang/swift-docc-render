<!--
  This source file is part of the Swift.org open source project

  Copyright (c) 2021 Apple Inc. and the Swift project authors
  Licensed under Apache License v2.0 with Runtime Library Exception

  See https://swift.org/LICENSE.txt for license information
  See https://swift.org/CONTRIBUTORS.txt for Swift project authors
-->

<template>
  <SVGIcon
    class="swift-file-icon"
    viewBox="0 0 15 14"
    themeId="swift-file"
  >
    <path
      d="M14.93,13.56A2.15,2.15,0,0,0,15,13a5.37,5.37,0,0,0-1.27-3.24A6.08,6.08,0,0,0,14,7.91,9.32,9.32,0,0,0,9.21.31a8.51,8.51,0,0,1,1.78,5,6.4,6.4,0,0,1-.41,2.18A45.06,45.06,0,0,1,3.25,1.54,44.57,44.57,0,0,0,7.54,6.9,45.32,45.32,0,0,1,1.47,2.32,35.69,35.69,0,0,0,8.56,9.94a6.06,6.06,0,0,1-3.26.85A9.48,9.48,0,0,1,0,8.91a10,10,0,0,0,8.1,4.72c2.55,0,3.25-1.2,4.72-1.2a2.09,2.09,0,0,1,1.91,1.15C14.79,13.69,14.88,13.75,14.93,13.56Z" />
  </SVGIcon>
</template>

<script>
import SVGIcon from 'docc-render/components/SVGIcon.vue';

export default {
  name: 'SwiftFileIcon',
  components: { SVGIcon },
};
</script>
<style scoped lang="scss">
@import 'docc-render/styles/_core.scss';

.swift-file-icon {
  &.file-icon {
    height: 1rem;
  }
}
</style>
