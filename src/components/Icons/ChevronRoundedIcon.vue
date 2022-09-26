<!--
  This source file is part of the Swift.org open source project

  Copyright (c) 2021 Apple Inc. and the Swift project authors
  Licensed under Apache License v2.0 with Runtime Library Exception

  See https://swift.org/LICENSE.txt for license information
  See https://swift.org/CONTRIBUTORS.txt for Swift project authors
-->

<template>
  <SVGIcon
    class="chevron-rounded-icon"
    viewBox="0 0 14 25"
    themeId="chevron-rounded"
  >
    <path d="M1,24.4a.9.9,0,0,0,.7-.3L13.4,13a1,1,0,0,0,0-1.6L1.7.3A.9.9,0,0,0,1,0,.9.9,0,0,0,0,1a.9.9,0,0,0,.3.7l11,10.5L.3,22.7a.9.9,0,0,0-.3.7A.9.9,0,0,0,1,24.4Z" />
  </SVGIcon>
</template>

<script>
import SVGIcon from 'docc-render/components/SVGIcon.vue';

export default {
  name: 'ChevronRoundedIcon',
  components: { SVGIcon },
};
</script>
