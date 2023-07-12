<!--
  This source file is part of the Swift.org open source project

  Copyright (c) 2021 Apple Inc. and the Swift project authors
  Licensed under Apache License v2.0 with Runtime Library Exception

  See https://swift.org/LICENSE.txt for license information
  See https://swift.org/CONTRIBUTORS.txt for Swift project authors
-->

<template>
  <SVGIcon
    class="close-icon"
    viewBox="0 0 14 14"
    themeId="close"
  >
    <path d="M12.73,0l1.27,1.27-5.74,5.73,5.72,5.72-1.27,1.27-5.72-5.72L1.28,13.99,.01,12.72,5.72,7.01,0,1.28,1.27,.01,6.99,5.73,12.73,0Z"/>
  </SVGIcon>
</template>

<script>
import SVGIcon from 'docc-render/components/SVGIcon.vue';

export default {
  name: 'CloseIcon',
  components: { SVGIcon },
};
</script>
