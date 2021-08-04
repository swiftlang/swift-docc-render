<!--
  This source file is part of the Swift.org open source project

  Copyright (c) 2021 Apple Inc. and the Swift project authors
  Licensed under Apache License v2.0 with Runtime Library Exception

  See https://swift.org/LICENSE.txt for license information
  See https://swift.org/CONTRIBUTORS.txt for Swift project authors
-->

<template>
  <SVGIcon viewBox="0 0 14 14" class="api-reference-icon">
    <title>API Reference</title>
    <path d="M13 1v12h-12v-12zM12 2h-10v10h10z"></path>
    <path d="M3 4h8v1h-8z"></path>
    <path d="M3 6.5h8v1h-8z"></path>
    <path d="M3 9h8v1h-8z"></path>
  </SVGIcon>
</template>

<script>
import SVGIcon from 'docc-render/components/SVGIcon.vue';

export default {
  name: 'APIReferenceIcon',
  components: { SVGIcon },
};
</script>
