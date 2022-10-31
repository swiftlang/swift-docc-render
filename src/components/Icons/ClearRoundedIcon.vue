<!--
  This source file is part of the Swift.org open source project

  Copyright (c) 2021 Apple Inc. and the Swift project authors
  Licensed under Apache License v2.0 with Runtime Library Exception

  See https://swift.org/LICENSE.txt for license information
  See https://swift.org/CONTRIBUTORS.txt for Swift project authors
-->

<template>
  <SVGIcon
    class="clear-rounded-icon"
    viewBox="0 0 16 16"
    themeId="clear-rounded"
  >
    <title>Clear</title>
    <path d="M14.55,0l1.45,1.45-6.56,6.55,6.54,6.54-1.45,1.45-6.53-6.53L1.47,15.99,.01,14.53l6.52-6.53L0,1.47,1.45,.02l6.55,6.54L14.55,0Z" fill-rule="evenodd"/>
  </SVGIcon>
</template>

<script>
import SVGIcon from 'docc-render/components/SVGIcon.vue';

export default {
  name: 'ClearRoundedIcon',
  components: { SVGIcon },
};
</script>
