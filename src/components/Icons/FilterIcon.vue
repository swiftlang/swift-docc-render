<!--
  This source file is part of the Swift.org open source project

  Copyright (c) 2021 Apple Inc. and the Swift project authors
  Licensed under Apache License v2.0 with Runtime Library Exception

  See https://swift.org/LICENSE.txt for license information
  See https://swift.org/CONTRIBUTORS.txt for Swift project authors
-->

<template>
  <SVGIcon
    class="filter-icon"
    height="14"
    width="14"
    viewBox="0 0 14 14"
    fill="currentColor"
    themeId="filter"
  >
    <path d="m2 6.5h10v1h-10z"/>
    <path d="m1 3h12v1h-12z"/>
    <path d="m3 10h8v1h-8z"/>
  </SVGIcon>
</template>

<script>
import SVGIcon from 'docc-render/components/SVGIcon.vue';

export default {
  name: 'FilterIcon',
  components: { SVGIcon },
};
</script>
