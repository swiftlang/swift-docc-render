<!--
  This source file is part of the Swift.org open source project

  Copyright (c) 2021 Apple Inc. and the Swift project authors
  Licensed under Apache License v2.0 with Runtime Library Exception

  See https://swift.org/LICENSE.txt for license information
  See https://swift.org/CONTRIBUTORS.txt for Swift project authors
-->

<template>
  <SVGIcon
    class="generic-file-icon"
    viewBox="0 0 14 14"
    themeId="generic-file"
  >
    <path d="M8.033 1l3.967 4.015v7.985h-10v-12zM7.615 2h-4.615v10h8v-6.574z"></path>
    <path d="M7 1h1v4h-1z"></path>
    <path d="M7 5h5v1h-5z"></path>
  </SVGIcon>
</template>

<script>
import SVGIcon from 'docc-render/components/SVGIcon.vue';

export default {
  name: 'GenericFileIcon',
  components: { SVGIcon },
};
</script>
