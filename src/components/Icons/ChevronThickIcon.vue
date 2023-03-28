<!--
  This source file is part of the Swift.org open source project

  Copyright (c) 2023 Apple Inc. and the Swift project authors
  Licensed under Apache License v2.0 with Runtime Library Exception

  See https://swift.org/LICENSE.txt for license information
  See https://swift.org/CONTRIBUTORS.txt for Swift project authors
-->

<template>
  <SVGIcon
    class="chevron-thick-icon"
    viewBox="0 0 14 10.5"
    themeId="chevron-thick"
  >
    <path d="M12.43,0l1.57,1.22L7,10.5,0,1.23,1.58,0,7,7,12.43,0Z"/>
  </SVGIcon>
</template>

<script>
import SVGIcon from 'docc-render/components/SVGIcon.vue';

export default {
  name: 'ChevronThickIcon',
  components: { SVGIcon },
};
</script>
