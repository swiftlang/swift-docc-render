<!--
  This source file is part of the Swift.org open source project

  Copyright (c) 2021 Apple Inc. and the Swift project authors
  Licensed under Apache License v2.0 with Runtime Library Exception

  See https://swift.org/LICENSE.txt for license information
  See https://swift.org/CONTRIBUTORS.txt for Swift project authors
-->

<template>
  <SVGIcon viewBox="0 0 14 14" class="api-reference-icon" themeId="api-reference">
    <title>API Reference</title>
    <path d="m1 1v12h12v-12zm11 11h-10v-10h10z"/>
    <path d="m3 4h8v1h-8zm0 2.5h8v1h-8zm0 2.5h8v1h-8z"/>
    <path d="m3 4h8v1h-8z"/>
    <path d="m3 6.5h8v1h-8z"/>
    <path d="m3 9h8v1h-8z"/>
  </SVGIcon>
</template>

<script>
import SVGIcon from 'docc-render/components/SVGIcon.vue';

export default {
  name: 'APIReferenceIcon',
  components: { SVGIcon },
};
</script>
